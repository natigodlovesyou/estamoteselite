# Estamote's Elite — Deployment Guide (Render.com)

## What you're deploying
A React single-page application with:
- **Login page** — phone number entry, admin detection
- **Registration page** — 3-step form for applicants
- **Admin dashboard** — full applicant management at `+251945847280` / `#estaomte2000`

Data is stored in the **browser's localStorage** of each visitor. The admin dashboard reads all submissions from the same browser where it's accessed. For a shared/cloud database, see the upgrade note at the bottom.

---

## Step 1 — Put the code on GitHub

1. Go to [github.com](https://github.com) and sign in (create a free account if needed).
2. Click **New repository** → name it `estamotes-elite` → set to **Public** → click **Create repository**.
3. On your computer, open a terminal in the project folder and run:

```bash
git init
git add .
git commit -m "Initial commit — Estamote's Elite"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/estamotes-elite.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

---

## Step 2 — Deploy on Render.com

1. Go to [render.com](https://render.com) and sign up / log in (free account works).
2. Click **New +** → select **Web Service**.
3. Click **Connect a repository** → connect your GitHub account → select `estamotes-elite`.
4. Fill in the settings:

| Field | Value |
|-------|-------|
| **Name** | `estamotes-elite` |
| **Environment** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run serve` |
| **Instance Type** | Free |

5. Click **Create Web Service**.
6. Wait 2–4 minutes for the first build to finish.
7. Your site will be live at:  
   **`https://estamotes-elite.onrender.com`**

---

## Step 3 — Test it

After deployment, open the URL and verify:

- [ ] Login page loads with the star emblem
- [ ] Entering a random phone number goes to registration
- [ ] The 3-step form works and submits successfully
- [ ] Entering `+251945847280` shows the password field
- [ ] Admin password `#estaomte2000` opens the dashboard
- [ ] Submitted applicants appear in the admin dashboard

---

## Sharing the link

Share this with applicants:

```
Apply here: https://estamotes-elite.onrender.com
```

They enter their phone number → fill the 3-step form → submit.  
You log in as admin to see all submissions.

---

## Custom domain (optional)

If you want `apply.estamoteselite.com` instead of the Render URL:

1. In Render → your service → **Settings** → **Custom Domains**
2. Add your domain and follow the DNS instructions shown
3. This requires you to own the domain (buy from Namecheap, GoDaddy, etc.)

---

## Important note on data storage

Currently, applicant data is stored in **localStorage** — meaning it's saved in your browser on the device you use to visit the admin page. This is perfect for testing and early use.

**If you want data to persist across devices and browsers**, the next upgrade is to connect a free database. The best free option for this project:

- **Firebase Firestore** (free tier, no credit card) — stores all submissions in the cloud, accessible from any device
- Ask for help setting this up when you're ready — it's a straightforward upgrade to the existing code.

---

## Admin credentials (keep private)

```
Phone:    +251945847280
Password: #estaomte2000
```

**Never share these publicly.**

---

*Built for Estamote's Elite mentorship program.*
