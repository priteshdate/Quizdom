import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { WEIGHTAGE, YEARS } from "../data/weightage";
import TrendChart from "../components/TrendChart";
import CountUp from "../components/CountUp";

import "../quiz.css";

const SUBJECTS = Object.keys(WEIGHTAGE);

const RANGES = [
  { label: "1 Year", years: 1 },
  { label: "3 Years", years: 3 },
  { label: "5 Years", years: 5 },
];

// DEMO ONLY: fake per-chapter accuracy (30-90%), stable for each chapter name.
// Replace with real results from the quiz backend later.
function demoAccuracy(name) {
  const h = [...name].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 97, 7);
  return 30 + (h % 61);
}

function Weightage() {

  const navigate = useNavigate();

  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [range, setRange] = useState(3);
  const [selectedName, setSelectedName] = useState(WEIGHTAGE[SUBJECTS[0]][0].name);
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState("All");
  const [sort, setSort] = useState({ key: "o", dir: "desc" });

  function changeSubject(next) {
    setSubject(next);
    setSelectedName(WEIGHTAGE[next][0].name);
    setQuery("");
    setTier("All");
  }

  function toggleSort(key) {
    setSort((p) =>
      p.key === key
        ? { key, dir: p.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "name" ? "asc" : "desc" }
    );
  }

  const arrow = (key) => (sort.key === key ? (sort.dir === "asc" ? " ▲" : " ▼") : "");


  // -------------------------
  // ROWS: sum of last N years, then filter + sort
  // -------------------------

  const chapters = WEIGHTAGE[subject];
  const windowYears = YEARS.slice(-range);
  const tiers = ["All", ...new Set(chapters.map((c) => c.tier))];

  const rows = chapters.map((chapter) => {
    let e = 0, m = 0, t = 0;
    windowYears.forEach((year) => {
      e += chapter.yearly[year].e;
      m += chapter.yearly[year].m;
      t += chapter.yearly[year].t;
    });
    return { ...chapter, e, m, t, o: e + m + t };
  });

  const needle = query.trim().toLowerCase();

  const shown = rows
    .filter((r) => (tier === "All" || r.tier === tier) && r.name.toLowerCase().includes(needle))
    .sort((a, b) => {
      const va = a[sort.key], vb = b[sort.key];
      const c = typeof va === "string" ? va.localeCompare(vb) : va - vb;
      return sort.dir === "asc" ? c : -c;
    });

  const total = shown.reduce(
    (sum, r) => ({ e: sum.e + r.e, m: sum.m + r.m, t: sum.t + r.t, o: sum.o + r.o }),
    { e: 0, m: 0, t: 0, o: 0 }
  );

  const maxO = Math.max(1, ...shown.map((r) => r.o));


  // -------------------------
  // PRIORITY = weightage x (100 - accuracy)
  // -------------------------

  const priority = rows
    .map((r) => {
      const acc = demoAccuracy(r.name);
      return { ...r, acc, score: Math.round((r.o * (100 - acc)) / 100) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const maxP = Math.max(1, ...priority.map((r) => r.score));


  // -------------------------
  // TREND CHART DATA
  // -------------------------

  const selected = chapters.find((c) => c.name === selectedName) || chapters[0];

  const trendData = YEARS.map((year) => {
    const { e, m, t } = selected.yearly[year];
    return { year, e, m, t, o: e + m + t };
  });


  return (

    <div className="dashboard-page">

      <nav className="dashboard-nav">
        <div className="dashboard-logo">QUIZ<span>DOM</span></div>
        <button className="nav-logout" onClick={() => navigate("/dashboard")}>← DASHBOARD</button>
      </nav>

      <main className="dashboard-content">

        <section className="dashboard-header">
          <div>
            <p className="dashboard-label">EXAM INSIGHTS</p>
            <h1>CHAPTER <span>WEIGHTAGE</span></h1>
            <p>Sample data. Pick a subject, click a chapter, hover the chart for yearly numbers.</p>
          </div>
        </section>

        <div className="qz-tabs">
          {SUBJECTS.map((name) => (
            <button
              key={name}
              className={name === subject ? "qz-tab active" : "qz-tab"}
              onClick={() => changeSubject(name)}
            >
              {name}
            </button>
          ))}
        </div>

        {/* everything below re-animates when the subject changes */}
        <div key={subject} className="fade-swap">

          {/* PRIORITY */}
          <div className="dashboard-card qz-section">
            <div className="card-title"><span></span><h2>STUDY THESE FIRST</h2></div>
            <p className="qz-muted">
              High weightage and low accuracy comes first. Accuracy is demo data until real quiz results are stored.
            </p>

            <div className="qz-prio">
              {priority.map((r) => (
                <button
                  key={r.name}
                  className={r.name === selected.name ? "qz-prio-item active" : "qz-prio-item"}
                  onClick={() => setSelectedName(r.name)}
                >
                  <div className="qz-prio-top">
                    <span>{r.name}</span>
                    <span className="qz-muted">Weightage {r.o} · Your accuracy {r.acc}%</span>
                  </div>
                  <div className="qz-bar">
                    <i style={{ transform: `scaleX(${r.score / maxP})` }}></i>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* TREND CHART */}
          <div className="dashboard-card qz-section">
            <div className="card-title"><span></span><h2>OVERVIEW</h2></div>

            <p className="qz-chart-title">
              {selected.name}
              <small> · {selected.tier} weightage · about {selected.approx} questions per paper</small>
            </p>

            {/* key = replay the draw animation for each chapter */}
            <TrendChart key={subject + selected.name} data={trendData} />
          </div>

          {/* TABLE */}
          <div className="dashboard-card qz-section">
            <div className="card-title"><span></span><h2>TOPIC-WISE BREAKDOWN</h2></div>

            <p className="qz-muted">Distribution of questions by topic. Click a column header to sort.</p>

            <div className="qz-toolbar">
              <input
                type="text"
                placeholder="Search chapters"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />

              <div className="qz-pills">
                {tiers.map((name) => (
                  <button
                    key={name}
                    className={name === tier ? "qz-pill active" : "qz-pill"}
                    onClick={() => setTier(name)}
                  >
                    {name}
                  </button>
                ))}
              </div>

              <div className="qz-pills">
                {RANGES.map((item) => (
                  <button
                    key={item.label}
                    className={item.years === range ? "qz-pill active" : "qz-pill"}
                    onClick={() => setRange(item.years)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="qz-table-wrap">
              <table className="qz-table">

                <thead>
                  <tr>
                    <th className="sortable" onClick={() => toggleSort("name")}>Topic{arrow("name")}</th>
                    <th className="sortable" onClick={() => toggleSort("e")}>E{arrow("e")}</th>
                    <th className="sortable" onClick={() => toggleSort("m")}>M{arrow("m")}</th>
                    <th className="sortable" onClick={() => toggleSort("t")}>T{arrow("t")}</th>
                    <th className="sortable" onClick={() => toggleSort("o")}>O{arrow("o")}</th>
                  </tr>
                </thead>

                <tbody>
                  {shown.length === 0 && (
                    <tr><td colSpan="5" className="qz-muted">No chapters match. Clear the search or pick another tier.</td></tr>
                  )}

                  {shown.map((row) => (
                    <tr
                      key={row.name}
                      className={row.name === selected.name ? "qz-row active" : "qz-row"}
                      onClick={() => setSelectedName(row.name)}
                    >
                      <td>
                        {row.name}{" "}
                        <span className={`qz-tier tier-${row.tier.toLowerCase()}`}>{row.tier}</span>
                      </td>
                      <td>{row.e}</td>
                      <td>{row.m}</td>
                      <td>{row.t}</td>
                      <td className="qz-overall">
                        <div className="qz-o-cell">
                          <span>{row.o}</span>
                          <div className="qz-bar">
                            <i style={{ transform: `scaleX(${row.o / maxO})` }}></i>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>

                <tfoot>
                  <tr>
                    <td>Total{shown.length < rows.length ? " (filtered)" : ""}</td>
                    <td><CountUp value={total.e} duration={500} /></td>
                    <td><CountUp value={total.m} duration={500} /></td>
                    <td><CountUp value={total.t} duration={500} /></td>
                    <td className="qz-overall"><CountUp value={total.o} duration={500} /></td>
                  </tr>
                </tfoot>

              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default Weightage;
