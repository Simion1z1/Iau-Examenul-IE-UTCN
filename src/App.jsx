import { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard.jsx";
import Quiz from "./components/Quiz.jsx";

export default function App() {
  // Minimal routing: null = dashboard, otherwise the chosen subject.
  const [activeSubject, setActiveSubject] = useState(null);

  // Theme persisted across visits.
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("theme") || "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("theme", theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  return (
    <div className="app">
      <div className="bg-orbs" aria-hidden="true">
        <span className="orb orb-1" />
        <span className="orb orb-2" />
        <span className="orb orb-3" />
      </div>

      <header className="app-header">
        <h1 className="brand" onClick={() => setActiveSubject(null)}>
          <span className="brand-mark">🎓</span> Treci sau pici? Află!
        </h1>
        <button
          className="theme-toggle"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle light/dark theme"
          title="Toggle theme"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
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
