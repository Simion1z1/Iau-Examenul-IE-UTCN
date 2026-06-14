// Calls the Pages Functions backend (/api/*). If that isn't available
// (e.g. plain `vite dev` with no Functions runtime), it transparently
// falls back to the static JSON in /public/data.

const DATA = `${import.meta.env.BASE_URL}data`;

async function fetchJson(url) {
  const r = await fetch(url);
  if (!r.ok) return null;
  try {
    return await r.json();
  } catch {
    return null; // not JSON (e.g. SPA fallback HTML)
  }
}

export async function getSubjects() {
  return (
    (await fetchJson("/api/subjects")) ||
    (await fetchJson(`${DATA}/subjects.json`)) ||
    Promise.reject(new Error("Failed to load subjects"))
  );
}

export async function getQuiz(subject) {
  // Try the backend first.
  const api = await fetchJson(`/api/subjects/${encodeURIComponent(subject.id)}`);
  if (api) {
    const questions = Array.isArray(api) ? api : api.questions;
    if (questions) return { subject, questions };
  }

  // Static fallback. Cloudflare is case-sensitive, so try the name exactly
  // as written AND lowercased — whichever file actually exists wins.
  const candidates = [`${subject.name}.json`, `${subject.name.toLowerCase()}.json`];
  for (const file of candidates) {
    const data = await fetchJson(`${DATA}/${file}`);
    if (data) {
      const questions = Array.isArray(data) ? data : data.questions;
      if (questions) return { subject, questions };
    }
  }
  throw new Error("Failed to load quiz");
}
