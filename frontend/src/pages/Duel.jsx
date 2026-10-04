import { useEffect, useReducer } from "react";
import { useNavigate } from "react-router-dom";

import { DUEL_QUESTIONS } from "../data/duelQuestions";
import CountUp from "../components/CountUp";

import "../quiz.css";
import "../duel.css";

// =========================================================
// DEMO DATA - everything below is hardcoded on purpose.
// Later: the server picks the opponent + questions and
// pushes every event over a WebSocket.
// =========================================================

const TURN_SECONDS = 20;
const REVEAL_MS = 2200;
const TOTAL = 10;

const ME_DEFAULT = { rank: 7 }; // demo rank (duel is hardcoded)
const OPP = { name: "ROHAN K.", tag: "@rohan_k", rank: 12, ping: 42 };

// What the "remote" player does on each of THEIR 5 turns
const OPP_SCRIPT = [
  { correct: true, delay: 6 },
  { correct: false, delay: 9 },
  { correct: true, delay: 4 },
  { correct: true, delay: 12 },
  { correct: false, delay: 15 },
];



// =========================================================
// STATE MACHINE  (think: enum phase + switch)
// lobby > searching > found > countdown > question > reveal
//                                  ^______________________|  (repeat)
//                                                   reveal > result
// Player 0 = you, player 1 = opponent. Even qIndex = your turn.
// =========================================================

const initial = {
  phase: "lobby",
  count: 3,
  qIndex: 0,
  timeLeft: TURN_SECONDS,
  picked: null,
  scores: [0, 0],
  streaks: [0, 0],
  right: [0, 0],
  lastGain: 0,
  log: [],
};

function reducer(s, a) {

  switch (a.type) {

    case "SEARCH":    return { ...initial, phase: "searching" };
    case "FOUND":     return { ...s, phase: "found" };
    case "COUNTDOWN": return { ...s, phase: "countdown", count: 3 };
    case "COUNT":     return { ...s, count: s.count - 1 };
    case "ASK":       return { ...s, phase: "question", timeLeft: TURN_SECONDS, picked: null, lastGain: 0 };
    case "TICK":      return { ...s, timeLeft: s.timeLeft - 1 };

    case "ANSWER": {

      if (s.phase !== "question") return s;

      const p = s.qIndex % 2;
      const q = DUEL_QUESTIONS[s.qIndex];
      const ok = a.choice === q.answer;

      const streak = ok ? s.streaks[p] + 1 : 0;
      const gain = ok
        ? 10 + Math.floor(a.timeLeft / 4) + (streak >= 3 ? 5 : 0)
        : 0;

      const scores = [...s.scores];  scores[p] += gain;
      const streaks = [...s.streaks]; streaks[p] = streak;
      const right = [...s.right];     if (ok) right[p] += 1;

      return {
        ...s,
        phase: "reveal",
        picked: a.choice,
        scores, streaks, right,
        lastGain: gain,
        log: [...s.log, { p, ok, choice: a.choice }],
      };
    }

    case "NEXT":
      return s.qIndex + 1 >= TOTAL
        ? { ...s, phase: "result" }
        : { ...s, qIndex: s.qIndex + 1, phase: "question", timeLeft: TURN_SECONDS, picked: null, lastGain: 0 };

    case "RESET": return initial;

    default: return s;
  }
}


function PlayerCard({ player, side, score, streak, active, gain }) {
  return (
    <div className={`dl-player ${side} ${active ? "active" : ""}`}>
      <div>
        <h3>{player.name}</h3>
        <p>{streak >= 2 ? `STREAK ×${streak}` : `RANK #${player.rank}`}</p>
      </div>
      <div className="dl-score"><CountUp value={score} duration={600} /></div>
      {gain > 0 && <span className="dl-gain" key={gain + "-" + score}>+{gain}</span>}
    </div>
  );
}


function Duel() {

  const navigate = useNavigate();

  // your name comes from the real login; everything else in the duel is demo data
  const stored = JSON.parse(localStorage.getItem("user") || "{}");
  const uname = stored.username || "player";
  const ME = { name: uname.toUpperCase(), tag: "@" + uname, rank: ME_DEFAULT.rank };

  const [s, dispatch] = useReducer(reducer, initial);

  const turn = s.qIndex % 2;
  const q = DUEL_QUESTIONS[s.qIndex];

  // ---------- timers (each effect cleans up after itself: safe in StrictMode) ----------

  useEffect(() => {
    if (s.phase !== "searching") return;
    const t = setTimeout(() => dispatch({ type: "FOUND" }), 2800);
    return () => clearTimeout(t);
  }, [s.phase]);

  useEffect(() => {
    if (s.phase !== "found") return;
    const t = setTimeout(() => dispatch({ type: "COUNTDOWN" }), 2600);
    return () => clearTimeout(t);
  }, [s.phase]);

  useEffect(() => {
    if (s.phase !== "countdown") return;
    const t = setTimeout(
      () => dispatch({ type: s.count > 0 ? "COUNT" : "ASK" }),
      s.count > 0 ? 1000 : 700
    );
    return () => clearTimeout(t);
  }, [s.phase, s.count]);

  // turn clock (ticks on both players' turns)
  useEffect(() => {
    if (s.phase !== "question") return;
    if (s.timeLeft <= 0) {
      dispatch({ type: "ANSWER", choice: null, timeLeft: 0 });
      return;
    }
    const t = setTimeout(() => dispatch({ type: "TICK" }), 1000);
    return () => clearTimeout(t);
  }, [s.phase, s.timeLeft]);

  // the "remote" opponent answering after their scripted delay
  useEffect(() => {
    if (s.phase !== "question" || s.qIndex % 2 !== 1) return;

    const step = OPP_SCRIPT[Math.floor(s.qIndex / 2)];
    const question = DUEL_QUESTIONS[s.qIndex];
    const choice = step.correct
      ? question.answer
      : (question.answer + 1) % question.options.length;

    const t = setTimeout(
      () => dispatch({ type: "ANSWER", choice, timeLeft: TURN_SECONDS - step.delay }),
      step.delay * 1000
    );
    return () => clearTimeout(t);
  }, [s.phase, s.qIndex]);

  useEffect(() => {
    if (s.phase !== "reveal") return;
    const t = setTimeout(() => dispatch({ type: "NEXT" }), REVEAL_MS);
    return () => clearTimeout(t);
  }, [s.phase]);


  // ---------- actions ----------

  function pick(i) {
    if (s.phase === "question" && turn === 0) {
      dispatch({ type: "ANSWER", choice: i, timeLeft: s.timeLeft });
    }
  }

  function leave() {
    const live = s.phase !== "lobby" && s.phase !== "result";
    if (live && !window.confirm("Leave the match? You will forfeit.")) return;
    navigate("/dashboard");
  }

  const navbar = (
    <nav className="dashboard-nav">
      <div className="dashboard-logo">QUIZ<span>DOM</span></div>
      <button className="nav-logout" onClick={leave}>
        {s.phase === "lobby" || s.phase === "result" ? "← DASHBOARD" : "FORFEIT"}
      </button>
    </nav>
  );

  const shell = (body) => (
    <div className="dashboard-page">
      {navbar}
      <main className="dashboard-content">{body}</main>
    </div>
  );


  // =========================
  // LOBBY
  // =========================
  if (s.phase === "lobby") {
    return shell(
      <>
        <section className="dashboard-header">
          <div>
            <p className="dashboard-label">ONLINE DUEL</p>
            <h1>HEAD TO <span>HEAD</span></h1>
            <p>
              Get matched with a player and take turns. You answer the odd
              questions, they answer the even ones. Highest score wins.
            </p>
          </div>
          <div className="dl-online"><i></i>1,284 PLAYERS ONLINE</div>
        </section>

        <div className="dashboard-card">
          <div className="stats-grid qz-stats-4">
            <div className="stat-box"><strong>{TOTAL}</strong><span>QUESTIONS</span></div>
            <div className="stat-box"><strong>{TURN_SECONDS}s</strong><span>PER TURN</span></div>
            <div className="stat-box"><strong>+10</strong><span>PER CORRECT</span></div>
            <div className="stat-box"><strong>+5</strong><span>3-STREAK BONUS</span></div>
          </div>
          <p className="qz-muted" style={{ marginTop: 18 }}>
            Faster answers earn up to +5 extra. Demo mode: the opponent is simulated.
          </p>
          <button
            className="primary-button"
            style={{ marginTop: 22 }}
            onClick={() => dispatch({ type: "SEARCH" })}
          >
            FIND OPPONENT →
          </button>
        </div>
      </>
    );
  }

  // =========================
  // SEARCHING
  // =========================
  if (s.phase === "searching") {
    return shell(
      <div className="dl-center">
        <div className="dl-radar"><i></i><i></i><i></i><b>YOU</b></div>
        <h2>
          SEARCHING FOR AN OPPONENT
          <span className="dl-dots"><span></span><span></span><span></span></span>
        </h2>
        <p className="qz-muted">Matching players near your rating</p>
        <button className="back-button" style={{ maxWidth: 220 }} onClick={() => dispatch({ type: "RESET" })}>
          CANCEL
        </button>
      </div>
    );
  }

  // =========================
  // MATCH FOUND + COUNTDOWN
  // =========================
  if (s.phase === "found" || s.phase === "countdown") {
    return shell(
      <div className="dl-center">
        <p className="dashboard-label">{s.phase === "found" ? "MATCH FOUND" : "GET READY"}</p>
        <div className="dl-vs">
          <div className="dl-fighter me">
            <div className="avatar">{ME.name[0]}</div>
            <h3>{ME.name}</h3>
            <p className="qz-muted">{ME.tag} · RANK #{ME.rank}</p>
          </div>
          <div className="dl-vs-mark">VS</div>
          <div className="dl-fighter opp">
            <div className="avatar opp">{OPP.name[0]}</div>
            <h3>{OPP.name}</h3>
            <p className="qz-muted">{OPP.tag} · RANK #{OPP.rank}</p>
          </div>
        </div>
        {s.phase === "found" ? (
          <p className="qz-muted">Connected · {OPP.ping} ms ping</p>
        ) : (
          <div className="dl-count" key={s.count}>{s.count > 0 ? s.count : "GO"}</div>
        )}
      </div>
    );
  }

  // =========================
  // RESULT
  // =========================
  if (s.phase === "result") {

    const [a, b] = s.scores;
    const outcome = a > b ? "win" : a < b ? "loss" : "draw";
    const maxS = Math.max(1, a, b);
    const delta = { win: "+24", loss: "-18", draw: "±0" }[outcome];
    const title = { win: "YOU WIN", loss: "YOU LOSE", draw: "DRAW" }[outcome];

    return shell(
      <>
        <section className="dashboard-header">
          <div>
            <p className="dashboard-label">MATCH COMPLETE</p>
            <h1 className={`dl-winner ${outcome}`}>{title}</h1>
            <p>Rating {delta} · {ME.name} vs {OPP.name}</p>
          </div>
          <button className="start-quiz-button" onClick={() => dispatch({ type: "SEARCH" })}>
            REMATCH →
          </button>
        </section>

        <div className="dashboard-card qz-section">
          <div className="card-title"><span></span><h2>FINAL SCORE</h2></div>
          <div className="dl-bars">
            <div className="dl-bar-row">
              <span>{ME.name}</span>
              <div className="dl-bar-track"><i style={{ transform: `scaleX(${a / maxS})` }}></i></div>
              <strong><CountUp value={a} /></strong>
            </div>
            <div className="dl-bar-row">
              <span>{OPP.name}</span>
              <div className="dl-bar-track"><i className="opp" style={{ transform: `scaleX(${b / maxS})` }}></i></div>
              <strong><CountUp value={b} /></strong>
            </div>
          </div>
        </div>

        <div className="dashboard-card qz-section">
          <div className="stats-grid qz-stats-4">
            <div className="stat-box"><strong>{s.right[0]}/5</strong><span>YOUR CORRECT</span></div>
            <div className="stat-box"><strong>{Math.round((s.right[0] / 5) * 100)}%</strong><span>YOUR ACCURACY</span></div>
            <div className="stat-box"><strong>{s.right[1]}/5</strong><span>THEIR CORRECT</span></div>
            <div className="stat-box"><strong>{Math.round((s.right[1] / 5) * 100)}%</strong><span>THEIR ACCURACY</span></div>
          </div>
        </div>
      </>
    );
  }

  // =========================
  // QUESTION / REVEAL
  // =========================

  const last = s.log[s.log.length - 1];
  const reveal = s.phase === "reveal";
  const who = last && last.p === 0 ? "YOU" : OPP.name;

  let status = { cls: "", text: "" };

  if (!reveal) {
    status = turn === 0
      ? { cls: "", text: "YOUR TURN · PICK AN ANSWER" }
      : { cls: "", text: `${OPP.name} IS THINKING` };
  } else if (last) {
    status = last.choice === null
      ? { cls: "bad", text: `${who} RAN OUT OF TIME` }
      : last.ok
        ? { cls: "good", text: `${who} GOT IT RIGHT  +${s.lastGain}` }
        : { cls: "bad", text: `${who} GOT IT WRONG` };
  }

  return shell(
    <>
      {/* SCOREBOARD */}
      <div className="dl-board">
        <PlayerCard
          player={ME} side="me" score={s.scores[0]} streak={s.streaks[0]}
          active={turn === 0} gain={reveal && last.p === 0 ? s.lastGain : 0}
        />
        <div className="dl-mid">Q {s.qIndex + 1}/{TOTAL}</div>
        <PlayerCard
          player={OPP} side="opp" score={s.scores[1]} streak={s.streaks[1]}
          active={turn === 1} gain={reveal && last.p === 1 ? s.lastGain : 0}
        />
      </div>

      {/* PROGRESS PIPS */}
      <div className="dl-pips">
        {Array.from({ length: TOTAL }, (_, i) => (
          <span
            key={i}
            className={`dl-pip ${s.log[i] ? (s.log[i].ok ? "ok" : "bad") : ""} ${i === s.qIndex ? "now" : ""}`}
          ></span>
        ))}
      </div>

      {/* QUESTION */}
      <div className="dashboard-card qz-question-card" key={s.qIndex}>

        <div className={`dl-turn ${turn === 0 ? "" : "opp"}`}>
          {turn === 0 ? "YOUR TURN" : `${OPP.name}'S TURN`} · {q.subject.toUpperCase()}
        </div>

        <div className="dl-timebar">
          <i
            className={s.timeLeft <= 5 ? "danger" : ""}
            style={{ width: `${(s.timeLeft / TURN_SECONDS) * 100}%` }}
          ></i>
        </div>

        <h2 className="qz-q-text">{q.text}</h2>

        <div className="qz-options">
          {q.options.map((option, i) => {

            let cls = "qz-option";

            if (reveal) {
              if (i === q.answer) cls += " dl-correct";
              else if (i === s.picked) cls += " dl-wrong";
              else cls += " dl-dim";
            } else if (turn === 1) {
              cls += " dl-locked";
            }

            return (
              <button
                key={i}
                className={cls}
                disabled={turn !== 0 || s.phase !== "question"}
                onClick={() => pick(i)}
              >
                <span className="qz-letter">{String.fromCharCode(65 + i)}</span>
                <span>{option}</span>
              </button>
            );
          })}
        </div>

        <div className={`dl-status ${status.cls}`}>
          {status.text}
          {!reveal && turn === 1 && (
            <span className="dl-dots"><span></span><span></span><span></span></span>
          )}
        </div>

      </div>
    </>
  );
}

export default Duel;
