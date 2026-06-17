# Estamote's Elite — Deployment Guide (Turso + Render)

## Architecture
```
Browser → Express API (Render) → Turso SQLite (Cloud DB)
                ↑
         Serves React build
```

Everything runs as **one service on Render**. The Express server both serves the React frontend and handles all API calls to Turso.

---

## Step 1 — Create your Turso database

1. Go to [turso.tech](https://turso.tech) and sign up (free).
2. Install the Turso CLI:
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
5. Get your database URL:
   ```bash
   turso db show estamotes-elite --url
   ```
   → Copy the URL (looks like `libsql://estamotes-elite-xxxx.turso.io`)

6. Create an auth token:
   ```bash
   turso db tokens create estamotes-elite
   ```
   → Copy the token (long string)

7. **Save both** — you'll need them in Step 3.

> The database table is created automatically when the app starts for the first time.

---

## Step 2 — Push code to GitHub

1. Go to [github.com](https://github.com) → **New repository** → name it `estamotes-elite` → Public → **Create**.
2. In your project folder (terminal):
   ```bash
   git init
   git add .
   git commit -m "Estamote's Elite — full stack with Turso"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/estamotes-elite.git
   git push -u origin main
   ```

---

## Step 3 — Deploy on Render

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

4. Scroll down to **Environment Variables** → Add these 4:

   | Key | Value |
   |-----|-------|
   | `TURSO_DATABASE_URL` | Your URL from Step 1 (libsql://...) |
   | `TURSO_AUTH_TOKEN` | Your token from Step 1 |
   | `ADMIN_SECRET` | `estamote-admin-secret` (or any strong secret you choose) |
   | `REACT_APP_ADMIN_SECRET` | Same value as ADMIN_SECRET above |

5. Click **Create Web Service**
6. Wait 3–5 minutes for the build.
7. Your site is live at: `https://estamotes-elite.onrender.com`

---

## Step 4 — Verify everything works

- [ ] Login page loads
- [ ] Random phone number → goes to 3-step registration
- [ ] Form submits successfully → check success screen
- [ ] Admin login: `+251945847280` / `#estaomte2000`
- [ ] Admin dashboard shows the submitted applicant
- [ ] Remove button works
- [ ] Export CSV downloads correctly

---

## Admin credentials

```
Phone:    +251945847280
Password: #estaomte2000
```

Keep these private.

---

## How data flows

1. Applicant enters phone → server checks Turso if phone exists
2. Applicant fills form → server validates + inserts into Turso
3. Admin logs in → server fetches all rows from Turso → displayed as cards
4. Admin removes → server deletes row from Turso

Data is **permanent and cross-device** — stored in the cloud, not the browser.

---

## Optional: Custom domain

Render → your service → **Settings** → **Custom Domains** → follow the DNS setup.

