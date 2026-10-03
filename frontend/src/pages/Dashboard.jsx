import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Retrieve logged-in user info from localStorage if present
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const username = storedUser.username || "manas123";

  const user = {
    name: username.toUpperCase(),
    username: username,
    email: `${username}@example.com`,
    quizzesPlayed: 18,
    quizzesWon: 11,
    totalScore: 842,
    bestScore: 96,
    rank: 7
  };

  useEffect(() => {
    fetch("http://localhost:8080/api/data")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch database data");
        }
        return res.json();
      })
      .then((data) => {
        setTableData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Dashboard fetch error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  function handleLogout() {
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <div className="dashboard-page">
      {/* NAVBAR */}
      <nav className="dashboard-nav">
        <div className="dashboard-logo">
          QUIZ<span>DOM</span>
        </div>

        <div className="nav-actions">
          <button className="nav-logout" onClick={handleLogout}>
            LOGOUT
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="dashboard-content">
        {/* HEADER */}
        <section className="dashboard-header">
          <div>
            <p className="dashboard-label">PLAYER DASHBOARD</p>
            <h1>
              WELCOME, <span>{user.name}</span>
            </h1>
            <p>Ready to challenge your friends?</p>
          </div>

          <button
            className="start-quiz-button"
            onClick={() => navigate("/quiz")}
          >
            START QUIZ →
          </button>
        </section>

        {/* USER PROFILE */}
        <section className="dashboard-grid">
          {/* PROFILE CARD */}
          <div className="dashboard-card profile-card">
            <div className="card-title">
              <span></span>
              <h2>PLAYER PROFILE</h2>
            </div>

            <div className="profile-main">
              <div className="avatar">{user.name.charAt(0)}</div>
              <div>
                <h3>{user.name}</h3>
                <p>@{user.username}</p>
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
              <h2>QUIZ STATISTICS</h2>
            </div>

            <div className="stats-grid">
              <div className="stat-box">
                <strong>{user.quizzesPlayed}</strong>
                <span>QUIZZES PLAYED</span>
              </div>
              <div className="stat-box">
                <strong>{user.quizzesWon}</strong>
                <span>QUIZZES WON</span>
              </div>
              <div className="stat-box">
                <strong>{user.totalScore}</strong>
                <span>TOTAL SCORE</span>
              </div>
              <div className="stat-box">
                <strong>{user.bestScore}</strong>
                <span>BEST SCORE</span>
              </div>
            </div>
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="quick-actions" style={{ marginTop: "2rem" }}>
          <h2>QUICK ACTIONS</h2>

          <div className="action-grid">
            <button
              className="action-card"
              onClick={() => navigate("/quiz")}
            >
              <span className="action-number">01</span>
              <div>
                <h3>START QUIZ</h3>
                <p>Test your knowledge</p>
              </div>
              <strong>→</strong>
            </button>

            <button
              className="action-card"
              onClick={() => navigate("/quiz")}
            >
              <span className="action-number">02</span>
              <div>
                <h3>FULL MOCK QUIZ</h3>
                <p>Take the complete three subject quiz</p>
              </div>
              <strong>→</strong>
            </button>

            <button
              className="action-card"
              onClick={() => navigate("/weightage")}
            >
              <span className="action-number">03</span>
              <div>
                <h3>EXAM INSIGHTS</h3>
                <p>Explore chapter weightage trends</p>
              </div>
              <strong>→</strong>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;