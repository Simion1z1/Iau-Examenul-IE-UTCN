// Backend endpoint:  GET /api/subjects/:id  ->  { subject, questions }
// The quiz file is named after the subject's name. Cloudflare is
// case-sensitive, so we try the name exactly as written AND lowercased.
export async function onRequestGet(context) {
  const { request, env, params } = context;
  const origin = new URL(request.url).origin;

  const subjectsRes = await env.ASSETS.fetch(`${origin}/data/subjects.json`);
  if (!subjectsRes.ok) {
    return Response.json({ error: "Could not load subjects." }, { status: 500 });
  }
  const subjects = await subjectsRes.json();
  const subject = subjects.find((s) => s.id === params.id);
  if (!subject) {
    return Response.json({ error: "Subject not found." }, { status: 404 });
  }

  const candidates = [`${subject.name}.json`, `${subject.name.toLowerCase()}.json`];
  for (const fileName of candidates) {
    if (/[\\/]|\.\./.test(fileName)) continue; // path-traversal guard
    const quizRes = await env.ASSETS.fetch(`${origin}/data/${fileName}`);
    if (quizRes.ok) {
      try {
        const questions = await quizRes.json();
        return Response.json({ subject, questions });
      } catch {
        /* not JSON, try next candidate */
      }
    }
  }
  return Response.json({ error: "Could not load quiz." }, { status: 500 });
}
