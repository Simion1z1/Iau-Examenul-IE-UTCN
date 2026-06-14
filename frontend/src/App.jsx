import { useState } from "react";
import Dashboard from "./components/Dashboard.jsx";
import Quiz from "./components/Quiz.jsx";

export default function App() {
  // Minimal client-side routing: null = dashboard, otherwise the chosen subject.
  const [activeSubject, setActiveSubject] = useState(null);

  return (
    <div className="app">
      <header className="app-header">
        <h1 onClick={() => setActiveSubject(null)} className="brand">
          🎓 Quiz Trainer
        </h1>
      </header>

      <main className="app-main">
        {activeSubject ? (
          <Quiz subject={activeSubject} onBack={() => setActiveSubject(null)} />
        ) : (
          <Dashboard onSelect={setActiveSubject} />
        )}
      </main>
    </div>
  );
}
