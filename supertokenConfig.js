const Dashboard = require("supertokens-node/recipe/dashboard");
const UserRoles = require("supertokens-node/recipe/userroles");
const EmailPassword = require("supertokens-node/recipe/emailpassword");
const EmailVerification = require("supertokens-node/recipe/emailverification");
let Session = require("supertokens-node/recipe/session");
let ThirdParty = require("supertokens-node/recipe/thirdparty");

const supertokensConfig = {
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
};

module.exports = supertokensConfig;
