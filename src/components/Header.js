import React from "react";
import { signOut } from "supertokens-auth-react/recipe/session";
import "../App.css";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faWallet } from "@fortawesome/free-solid-svg-icons";

function Header(props) {
  const [localBudget, setlocalBudget] = React.useState(0);
  const navigate = useNavigate();
  async function onLogout() {
    await signOut();
    window.location.href = "/auth";
  }

  function handleBudgetChange() {
    if (localBudget <= 0) {
      alert("Budget must be greater than 0");
    } else if (props.budget > 0) {
      fetch("http://localhost:3001/update-budget", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          budget: parseFloat(localBudget),
          userId: props.user,
        }),
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
        body: JSON.stringify({
          budget: parseFloat(localBudget),
          userId: props.user,
        }),
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

  function goToProfilePage() {
    navigate("/profile", {
      state: props.profile,
    });
  }

  return (
    <div>
      <nav className="shadow-lg navbar bg-body-tertiary">
        <div className="container-fluid">
          <a href="/" className="navbar-brand">
            <FontAwesomeIcon
              icon={faWallet}
              size="2xl"
              style={{ color: "#2c9cf2", marginRight: "10px" }}
            />
            Personal Expense Tracker
          </a>
          <div className="d-flex">
            <button
              className="btn bg-transparent"
              onClick={() => goToProfilePage(props.profile)}
            >
              <FontAwesomeIcon icon={faUser} />
            </button>
            <button
              className="btn btn-outline-danger"
              type="button"
              onClick={onLogout}
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>
      <div className="container mt-5">
        <div className="input-ctn">
          <form>
            <div class="form-group">
              <label for="budget">Add/Update Budget</label>
              <input
                type="number"
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
    </div>
  );
}

export default Header;
