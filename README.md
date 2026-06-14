# Quiz Trainer

A JSON-driven multiple-choice quiz app (React + Vite). It is **fully static** — there
is no backend. Quiz content lives in plain JSON files served as static assets, so it
runs with a single command locally and deploys to **Cloudflare Pages** with zero config.

```
Iau-Examenul-IE-UTCN/
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── wrangler.toml          # Cloudflare Pages config
    ├── package.json
    ├── public/
    │   └── data/              # ← all quiz content lives here
    │       ├── subjects.json
    │       ├── anatomy.json
    │       └── history.json
    └── src/
        ├── App.jsx
        ├── api.js             # fetches /data/*.json
        ├── styles.css
        └── components/
            ├── Dashboard.jsx
            └── Quiz.jsx
```

## Run locally

```powershell
cd frontend
npm install
npm run dev
```

Open the URL it prints (http://localhost:5173). That's it — no second server.

> PowerShell note: `&&` doesn't work in older Windows PowerShell. Run the commands on
> separate lines, or join them with `;` instead of `&&`.

## The data

Everything is driven by JSON in `frontend/public/data/`.

**`subjects.json`** — the dashboard list:

```json
[
  { "id": "sub1", "name": "Anatomy" },
  { "id": "sub2", "name": "History" }
]
```

**One quiz file per subject** — file name = the subject `name` in lowercase
(`"Anatomy"` → `anatomy.json`). Each file is an array of questions:

```json
[
  {
    "question": "Which bone is the longest in the human body?",
    "correct_answer": "Femur",
    "wrong_answers": ["Tibia", "Humerus", "Fibula"]
  }
]
```

### Add a new subject

1. Add a line to `subjects.json`, e.g. `{ "id": "sub3", "name": "Geography" }`.
2. Create `frontend/public/data/geography.json` with your questions.
3. Refresh the page. (Re-run `npm run build` before redeploying.)

## Quiz mechanics

- One question at a time.
- Options (1 correct + the wrong ones) are re-shuffled every time a question loads.
- Clicking an option locks the answer: green = correct, red = your wrong pick, and the
  correct option is always shown in green.
- A **Next Question** button advances; the last question shows a score screen.

## Deploy to Cloudflare Pages

Because the app is static, deployment is plug-and-play. Two options:

### A. Command line (Wrangler)

```powershell
cd frontend
npm install
npm run build
npx wrangler pages deploy
```

`wrangler.toml` already sets the project name and `dist` as the output directory, so
the first run will create the project and upload it. (Wrangler will prompt you to log
in to Cloudflare the first time.)

### B. Git / dashboard

Push this repo to GitHub, then in the Cloudflare dashboard:
**Workers & Pages → Create → Pages → Connect to Git**, and set:

| Setting               | Value          |
|-----------------------|----------------|
| Root directory        | `frontend`     |
| Build command         | `npm run build`|
| Build output directory| `dist`         |

Every push then auto-deploys.

> Why not Cloudflare Workers? Workers have no filesystem at request time, so the old
> Express/`fs` backend couldn't read the JSON there. Since the data is static and all
> logic runs in the browser, Pages (static hosting) is the simpler, free fit — no
> server code to maintain.
