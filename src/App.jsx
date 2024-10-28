import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SuperTokens, { SuperTokensWrapper } from "supertokens-auth-react";
import { getSuperTokensRoutesForReactRouterDom } from "supertokens-auth-react/ui";
import ThirdParty, { Google } from "supertokens-auth-react/recipe/thirdparty";
import EmailPassword from "supertokens-auth-react/recipe/emailpassword";
import Session, { SessionAuth } from "supertokens-auth-react/recipe/session";
import { EmailPasswordPreBuiltUI } from "supertokens-auth-react/recipe/emailpassword/prebuiltui";
import { ThirdPartyPreBuiltUI } from "supertokens-auth-react/recipe/thirdparty/prebuiltui";

import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Home from "./Home";

const PreBuiltUIList = [EmailPasswordPreBuiltUI, ThirdPartyPreBuiltUI];
const ComponentWrapper = (props) => {
  return props.children;
};

SuperTokens.init({
  appInfo: {
    appName: "Expense Tracker",
    apiDomain: "http://localhost:3001",
    websiteDomain: "http://localhost:3000",
  },
  recipeList: [
    ThirdParty.init({
      signInAndUpFeature: {
        providers: [Google.init()],
      },
    }),
    EmailPassword.init({}),

    Session.init(),
  ],
});

function App() {
  return (
    <SuperTokensWrapper>
      <ComponentWrapper>
        <Router>
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
          </Routes>
        </Router>
      </ComponentWrapper>
    </SuperTokensWrapper>
  );
}

export default App;
