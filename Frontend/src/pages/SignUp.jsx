import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { dispatchAuthEvent } from "../utils/authEvents";

const API_URL =
   import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
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
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const onlyDigits = value
        .replace(/\D/g, "")
        .slice(0, 10);

      setFormData((prev) => ({
        ...prev,
        phone: onlyDigits,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      phone,
    } = formData;

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Min 6 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword =
        "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword =
        "Passwords do not match";
    }

    if (!phone.trim()) {
      newErrors.phone =
        "Phone number is required";
    } else if (!/^\d{10}$/.test(phone)) {
      newErrors.phone =
        "Phone number must be exactly 10 digits";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    setErrors({});

    try {
      const response = await fetch(
        `${API_URL}/api/users`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
            phone: formData.phone,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Registration failed"
        );
      }

      if (!data.token) {
        throw new Error(
          "Registration successful but token was not received"
        );
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

      setSuccess(true);

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error("Signup error:", error);

      const message =
        error.message ||
        "Unable to create account";

      if (
        message.toLowerCase().includes("already")
      ) {
        setErrors((prev) => ({
          ...prev,
          email: "Email already registered",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          general: message,
        }));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 flex flex-col items-center justify-start pt-12 px-4">

      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-700 tracking-wide">
          Create{" "}
          <span className="text-blue-500">
            Account
          </span>
        </h1>

        <div className="w-24 h-1 bg-blue-400 mx-auto mt-2 rounded" />
      </div>

      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-3xl">

        {success && (
          <div className="bg-green-100 text-green-700 p-3 mb-4 rounded text-center font-medium">
            ✅ Account created! Redirecting...
          </div>
        )}

        {errors.general && (
          <div className="bg-red-100 text-red-700 p-3 mb-4 rounded text-center">
            {errors.general}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="block font-medium mb-1">
                First Name *
              </label>

              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                disabled={success || submitting}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                  errors.firstName
                    ? "border-red-500"
                    : ""
                }`}
              />

              {errors.firstName && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.firstName}
                </p>
              )}
            </div>

            <div>
              <label className="block font-medium mb-1">
                Last Name *
              </label>

              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                disabled={success || submitting}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                  errors.lastName
                    ? "border-red-500"
                    : ""
                }`}
              />

              {errors.lastName && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">
              Email *
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={success || submitting}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                errors.email
                  ? "border-red-500"
                  : ""
              }`}
            />

            {errors.email && (
              <p className="text-sm text-red-500 mt-1">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label className="block font-medium mb-1">
              Phone *
            </label>

            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={success || submitting}
              placeholder="9876543210"
              maxLength={10}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                errors.phone
                  ? "border-red-500"
                  : ""
              }`}
            />

            {errors.phone && (
              <p className="text-sm text-red-500 mt-1">
                {errors.phone}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="block font-medium mb-1">
                Password *
              </label>

              <div className="relative">
                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={
                    success || submitting
                  }
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                    errors.password
                      ? "border-red-500"
                      : ""
                  }`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="absolute right-3 top-2 text-gray-500"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {errors.password && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <label className="block font-medium mb-1">
                Confirm Password *
              </label>

              <div className="relative">
                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  value={
                    formData.confirmPassword
                  }
                  onChange={handleChange}
                  disabled={
                    success || submitting
                  }
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : ""
                  }`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  className="absolute right-3 top-2 text-gray-500"
                >
                  {showConfirmPassword
                    ? "Hide"
                    : "Show"}
                </button>
              </div>

              {errors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          <p className="text-sm text-gray-600">
            By creating an account, you agree to our
            <Link
              to="#"
              className="text-blue-600 underline ml-1"
            >
              Terms of Service
            </Link>{" "}
            and
            <Link
              to="#"
              className="text-blue-600 underline ml-1"
            >
              Privacy Policy
            </Link>
            .
          </p>

          <button
            type="submit"
            disabled={success || submitting}
            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:opacity-60"
          >
            {submitting
              ? "Creating Account..."
              : "Create Account"}
          </button>

          <p className="text-center mt-4 text-gray-700">
            Already have an account?
            <Link
              to="/login"
              className="text-blue-600 underline ml-1"
            >
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUp;