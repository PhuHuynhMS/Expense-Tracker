const dotenv = require("dotenv");
const express = require("express");
const UserRoles = require("supertokens-node/recipe/userroles");
const supertokens = require("supertokens-node");
const cors = require("cors");
const { middleware } = require("supertokens-node/framework/express");
const {
  verifySession,
} = require("supertokens-node/recipe/session/framework/express");
const { errorHandler } = require("supertokens-node/framework/express");
const controller = require("./controller");
const supertokensConfig = require("./supertokenConfig");

dotenv.config();

supertokens.init(supertokensConfig);

const PORT = 3001;

const app = express();

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

app.get("/data", verifySession(), controller.getData);

app.post(
  "/create-budget",
  verifySession({
    overrideGlobalClaimValidators: async (globalValidators) => [
      ...globalValidators,
      UserRoles.UserRoleClaim.validators.includes("Manager"),
      // UserRoles.PermissionClaim.validators.includes("edit")
    ],
  }),
  controller.createBudget
);

app.post(
  "/update-budget",
  verifySession({
    overrideGlobalClaimValidators: async (globalValidators) => [
      ...globalValidators,
      UserRoles.UserRoleClaim.validators.includes("Manager"),
    ],
  }),
  controller.updateBudget
);

app.post("/create-item", verifySession(), controller.createItem);

app.put("/update-profile", verifySession(), controller.updateProfile);

app.post("/change-password", verifySession(), controller.changePassword);

app.delete("/delete-budget-item", verifySession(), controller.deleteBudgetItem);

app.delete(
  "/delete-all",
  verifySession({
    overrideGlobalClaimValidators: async (globalValidators) => [
      ...globalValidators,
      UserRoles.UserRoleClaim.validators.includes("Manager"),
    ],
  }),
  controller.deleteAll
);

app.post("/change-email", verifySession(), controller.changeEmail);

app.post("/auth/verify-email", controller.verifyEmail);

app.get("/get-user-info/:userId", verifySession(), controller.getUserInfo);

app.use(errorHandler());
