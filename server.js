const dotenv = require("dotenv");
const express = require("express");
const Dashboard = require("supertokens-node/recipe/dashboard");
const UserRoles = require("supertokens-node/recipe/userroles");
let supertokens = require("supertokens-node");
let cors = require("cors");
let Session = require("supertokens-node/recipe/session");
let ThirdParty = require("supertokens-node/recipe/thirdparty");
const EmailPassword = require("supertokens-node/recipe/emailpassword");
const EmailVerification = require("supertokens-node/recipe/emailverification");
const {
  isEmailChangeAllowed,
} = require("supertokens-node/recipe/accountlinking");
let { middleware } = require("supertokens-node/framework/express");
let {
  verifySession,
} = require("supertokens-node/recipe/session/framework/express");
let { errorHandler } = require("supertokens-node/framework/express");

dotenv.config();

supertokens.init({
  debug: true,
  framework: "express",
  supertokens: {
    connectionURI: "http://localhost:3567",
    // apiKey: "IF YOU HAVE AN API KEY FOR THE CORE, ADD IT HERE",
  },
  appInfo: {
    appName: "Expense Management",
    apiDomain: "http://localhost:3001",
    websiteDomain: "http://localhost:3000",
  },
  recipeList: [
    EmailPassword.init(),
    EmailVerification.init({
      mode: "REQUIRED",
      override: {
        apis: (oI) => {
          return {
            ...oI,
            verifyEmailPOST: async function (input) {
              let response = await oI.verifyEmailPOST(input);
              if (response.status === "OK") {
                // This will update the email of the user to the one
                // that was just marked as verified by the token.
                await EmailPassword.updateEmailOrPassword({
                  recipeUserId: response.user.recipeUserId,
                  email: response.user.email,
                });
              }
              return response;
            },
          };
        },
      },
    }),
    ThirdParty.init({
      signInAndUpFeature: {
        providers: [
          {
            config: {
              thirdPartyId: "google",
              clients: [
                {
                  clientId: process.env.CLIENT_ID,
                  clientSecret: process.env.CLIENT_SECRET,
                },
              ],
            },
          },
        ],
      },
    }),
    Session.init(), // initializes session features
    Dashboard.init(),
    UserRoles.init(),
  ],
});

const PORT = 3001;

const app = express();

const database = require("./db");

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

app.use(
  cors({
    origin: "http://localhost:3000",
    allowedHeaders: ["content-type", ...supertokens.getAllCORSHeaders()],
    methods: ["GET", "PUT", "POST", "DELETE"],
    credentials: true,
  })
);

app.use(middleware()); // middleware adds the signin and signup api endpoints to the express app

app.use(express.json());
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Access-Control-Allow-Headers"
  );
  next();
});

app.get("/data", verifySession(), async (req, res) => {
  try {
    const userId = req.session.getUserId();

    let userInfo = await supertokens.getUser(userId);

    let response = await database.getData(userId);

    res.status(200).send({ response, userInfo });
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post("/create-budget", verifySession(), (req, res) => {
  database
    .createBudget(req.body)
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

app.post("/update-budget", verifySession(), (req, res) => {
  database
    .updateBudget(req.body)
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

app.post("/create-item", verifySession(), (req, res) => {
  database
    .createItem(req.body)
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

app.put("/update-profile", verifySession(), (req, res) => {
  database
    .updateProfile(req.body)
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

app.post("/change-password", verifySession(), async (req, res) => {
  try {
    // get the supertokens session object from the req
    let session = req.session;
    let userId = req.session.getUserId();
    console.log(userId);

    // retrive the old password from the request body
    let oldPassword = req.body.oldPassword;

    // retrive the new password from the request body
    let updatedPassword = req.body.newPassword;

    // get the signed in user's email from the getUserById function
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
});

app.delete("/delete-budget-item", verifySession(), (req, res) => {
  database
    .deleteBudgetItem(req.body)
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

app.post("/change-email", verifySession(), async (req, res) => {
  let session = req.session;
  let email = req.body.email;

  // validate the input email
  if (!isValidEmail(email)) {
    return res.status(400).send("Email is invalid");
  }

  // Then, we check if the email is verified for this user ID or not.
  // It is important to understand that SuperTokens stores email verification
  // status based on the user ID AND the email, and not just the email.
  let isVerified = await EmailVerification.isEmailVerified(
    session.getRecipeUserId(),
    email
  );

  if (!isVerified) {
    if (
      !(await isEmailChangeAllowed(session.getRecipeUserId(), email, false))
    ) {
      // this can come here if you have enabled the account linking feature, and
      // if there is a security risk in changing this user's email.
      return res
        .status(400)
        .send("Email change not allowed. Please contact support");
    }

    // Before sending a verification email, we check if the email is already
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
        // Since one user can be shared across many tenants, we need to check if
        // the email already exists in any of the tenants that belongs to this user.
        let currUser = usersWithSameEmail[y];
        if (currUser?.id !== session.getUserId()) {
          // TODO handle error, email already exists with another user.
          res.status(400).send("Email already exists with another user");
          return;
        }
      }
    }

    // Now we create and send the email verification link to the user for the new email.
    await EmailVerification.sendEmailVerificationEmail(
      session.getTenantId(),
      session.getUserId(),
      session.getRecipeUserId(),
      email
    );

    // TODO send successful response that email verification email sent.
    res.status(200).send("Email verification email sent");
    return;
  }

  console.log("user ID: ", session.getRecipeUserId());

  // Since the email is verified, we try and do an update
  let resp = await EmailPassword.updateEmailOrPassword({
    recipeUserId: session.getRecipeUserId(),
    email: email,
  });

  if (resp.status === "OK") {
    // TODO send successful response that email updated.
    res.status(200).send("Email updated");
    return;
  }
  if (resp.status === "EMAIL_ALREADY_EXISTS_ERROR") {
    // TODO handle error, email already exists with another user.
    res.status(400).send("Email already exists with another user");
    return;
  }

  throw new Error("Should never come here");
});

function isValidEmail(email) {
  let regexp = new RegExp(
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
  return regexp.test(email);
}

app.post("/auth/verify-email", async (req, res) => {
  const { token, tenantId } = req.body;

  try {
    console.log(token, tenantId);

    // Kiểm tra nếu token hợp lệ và thực hiện xác minh
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
});

app.use(errorHandler());
