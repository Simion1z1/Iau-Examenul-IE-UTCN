import { useEffect, useState } from "react";
import { getSubjects } from "../api.js";

export default function Dashboard({ onSelect }) {
  const [subjects, setSubjects] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  useEffect(() => {
    getSubjects()
      .then((data) => {
        setSubjects(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  if (status === "loading")
    return <div className="info glass">Loading subjects…</div>;
  if (status === "error")
    return (
      <div className="info glass error">
        Could not load subjects. Is the backend running?
      </div>
    );

  return (
    <section className="dash">
      <h2 className="section-title">Choose a subject</h2>
      <p className="section-sub">Tap a card to start practising.</p>

      <div className="subject-grid">
        {subjects.map((s, i) => (
          <button
            key={s.id}
            className="subject-card glass"
            style={{ animationDelay: `${i * 70}ms` }}
            onClick={() => onSelect(s)}
          >
            <span className="subject-avatar">{s.name.charAt(0).toUpperCase()}</span>
            <span className="subject-name">{s.name}</span>
            <span className="subject-cta">
              Practice <span className="arrow">→</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
