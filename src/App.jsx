import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import SuperTokens, { SuperTokensWrapper } from "supertokens-auth-react";
import { getSuperTokensRoutesForReactRouterDom } from "supertokens-auth-react/ui";
import ThirdParty, { Google } from "supertokens-auth-react/recipe/thirdparty";
import EmailPassword from "supertokens-auth-react/recipe/emailpassword";
import Session, { SessionAuth } from "supertokens-auth-react/recipe/session";
import { EmailPasswordPreBuiltUI } from "supertokens-auth-react/recipe/emailpassword/prebuiltui";
import { ThirdPartyPreBuiltUI } from "supertokens-auth-react/recipe/thirdparty/prebuiltui";
import { AuthRecipeComponentsOverrideContextProvider } from "supertokens-auth-react/ui";
import EmailVerification from "supertokens-auth-react/recipe/emailverification";
import { EmailVerificationPreBuiltUI } from "supertokens-auth-react/recipe/emailverification/prebuiltui";
import { ToastContainer } from "react-toastify";

import logo from "./logo.png";
import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Home from "../src/pages/Home";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";
import VerifyEmail from "./pages/VerifyEmail";

const PreBuiltUIList = [
  EmailPasswordPreBuiltUI,
  ThirdPartyPreBuiltUI,
  EmailVerificationPreBuiltUI,
];
// const ComponentWrapper = (props) => {
//   return props.children;
// };

SuperTokens.init({
  appInfo: {
    appName: "Expense Management",
    apiDomain: "http://localhost:3001",
    websiteDomain: "http://localhost:3000",
  },
  recipeList: [
    ThirdParty.init({
      signInAndUpFeature: {
        providers: [Google.init()],
      },
    }),
    EmailVerification.init({
      mode: "REQUIRED", // or "OPTIONAL"
    }),
    EmailPassword.init(),
    Session.init(),
  ],
});

class App extends React.Component {
  render() {
    return (
      <SuperTokensWrapper>
        {/* <ComponentWrapper> */}
        <BrowserRouter>
          <AuthRecipeComponentsOverrideContextProvider
            components={{
              AuthPageHeader_Override: ({ DefaultComponent, ...props }) => {
                return (
                  <div>
                    <img src={logo} style={{ width: "100px" }} alt="wallet" />
                    <h1 style={{ color: "#699cf0", fontWeight: 700 }}>
                      Expense Management
                    </h1>
                    <DefaultComponent {...props} />
                  </div>
                );
              },
            }}
          >
            <Routes>
              {getSuperTokensRoutesForReactRouterDom(
                require("react-router-dom"),
                PreBuiltUIList
              )}

              <Route
                path="/"
                element={
                  <SessionAuth>
                    {/* Wrapping the component to make sure that only signed-in users can access this page */}
                    <Home />
                  </SessionAuth>
                }
              />

              <Route
                path="/profile"
                element={
                  <SessionAuth>
                    {/* Wrapping the component to make sure that only signed-in users can access this page */}
                    <Profile />
                  </SessionAuth>
                }
              />
              <Route
                path="/change-password"
                element={
                  <SessionAuth>
                    {/* Wrapping the component to make sure that only signed-in users can access this page */}
                    <ChangePassword />
                  </SessionAuth>
                }
              />
              <Route
                path="/auth/verify-email"
                element={
                  <>
                    {/* Wrapping the component to make sure that only signed-in users can access this page */}
                    <VerifyEmail />
                  </>
                }
              />
            </Routes>

            {/* </ComponentWrapper> */}
          </AuthRecipeComponentsOverrideContextProvider>
        </BrowserRouter>
        <ToastContainer />
      </SuperTokensWrapper>
    );
  }
}

export default App;
