import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const tenantId = searchParams.get("tenantId");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/auth/verify-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: token,
        tenantId: tenantId,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setMessage(data.message);

        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <div>{message}</div>;
}

export default VerifyEmail;
