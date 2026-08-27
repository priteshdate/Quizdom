import { useNavigate } from "react-router-dom";

function Dashboard() {

  const navigate = useNavigate();


  // -------------------------
  // TEMPORARY HARDCODED DATA
  // -------------------------

  const user = {

    name: "Manas Bhutada",

    username: "manas123",

    email: "manas@example.com",

    quizzesPlayed: 18,

    quizzesWon: 11,

    totalScore: 842,

    bestScore: 96,

    rank: 7

  };


  function handleLogout() {

    navigate("/login");

  }


  return (

    <div className="dashboard-page">

      {/* =========================
          NAVBAR
      ========================= */}

      <nav className="dashboard-nav">

        <div className="dashboard-logo">
          QUIZ<span>DOM</span>
        </div>


        <div className="nav-actions">

          <button
            className="nav-logout"
            onClick={handleLogout}
          >
            LOGOUT
          </button>

        </div>

      </nav>


      {/* =========================
          MAIN CONTENT
      ========================= */}

      <main className="dashboard-content">


        {/* HEADER */}

        <section className="dashboard-header">

          <div>

            <p className="dashboard-label">
              PLAYER DASHBOARD
            </p>

            <h1>
              WELCOME,{" "}
              <span>
                {user.name.split(" ")[0].toUpperCase()}
              </span>
            </h1>

            <p>
              Ready to challenge your friends?
            </p>

          </div>


          <button
            className="start-quiz-button"
            onClick={() => alert("Quiz module coming next!")}
          >
            START QUIZ →
          </button>

        </section>


        {/* =========================
            USER PROFILE
        ========================= */}

        <section className="dashboard-grid">


          {/* PROFILE CARD */}

          <div className="dashboard-card profile-card">

            <div className="card-title">

              <span></span>

              <h2>
                PLAYER PROFILE
              </h2>

            </div>


            <div className="profile-main">

              <div className="avatar">
                {user.name.charAt(0)}
              </div>

              <div>

                <h3>
                  {user.name}
                </h3>

                <p>
                  @{user.username}
                </p>

              </div>

            </div>


            <div className="profile-details">

              <div>
                <span>EMAIL</span>
                <strong>{user.email}</strong>
              </div>

              <div>
                <span>PLAYER RANK</span>
                <strong>#{user.rank}</strong>
              </div>

            </div>

          </div>


          {/* STATS CARD */}

          <div className="dashboard-card stats-card">

            <div className="card-title">

              <span></span>

              <h2>
                QUIZ STATISTICS
              </h2>

            </div>


            <div className="stats-grid">

              <div className="stat-box">

                <strong>
                  {user.quizzesPlayed}
                </strong>

                <span>
                  QUIZZES PLAYED
                </span>

              </div>


              <div className="stat-box">

                <strong>
                  {user.quizzesWon}
                </strong>

                <span>
                  QUIZZES WON
                </span>

              </div>


              <div className="stat-box">

                <strong>
                  {user.totalScore}
                </strong>

                <span>
                  TOTAL SCORE
                </span>

              </div>


              <div className="stat-box">

                <strong>
                  {user.bestScore}
                </strong>

                <span>
                  BEST SCORE
                </span>

              </div>

            </div>

          </div>


        </section>


        {/* =========================
            QUICK ACTIONS
        ========================= */}

        <section className="quick-actions">

          <h2>
            QUICK ACTIONS
          </h2>


          <div className="action-grid">


            <button
              className="action-card"
              onClick={() => alert("Quiz Setup coming next!")}
            >

              <span className="action-number">
                01
              </span>

              <div>

                <h3>
                  START QUIZ
                </h3>

                <p>
                  Test your knowledge
                </p>

              </div>

              <strong>
                →
              </strong>

            </button>


            <button
              className="action-card"
              onClick={() => alert("Challenge mode coming next!")}
            >

              <span className="action-number">
                02
              </span>

              <div>

                <h3>
                  CHALLENGE FRIEND
                </h3>

                <p>
                  Compete with your friends
                </p>

              </div>

              <strong>
                →
              </strong>

            </button>


            <button
              className="action-card"
              onClick={() => alert("Leaderboard coming next!")}
            >

              <span className="action-number">
                03
              </span>

              <div>

                <h3>
                  LEADERBOARD
                </h3>

                <p>
                  See who's on top
                </p>

              </div>

              <strong>
                →
              </strong>

            </button>


          </div>

        </section>


      </main>

    </div>

  );
}

export default Dashboard;