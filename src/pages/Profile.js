import { useState } from "react";
import { useLocation } from "react-router-dom";
import ProfileHeader from "../components/ProfileHeader";

function Profile() {
  const location = useLocation();
  const data = location.state;
  let dataEmails;
  let dataPhoneNumbers;

  if (data.emails && data.phoneNumbers) {
    dataEmails = data.emails;
    dataPhoneNumbers = data.phoneNumbers;
  }
  const [email, setEmail] = useState(dataEmails[0] ?? "");
  const [phone, setPhone] = useState(dataPhoneNumbers[0] ?? "");

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
            defaultValue={email ?? ""}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div class="mb-3">
          <label for="phone" class="form-label">
            Phone Number
          </label>
          <input
            type="text"
            class="form-control"
            id="phone"
            placeholder="Enter your phone number"
            defaultValue={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <a href="/change-password" className="text-decoration-none">
            Change password
          </a>
        </div>
        <button
          type="submit"
          class="btn btn-primary"
          onClick={() => {
            fetch("http://localhost:3001/update-profile", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userId: data.userId,
                email: email,
                phone: phone,
              }),
            })
              .then((response) => {
                return response.text();
              })
              .then((data) => {
                alert(data);
              });
          }}
        >
          Update
        </button>
      </div>
    </div>
  );
}

export default Profile;
