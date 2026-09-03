import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {

  const navigate = useNavigate();

  // -------------------------
  // LOGIN STATE
  // -------------------------

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // -------------------------
  // FORGOT PASSWORD STATE
  // -------------------------

  const [showForgot, setShowForgot] = useState(false);

  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // -------------------------
  // OTP COUNTDOWN
  // -------------------------

  useEffect(() => {

    if (countdown <= 0) {
      return;
    }

    const timer = setInterval(() => {

      setCountdown((previous) => previous - 1);

    }, 1000);

    return () => clearInterval(timer);

  }, [countdown]);


  // -------------------------
  // LOGIN
  // -------------------------

  function handleLogin(event) {

    event.preventDefault();

    if (username.trim() === "" || password.trim() === "") {

      alert("Please enter username and password.");

      return;
    }

    // TEMPORARY FRONTEND LOGIN
    navigate("/dashboard");
  }


  // -------------------------
  // OPEN FORGOT PASSWORD
  // -------------------------

  function openForgotPassword() {

    setShowForgot(true);

    setOtpSent(false);
    setOtp("");
    setCountdown(0);

  }


  // -------------------------
  // SEND OTP
  // -------------------------

  function sendOTP() {

    if (forgotEmail.trim() === "") {

      alert("Please enter your email or username.");

      return;
    }

    setOtpSent(true);

    setCountdown(60);

    alert("Demo OTP sent successfully.");

  }


  // -------------------------
  // RESEND OTP
  // -------------------------

  function resendOTP() {

    if (countdown > 0) {
      return;
    }

    sendOTP();

  }


  // -------------------------
  // RESET PASSWORD
  // -------------------------

  function resetPassword(event) {

    event.preventDefault();

    if (!otpSent) {

      alert("Please request an OTP first.");

      return;
    }

    if (otp.trim() === "") {

      alert("Please enter the OTP.");

      return;
    }

    if (newPassword.trim() === "") {

      alert("Please enter a new password.");

      return;
    }

    if (newPassword !== confirmNewPassword) {

      alert("Passwords do not match.");

      return;
    }

    alert("Password reset successful!");

    setShowForgot(false);

    setForgotEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmNewPassword("");
    setOtpSent(false);
    setCountdown(0);

  }


  return (

    <div className="auth-page">

      <div className="auth-card">

        {/* BRAND */}

        <div className="brand">
          QUIZ<span>DOM</span>
        </div>

        <p className="tagline">
          ANSWER FAST • SCORE HIGH • BEAT YOUR FRIENDS
        </p>


        {!showForgot ? (

          /* =========================
             LOGIN BLOCK
          ========================= */

          <>

            <div className="section-heading">

              <span className="red-line"></span>

              <div>
                <h1>WELCOME BACK</h1>

                <p>
                  Login to enter the arena
                </p>
              </div>

            </div>


            <form onSubmit={handleLogin}>

              {/* USERNAME */}

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


              {/* PASSWORD */}

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


              {/* FORGOT PASSWORD */}

              <button
                type="button"
                className="forgot-button"
                onClick={openForgotPassword}
              >
                Forgot Password?
              </button>


              {/* LOGIN */}

              <button
                type="submit"
                className="primary-button"
              >
                LOGIN →
              </button>

            </form>


            {/* SIGNUP */}

            <div className="auth-switch">

              <span>
                NEW USER?
              </span>

              <Link to="/signup">
                CREATE ACCOUNT
              </Link>

            </div>

          </>

        ) : (

          /* =========================
             FORGOT PASSWORD BLOCK
          ========================= */

          <>

            <div className="section-heading">

              <span className="red-line"></span>

              <div>

                <h1>RESET PASSWORD</h1>

                <p>
                  Recover your Quizdom account
                </p>

              </div>

            </div>


            <form onSubmit={resetPassword}>

              {/* EMAIL */}

              <label>
                Email or Username
              </label>

              <input
                type="text"
                placeholder="Enter email or username"
                value={forgotEmail}
                onChange={(event) =>
                  setForgotEmail(event.target.value)
                }
              />


              {/* SEND OTP */}

              {!otpSent ? (

                <button
                  type="button"
                  className="primary-button"
                  onClick={sendOTP}
                >
                  SEND OTP
                </button>

              ) : (

                <div className="otp-status">
                  ✓ OTP SENT SUCCESSFULLY
                </div>

              )}


              {/* OTP */}

              {otpSent && (

                <>

                  <label>
                    OTP
                  </label>

                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                    value={otp}
                    onChange={(event) =>
                      setOtp(event.target.value)
                    }
                  />


                  {/* COUNTDOWN */}

                  <div className="resend-area">

                    {countdown > 0 ? (

                      <span>
                        Resend OTP in{" "}
                        <strong>
                          {countdown}s
                        </strong>
                      </span>

                    ) : (

                      <button
                        type="button"
                        className="resend-button"
                        onClick={resendOTP}
                      >
                        RESEND OTP
                      </button>

                    )}

                  </div>


                  {/* NEW PASSWORD */}

                  <label>
                    New Password
                  </label>

                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(event.target.value)
                    }
                  />


                  {/* CONFIRM PASSWORD */}

                  <label>
                    Confirm New Password
                  </label>

                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmNewPassword}
                    onChange={(event) =>
                      setConfirmNewPassword(event.target.value)
                    }
                  />


                  {/* RESET */}

                  <button
                    type="submit"
                    className="primary-button"
                  >
                    RESET PASSWORD →
                  </button>

                </>

              )}

            </form>


            {/* BACK */}

            <button
              type="button"
              className="back-button"
              onClick={() => setShowForgot(false)}
            >
              ← BACK TO LOGIN
            </button>


            {/* SIGNUP */}

            <div className="auth-switch">

              <span>
                NEW USER?
              </span>

              <Link to="/signup">
                CREATE ACCOUNT
              </Link>

            </div>

          </>

        )}

      </div>

    </div>

  );
}

export default Login;