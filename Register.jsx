import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [otpSent, setOtpSent] = useState(false);

  const navigate = useNavigate();

  function sendOTP() {

    if (email === "") {

      alert("Please enter your email first.");

      return;

    }

    setOtpSent(true);

    alert("Demo OTP sent to your email.");

  }

  function handleRegister(event) {

    event.preventDefault();

    if (
      name === "" ||
      username === "" ||
      email === "" ||
      password === "" ||
      otp === ""
    ) {

      alert("Please fill all fields.");

      return;

    }

    alert("Registration successful!");

    navigate("/login");

  }

  return (

    <div className="auth-page">

      <div className="auth-card register-card">

        <div className="brand">
          QUIZ<span>DOM</span>
        </div>

        <p className="tagline">
          CREATE YOUR RACER PROFILE
        </p>

        <h1>CREATE ACCOUNT</h1>

        <p className="auth-subtitle">
          Join the Quizdom community
        </p>

        <form onSubmit={handleRegister}>

          <label>
            Name
          </label>

          <input
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
          />


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


          <label>
            OTP
          </label>

          <div className="otp-row">

            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(event) =>
                setOtp(event.target.value)
              }
            />

            <button
              type="button"
              className="otp-button"
              onClick={sendOTP}
            >
              SEND OTP
            </button>

          </div>


          {otpSent && (

            <p className="otp-success">
              ✓ OTP sent successfully
            </p>

          )}


          <button type="submit">
            CREATE ACCOUNT →
          </button>

        </form>


        <p className="switch-auth">

          Already have an account?

          <Link to="/login">
            Login
          </Link>

        </p>

      </div>

    </div>

  );
}

export default Register;