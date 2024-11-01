import React from "react";
import { signOut } from "supertokens-auth-react/recipe/session";
import "../App.css";

function Header(props) {
  const [localBudget, setlocalBudget] = React.useState(0);

  async function onLogout() {
    await signOut();
    window.location.href = "/auth"; // or to wherever your logic page is
  }

  function handleBudgetChange() {
    if (props.budget > 0) {
      fetch("http://localhost:3001/update-budget", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ budget: localBudget, userId: props.user }),
      })
        .then((response) => {
          return response.text();
        })
        .then((data) => {
          alert(data);
          props.getDataForUser();
        });
    } else {
      fetch("http://localhost:3001/create-budget", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ budget: localBudget, userId: props.user }),
      })
        .then((response) => {
          return response.text();
        })
        .then((data) => {
          alert(data);
          props.getDataForUser();
        });
    }
  }
  return (
    <div>
      <div className="header">
        <h1 className="mt-3 text-ctn">Personal Expense Tracker</h1>
        <button type="button" class="btn btn-dark mt-3" onClick={onLogout}>
          Sign Out
        </button>
      </div>
      <div className="input-ctn">
        <form>
          <div class="form-group">
            <label for="budget">Add/Update Budget</label>
            <input
              class="form-control"
              placeholder="Budget"
              value={localBudget}
              onChange={(e) => setlocalBudget(e.target.value)}
            ></input>
          </div>
          <button
            type="button"
            class="btn btn-dark mt-3"
            onClick={() => {
              handleBudgetChange();
            }}
          >
            Save Budget
          </button>
        </form>
      </div>
    </div>
  );
}

export default Header;
