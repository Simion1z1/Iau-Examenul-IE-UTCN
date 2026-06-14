// Backend endpoint:  GET /api/subjects
// Reads the static JSON shipped with the site and returns the subject list.
export async function onRequestGet(context) {
  const { request, env } = context;
  const origin = new URL(request.url).origin;

  const res = await env.ASSETS.fetch(`${origin}/data/subjects.json`);
  if (!res.ok) {
    return Response.json({ error: "Could not load subjects." }, { status: 500 });
  }
  const subjects = await res.json();
  return Response.json(subjects);
}
