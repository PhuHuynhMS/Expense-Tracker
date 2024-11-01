const dotenv = require("dotenv");
const express = require("express");
let supertokens = require("supertokens-node");
let cors = require("cors");
let Session = require("supertokens-node/recipe/session");
let ThirdParty = require("supertokens-node/recipe/thirdparty");
const EmailPassword = require("supertokens-node/recipe/emailpassword");
let { middleware } = require("supertokens-node/framework/express");
let {
  verifySession,
} = require("supertokens-node/recipe/session/framework/express");

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

let { errorHandler } = require("supertokens-node/framework/express");

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

app.get("/get-user-info", verifySession(), async (req, res) => {
  const userId = req.session.getUserId();
  // let userInfo = await ThirdPartyEmailPassword.getUserById(userId);
});

app.get("/data", verifySession(), async (req, res) => {
  const userId = req.session.getUserId();

  database
    .getData(userId)
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

app.post("/create-budget", (req, res) => {
  database
    .createBudget(req.body)
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

app.post("/update-budget", (req, res) => {
  database
    .updateBudget(req.body)
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

app.post("/create-item", (req, res) => {
  database
    .createItem(req.body)
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

app.delete("/delete-budget-item", (req, res) => {
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
