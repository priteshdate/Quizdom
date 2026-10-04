import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function Signup() {
  const navigate = useNavigate();

  // -------------------------
  // FORM STATE OBJECT
  // -------------------------

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // -------------------------
  // PASSWORD MATCH
  // -------------------------

  const passwordsMatch = formData.password === formData.confirmPassword;
  const showPasswordError =
    formData.confirmPassword !== "" && !passwordsMatch;

  // -------------------------
  // SIGNUP HANDLER
  // -------------------------

  async function handleSignup(event) {
    event.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.username.trim() ||
      !formData.email.trim() ||
      !formData.password.trim() ||
      !formData.confirmPassword.trim()
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must contain at least 6 characters.");
      return;
    }

    const toastId = toast.loading("Creating your account...");

    try {
      const response = await fetch("http://localhost:8080/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: formData.username,
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      if (response.status === 409) {
        toast.error("Username or email already exists.", { id: toastId });
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || "Registration failed.", { id: toastId });
        return;
      }

      toast.success("Account created successfully!", { id: toastId });
      navigate("/login");
    } catch (error) {
      toast.error("Network error. Could not connect to backend server.", { id: toastId });
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card signup-card">
        {/* BRAND */}
        <div className="brand">
          QUIZ<span>DOM</span>
        </div>

        <p className="tagline">CREATE YOUR PLAYER PROFILE</p>

        {/* HEADING */}
        <div className="section-heading">
          <span className="red-line"></span>
          <div>
            <h1>CREATE ACCOUNT</h1>
            <p>Join the Quizdom community</p>
          </div>
        </div>

        <form onSubmit={handleSignup}>
          {/* NAME */}
          <label>Full Name</label>
          <input
            type="text"
            name="name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
          />

          {/* USERNAME */}
          <label>Username</label>
          <input
            type="text"
            name="username"
            placeholder="Choose a username"
            value={formData.username}
            onChange={handleChange}
          />

          {/* EMAIL */}
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
          />

          {/* PASSWORD */}
          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
          />

          {/* CONFIRM PASSWORD */}
          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          {/* PASSWORD ERROR */}
          {showPasswordError && (
            <p className="password-error">✕ Passwords do not match</p>
          )}

          {/* PASSWORD SUCCESS */}
          {formData.confirmPassword !== "" && passwordsMatch && (
            <p className="password-success">✓ Passwords match</p>
          )}

          {/* CREATE ACCOUNT BUTTON */}
          <button type="submit" className="primary-button">
            CREATE ACCOUNT →
          </button>
        </form>

        {/* LOGIN SWITCH */}
        <div className="auth-switch">
          <span>ALREADY HAVE AN ACCOUNT?</span>
          <Link to="/login">LOGIN</Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;