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

  if (status === "loading") return <p className="info">Loading subjects…</p>;
  if (status === "error")
    return <p className="info error">Could not load subjects. Is the backend running?</p>;

  return (
    <section>
      <h2 className="section-title">Choose a subject</h2>
      <div className="subject-grid">
        {subjects.map((s) => (
          <button key={s.id} className="subject-card" onClick={() => onSelect(s)}>
            <span className="subject-name">{s.name}</span>
            <span className="subject-cta">Practice →</span>
          </button>
        ))}
      </div>
    </section>
  );
}
