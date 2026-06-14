import { useEffect, useMemo, useState } from "react";
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
  const [selected, setSelected] = useState(null); // selected option string
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = questions[index];

  // Load the quiz for this subject once.
  useEffect(() => {
    getQuiz(subject)
      .then((data) => {
        setQuestions(data.questions || []);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [subject.id]);

  // Whenever the current question changes, build a freshly shuffled option set.
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
    if (isLast) {
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
    }
  }

  function restart() {
    setIndex(0);
    setScore(0);
    setSelected(null);
    setFinished(false);
    // Re-shuffle the very first question immediately.
    if (questions[0]) {
      setOptions(shuffle([questions[0].correct_answer, ...questions[0].wrong_answers]));
    }
  }

  function classFor(option) {
    if (selected === null) return "option";
    if (option === current.correct_answer) return "option correct";
    if (option === selected) return "option wrong";
    return "option dim";
  }

  if (status === "loading") return <p className="info">Loading questions…</p>;
  if (status === "error")
    return (
      <div>
        <button className="back" onClick={onBack}>← Back</button>
        <p className="info error">Could not load this quiz.</p>
      </div>
    );
  if (total === 0)
    return (
      <div>
        <button className="back" onClick={onBack}>← Back</button>
        <p className="info">No questions found for {subject.name}.</p>
      </div>
    );

  if (finished) {
    return (
      <div className="result-card">
        <h2>Quiz complete!</h2>
        <p className="score-big">{score} / {total}</p>
        <p className="info">Subject: {subject.name}</p>
        <div className="actions">
          <button className="primary" onClick={restart}>Try again</button>
          <button className="secondary" onClick={onBack}>Back to subjects</button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz">
      <div className="quiz-top">
        <button className="back" onClick={onBack}>← Back</button>
        <span className="progress">
          {subject.name} · Question {index + 1} of {total} · Score {score}
        </span>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${((index) / total) * 100}%` }} />
      </div>

      <h2 className="question">{current.question}</h2>

      <div className="options">
        {options.map((opt) => (
          <button
            key={opt}
            className={classFor(opt)}
            onClick={() => handleSelect(opt)}
            disabled={selected !== null}
          >
            {opt}
          </button>
        ))}
      </div>

      {selected !== null && (
        <div className="feedback">
          {selected === current.correct_answer ? (
            <span className="ok">✓ Correct!</span>
          ) : (
            <span className="bad">✗ Wrong — correct answer highlighted in green.</span>
          )}
          <button className="primary" onClick={handleNext}>
            {isLast ? "Finish" : "Next Question →"}
          </button>
        </div>
      )}
    </div>
  );
}
