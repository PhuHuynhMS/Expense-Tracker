const dotenv = require("dotenv");
const express = require("express");
const Dashboard = require("supertokens-node/recipe/dashboard");
const UserRoles = require("supertokens-node/recipe/userroles");
let supertokens = require("supertokens-node");
let cors = require("cors");
let Session = require("supertokens-node/recipe/session");
let ThirdParty = require("supertokens-node/recipe/thirdparty");
const EmailPassword = require("supertokens-node/recipe/emailpassword");
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
    console.log(userId);

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

app.use(errorHandler());
