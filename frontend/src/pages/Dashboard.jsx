import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import CountUp from "../components/CountUp";

const API_URL = "http://localhost:8080";

function Dashboard() {

  const navigate = useNavigate();

  // The login page stores { username, email } in localStorage
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const username = storedUser.username || "";

  const [stats, setStats] = useState(null);   // null = still loading
  const [error, setError] = useState("");


  // -------------------------
  // LOAD THIS USER'S REAL STATS
  // -------------------------

  useEffect(() => {

    // not logged in -> back to login
    if (!username) {
      navigate("/login", { replace: true });
      return;
    }

    const controller = new AbortController();

    fetch(`${API_URL}/api/stats?username=${encodeURIComponent(username)}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Could not load your statistics.");
        }
        return response.json();
      })
      .then((data) => {
        setStats(data);
        setError("");
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message || "Could not reach the server.");
        }
      });

    return () => controller.abort();

  }, [username, navigate]);


  function handleLogout() {
    localStorage.removeItem("user");
    navigate("/login");
  }

  const statBoxes = [
    ["QUIZZES PLAYED", stats?.quizzesPlayed],
    ["AVERAGE SCORE", stats?.averageScore],
    ["TOTAL SCORE", stats?.totalScore],
    ["BEST SCORE", stats?.bestScore],
  ];

  const actions = [
    { n: "01", title: "START QUIZ", text: "Test your knowledge", to: "/quiz" },
    { n: "02", title: "ONLINE DUEL", text: "Take turns against another player", to: "/duel" },
    { n: "03", title: "EXAM INSIGHTS", text: "Explore chapter weightage trends", to: "/weightage" },
  ];

  if (!username) {
    return null;
  }

  return (

    <div className="dashboard-page">

      <nav className="dashboard-nav">
        <div className="dashboard-logo">QUIZ<span>DOM</span></div>
        <div className="nav-actions">
          <button className="nav-logout" onClick={handleLogout}>LOGOUT</button>
        </div>
      </nav>

      <main className="dashboard-content">

        <section className="dashboard-header">
          <div>
            <p className="dashboard-label">PLAYER DASHBOARD</p>
            <h1>WELCOME, <span>{username.toUpperCase()}</span></h1>
            <p>Ready to challenge your friends?</p>
          </div>

          <button className="start-quiz-button" onClick={() => navigate("/quiz")}>
            START QUIZ →
          </button>
        </section>

        <section className="dashboard-grid">

          <div className="dashboard-card profile-card">
            <div className="card-title"><span></span><h2>PLAYER PROFILE</h2></div>

            <div className="profile-main">
              <div className="avatar">{username.charAt(0).toUpperCase()}</div>
              <div>
                <h3>{username}</h3>
                <p>@{username}</p>
              </div>
            </div>

            <div className="profile-details">
              <div>
                <span>EMAIL</span>
                <strong>{storedUser.email || "—"}</strong>
              </div>
              <div>
                <span>PLAYER RANK</span>
                <strong>
                  {stats?.rank ? <>#<CountUp value={stats.rank} /></> : "—"}
                </strong>
              </div>
            </div>
          </div>

          <div className="dashboard-card stats-card">
            <div className="card-title"><span></span><h2>QUIZ STATISTICS</h2></div>

            <div className="stats-grid">
              {statBoxes.map(([label, value]) => (
                <div className="stat-box" key={label}>
                  <strong>
                    {value === undefined ? "—" : <CountUp value={value} />}
                  </strong>
                  <span>{label}</span>
                </div>
              ))}
            </div>

            {error && <p className="qz-muted" style={{ marginTop: 14 }}>{error}</p>}
            {stats && stats.quizzesPlayed === 0 && (
              <p className="qz-muted" style={{ marginTop: 14 }}>
                No quizzes yet. Play one and your stats show up here.
              </p>
            )}
          </div>

        </section>

        <section className="quick-actions">
          <h2>QUICK ACTIONS</h2>

          <div className="action-grid">
            {actions.map((a) => (
              <button key={a.n} className="action-card" onClick={() => navigate(a.to)}>
                <span className="action-number">{a.n}</span>
                <div>
                  <h3>{a.title}</h3>
                  <p>{a.text}</p>
                </div>
                <strong>→</strong>
              </button>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}

export default Dashboard;
