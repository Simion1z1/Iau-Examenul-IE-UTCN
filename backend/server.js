import express from "express";
import cors from "cors";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Read and parse a JSON file from the data directory.
async function readJson(fileName) {
  const filePath = path.join(DATA_DIR, fileName);
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw);
}

// GET /api/subjects -> list of subjects from subjects.json
app.get("/api/subjects", async (_req, res) => {
  try {
    const subjects = await readJson("subjects.json");
    res.json(subjects);
  } catch (err) {
    console.error("Failed to read subjects.json:", err.message);
    res.status(500).json({ error: "Could not load subjects." });
  }
});

// GET /api/subjects/:id -> the quiz questions for one subject.
// The quiz file name is derived from the subject's `name` (lowercased)
// so subject { id: "sub1", name: "Anatomy" } loads data/anatomy.json.
app.get("/api/subjects/:id", async (req, res) => {
  try {
    const subjects = await readJson("subjects.json");
    const subject = subjects.find((s) => s.id === req.params.id);
    if (!subject) {
      return res.status(404).json({ error: "Subject not found." });
    }

    const fileName = `${subject.name.toLowerCase()}.json`;

    // Guard against path traversal via crafted subject names.
    if (fileName.includes("/") || fileName.includes("\\") || fileName.includes("..")) {
      return res.status(400).json({ error: "Invalid subject file name." });
    }

    const questions = await readJson(fileName);
    res.json({ subject, questions });
  } catch (err) {
    console.error("Failed to load quiz:", err.message);
    res.status(500).json({ error: "Could not load quiz for this subject." });
  }
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Quiz backend running at http://localhost:${PORT}`);
  console.log(`Reading JSON data from: ${DATA_DIR}`);
});
