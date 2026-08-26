import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  function handleLogin(event) {

    event.preventDefault();

    console.log("Username:", username);
    console.log("Password:", password);

    // Temporary frontend login
    if (username !== "" && password !== "") {

      navigate("/home");

    } else {

      alert("Please enter username and password.");

    }

  }

  return (

    <div className="auth-page">

      <div className="auth-card">

        <div className="brand">
          QUIZ<span>DOM</span>
        </div>

        <p className="tagline">
          ANSWER FAST. SCORE HIGH. BEAT YOUR FRIENDS.
        </p>

        <h1>WELCOME BACK</h1>

        <p className="auth-subtitle">
          Login to enter the arena
        </p>

        <form onSubmit={handleLogin}>

          <label>
            Username
          </label>

          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(event) =>
              setUsername(event.target.value)
            }
          />

          <label>
            Password
          </label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
          />

          <button type="submit">
            LOGIN →
          </button>

        </form>

        <p className="switch-auth">

          Don't have an account?

          <Link to="/register">
            Create Account
          </Link>

        </p>

      </div>

    </div>

  );
}

export default Login;