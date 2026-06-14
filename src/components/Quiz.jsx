import { useEffect, useState } from "react";
import { getQuiz } from "../api.js";

// Fisher-Yates shuffle (returns a new array).
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Quiz({ subject, onBack }) {
  const [questions, setQuestions] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [index, setIndex] = useState(0);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = questions[index];

  useEffect(() => {
    getQuiz(subject)
      .then((data) => {
        setQuestions(data.questions || []);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [subject]);

  // Re-shuffle options whenever the current question changes.
  useEffect(() => {
    if (!current) return;
    setOptions(shuffle([current.correct_answer, ...current.wrong_answers]));
    setSelected(null);
  }, [current]);

  const total = questions.length;
  const isLast = index === total - 1;

  function handleSelect(option) {
    if (selected !== null) return; // lock after first choice
    setSelected(option);
    if (option === current.correct_answer) setScore((s) => s + 1);
  }

  function handleNext() {
    if (isLast) setFinished(true);
    else setIndex((i) => i + 1);
  }

  function restart() {
    setIndex(0);
    setScore(0);
    setSelected(null);
    setFinished(false);
    if (questions[0]) {
      setOptions(shuffle([questions[0].correct_answer, ...questions[0].wrong_answers]));
    }
  }

  function classFor(option) {
    if (selected === null) return "option glass";
    if (option === current.correct_answer) return "option glass correct";
    if (option === selected) return "option glass wrong";
    return "option glass dim";
  }

  if (status === "loading") return <div className="info glass">Loading questions…</div>;
  if (status === "error")
    return (
      <div className="quiz-wrap">
        <button className="back" onClick={onBack}>← Back</button>
        <div className="info glass error">Could not load this quiz.</div>
      </div>
    );
  if (total === 0)
    return (
      <div className="quiz-wrap">
        <button className="back" onClick={onBack}>← Back</button>
        <div className="info glass">No questions found for {subject.name}.</div>
      </div>
    );

  if (finished) {
    const pct = Math.round((score / total) * 100);
    const message =
      pct === 100 ? "Perfect! 🏆" : pct >= 70 ? "Great work! 🎉" : pct >= 40 ? "Keep practising 💪" : "Don't give up! 📚";
    return (
      <div className="result-card glass">
        <div className="score-ring" style={{ "--pct": pct }}>
          <div className="score-ring-inner">
            <span className="score-big">{score}/{total}</span>
            <span className="score-pct">{pct}%</span>
          </div>
        </div>
        <h2 className="result-title">{message}</h2>
        <p className="info">Subject: {subject.name}</p>
        <div className="actions">
          <button className="primary" onClick={restart}>Try again</button>
          <button className="secondary" onClick={onBack}>Back to subjects</button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-wrap">
      <div className="quiz-top">
        <button className="back" onClick={onBack}>← Back</button>
        <div className="quiz-meta">
          <span className="pill">{subject.name}</span>
          <span className="pill pill-accent">Score {score}</span>
        </div>
      </div>

      <div className="progress-row">
        <span className="progress-label">Question {index + 1} of {total}</span>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(index / total) * 100}%` }} />
        </div>
      </div>

      <div className="quiz-card glass" key={index}>
        <h2 className="question">{current.question}</h2>

        <div className="options">
          {options.map((opt) => (
            <button
              key={opt}
              className={classFor(opt)}
              onClick={() => handleSelect(opt)}
              disabled={selected !== null}
            >
              <span className="option-text">{opt}</span>
              {selected !== null && opt === current.correct_answer && (
                <span className="mark ok">✓</span>
              )}
              {selected !== null && opt === selected && opt !== current.correct_answer && (
                <span className="mark bad">✗</span>
              )}
            </button>
          ))}
        </div>

        {selected !== null && (
          <div className="feedback">
            <span className={selected === current.correct_answer ? "ok" : "bad"}>
              {selected === current.correct_answer
                ? "✓ Correct!"
                : "✗ Wrong — the correct answer is highlighted."}
            </span>
            <button className="primary" onClick={handleNext}>
              {isLast ? "Finish" : "Next Question →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
