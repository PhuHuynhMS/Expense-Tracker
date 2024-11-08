import React from "react";
import { signOut } from "supertokens-auth-react/recipe/session";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse } from "@fortawesome/free-solid-svg-icons";

import "../App.css";

function Header() {
  async function onLogout() {
    await signOut();
    window.location.href = "/auth";
  }

  return (
    <nav className="shadow-lg navbar bg-body-tertiary">
      <div className="container-fluid">
        <a href="/" className="navbar-brand">
          Personal Expense Tracker
        </a>
        <div className="d-flex">
          <a href="/" className="navbar-brand">
            <FontAwesomeIcon icon={faHouse} />
          </a>
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
  );
}

export default Header;
