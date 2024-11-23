import React from "react";
import { signOut } from "supertokens-auth-react/recipe/session";
import "../App.css";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faWallet } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

function Header(props) {
  const [localBudget, setlocalBudget] = React.useState(0);
  const navigate = useNavigate();

  async function onLogout() {
    await signOut();
    window.location.href = "/auth";
  }

  function handleBudgetChange() {
    if (localBudget <= 0) {
      toast.error("Budget must be greater than 0", {
        theme: "colored",
        position: "top-center",
      });
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
      }).then(async (response) => {
        const data = await response.json();

        if (data.message === "invalid claim") {
          toast.error("You have no permission to update the budget", {
            theme: "colored",
            position: "top-center",
          });
        } else {
          toast.success("Budget updated successfully", {
            theme: "colored",
            position: "top-center",
          });
        }
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
      }).then(async (response) => {
        const data = await response.json();

        if (data.message === "invalid claim") {
          toast.error("You have no permission to create the budget", {
            theme: "colored",
            position: "top-center",
          });
        } else {
          toast.success("Budget created successfully", {
            theme: "colored",
            position: "top-center",
          });
        }
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
      <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
        <div className="container-fluid">
          <a href="/" className="navbar-brand d-flex align-items-center">
            <FontAwesomeIcon
              icon={faWallet}
              size="2xl"
              className="me-2"
              style={{ color: "#2c9cf2" }}
            />
            <span className="fw-bold fs-5">Expense Tracker</span>
          </a>
          <div className="d-flex align-items-center">
            <button
              className="btn btn-light me-2"
              onClick={() => goToProfilePage(props.profile)}
            >
              <FontAwesomeIcon icon={faUser} size="lg" />
            </button>
            <button className="btn btn-danger" type="button" onClick={onLogout}>
              Sign Out
            </button>
          </div>
        </div>
      </nav>
      <div className="container mt-4">
        <div className="card shadow-sm p-4">
          <h5 className="card-title text-center">Manage Your Budget</h5>
          <form className="mt-3">
            <div className="form-group mb-3">
              <label htmlFor="budget" className="form-label">
                Add or Update Budget
              </label>
              <input
                type="number"
                id="budget"
                className="form-control"
                placeholder="Enter your budget"
                value={localBudget}
                onChange={(e) => setlocalBudget(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="btn btn-primary w-100"
              onClick={() => handleBudgetChange()}
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
