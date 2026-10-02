import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { QUESTIONS, SUBJECTS } from "../data/questions";

import "../quiz.css";

// -------------------------
// SETTINGS
// -------------------------

const SECONDS_PER_QUESTION = 60;
const MARKS_CORRECT = 4;
const MARKS_WRONG = -1;

const MODES = [
  { id: "Physics", title: "PHYSICS", subjects: ["Physics"] },
  { id: "Chemistry", title: "CHEMISTRY", subjects: ["Chemistry"] },
  { id: "Maths", title: "MATHS", subjects: ["Maths"] },
  { id: "Full", title: "FULL MOCK", subjects: SUBJECTS },
];


// -------------------------
// HELPERS
// -------------------------

function buildQuiz(subjects) {

  // flatten the chosen subjects into one list, tagging each question
  return subjects.flatMap((subject) =>
    QUESTIONS[subject].map((question) => ({ ...question, subject }))
  );

}

function formatTime(totalSeconds) {

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return (
    String(minutes).padStart(2, "0") +
    ":" +
    String(seconds).padStart(2, "0")
  );

}


function Quiz() {

  const navigate = useNavigate();

  // -------------------------
  // STATE
  // -------------------------

  const [stage, setStage] = useState("setup"); // setup | running | result

  const [quiz, setQuiz] = useState([]);
  const [answers, setAnswers] = useState([]); // null = unanswered, else option index
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);


  // -------------------------
  // TIMER
  // -------------------------

  useEffect(() => {

    if (stage !== "running") {
      return;
    }

    if (timeLeft <= 0) {
      handleFinishQuiz();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((previous) => previous - 1);
    }, 1000);

    return () => clearTimeout(timer);

  }, [stage, timeLeft]);


  // -------------------------
  // ACTIONS
  // -------------------------

  function startQuiz(mode) {

    const list = buildQuiz(mode.subjects);

    setQuiz(list);
    setAnswers(list.map(() => null));
    setCurrent(0);
    setTimeLeft(list.length * SECONDS_PER_QUESTION);
    setStage("running");

  }

  function selectOption(optionIndex) {

    setAnswers((previous) =>
      previous.map((value, index) => {

        if (index !== current) {
          return value;
        }

        // clicking the selected option again clears it
        return value === optionIndex ? null : optionIndex;

      })
    );

  }

  function clearAnswer() {

    setAnswers((previous) =>
      previous.map((value, index) =>
        index === current ? null : value
      )
    );

  }
  
  function handleFinishQuiz() {
    // Calculate results for the backend payload
    const computedResults = quiz.map((item, index) => {
      const picked = answers[index];
      let status = "skipped";
      if (picked !== null) {
        status = picked === item.answer ? "correct" : "wrong";
      }
      return { ...item, picked, status };
    });

    const correct = computedResults.filter((r) => r.status === "correct").length;
    const wrong = computedResults.filter((r) => r.status === "wrong").length;
    const skipped = computedResults.filter((r) => r.status === "skipped").length;
    
    const score = correct * MARKS_CORRECT + wrong * MARKS_WRONG;
    const maxScore = quiz.length * MARKS_CORRECT;
    const attempted = correct + wrong;
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    const timeTaken = quiz.length * SECONDS_PER_QUESTION - timeLeft;

    let modeName = "Full";
    if (quiz.length > 0) {
       const distinctSubjects = [...new Set(quiz.map(q => q.subject))];
       if (distinctSubjects.length === 1) modeName = distinctSubjects[0];
    }

    const payload = {
      userId: 1, // Hardcoded test user until full auth flow is wired
      mode: modeName,
      totalQuestions: quiz.length,
      timeTakenSeconds: timeTaken,
      correctCount: correct,
      wrongCount: wrong,
      skippedCount: skipped,
      totalScore: score,
      maxScore: maxScore,
      accuracyPercentage: accuracy
    };

    fetch('http://localhost:8080/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => console.log('Saved attempt to database:', data))
    .catch(err => console.error('Error saving attempt:', err));
    
    setStage("result");
  }

  function submitQuiz() {

    const unanswered = answers.filter((value) => value === null).length;

    const message =
      unanswered > 0
        ? `You have ${unanswered} unanswered question(s). Submit anyway?`
        : "Submit your quiz?";

    if (window.confirm(message)) {
      handleFinishQuiz();
    }

  }

  function exitQuiz() {

    if (
      stage === "running" &&
      !window.confirm("Exit the quiz? Your progress will be lost.")
    ) {
      return;
    }

    navigate("/dashboard");

  }


  // -------------------------
  // NAVBAR (shared by all stages)
  // -------------------------

  const navbar = (

    <nav className="dashboard-nav">

      <div className="dashboard-logo">
        QUIZ<span>DOM</span>
      </div>

      <button className="nav-logout" onClick={exitQuiz}>
        {stage === "running" ? "EXIT QUIZ" : "← DASHBOARD"}
      </button>

    </nav>

  );


  // =========================
  // STAGE 1: SETUP
  // =========================

  if (stage === "setup") {

    return (

      <div className="dashboard-page">

        {navbar}

        <main className="dashboard-content">

          <section className="dashboard-header">

            <div>

              <p className="dashboard-label">
                QUIZ SETUP
              </p>

              <h1>
                CHOOSE YOUR <span>ROUND</span>
              </h1>

              <p>
                10 questions per subject. {SECONDS_PER_QUESTION} seconds per question.
                +{MARKS_CORRECT} for correct, {MARKS_WRONG} for wrong, 0 if skipped.
              </p>

            </div>

          </section>


          <div className="qz-mode-grid">

            {MODES.map((mode) => {

              const count = mode.subjects.length * 10;

              return (

                <button
                  key={mode.id}
                  className="qz-mode-card"
                  onClick={() => startQuiz(mode)}
                >

                  <h3>{mode.title}</h3>

                  <p>
                    {count} questions
                  </p>

                  <p>
                    {formatTime(count * SECONDS_PER_QUESTION)} minutes
                  </p>

                </button>

              );

            })}

          </div>

        </main>

      </div>

    );

  }


  // =========================
  // STAGE 2: RUNNING
  // =========================

  if (stage === "running") {

    const question = quiz[current];
    const isLast = current === quiz.length - 1;

    return (

      <div className="dashboard-page">

        {navbar}

        <main className="dashboard-content">

          {/* TOP BAR */}

          <div className="qz-topbar">

            <div>

              <p className="qz-subject">
                {question.subject}
              </p>

              <p className="qz-muted">
                Question {current + 1} of {quiz.length}
              </p>

            </div>

            <div
              className={
                timeLeft <= 60 ? "qz-timer danger" : "qz-timer"
              }
            >
              {formatTime(timeLeft)}
            </div>

          </div>


          <div className="qz-layout">

            {/* QUESTION */}

            <div className="dashboard-card qz-question-card">

              <h2 className="qz-q-text">
                {question.text}
              </h2>

              <div className="qz-options">

                {question.options.map((option, index) => (

                  <button
                    key={index}
                    className={
                      answers[current] === index
                        ? "qz-option selected"
                        : "qz-option"
                    }
                    onClick={() => selectOption(index)}
                  >

                    <span className="qz-letter">
                      {String.fromCharCode(65 + index)}
                    </span>

                    <span>{option}</span>

                  </button>

                ))}

              </div>


              <div className="qz-actions">

                <button
                  className="qz-btn"
                  disabled={current === 0}
                  onClick={() => setCurrent(current - 1)}
                >
                  ← PREVIOUS
                </button>

                <button
                  className="qz-btn"
                  onClick={clearAnswer}
                >
                  CLEAR
                </button>

                {isLast ? (

                  <button
                    className="qz-btn primary"
                    onClick={submitQuiz}
                  >
                    SUBMIT
                  </button>

                ) : (

                  <button
                    className="qz-btn primary"
                    onClick={() => setCurrent(current + 1)}
                  >
                    NEXT →
                  </button>

                )}

              </div>

            </div>


            {/* PALETTE */}

            <aside className="dashboard-card qz-palette">

              <div className="card-title">
                <span></span>
                <h2>QUESTIONS</h2>
              </div>

              <div className="qz-palette-grid">

                {quiz.map((item, index) => {

                  let className = "qz-pal-btn";

                  if (answers[index] !== null) {
                    className += " answered";
                  }

                  if (index === current) {
                    className += " current";
                  }

                  return (

                    <button
                      key={item.id}
                      className={className}
                      onClick={() => setCurrent(index)}
                    >
                      {index + 1}
                    </button>

                  );

                })}

              </div>

              <p className="qz-muted qz-palette-note">
                Filled = answered. Red outline = current.
              </p>

              <button
                className="qz-btn primary qz-submit-wide"
                onClick={submitQuiz}
              >
                SUBMIT QUIZ
              </button>

            </aside>

          </div>

        </main>

      </div>

    );

  }


  // =========================
  // STAGE 3: RESULT
  // =========================

  const results = quiz.map((item, index) => {

    const picked = answers[index];

    let status = "skipped";

    if (picked !== null) {
      status = picked === item.answer ? "correct" : "wrong";
    }

    return { ...item, picked, status };

  });

  function summarize(list) {

    const correct = list.filter((r) => r.status === "correct").length;
    const wrong = list.filter((r) => r.status === "wrong").length;
    const skipped = list.filter((r) => r.status === "skipped").length;

    return {
      correct,
      wrong,
      skipped,
      score: correct * MARKS_CORRECT + wrong * MARKS_WRONG,
    };

  }

  const overall = summarize(results);
  const maxScore = quiz.length * MARKS_CORRECT;
  const attempted = overall.correct + overall.wrong;
  const accuracy =
    attempted > 0 ? Math.round((overall.correct / attempted) * 100) : 0;
  const timeTaken = quiz.length * SECONDS_PER_QUESTION - timeLeft;

  const subjectsInQuiz = [...new Set(results.map((r) => r.subject))];

  return (

    <div className="dashboard-page">

      {navbar}

      <main className="dashboard-content">

        <section className="dashboard-header">

          <div>

            <p className="dashboard-label">
              {timeLeft === 0 ? "TIME'S UP" : "QUIZ COMPLETE"}
            </p>

            <h1>
              YOUR SCORE:{" "}
              <span>{overall.score}</span> / {maxScore}
            </h1>

            <p>
              Accuracy {accuracy}% · Time taken {formatTime(timeTaken)}
            </p>

          </div>

          <button
            className="start-quiz-button"
            onClick={() => setStage("setup")}
          >
            PLAY AGAIN →
          </button>

        </section>


        {/* STATS */}

        <div className="dashboard-card qz-section">

          <div className="stats-grid qz-stats-4">

            <div className="stat-box">
              <strong>{overall.correct}</strong>
              <span>CORRECT</span>
            </div>

            <div className="stat-box">
              <strong>{overall.wrong}</strong>
              <span>WRONG</span>
            </div>

            <div className="stat-box">
              <strong>{overall.skipped}</strong>
              <span>SKIPPED</span>
            </div>

            <div className="stat-box">
              <strong>{overall.score}</strong>
              <span>SCORE</span>
            </div>

          </div>

        </div>


        {/* PER SUBJECT */}

        <div className="dashboard-card qz-section">

          <div className="card-title">
            <span></span>
            <h2>SUBJECT BREAKDOWN</h2>
          </div>

          <div className="qz-table-wrap">

            <table className="qz-table">

              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Correct</th>
                  <th>Wrong</th>
                  <th>Skipped</th>
                  <th>Score</th>
                </tr>
              </thead>

              <tbody>

                {subjectsInQuiz.map((subject) => {

                  const part = summarize(
                    results.filter((r) => r.subject === subject)
                  );

                  return (

                    <tr key={subject}>
                      <td>{subject}</td>
                      <td>{part.correct}</td>
                      <td>{part.wrong}</td>
                      <td>{part.skipped}</td>
                      <td className="qz-overall">{part.score}</td>
                    </tr>

                  );

                })}

              </tbody>

            </table>

          </div>

        </div>


        {/* REVIEW */}

        <div className="dashboard-card qz-section">

          <div className="card-title">
            <span></span>
            <h2>REVIEW ANSWERS</h2>
          </div>

          {results.map((item, index) => (

            <div
              key={item.id}
              className={`qz-review ${item.status}`}
            >

              <p className="qz-review-q">
                <strong>Q{index + 1}.</strong> {item.text}
              </p>

              <p className="qz-muted">
                Your answer:{" "}
                {item.picked === null
                  ? "Not answered"
                  : item.options[item.picked]}
              </p>

              {item.status !== "correct" && (

                <p className="qz-correct-line">
                  Correct answer: {item.options[item.answer]}
                </p>

              )}

            </div>

          ))}

        </div>

      </main>

    </div>

  );
}

export default Quiz;
