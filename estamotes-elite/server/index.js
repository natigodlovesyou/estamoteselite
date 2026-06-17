const express    = require("express");
const cors       = require("cors");
const path       = require("path");
const multer     = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();

const { createClient } = require("@libsql/client");

/* ── Turso ──────────────────────────────────────────────────── */
const db = createClient({
  url:       process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

/* ── Cloudinary ─────────────────────────────────────────────── */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder:    "estamotes-elite",
    format:    "jpg",
    transformation: [{ width: 1200, quality: "auto:good", fetch_format: "auto" }],
    public_id: `${Date.now()}-${file.fieldname}`,
  }),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (_, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/heic"];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error("Only image files are allowed."));
  },
});

/* ── Init DB ────────────────────────────────────────────────── */
async function initDB() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS applicants (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      phone           TEXT UNIQUE NOT NULL,
      full_name       TEXT NOT NULL,
      gender          TEXT NOT NULL,
      age             TEXT,
      grade           TEXT NOT NULL,
      school          TEXT NOT NULL,
      city            TEXT,
      motivation      TEXT NOT NULL,
      goal_exam       TEXT NOT NULL,
      scholarship     TEXT,
      help_others     TEXT NOT NULL,
      weakness        TEXT NOT NULL,
      how_heard       TEXT,
      national_id_url TEXT NOT NULL,
      certificate_url TEXT NOT NULL,
      applied_at      TEXT NOT NULL
    )
  `);
  console.log("✓ DB ready");
}

/* ── Express ────────────────────────────────────────────────── */
const app  = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

/* ── Auth middleware ────────────────────────────────────────── */
function adminOnly(req, res, next) {
  if (req.headers["x-admin-token"] !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

/* ── Routes ─────────────────────────────────────────────────── */

// Check if phone already applied
app.get("/api/check/:phone", async (req, res) => {
  try {
    const result = await db.execute({
      sql:  "SELECT id FROM applicants WHERE phone = ?",
      args: [decodeURIComponent(req.params.phone)],
    });
    res.json({ exists: result.rows.length > 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Upload photos — returns Cloudinary URLs (called before final submit)
app.post(
  "/api/upload-photos",
  upload.fields([
    { name: "nationalId",  maxCount: 1 },
    { name: "certificate", maxCount: 1 },
  ]),
  (req, res) => {
    try {
      const nationalId  = req.files?.nationalId?.[0]?.path;
      const certificate = req.files?.certificate?.[0]?.path;
      if (!nationalId || !certificate) {
        return res.status(400).json({ error: "Both photos are required." });
      }
      res.json({ nationalIdUrl: nationalId, certificateUrl: certificate });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Upload failed. Try again." });
    }
  }
);

// Submit full application
app.post("/api/apply", async (req, res) => {
  const {
    phone, fullName, gender, age, grade, school, city,
    motivation, goalExam, scholarship, helpOthers, weakness,
    howHeard, nationalIdUrl, certificateUrl,
  } = req.body;

  if (!phone || !fullName || !gender || !grade || !school ||
      !motivation || !goalExam || !helpOthers || !weakness ||
      !nationalIdUrl || !certificateUrl) {
    return res.status(400).json({ error: "Missing required fields." });
  }
  if (parseFloat(grade) < 87) {
    return res.status(400).json({ error: "Grade average must be 87% or above." });
  }

  try {
    await db.execute({
      sql: `INSERT INTO applicants
              (phone, full_name, gender, age, grade, school, city,
               motivation, goal_exam, scholarship, help_others, weakness,
               how_heard, national_id_url, certificate_url, applied_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
        phone, fullName, gender, age || null, grade, school, city || null,
        motivation, goalExam, scholarship || null, helpOthers, weakness,
        howHeard || null, nationalIdUrl, certificateUrl,
        new Date().toISOString(),
      ],
    });
    res.json({ success: true });
  } catch (err) {
    if (err.message?.includes("UNIQUE")) {
      return res.status(409).json({ error: "This phone number already has a submitted application." });
    }
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Get all applicants (admin)
app.get("/api/admin/applicants", adminOnly, async (req, res) => {
  try {
    const result = await db.execute("SELECT * FROM applicants ORDER BY applied_at DESC");
    res.json({ applicants: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Delete applicant (admin)
app.delete("/api/admin/applicants/:id", adminOnly, async (req, res) => {
  try {
    await db.execute({ sql: "DELETE FROM applicants WHERE id = ?", args: [req.params.id] });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

/* ── Serve React ────────────────────────────────────────────── */
app.use(express.static(path.join(__dirname, "../build")));
app.get("*", (_, res) => res.sendFile(path.join(__dirname, "../build/index.html")));

/* ── Start ──────────────────────────────────────────────────── */
initDB().then(() => {
  app.listen(PORT, () => console.log(`✓ Server on port ${PORT}`));
}).catch(err => { console.error("DB init failed:", err); process.exit(1); });
