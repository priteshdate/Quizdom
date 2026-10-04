import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import CountUp from "../components/CountUp";
import "../quiz.css";

// -------------------------
// SETTINGS
// -------------------------

const SECONDS_PER_QUESTION = 60;
const MARKS_CORRECT = 4;
const MARKS_WRONG = -1;
const SUBJECTS = ["Physics", "Chemistry", "Maths"];

const MODES = [
  { id: "Physics", title: "PHYSICS", subjects: ["Physics"] },
  { id: "Chemistry", title: "CHEMISTRY", subjects: ["Chemistry"] },
  { id: "Maths", title: "MATHS", subjects: ["Maths"] },
  { id: "Full", title: "FULL MOCK", subjects: SUBJECTS },
];


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
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizError, setQuizError] = useState("");
  const [quizResult, setQuizResult] = useState(null);
  const [reviewQuestion, setReviewQuestion] = useState(0);
  const finishingRef = useRef(false);


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

  async function startQuiz(mode) {

    setLoadingQuiz(true);
    setQuizError("");

    try {
      const params = new URLSearchParams();
      mode.subjects.forEach((subject) => params.append("subjects", subject));
      const response = await fetch(`http://localhost:8080/api/questions?${params}`);
      const list = await response.json();

      if (!response.ok) {
        throw new Error(list.message || "Could not load quiz questions.");
      }

      setQuiz(list);
      setAnswers(list.map(() => null));
      setQuizResult(null);
      setReviewQuestion(0);
      setCurrent(0);
      setTimeLeft(list.length * SECONDS_PER_QUESTION);
      setStage("running");
    } catch (error) {
      setQuizError(error.message || "Could not load quiz questions.");
    } finally {
      setLoadingQuiz(false);
    }

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
  
  async function handleFinishQuiz() {
    if (finishingRef.current) return;
    finishingRef.current = true;

    let modeName = "Full";
    if (quiz.length > 0) {
       const distinctSubjects = [...new Set(quiz.map(q => q.subject))];
       if (distinctSubjects.length === 1) modeName = distinctSubjects[0];
    }

    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

    const payload = {
      // The login stored procedure returns the username, which is the user key.
      username: storedUser.username || "",
      mode: modeName,
      timeTakenSeconds: Math.max(0, quiz.length * SECONDS_PER_QUESTION - timeLeft),
      questionIds: quiz.map((question) => question.id),
      answers
    };

    try {
      const response = await fetch("http://localhost:8080/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Could not submit the quiz.");
      }
      setQuizResult(data);
      setReviewQuestion(0);
      setStage("result");
    } catch (error) {
      alert(error.message || "Could not submit the quiz.");
    } finally {
      finishingRef.current = false;
    }
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
                Up to 10 random database questions per subject. {SECONDS_PER_QUESTION} seconds per question.
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
                  disabled={loadingQuiz}
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

          {quizError && <p className="qz-muted">{quizError}</p>}

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

            <div className="dashboard-card qz-question-card" key={current}>

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
    const correctAnswer = quizResult?.correctAnswers?.[item.id];

    let status = "skipped";

    if (picked !== null) {
      status = picked === correctAnswer ? "correct" : "wrong";
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

  const overall = quizResult
    ? { correct: quizResult.correct, wrong: quizResult.wrong, skipped: quizResult.skipped, score: quizResult.score }
    : summarize(results);
  const maxScore = quizResult?.maxScore ?? quiz.length * MARKS_CORRECT;
  const attempted = overall.correct + overall.wrong;
  const accuracy =
    quizResult?.accuracy ?? (attempted > 0 ? Math.round((overall.correct / attempted) * 100) : 0);
  const timeTaken = Math.max(0, quiz.length * SECONDS_PER_QUESTION - timeLeft);

  const subjectsInQuiz = [...new Set(results.map((r) => r.subject))];
  const activeReview = results[reviewQuestion];
  const activeCorrectAnswer = quizResult?.correctAnswers?.[activeReview?.id];

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
              <span><CountUp value={overall.score} /></span> / {maxScore}
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
              <strong><CountUp value={overall.correct} /></strong>
              <span>CORRECT</span>
            </div>

            <div className="stat-box">
              <strong><CountUp value={overall.wrong} /></strong>
              <span>WRONG</span>
            </div>

            <div className="stat-box">
              <strong><CountUp value={overall.skipped} /></strong>
              <span>SKIPPED</span>
            </div>

            <div className="stat-box">
              <strong><CountUp value={overall.score} /></strong>
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

          <div className="qz-review-picker" aria-label="Select a question to review">
            {results.map((item, index) => (
              <button
                key={item.id}
                className={`qz-review-number ${item.status} ${index === reviewQuestion ? "active" : ""}`}
                onClick={() => setReviewQuestion(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {activeReview && (
            <article className={`qz-review-detail ${activeReview.status}`}>
              <p className="qz-review-subject">{activeReview.subject} · QUESTION {reviewQuestion + 1}</p>
              <h3 className="qz-review-q">{activeReview.text}</h3>

              <div className="qz-review-options">
                {activeReview.options.map((option, optionIndex) => {
                  const isPicked = activeReview.picked === optionIndex;
                  const isCorrect = activeCorrectAnswer === optionIndex;
                  const optionState = isCorrect ? "correct" : isPicked ? "incorrect" : "";

                  return (
                    <div key={optionIndex} className={`qz-review-option ${optionState}`}>
                      <span className="qz-letter">{String.fromCharCode(65 + optionIndex)}</span>
                      <span>{option}</span>
                      {isCorrect && <small>CORRECT ANSWER</small>}
                      {isPicked && !isCorrect && <small>YOUR ANSWER</small>}
                    </div>
                  );
                })}
              </div>

              <p className="qz-muted qz-review-summary">
                Your selection: {activeReview.picked === null ? "Not answered" : activeReview.options[activeReview.picked]}
              </p>
            </article>
          )}

        </div>

      </main>

    </div>

  );
}

export default Quiz;
