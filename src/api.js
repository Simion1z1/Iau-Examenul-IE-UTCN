// Calls the Pages Functions backend (/api/*). If that isn't available
// (e.g. plain `vite dev` with no Functions runtime), it transparently
// falls back to the static JSON in /public/data.

async function loadJson(apiPath, staticPath) {
  try {
    const r = await fetch(apiPath);
    if (r.ok) return await r.json(); // throws on non-JSON -> falls back
  } catch (_) {
    /* fall through to static */
  }
  const r = await fetch(staticPath);
  if (!r.ok) throw new Error(`Failed to load ${apiPath}`);
  return r.json();
}

const DATA = `${import.meta.env.BASE_URL}data`;

export async function getSubjects() {
  return loadJson("/api/subjects", `${DATA}/subjects.json`);
}

export async function getQuiz(subject) {
  const fileName = `${subject.name.toLowerCase()}.json`;
  const data = await loadJson(
    `/api/subjects/${encodeURIComponent(subject.id)}`,
    `${DATA}/${fileName}`
  );
  // Backend returns { subject, questions }; static fallback returns the array.
  const questions = Array.isArray(data) ? data : data.questions;
  return { subject, questions };
}
