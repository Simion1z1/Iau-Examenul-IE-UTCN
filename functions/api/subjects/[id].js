// Backend endpoint:  GET /api/subjects/:id  ->  { subject, questions }
// The quiz file name is derived from the subject's name (lowercased):
// { id: "sub1", name: "Anatomy" } -> data/anatomy.json
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

  const fileName = `${subject.name.toLowerCase()}.json`;
  // Guard against path traversal via a crafted subject name.
  if (/[\\/]|\.\./.test(fileName)) {
    return Response.json({ error: "Invalid subject file name." }, { status: 400 });
  }

  const quizRes = await env.ASSETS.fetch(`${origin}/data/${fileName}`);
  if (!quizRes.ok) {
    return Response.json({ error: "Could not load quiz." }, { status: 500 });
  }
  const questions = await quizRes.json();
  return Response.json({ subject, questions });
}
