import { useState } from "react";
import ProfileHeader from "../components/ProfileHeader";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");

  function updatePassword() {
    if (newPassword !== confirmedPassword) {
      alert("Passwords do not match");
      return;
    }
    fetch("http://localhost:3001/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        newPassword: newPassword,
        oldPassword: oldPassword,
      }),
    })
      .then((response) => response.json())
      .then(async (data) => {
        if (data.message) {
          toast.error(data.message, {
            position: "top-center",
            theme: "colored",
          });
        }
        if (data.status === "OK") {
          await withReactContent(Swal).fire({
            show: true,
            title: "Password updated successfully",
            icon: "success",
            confirmButtonColor: "#3085d6",
            confirmButtonText: "OK",
          });
          window.location.href = "/auth";
        }
        if (data.status === "PASSWORD_POLICY_VIOLATED_ERROR") {
          toast.error("Password must be at least 8 characters long", {
            position: "top-center",
            theme: "colored",
          });
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Failed to update password. Please try again.");
      });
  }

  return (
    <div>
      <ProfileHeader />
      <div className="container col-md-4 mt-5">
        <h1 className="text-center text-light">Change Password</h1>
        <div class="mb-3">
          <input
            type="password"
            class="form-control"
            id="oldPassword"
            placeholder="Enter your current password"
            onChange={(e) => setOldPassword(e.target.value)}
          />
        </div>
        <div class="mb-3">
          <input
            type="password"
            class="form-control"
            id="newPassword"
            placeholder="Enter your new password"
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div class="mb-3">
          <input
            type="password"
            class="form-control"
            id="confirmNewPassword"
            placeholder="Confirm your new password"
            onChange={(e) => setConfirmedPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          class="btn btn-primary"
          onClick={() => updatePassword()}
        >
          Update
        </button>
      </div>
      <ToastContainer />
    </div>
  );
}

export default ChangePassword;
