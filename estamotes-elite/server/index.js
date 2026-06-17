const express = require("express");
const cors    = require("cors");
const path    = require("path");
require("dotenv").config();

const { createClient } = require("@libsql/client");

/* ── Turso client ─────────────────────────────────────────── */
const db = createClient({
  url:       process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

/* ── Init table ───────────────────────────────────────────── */
async function initDB() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS applicants (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      phone       TEXT UNIQUE NOT NULL,
      full_name   TEXT NOT NULL,
      gender      TEXT NOT NULL,
      age         TEXT,
      grade       TEXT NOT NULL,
      school      TEXT NOT NULL,
      city        TEXT,
      motivation  TEXT NOT NULL,
      goal_exam   TEXT NOT NULL,
      scholarship TEXT,
      help_others TEXT NOT NULL,
      weakness    TEXT NOT NULL,
      how_heard   TEXT,
      applied_at  TEXT NOT NULL
    )
  `);
  console.log("✓ DB ready");
}

/* ── App ──────────────────────────────────────────────────── */
const app  = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

/* ── Routes ───────────────────────────────────────────────── */

// Check if phone already applied
app.get("/api/check/:phone", async (req, res) => {
  try {
    const result = await db.execute({
      sql:  "SELECT id FROM applicants WHERE phone = ?",
      args: [req.params.phone],
    });
    res.json({ exists: result.rows.length > 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Submit application
app.post("/api/apply", async (req, res) => {
  const {
    phone, fullName, gender, age, grade, school, city,
    motivation, goalExam, scholarship, helpOthers, weakness, howHeard,
  } = req.body;

  // Basic validation
  if (!phone || !fullName || !gender || !grade || !school || !motivation || !goalExam || !helpOthers || !weakness) {
    return res.status(400).json({ error: "Missing required fields." });
  }
  if (parseFloat(grade) < 87) {
    return res.status(400).json({ error: "Grade average must be 87% or above." });
  }

  try {
    await db.execute({
      sql: `INSERT INTO applicants
              (phone, full_name, gender, age, grade, school, city,
               motivation, goal_exam, scholarship, help_others, weakness, how_heard, applied_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
        phone, fullName, gender, age || null, grade, school, city || null,
        motivation, goalExam, scholarship || null, helpOthers, weakness,
        howHeard || null, new Date().toISOString(),
      ],
    });
    res.json({ success: true });
  } catch (err) {
    if (err.message && err.message.includes("UNIQUE")) {
      return res.status(409).json({ error: "This phone number already has a submitted application." });
    }
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Get all applicants (admin only — protected by frontend, no sensitive data exposed beyond this)
app.get("/api/admin/applicants", async (req, res) => {
  const token = req.headers["x-admin-token"];
  if (token !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const result = await db.execute("SELECT * FROM applicants ORDER BY applied_at DESC");
    res.json({ applicants: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Delete applicant (admin)
app.delete("/api/admin/applicants/:id", async (req, res) => {
  const token = req.headers["x-admin-token"];
  if (token !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    await db.execute({ sql: "DELETE FROM applicants WHERE id = ?", args: [req.params.id] });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

/* ── Serve React build in production ──────────────────────── */
app.use(express.static(path.join(__dirname, "../build")));
app.get("*", (_, res) => res.sendFile(path.join(__dirname, "../build/index.html")));

/* ── Start ────────────────────────────────────────────────── */
initDB().then(() => {
  app.listen(PORT, () => console.log(`✓ Server running on port ${PORT}`));
}).catch(err => {
  console.error("Failed to init DB:", err);
  process.exit(1);
});
