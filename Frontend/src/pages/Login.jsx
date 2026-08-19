import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { dispatchAuthEvent } from "../utils/authEvents";

const API_URL =
   import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const userAuth = JSON.parse(
          localStorage.getItem("userAuth") || "null"
        );

        const adminAuth = JSON.parse(
          localStorage.getItem("adminAuth") || "null"
        );

        if (userAuth?.isAuthenticated) {
          navigate("/");
        } else if (adminAuth?.isAuthenticated) {
          navigate("/admin/messages");
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        localStorage.removeItem("userAuth");
        localStorage.removeItem("adminAuth");
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: credentials.email.trim().toLowerCase(),
          password: credentials.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Invalid email or password"
        );
      }

      if (!data.token) {
        throw new Error("Login failed: token not received");
      }

      const userAuth = {
        isAuthenticated: true,
        userId: data._id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || "",
        isAdmin: data.isAdmin || false,
        token: data.token,
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem(
        "userAuth",
        JSON.stringify(userAuth)
      );

      dispatchAuthEvent();

      if (data.isAdmin) {
        navigate("/admin/messages");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);

      setError(
        error.message ||
          "Unable to login. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        <h2 className="text-2xl font-semibold text-center text-blue-700 mb-6">
          User Login
        </h2>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-100 px-4 py-2 rounded">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>

            <input
              type="email"
              id="email"
              name="email"
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={credentials.email}
              onChange={handleChange}
              required
              disabled={submitting}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>

            <input
              type="password"
              id="password"
              name="password"
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={credentials.password}
              onChange={handleChange}
              required
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-60"
          >
            {submitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-sm text-center text-gray-600">
          <p>
            Don’t have an account?{" "}
            <Link
              to="/signup"
              className="text-blue-600 hover:underline"
            >
              Sign up
            </Link>
          </p>

          <p className="mt-2">
            Admin?{" "}
            <Link
              to="/admin/login"
              className="text-blue-600 hover:underline"
            >
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;