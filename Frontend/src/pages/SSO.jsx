import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const SSO = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loginWithCureGo = async () => {
      try {
        const cureGoToken = searchParams.get("token");

        if (!cureGoToken) {
          throw new Error(
            "CureGo authentication token is missing"
          );
        }

        const response = await fetch(
          `${API_URL}/api/users/sso`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              token: cureGoToken,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "SSO authentication failed"
          );
        }

        if (!data.token || !data._id) {
          throw new Error(
            "Invalid authentication response"
          );
        }

        // QuickMeds authentication object
        const userAuth = {
          isAuthenticated: true,
          userId: data._id,
          email: data.email || "",
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          phone: data.phone || "",
          isAdmin: data.isAdmin || false,
          token: data.token,
          timestamp: new Date().toISOString(),
          loginSource: "CureGo",
        };

        // Save QuickMeds login
        localStorage.setItem(
          "userAuth",
          JSON.stringify(userAuth)
        );

        // Notify application
        window.dispatchEvent(
          new Event("authUpdated")
        );

        // Go to doctors
        navigate("/doctors", {
          replace: true,
        });

      } catch (err) {
        console.error("CureGo SSO Error:", err);

        setError(
          err.message ||
            "Unable to login with CureGo"
        );
      } finally {
        setLoading(false);
      }
    };

    loginWithCureGo();
  }, [navigate, searchParams]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "70vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h2>Signing you in...</h2>

        <p>
          Connecting your CureGo account with QuickMeds.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "70vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "20px",
        }}
      >
        <h2 style={{ color: "red" }}>
          Login Failed
        </h2>

        <p>{error}</p>

        <button
          onClick={() => navigate("/login")}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return null;
};

export default SSO;