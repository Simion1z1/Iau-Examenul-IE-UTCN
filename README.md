# Quiz Trainer

A JSON-driven multiple-choice quiz app. **Frontend and backend live in one project at
the repo root** and deploy to **Cloudflare Pages** with zero configuration:

- **Frontend** — React + Vite (builds to `dist/`).
- **Backend** — Cloudflare Pages Functions in `functions/` (run as edge Workers).
- **Data** — plain JSON in `public/data/`.

```
.
├── index.html
├── package.json
├── vite.config.js
├── wrangler.toml
├── public/
│   └── data/                 # ← all quiz content
│       ├── subjects.json
│       ├── anatomy.json
│       └── history.json
├── src/                      # frontend (React)
│   ├── App.jsx
│   ├── api.js                # calls /api/*, falls back to static JSON
│   ├── styles.css
│   └── components/
│       ├── Dashboard.jsx
│       └── Quiz.jsx
└── functions/                # backend (Pages Functions)
    └── api/
        ├── subjects.js       # GET /api/subjects
        └── subjects/
            └── [id].js       # GET /api/subjects/:id
```

## Run locally

Run the lines one at a time (Windows PowerShell rejects `&&`).

**Frontend only (fast UI loop):**
```powershell
npm install
npm run dev
```
Opens http://localhost:5173. The API isn't running, so the app automatically falls
back to reading the static JSON in `public/data` — everything still works.

**Full stack (frontend + backend Functions), like production:**
```powershell
npm install
npm run build
npx wrangler pages dev dist
```
This serves the built site and the `/api/*` Functions together.

## Deploy to Cloudflare Pages (plug and play)

Push this repo to GitHub, then in Cloudflare: **Workers & Pages → Create → Pages →
Connect to Git**, pick the repo, and use the defaults:

| Setting                | Value           |
|------------------------|-----------------|
| Root directory         | `/` (the root)  |
| Framework preset       | Vite            |
| Build command          | `npm run build` |
| Build output directory | `dist`          |

No subfolder configuration needed. The `functions/` directory is detected
automatically and deployed as your backend. Every `git push` redeploys.

(Or from the CLI: `npm run build` then `npx wrangler pages deploy`.)

## The data

**`public/data/subjects.json`** — the dashboard list:
```json
[
  { "id": "sub1", "name": "Anatomy" },
  { "id": "sub2", "name": "History" }
]
```

**One quiz file per subject** — name = subject `name` lowercased
(`"Anatomy"` → `anatomy.json`):
```json
[
  {
    "question": "Which bone is the longest in the human body?",
    "correct_answer": "Femur",
    "wrong_answers": ["Tibia", "Humerus", "Fibula"]
  }
]
```

### Add a subject
1. Add a line to `subjects.json`, e.g. `{ "id": "sub3", "name": "Geography" }`.
2. Add `public/data/geography.json` with your questions.
3. Commit and push — Pages rebuilds automatically.

## Quiz mechanics
- One question at a time.
- Options (1 correct + the wrong ones) are re-shuffled on every question.
- Clicking locks the answer: green = correct, red = your wrong pick, correct answer
  always shown in green.
- A **Next Question** button advances; the last question shows a score screen.

## API

| Method | Endpoint            | Returns                                   |
|--------|---------------------|-------------------------------------------|
| GET    | `/api/subjects`     | Array of subjects                         |
| GET    | `/api/subjects/:id` | `{ subject, questions }` for that subject |
