// Static, backend-free data access.
// JSON lives in /public/data and is served at /data/* by Vite (dev) and
// Cloudflare Pages (prod). No server required.

const BASE = `${import.meta.env.BASE_URL}data`;

export async function getSubjects() {
  const res = await fetch(`${BASE}/subjects.json`);
  if (!res.ok) throw new Error("Failed to load subjects");
  return res.json();
}

// The quiz file name is derived from the subject's name (lowercased):
// { id: "sub1", name: "Anatomy" } -> /data/anatomy.json
export async function getQuiz(subject) {
  const fileName = `${subject.name.toLowerCase()}.json`;
  const res = await fetch(`${BASE}/${fileName}`);
  if (!res.ok) throw new Error("Failed to load quiz");
  const questions = await res.json();
  return { subject, questions };
}
