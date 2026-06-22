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

// Backward compatible and forgiving: the correct answer(s) may live under either
// `correct_answers` or `correct_answer`, and the value may be a single string OR a
// list. A list with 2+ items becomes a multi-select question; anything else is
// single-select. Empty / null values are dropped.
function correctsOf(q) {
  if (!q) return [];
  const raw = q.correct_answers != null ? q.correct_answers : q.correct_answer;
  const list = Array.isArray(raw) ? raw : [raw];
  return list.filter((v) => v != null && String(v).trim() !== "");
}

export default function Quiz({ subject, onBack }) {
  const [questions, setQuestions] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [index, setIndex] = useState(0);
  const [options, setOptions] = useState([]);
  const [chosen, setChosen] = useState([]);   // options the user picked
  const [locked, setLocked] = useState(false); // feedback shown / answer submitted
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = questions[index];
  const corrects = correctsOf(current);
  const isMulti = corrects.length > 1;
  const total = questions.length;
  const isLast = index === total - 1;

  const answeredCorrect =
    locked &&
    chosen.length === corrects.length &&
    corrects.every((c) => chosen.includes(c));

  useEffect(() => {
    getQuiz(subject)
      .then((data) => {
        setQuestions(shuffle(data.questions || [])); // random question order
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [subject]);

  // Re-shuffle options and reset answer state whenever the question changes.
  useEffect(() => {
    if (!current) return;
    setOptions(shuffle([...correctsOf(current), ...current.wrong_answers]));
    setChosen([]);
    setLocked(false);
  }, [current]);

  function handleOption(option) {
    if (locked) return;
    if (isMulti) {
      // toggle selection, wait for the "Check" button
      setChosen((c) => (c.includes(option) ? c.filter((o) => o !== option) : [...c, option]));
    } else {
      // single answer: lock immediately
      setChosen([option]);
      setLocked(true);
      if (corrects[0] === option) setScore((s) => s + 1);
    }
  }

  function check() {
    if (locked || chosen.length === 0) return;
    setLocked(true);
    const ok =
      chosen.length === corrects.length && corrects.every((c) => chosen.includes(c));
    if (ok) setScore((s) => s + 1);
  }

  function handleNext() {
    if (isLast) setFinished(true);
    else setIndex((i) => i + 1);
  }

  function restart() {
    setQuestions((qs) => shuffle(qs)); // fresh random order on retry
    setIndex(0);
    setScore(0);
    setChosen([]);
    setLocked(false);
    setFinished(false);
  }

  function classFor(option) {
    const picked = chosen.includes(option);
    if (!locked) return picked ? "option glass picked" : "option glass";
    if (corrects.includes(option)) return "option glass correct";
    if (picked) return "option glass wrong";
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
        {isMulti && !locked && (
          <p className="multi-hint">✔️ Multiple answers — select all that apply, then Check.</p>
        )}

        <div className="options">
          {options.map((opt) => (
            <button
              key={opt}
              className={classFor(opt)}
              onClick={() => handleOption(opt)}
              disabled={locked}
            >
              {isMulti && !locked && (
                <span className={chosen.includes(opt) ? "checkbox on" : "checkbox"} />
              )}
              <span className="option-text">{opt}</span>
              {locked && corrects.includes(opt) && <span className="mark ok">✓</span>}
              {locked && chosen.includes(opt) && !corrects.includes(opt) && (
                <span className="mark bad">✗</span>
              )}
            </button>
          ))}
        </div>

        {isMulti && !locked && (
          <div className="feedback">
            <span className="info" style={{ padding: 0 }}>
              {chosen.length} selected
            </span>
            <button className="primary" onClick={check} disabled={chosen.length === 0}>
              Check answer
            </button>
          </div>
        )}

        {locked && (
          <div className="feedback">
            <span className={answeredCorrect ? "ok" : "bad"}>
              {answeredCorrect
                ? "✓ Correct!"
                : isMulti
                ? "✗ Not quite — correct answers are highlighted."
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
