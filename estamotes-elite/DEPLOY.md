# Estamote's Elite — Deployment Guide (Turso + Cloudinary + Render)

## Architecture
```
Browser → Express API (Render) → Turso SQLite (applicant data)
                              → Cloudinary (ID photos & certificates)
```

---

## Step 1 — Create your Turso database

1. Go to [turso.tech](https://turso.tech) → sign up free
2. Install Turso CLI:
   ```bash
   # macOS / Linux
   curl -sSfL https://get.tur.so/install.sh | bash

   # Windows (PowerShell)
   irm https://get.tur.so/install.ps1 | iex
   ```
3. Log in:
   ```bash
   turso auth login
   ```
4. Create your database:
   ```bash
   turso db create estamotes-elite
   ```
5. Get your URL:
   ```bash
   turso db show estamotes-elite --url
   ```
   → Copy it (looks like `libsql://estamotes-elite-xxxx.turso.io`)

6. Create auth token:
   ```bash
   turso db tokens create estamotes-elite
   ```
   → Copy the token (long string)

---

## Step 2 — Create your Cloudinary account

1. Go to [cloudinary.com](https://cloudinary.com) → sign up free (no credit card)
2. After signing in, go to your **Dashboard**
3. Copy these 3 values:
   - **Cloud name** (e.g. `dxxxxxx`)
   - **API Key** (e.g. `123456789012345`)
   - **API Secret** (e.g. `xxxxxxxxxxxxxxxxxxxxxxx`)

That's it — Cloudinary is ready. The folder `estamotes-elite` will be created automatically when the first photo uploads.

---

## Step 3 — Push code to GitHub

1. Go to [github.com](https://github.com) → **New repository** → name it `estamotes-elite` → Public → **Create**
2. In your project folder (terminal):
   ```bash
   git init
   git add .
   git commit -m "Estamote's Elite — with Turso + Cloudinary"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/estamotes-elite.git
   git push -u origin main
   ```

---

## Step 4 — Deploy on Render

1. Go to [render.com](https://render.com) → **New +** → **Web Service**
2. Connect GitHub → select `estamotes-elite`
3. Fill in:

   | Field | Value |
   |-------|-------|
   | **Name** | `estamotes-elite` |
   | **Environment** | `Node` |
   | **Build Command** | `npm install && npm run build` |
   | **Start Command** | `npm start` |
   | **Instance Type** | Free |

4. Scroll to **Environment Variables** → Add all 7:

   | Key | Value |
   |-----|-------|
   | `TURSO_DATABASE_URL` | Your Turso URL from Step 1 |
   | `TURSO_AUTH_TOKEN` | Your Turso token from Step 1 |
   | `CLOUDINARY_CLOUD_NAME` | Your cloud name from Step 2 |
   | `CLOUDINARY_API_KEY` | Your API key from Step 2 |
   | `CLOUDINARY_API_SECRET` | Your API secret from Step 2 |
   | `ADMIN_SECRET` | `estamote-admin-secret` (or any strong string you choose) |
   | `REACT_APP_ADMIN_SECRET` | Same value as `ADMIN_SECRET` above |

5. Click **Create Web Service**
6. Wait 4–6 minutes for the first build (it installs + builds React)
7. Live at: `https://estamotes-elite.onrender.com`

---

## Step 5 — Verify everything works

- [ ] Login page loads with the star emblem
- [ ] Random phone → goes to 4-step registration form
- [ ] Steps 1–3 validate and navigate correctly
- [ ] Step 4: drag or click to upload ID photo → preview appears
- [ ] Step 4: upload certificate photo → preview appears
- [ ] Submit → success screen with reference number
- [ ] Admin login: `+251945847280` / `#estaomte2000`
- [ ] Admin dashboard loads the submitted student
- [ ] Document thumbnails visible on the card (hover → "View full")
- [ ] Clicking thumbnail opens lightbox fullscreen
- [ ] Export CSV downloads with all fields including photo URLs

---

## How photos work

```
Student uploads file (max 5MB, JPG/PNG/HEIC)
        ↓
Multer receives it in memory (no disk)
        ↓
CloudinaryStorage streams it directly to Cloudinary
        ↓
Cloudinary returns a permanent URL
        ↓
URL saved in Turso alongside the application
        ↓
Admin sees thumbnail + can click to view full size
```

Photos are auto-optimized by Cloudinary (resized to max 1200px wide, quality auto).

---

## Free tier limits

| Service | Free limit | Your usage |
|---------|-----------|------------|
| Turso | 500 databases, 9GB storage | ~1MB for 100 applicants |
| Cloudinary | 25GB storage, 25GB bandwidth/month | ~50MB for 100 applicants |
| Render | 750 hours/month (sleeps after 15min idle) | Enough for one service |

All three free tiers are more than enough for this program.

---

## Admin credentials

```
Phone:    +251945847280
Password: #estaomte2000
```

**Never share these publicly.**

---

## Important: Render free tier sleep

On Render's free plan, the server sleeps after 15 minutes of inactivity. The first request after sleep takes ~30 seconds to wake up. This is normal — subsequent requests are fast. If you want it always awake, upgrade to Render's $7/month Starter plan.

---

*Built for Estamote's Elite mentorship program.*
