const dotenv = require("dotenv");
const UserRoles = require("supertokens-node/recipe/userroles");
let supertokens = require("supertokens-node");
let Session = require("supertokens-node/recipe/session");
const EmailPassword = require("supertokens-node/recipe/emailpassword");
const EmailVerification = require("supertokens-node/recipe/emailverification");
const {
  isEmailChangeAllowed,
} = require("supertokens-node/recipe/accountlinking");

dotenv.config();
const database = require("./db");

exports.getData = async (req, res) => {
  try {
    const userId = req.session.getUserId();

    let userInfo = await supertokens.getUser(userId);

    let response = await database.getData();

    res.status(200).send({ response, userInfo });
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.createBudget = (req, res) => {
  database
    .createBudget(req.body)
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
};

exports.updateBudget = (req, res) => {
  database
    .updateBudget(req.body)
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
};

exports.createItem = (req, res) => {
  database
    .createItem(req.body)
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
};

exports.updateProfile = (req, res) => {
  database
    .updateProfile(req.body)
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
};

exports.changePassword = async (req, res) => {
  try {
    let session = req.session;
    let userId = req.session.getUserId();
    console.log(userId);

    let oldPassword = req.body.oldPassword;

    let updatedPassword = req.body.newPassword;

    let userInfo = await supertokens.getUser(session.userId);

    if (userInfo === undefined) {
      throw new Error("Should never come here");
    }

    let loginMethod = userInfo.loginMethods.find((lM) => {
      return (
        lM.recipeUserId.getAsString() ===
          session.getRecipeUserId().getAsString() &&
        lM.recipeId === "emailpassword"
      );
    });
    if (loginMethod === undefined) {
      throw new Error("Should never come here");
    }

    if (loginMethod === undefined) {
      throw new Error("Should never come here");
    }
    const email = loginMethod.email;

    // call signin to check that input password is correct
    let isPasswordValid = await EmailPassword.verifyCredentials(
      session.getTenantId(),
      email,
      oldPassword
    );

    if (isPasswordValid.status !== "OK") {
      res.status(400).send({ message: "Incorrect password" });
      return;
    }

    // update the user's password using updateEmailOrPassword
    let response = await EmailPassword.updateEmailOrPassword({
      recipeUserId: session.getRecipeUserId(),
      password: updatedPassword,
      tenantIdForPasswordPolicy: session.getTenantId(),
    });

    if (response.status === "PASSWORD_POLICY_VIOLATED_ERROR") {
      res.send(response);
      return;
    }

    // revoke all sessions for the user
    await Session.revokeAllSessionsForUser(userId);

    // revoke the current user's session, we do this to remove the auth cookies, logging out the user on the frontend.
    await req.session.revokeSession();

    res.status(200).send(response);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.deleteBudgetItem = async (req, res) => {
  const userId = req.session.getUserId();
  const itemUserId = req.body.userId;

  const response = await UserRoles.getRolesForUser("public", userId);
  const roles = response.roles;

  if (!roles.includes("Manager") && itemUserId !== userId) {
    return res.status(400).send("You are not allowed to delete this item");
  }
  database
    .deleteBudgetItem(req.body)
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
};

function isValidEmail(email) {
  let regexp = new RegExp(
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
  return regexp.test(email);
}

exports.changeEmail = async (req, res) => {
  let session = req.session;
  let email = req.body.email;

  // validate the input email
  if (!isValidEmail(email)) {
    return res.status(400).send("Email is invalid");
  }

  // check if the email is verified for this user ID or not.
  let isVerified = await EmailVerification.isEmailVerified(
    session.getRecipeUserId(),
    email
  );

  if (!isVerified) {
    if (
      !(await isEmailChangeAllowed(session.getRecipeUserId(), email, false))
    ) {
      return res
        .status(400)
        .send("Email change not allowed. Please contact support");
    }

    // check if the email is already
    // being used by another user. If it is, we throw an error.
    let user = await supertokens.getUser(session.getUserId());
    for (let i = 0; i < user.tenantIds.length; i++) {
      let usersWithSameEmail = await supertokens.listUsersByAccountInfo(
        user.tenantIds[i],
        {
          email,
        }
      );
      for (let y = 0; y < usersWithSameEmail.length; y++) {
        // check if the email already exists in any of the tenants that belongs to this user.
        let currUser = usersWithSameEmail[y];
        if (currUser?.id !== session.getUserId()) {
          res.status(400).send("Email already exists with another user");
          return;
        }
      }
    }

    // create and send the email verification link to the user for the new email.
    await EmailVerification.sendEmailVerificationEmail(
      session.getTenantId(),
      session.getUserId(),
      session.getRecipeUserId(),
      email
    );

    res.status(200).send("Email verification email sent");
    return;
  }

  console.log("user ID: ", session.getRecipeUserId());

  // the email is verified, do an update
  let resp = await EmailPassword.updateEmailOrPassword({
    recipeUserId: session.getRecipeUserId(),
    email: email,
  });

  if (resp.status === "OK") {
    res.status(200).send("Email updated");
    return;
  }
  if (resp.status === "EMAIL_ALREADY_EXISTS_ERROR") {
    res.status(400).send("Email already exists with another user");
    return;
  }

  throw new Error("Should never come here");
};

exports.verifyEmail = async (req, res) => {
  const { token, tenantId } = req.body;

  try {
    let response = await EmailVerification.verifyEmailUsingToken(
      tenantId,
      token
    );

    if (response.status === "OK") {
      res.status(200).send({ message: "Email verified successfully." });
    } else {
      res
        .status(400)
        .send({ message: "Invalid or expired verification token." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error verifying email." });
  }
};

exports.getUserInfo = async (req, res) => {
  try {
    let userId = req.params.userId;

    let userInfo = await supertokens.getUser(userId);

    res.status(200).send(userInfo);
  } catch (error) {
    res.status(500).send(error);
  }
};
