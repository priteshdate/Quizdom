import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Signup() {

  const navigate = useNavigate();

  // -------------------------
  // FORM STATE
  // -------------------------

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // -------------------------
  // PASSWORD MATCH
  // -------------------------

  const passwordsMatch =
    password === confirmPassword;

  const showPasswordError =
    confirmPassword !== "" &&
    !passwordsMatch;


  // -------------------------
  // SIGNUP
  // -------------------------

  function handleSignup(event) {

    event.preventDefault();

    if (
      name.trim() === "" ||
      username.trim() === "" ||
      email.trim() === "" ||
      password.trim() === "" ||
      confirmPassword.trim() === ""
    ) {

      alert("Please fill all fields.");

      return;
    }


    // FRONTEND PASSWORD VALIDATION

    if (password !== confirmPassword) {

      alert("Passwords do not match.");

      return;
    }


    if (password.length < 6) {

      alert("Password must contain at least 6 characters.");

      return;
    }


    // TEMPORARY FRONTEND REGISTRATION

    alert("Account created successfully!");

    navigate("/login");

  }


  return (

    <div className="auth-page">

      <div className="auth-card signup-card">

        {/* BRAND */}

        <div className="brand">
          QUIZ<span>DOM</span>
        </div>

        <p className="tagline">
          CREATE YOUR PLAYER PROFILE
        </p>


        {/* HEADING */}

        <div className="section-heading">

          <span className="red-line"></span>

          <div>

            <h1>CREATE ACCOUNT</h1>

            <p>
              Join the Quizdom community
            </p>

          </div>

        </div>


        <form onSubmit={handleSignup}>

          {/* NAME */}

          <label>
            Full Name
          </label>

          <input
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
          />


          {/* USERNAME */}

          <label>
            Username
          </label>

          <input
            type="text"
            placeholder="Choose a username"
            value={username}
            onChange={(event) =>
              setUsername(event.target.value)
            }
          />


          {/* EMAIL */}

          <label>
            Email
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
          />


          {/* PASSWORD */}

          <label>
            Password
          </label>

          <input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
          />


          {/* CONFIRM PASSWORD */}

          <label>
            Confirm Password
          </label>

          <input
            type="password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(event.target.value)
            }
          />


          {/* PASSWORD ERROR */}

          {showPasswordError && (

            <p className="password-error">
              ✕ Passwords do not match
            </p>

          )}


          {/* PASSWORD SUCCESS */}

          {confirmPassword !== "" &&
            passwordsMatch && (

              <p className="password-success">
                ✓ Passwords match
              </p>

            )}


          {/* CREATE ACCOUNT */}

          <button
            type="submit"
            className="primary-button"
          >
            CREATE ACCOUNT →
          </button>

        </form>


        {/* LOGIN */}

        <div className="auth-switch">

          <span>
            ALREADY HAVE AN ACCOUNT?
          </span>

          <Link to="/login">
            LOGIN
          </Link>

        </div>

      </div>

    </div>

  );
}

export default Signup;