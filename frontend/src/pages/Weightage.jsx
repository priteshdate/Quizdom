import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { WEIGHTAGE, YEARS } from "../data/weightage";
import TrendChart from "../components/TrendChart";

import "../quiz.css";

const SUBJECTS = Object.keys(WEIGHTAGE);

const RANGES = [
  { label: "1 Year", years: 1 },
  { label: "3 Years", years: 3 },
  { label: "5 Years", years: 5 },
];

function Weightage() {

  const navigate = useNavigate();

  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [range, setRange] = useState(3);
  const [selectedName, setSelectedName] = useState(
    WEIGHTAGE[SUBJECTS[0]][0].name
  );


  // -------------------------
  // CHANGE SUBJECT
  // -------------------------

  function changeSubject(newSubject) {

    setSubject(newSubject);

    // select the first chapter of the new subject
    setSelectedName(WEIGHTAGE[newSubject][0].name);

  }


  // -------------------------
  // TABLE ROWS (sum of last N years)
  // -------------------------

  const chapters = WEIGHTAGE[subject];
  const windowYears = YEARS.slice(-range);

  const rows = chapters.map((chapter) => {

    let e = 0;
    let m = 0;
    let t = 0;

    windowYears.forEach((year) => {
      e += chapter.yearly[year].e;
      m += chapter.yearly[year].m;
      t += chapter.yearly[year].t;
    });

    return { ...chapter, e, m, t, o: e + m + t };

  });

  const total = rows.reduce(
    (sum, row) => ({
      e: sum.e + row.e,
      m: sum.m + row.m,
      t: sum.t + row.t,
      o: sum.o + row.o,
    }),
    { e: 0, m: 0, t: 0, o: 0 }
  );


  // -------------------------
  // TREND CHART DATA (selected chapter)
  // -------------------------

  const selected =
    chapters.find((chapter) => chapter.name === selectedName) ||
    chapters[0];

  const trendData = YEARS.map((year) => {

    const { e, m, t } = selected.yearly[year];

    return { year, e, m, t, o: e + m + t };

  });


  return (

    <div className="dashboard-page">

      {/* NAVBAR */}

      <nav className="dashboard-nav">

        <div className="dashboard-logo">
          QUIZ<span>DOM</span>
        </div>

        <button
          className="nav-logout"
          onClick={() => navigate("/dashboard")}
        >
          ← DASHBOARD
        </button>

      </nav>


      <main className="dashboard-content">

        {/* HEADER */}

        <section className="dashboard-header">

          <div>

            <p className="dashboard-label">
              EXAM INSIGHTS
            </p>

            <h1>
              CHAPTER <span>WEIGHTAGE</span>
            </h1>

            <p>
              Sample data. Pick a subject, then click a chapter to see its trend.
            </p>

          </div>

        </section>


        {/* SUBJECT TABS */}

        <div className="qz-tabs">

          {SUBJECTS.map((name) => (

            <button
              key={name}
              className={
                name === subject ? "qz-tab active" : "qz-tab"
              }
              onClick={() => changeSubject(name)}
            >
              {name}
            </button>

          ))}

        </div>


        {/* TREND CHART */}

        <div className="dashboard-card qz-section">

          <div className="card-title">
            <span></span>
            <h2>OVERVIEW</h2>
          </div>

          <p className="qz-chart-title">
            {selected.name}
            <small> · {selected.tier} weightage · about {selected.approx} questions per paper</small>
          </p>

          <TrendChart data={trendData} />

        </div>


        {/* TOPIC-WISE TABLE */}

        <div className="dashboard-card qz-section">

          <div className="card-title">
            <span></span>
            <h2>TOPIC-WISE BREAKDOWN</h2>
          </div>

          <p className="qz-muted">
            Distribution of questions by topic
          </p>

          <div className="qz-pills">

            {RANGES.map((item) => (

              <button
                key={item.label}
                className={
                  item.years === range ? "qz-pill active" : "qz-pill"
                }
                onClick={() => setRange(item.years)}
              >
                {item.label}
              </button>

            ))}

          </div>


          <div className="qz-table-wrap">

            <table className="qz-table">

              <thead>
                <tr>
                  <th>Topic</th>
                  <th>E</th>
                  <th>M</th>
                  <th>T</th>
                  <th>O</th>
                </tr>
              </thead>

              <tbody>

                {rows.map((row) => (

                  <tr
                    key={row.name}
                    className={
                      row.name === selected.name ? "qz-row active" : "qz-row"
                    }
                    onClick={() => setSelectedName(row.name)}
                  >

                    <td>
                      {row.name}{" "}
                      <span className={`qz-tier tier-${row.tier.toLowerCase()}`}>
                        {row.tier}
                      </span>
                    </td>

                    <td>{row.e}</td>
                    <td>{row.m}</td>
                    <td>{row.t}</td>
                    <td className="qz-overall">{row.o}</td>

                  </tr>

                ))}

              </tbody>

              <tfoot>

                <tr>
                  <td>Total</td>
                  <td>{total.e}</td>
                  <td>{total.m}</td>
                  <td>{total.t}</td>
                  <td className="qz-overall">{total.o}</td>
                </tr>

              </tfoot>

            </table>

          </div>

        </div>

      </main>

    </div>

  );
}

export default Weightage;
