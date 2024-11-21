import { useState } from "react";
import { useLocation } from "react-router-dom";
import ProfileHeader from "../components/ProfileHeader";

function Profile() {
  const location = useLocation();
  const data = location.state;
  let dataEmails;

  if (data.emails) {
    dataEmails = data.emails;
  }
  const [email, setEmail] = useState(dataEmails[0] ?? "");

  function updateProfile(email) {
    fetch("http://localhost:3001/update-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: data.userId,
        email: email,
      }),
    })
      .then((response) => {
        return response.text();
      })
      .then((data) => {
        alert(data);
      });
  }

  return (
    <div>
      <ProfileHeader />
      <div className="container col-md-4 mt-5">
        <h1 className="text-center">Profile</h1>
        <div class="mb-3">
          <label for="email" class="form-label">
            Email address
          </label>
          <input
            type="email"
            class="form-control"
            id="email"
            defaultValue={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-3">
          {data.loginMethods[0].thirdParty.id === "google" ? (
            <a
              href="https://myaccount.google.com/security"
              target="_blank"
              rel="noopener noreferrer"
              className="text-decoration-none"
            >
              Change password
            </a>
          ) : (
            <a href="/change-password" className="text-decoration-none">
              Change password
            </a>
          )}
        </div>
        <button
          type="submit"
          class="btn btn-primary"
          onClick={() => updateProfile(email)}
        >
          Update
        </button>
      </div>
    </div>
  );
}

export default Profile;
