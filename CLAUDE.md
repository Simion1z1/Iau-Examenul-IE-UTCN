# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A JSON-driven multiple-choice quiz app. Frontend (React + Vite) and backend
(Cloudflare Pages Functions) live in one project at the repo root and deploy to
Cloudflare Pages with no subfolder configuration. There is no traditional server.

## Commands

```bash
npm install                 # install deps
npm run dev                 # Vite dev server on http://localhost:5173 (frontend only)
npm run build               # production build -> dist/
npm run preview             # serve the built dist/ with Vite
npx wrangler pages dev dist # run the full stack locally (frontend + /api Functions)
npx wrangler pages deploy   # deploy to Cloudflare Pages from the CLI
```

There is no test runner or linter configured.

On Windows PowerShell, chain commands with `;` (not `&&`).

## Architecture

Three layers, all rooted at the repo top:

- **Frontend** — `src/` (React 18). `src/main.jsx` mounts `App.jsx`. There is no
  router library: `App.jsx` holds an `activeSubject` in `useState` and swaps between
  `components/Dashboard.jsx` (subject list) and `components/Quiz.jsx` (practice mode).
- **Backend** — `functions/api/` are Cloudflare Pages Functions (edge Workers), routed
  by file path: `subjects.js` -> `GET /api/subjects`, `subjects/[id].js` ->
  `GET /api/subjects/:id`. They do NOT read the filesystem; they read the site's own
  static assets via the `env.ASSETS.fetch(...)` binding that Pages injects.
- **Data** — `public/data/*.json`, shipped as static assets (also directly fetchable).

### Data contract (drives everything)

- `public/data/subjects.json`: `[{ "id": "sub1", "name": "Anatomy" }, ...]`
- One quiz file per subject, named after the subject `name` lowercased
  (`"Anatomy"` -> `public/data/anatomy.json`). Each is an array of
  `{ question, correct_answer, wrong_answers: [...] }`.

This `name.toLowerCase() + ".json"` mapping is implemented in BOTH `src/api.js` and
`functions/api/subjects/[id].js` — keep them in sync if you change it. The backend also
path-traversal-guards the derived filename.

### Frontend data access (key detail)

`src/api.js` calls the `/api/*` backend first and **transparently falls back to the
static JSON** in `public/data` when the API is unavailable or returns non-JSON. This is
why plain `npm run dev` (no Functions runtime) still works. Note the two response
shapes: the backend returns `{ subject, questions }`, the static fallback returns the
raw questions array — `getQuiz` normalizes both.

### Quiz mechanics (`components/Quiz.jsx`)

Options are re-shuffled (Fisher-Yates) on every question via a `useEffect` keyed on the
current question. Selecting an answer locks all options and applies result classes
(`correct` / `wrong` / `dim`); the correct option is always revealed.

## Deploying

Cloudflare Pages "Connect to Git" with defaults: framework Vite, build `npm run build`,
output `dist`, root directory `/`. The `functions/` folder is auto-detected as the
backend. `wrangler.toml` sets the project name and `pages_build_output_dir = ./dist`.

## Repo hygiene

The `frontend/` and `backend/` directories are stale remnants of an earlier structure
and should be deleted — the live app is entirely at the repo root.
