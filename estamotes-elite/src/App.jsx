import { useState, useEffect, useCallback } from "react";

/* ─── Constants ─────────────────────────────────────────────── */
const ADMIN_PHONE  = "+251945847280";
const ADMIN_PASS   = "#estaomte2000";
const ADMIN_SECRET = process.env.REACT_APP_ADMIN_SECRET || "estamote-admin-secret";

/* ─── API helpers ───────────────────────────────────────────── */
const api = {
  checkPhone: (phone) =>
    fetch(`/api/check/${encodeURIComponent(phone)}`).then(r => r.json()),

  submit: (data) =>
    fetch("/api/apply", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(data),
    }).then(r => r.json()),

  getApplicants: () =>
    fetch("/api/admin/applicants", {
      headers: { "x-admin-token": ADMIN_SECRET },
    }).then(r => r.json()),

  deleteApplicant: (id) =>
    fetch(`/api/admin/applicants/${id}`, {
      method:  "DELETE",
      headers: { "x-admin-token": ADMIN_SECRET },
    }).then(r => r.json()),
};

/* ─── Global Styles ─────────────────────────────────────────── */
const GlobalStyle = () => (
  <style>{`
    :root {
      --navy:       #0B1F3A;
      --navy-mid:   #132845;
      --navy-light: #1C3860;
      --gold:       #C9992A;
      --gold-lt:    #F0BA45;
      --gold-pale:  #FDF3DC;
      --cream:      #F8F5EF;
      --white:      #FFFFFF;
      --text:       #0F1C2E;
      --muted:      #6B7A8D;
      --border:     #E2E8F0;
      --border-md:  #CBD5E0;
      --success:    #1A7A4A;
      --success-bg: #E8F5EE;
      --danger:     #B91C1C;
      --danger-bg:  #FEE2E2;
      --info-bg:    #EEF4FF;
      --info:       #1E4FA3;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: var(--navy); color: var(--text); min-height: 100vh; -webkit-font-smoothing: antialiased; }
    input, select, textarea, button { font-family: 'Inter', sans-serif; }
    button { cursor: pointer; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border-md); border-radius: 3px; }

    .field { margin-bottom: 18px; }
    .field label { display: block; font-size: 12.5px; font-weight: 600; color: var(--navy); margin-bottom: 6px; letter-spacing: 0.02em; }
    .field input, .field select, .field textarea { width: 100%; padding: 11px 14px; border: 1.5px solid var(--border); border-radius: 10px; font-size: 14px; color: var(--text); outline: none; transition: border-color 0.18s, box-shadow 0.18s; background: var(--white); appearance: none; -webkit-appearance: none; }
    .field input:focus, .field select:focus, .field textarea:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(201,153,42,0.14); }
    .field input::placeholder, .field textarea::placeholder { color: #A0ADBC; }
    .field textarea { resize: vertical; min-height: 88px; line-height: 1.6; }
    .field select { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%236B7A8D' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px; }
    .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .field-hint { font-size: 11.5px; color: var(--muted); margin-top: 5px; }

    .btn-primary { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 13px 20px; background: var(--navy); color: var(--white); border: none; border-radius: 11px; font-size: 15px; font-weight: 600; letter-spacing: 0.02em; transition: background 0.18s, transform 0.1s, box-shadow 0.18s; }
    .btn-primary:hover:not(:disabled) { background: var(--navy-light); box-shadow: 0 6px 20px rgba(11,31,58,0.25); }
    .btn-primary:active { transform: scale(0.985); }
    .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }
    .btn-primary.gold-btn { background: var(--gold); color: var(--navy); }
    .btn-primary.gold-btn:hover:not(:disabled) { background: #D4A32E; box-shadow: 0 6px 20px rgba(201,153,42,0.3); }
    .btn-ghost { background: none; border: 1.5px solid var(--border); border-radius: 8px; padding: 7px 14px; font-size: 13px; color: var(--muted); transition: border-color 0.15s, color 0.15s; }
    .btn-ghost:hover { border-color: var(--border-md); color: var(--text); }

    .alert { border-radius: 10px; padding: 11px 15px; font-size: 13.5px; margin-bottom: 18px; display: flex; align-items: flex-start; gap: 8px; }
    .alert-error { background: var(--danger-bg); color: var(--danger); }
    .alert-success { background: var(--success-bg); color: var(--success); }

    .divider { border: none; border-top: 1px solid var(--border); margin: 24px 0; }
    .section-label { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--gold); margin-bottom: 16px; margin-top: 28px; display: flex; align-items: center; gap: 8px; }
    .section-label:first-child { margin-top: 0; }
    .section-label::after { content: ''; flex: 1; height: 1px; background: var(--gold-pale); }

    .nav { background: var(--navy); padding: 0 32px; height: 62px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.07); }
    .nav-brand { font-family: 'Playfair Display', serif; font-size: 18px; color: var(--white); display: flex; align-items: center; gap: 10px; }
    .nav-brand .star { color: var(--gold-lt); font-size: 16px; }
    .nav-brand em { color: var(--gold-lt); font-style: normal; }
    .nav-right { display: flex; align-items: center; gap: 16px; }
    .nav-logout { font-size: 13px; color: rgba(255,255,255,0.45); background: none; border: none; transition: color 0.15s; padding: 4px 0; }
    .nav-logout:hover { color: var(--gold-lt); }
    .nav-badge { background: rgba(201,153,42,0.2); color: var(--gold-lt); font-size: 10.5px; font-weight: 700; letter-spacing: 0.07em; padding: 3px 10px; border-radius: 20px; }

    .steps { display: flex; align-items: center; gap: 0; margin-bottom: 32px; }
    .step { display: flex; align-items: center; gap: 8px; flex: 1; }
    .step-num { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; transition: all 0.2s; }
    .step-num.done { background: var(--success); color: var(--white); }
    .step-num.active { background: var(--navy); color: var(--white); box-shadow: 0 0 0 3px rgba(11,31,58,0.15); }
    .step-num.idle { background: var(--border); color: var(--muted); }
    .step-label { font-size: 12px; font-weight: 500; color: var(--muted); white-space: nowrap; }
    .step-label.active { color: var(--navy); font-weight: 600; }
    .step-line { flex: 1; height: 1px; background: var(--border); margin: 0 4px; }
    .step-line.done { background: var(--success); }

    .card { background: var(--white); border-radius: 18px; padding: 36px 40px; border: 1px solid var(--border); box-shadow: 0 2px 16px rgba(0,0,0,0.05); }

    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 28px; }
    .stat-card { background: var(--white); border-radius: 14px; padding: 20px 22px; border: 1px solid var(--border); position: relative; overflow: hidden; }
    .stat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--navy); border-radius: 14px 14px 0 0; }
    .stat-card.gold-stat::before { background: var(--gold); }
    .stat-card.green-stat::before { background: var(--success); }
    .stat-card.blue-stat::before { background: #2563EB; }
    .stat-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); margin-bottom: 10px; }
    .stat-value { font-size: 34px; font-weight: 700; color: var(--navy); line-height: 1; }
    .stat-sub { font-size: 12px; color: var(--muted); margin-top: 5px; }
    .stat-bar { height: 4px; background: var(--border); border-radius: 2px; margin-top: 10px; overflow: hidden; }
    .stat-bar-fill { height: 100%; border-radius: 2px; background: var(--gold); transition: width 0.4s; }

    .students-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(330px, 1fr)); gap: 20px; }
    .student-card { background: var(--white); border-radius: 16px; overflow: hidden; border: 1px solid var(--border); transition: box-shadow 0.2s, transform 0.2s; }
    .student-card:hover { box-shadow: 0 10px 36px rgba(0,0,0,0.11); transform: translateY(-3px); }
    .sc-header { background: var(--navy); padding: 20px 22px; display: flex; align-items: center; gap: 14px; position: relative; }
    .sc-header::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: var(--gold); opacity: 0.6; }
    .sc-avatar { width: 50px; height: 50px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 17px; font-weight: 700; border: 2px solid rgba(255,255,255,0.15); }
    .av-f { background: rgba(240,186,69,0.2); color: var(--gold-lt); }
    .av-m { background: rgba(99,179,237,0.2); color: #93C5FD; }
    .sc-name-wrap { flex: 1; min-width: 0; }
    .sc-name { font-size: 15px; font-weight: 600; color: var(--white); margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .sc-phone { font-size: 12px; color: rgba(255,255,255,0.45); }
    .sc-gender-pill { font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 20px; letter-spacing: 0.06em; flex-shrink: 0; }
    .pill-f { background: rgba(240,186,69,0.18); color: var(--gold-lt); }
    .pill-m { background: rgba(147,197,253,0.18); color: #93C5FD; }
    .sc-body { padding: 18px 22px; }
    .sc-row { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 9px; }
    .sc-lbl { font-size: 12px; color: var(--muted); font-weight: 500; }
    .sc-val { font-size: 13px; color: var(--text); font-weight: 500; text-align: right; max-width: 58%; }
    .grade-pill { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; }
    .g-hi { background: var(--success-bg); color: var(--success); }
    .g-ok { background: var(--info-bg); color: var(--info); }
    .g-lo { background: var(--danger-bg); color: var(--danger); }
    .sc-divider { border: none; border-top: 1px solid var(--border); margin: 12px 0; }
    .sc-text-lbl { font-size: 10.5px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 5px; }
    .sc-text-body { font-size: 12.5px; color: var(--muted); line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .sc-text-body.expanded { display: block; }
    .sc-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 14px; }
    .sc-date { font-size: 11px; color: #B0BAC8; }
    .sc-actions { display: flex; gap: 6px; }
    .sc-btn-detail { font-size: 12px; background: var(--info-bg); color: var(--info); border: none; border-radius: 7px; padding: 5px 11px; font-family: 'Inter', sans-serif; transition: background 0.15s; }
    .sc-btn-detail:hover { background: #DBEAFF; }
    .sc-btn-del { font-size: 12px; background: var(--danger-bg); color: var(--danger); border: none; border-radius: 7px; padding: 5px 11px; font-family: 'Inter', sans-serif; transition: background 0.15s; }
    .sc-btn-del:hover { background: #FECACA; }

    .filters-row { display: flex; align-items: center; gap: 10px; margin-bottom: 22px; flex-wrap: wrap; }
    .search-wrap { flex: 1; min-width: 200px; position: relative; }
    .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--muted); font-size: 15px; pointer-events: none; }
    .search-input { width: 100%; padding: 9px 14px 9px 36px; border: 1.5px solid var(--border); border-radius: 10px; font-size: 13.5px; font-family: 'Inter', sans-serif; outline: none; background: var(--white); color: var(--text); transition: border-color 0.18s; }
    .search-input:focus { border-color: var(--gold); }
    .filter-sel { padding: 9px 32px 9px 12px; border: 1.5px solid var(--border); border-radius: 10px; font-size: 13px; font-family: 'Inter', sans-serif; background: var(--white); color: var(--text); outline: none; appearance: none; -webkit-appearance: none; cursor: pointer; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%236B7A8D' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; transition: border-color 0.18s; }
    .filter-sel:focus { border-color: var(--gold); }
    .result-count { font-size: 12.5px; color: var(--muted); white-space: nowrap; }

    .empty { text-align: center; padding: 72px 24px; }
    .empty-icon { font-size: 52px; margin-bottom: 14px; opacity: 0.6; }
    .empty-title { font-size: 16px; font-weight: 600; color: var(--navy); margin-bottom: 6px; }
    .empty-sub { font-size: 14px; color: var(--muted); }

    .login-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--navy); padding: 24px; position: relative; overflow: hidden; }
    .login-orb-1 { position: absolute; width: 600px; height: 600px; border-radius: 50%; background: rgba(201,153,42,0.06); top: -200px; right: -150px; pointer-events: none; }
    .login-orb-2 { position: absolute; width: 400px; height: 400px; border-radius: 50%; background: rgba(201,153,42,0.04); bottom: -100px; left: -100px; pointer-events: none; }
    .login-card { background: var(--white); border-radius: 22px; padding: 48px 44px; width: 100%; max-width: 430px; position: relative; z-index: 1; box-shadow: 0 40px 100px rgba(0,0,0,0.45); }
    .login-emblem { display: flex; align-items: center; gap: 13px; margin-bottom: 34px; }
    .login-emblem-icon { width: 46px; height: 46px; background: var(--navy); border-radius: 13px; display: flex; align-items: center; justify-content: center; font-size: 22px; color: var(--gold-lt); }
    .login-emblem-name { font-family: 'Playfair Display', serif; font-size: 19px; font-weight: 700; color: var(--navy); line-height: 1.2; }
    .login-emblem-tag { font-size: 10.5px; color: var(--muted); letter-spacing: 0.1em; text-transform: uppercase; margin-top: 2px; }
    .login-gold-line { width: 36px; height: 3px; background: var(--gold); border-radius: 2px; margin-bottom: 22px; }
    .login-title { font-size: 24px; font-weight: 700; color: var(--navy); margin-bottom: 5px; }
    .login-sub { font-size: 14px; color: var(--muted); margin-bottom: 28px; line-height: 1.5; }
    .login-footer { font-size: 11.5px; color: #B0BAC8; text-align: center; margin-top: 22px; }
    .show-pass { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--muted); font-size: 13px; padding: 4px; }
    .pass-wrap { position: relative; }
    .pass-wrap input { padding-right: 40px; }

    .reg-hero { background: var(--navy); padding: 52px 32px 48px; text-align: center; position: relative; overflow: hidden; }
    .reg-hero::before { content: ''; position: absolute; top: -80px; right: -80px; width: 320px; height: 320px; border-radius: 50%; background: rgba(201,153,42,0.06); pointer-events: none; }
    .hero-tag { display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--gold); background: rgba(201,153,42,0.12); border: 1px solid rgba(201,153,42,0.3); border-radius: 20px; padding: 5px 14px; margin-bottom: 18px; }
    .hero-title { font-family: 'Playfair Display', serif; font-size: 34px; color: var(--white); margin-bottom: 12px; line-height: 1.2; }
    .hero-title em { color: var(--gold-lt); font-style: normal; }
    .hero-desc { font-size: 15px; color: rgba(255,255,255,0.6); max-width: 480px; margin: 0 auto; line-height: 1.65; }
    .hero-spots { display: flex; justify-content: center; gap: 20px; margin-top: 26px; flex-wrap: wrap; }
    .hero-spot { display: flex; align-items: center; gap: 6px; font-size: 13px; color: rgba(255,255,255,0.55); }
    .hero-spot strong { color: var(--gold-lt); font-weight: 600; }
    .hero-dot { width: 4px; height: 4px; border-radius: 50%; background: rgba(255,255,255,0.2); }

    .page-bg { background: var(--cream); min-height: 100vh; }
    .page-body { max-width: 720px; margin: 0 auto; padding: 40px 24px 72px; }
    .admin-bg { background: #EEF2F8; min-height: 100vh; }
    .admin-body { max-width: 1180px; margin: 0 auto; padding: 36px 24px 64px; }
    .admin-hdr { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 28px; }
    .admin-title { font-family: 'Playfair Display', serif; font-size: 26px; color: var(--navy); margin-bottom: 3px; }
    .admin-sub { font-size: 14px; color: var(--muted); }
    .export-btn { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: var(--navy); background: var(--white); border: 1.5px solid var(--border); border-radius: 9px; padding: 8px 16px; transition: border-color 0.15s, box-shadow 0.15s; }
    .export-btn:hover { border-color: var(--gold); box-shadow: 0 2px 10px rgba(0,0,0,0.07); }

    .success-page { min-height: 80vh; display: flex; align-items: center; justify-content: center; padding: 40px 24px; }
    .success-card { background: var(--white); border-radius: 22px; padding: 52px 44px; text-align: center; max-width: 520px; width: 100%; border: 1px solid var(--border); }
    .success-icon { width: 72px; height: 72px; background: var(--success-bg); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; font-size: 30px; }
    .success-title { font-family: 'Playfair Display', serif; font-size: 26px; color: var(--navy); margin-bottom: 12px; }
    .success-body { font-size: 15px; color: var(--muted); line-height: 1.7; margin-bottom: 28px; }
    .success-ref { background: var(--cream); border-radius: 12px; padding: 18px 22px; border: 1px solid var(--border); }
    .success-ref-lbl { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); margin-bottom: 4px; font-weight: 600; }
    .success-ref-val { font-size: 18px; font-weight: 700; color: var(--navy); }

    .spinner { width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
    .spinner.dark { border-color: rgba(11,31,58,0.2); border-top-color: var(--navy); }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 600px) {
      .login-card { padding: 36px 24px; }
      .card { padding: 24px 20px; }
      .field-row { grid-template-columns: 1fr; }
      .stats-grid { grid-template-columns: 1fr 1fr; }
      .students-grid { grid-template-columns: 1fr; }
      .admin-hdr { flex-direction: column; align-items: flex-start; gap: 12px; }
      .hero-title { font-size: 26px; }
      .nav { padding: 0 18px; }
      .admin-body, .page-body { padding-left: 16px; padding-right: 16px; }
    }
  `}</style>
);

/* ─── Helpers ───────────────────────────────────────────────── */
const initials   = n => n.trim().split(/\s+/).map(w => w[0]).join("").toUpperCase().slice(0,2);
const gradeClass = g => parseFloat(g) >= 90 ? "g-hi" : parseFloat(g) >= 87 ? "g-ok" : "g-lo";
const fmtDate    = iso => new Date(iso).toLocaleString("en-GB", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });

/* ─── Login ─────────────────────────────────────────────────── */
function LoginPage({ onLogin }) {
  const [phone, setPhone]     = useState("");
  const [pass, setPass]       = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const isAdmin = phone.trim() === ADMIN_PHONE;

  async function handle() {
    const p = phone.trim();
    if (!p) { setError("Please enter your phone number."); return; }
    if (isAdmin) {
      if (!pass) { setError("Please enter the admin password."); return; }
      if (pass !== ADMIN_PASS) { setError("Incorrect password."); return; }
      onLogin(p, true); return;
    }
    setLoading(true); setError("");
    try {
      const res = await api.checkPhone(p);
      if (res.exists) {
        setError("This number already has a submitted application. Contact Estamote if you need changes.");
      } else {
        onLogin(p, false);
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-orb-1" /><div className="login-orb-2" />
      <div className="login-card">
        <div className="login-emblem">
          <div className="login-emblem-icon">★</div>
          <div>
            <div className="login-emblem-name">Estamote's Elite</div>
            <div className="login-emblem-tag">Premium mentorship · 10 spots</div>
          </div>
        </div>
        <div className="login-gold-line" />
        <h1 className="login-title">Welcome</h1>
        <p className="login-sub">Enter your phone number to access the application form.</p>
        {error && <div className="alert alert-error">⚠ {error}</div>}
        <div className="field">
          <label>Phone number</label>
          <input type="tel" placeholder="+251 9__ __ __ __" value={phone}
            onChange={e => { setPhone(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && handle()} autoFocus />
          <div className="field-hint">Your phone number is your unique application ID.</div>
        </div>
        {isAdmin && (
          <div className="field">
            <label>Admin password</label>
            <div className="pass-wrap">
              <input type={showPass ? "text" : "password"} placeholder="Password"
                value={pass} onChange={e => { setPass(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && handle()} />
              <button className="show-pass" onClick={() => setShowPass(s => !s)} type="button">
                {showPass ? "hide" : "show"}
              </button>
            </div>
          </div>
        )}
        <button className="btn-primary" onClick={handle} disabled={loading} style={{ marginTop: 8 }}>
          {loading ? <span className="spinner" /> : "Continue →"}
        </button>
        <div className="login-footer">Free program · No fees · No tricks</div>
      </div>
    </div>
  );
}

/* ─── Registration ───────────────────────────────────────────── */
const STEPS = ["Personal info", "Motivation", "Character"];

function RegistrationPage({ phone, onLogout }) {
  const [step, setStep]     = useState(0);
  const [done, setDone]     = useState(false);
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm]     = useState({
    fullName:"", gender:"", age:"", grade:"", school:"", city:"",
    motivation:"", goalExam:"", scholarship:"",
    helpOthers:"", weakness:"", howHeard:"",
  });
  const set = useCallback((k, v) => { setForm(f => ({...f,[k]:v})); setError(""); }, []);

  function validateStep(s) {
    if (s === 0) {
      if (!form.fullName.trim()) return "Full name is required.";
      if (!form.gender)          return "Please select your gender.";
      if (!form.grade)           return "Please enter your grade average.";
      if (parseFloat(form.grade) < 87) return "Minimum grade average of 87% is required.";
      if (!form.school.trim())   return "School name is required.";
    }
    if (s === 1) {
      if (!form.motivation.trim()) return "Please write your motivation statement.";
      if (form.motivation.trim().split(/\s+/).length < 20) return "Please write at least 20 words in your motivation.";
      if (!form.goalExam.trim())   return "Please describe your entrance exam goal.";
    }
    if (s === 2) {
      if (!form.helpOthers.trim()) return "Please answer how you will help your peers.";
      if (!form.weakness.trim())   return "Please describe your biggest weakness.";
    }
    return null;
  }

  function next() {
    const err = validateStep(step);
    if (err) { setError(err); return; }
    setError(""); setStep(s => s+1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function back() { setError(""); setStep(s => s-1); window.scrollTo({ top: 0, behavior: "smooth" }); }

  async function submit() {
    const err = validateStep(2);
    if (err) { setError(err); return; }
    setLoading(true); setError("");
    try {
      const res = await api.submit({ ...form, phone });
      if (res.error) { setError(res.error); }
      else { setDone(true); window.scrollTo({ top: 0, behavior: "smooth" }); }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) return (
    <div className="page-bg">
      <nav className="nav">
        <div className="nav-brand"><span className="star">★</span> Estamote's <em>Elite</em></div>
        <button className="nav-logout" onClick={onLogout}>Log out</button>
      </nav>
      <div className="success-page">
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h2 className="success-title">Application submitted!</h2>
          <p className="success-body">
            Thank you, <strong>{form.fullName}</strong>. Your application has been saved and is under review.
            Estamote will reach out via phone if you advance to the next stage.<br /><br />
            <em>Stay consistent. Stay humble. The journey starts here.</em>
          </p>
          <div className="success-ref">
            <div className="success-ref-lbl">Your reference number</div>
            <div className="success-ref-val">{phone}</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-bg">
      <nav className="nav">
        <div className="nav-brand"><span className="star">★</span> Estamote's <em>Elite</em></div>
        <div className="nav-right">
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>{phone}</span>
          <button className="nav-logout" onClick={onLogout}>Log out</button>
        </div>
      </nav>
      <div className="reg-hero">
        <div className="hero-tag">Official application · {new Date().getFullYear()}</div>
        <h1 className="hero-title">Apply for <em>Estamote's Elite</em></h1>
        <p className="hero-desc">10 students. Free mentorship. Real preparation for the national entrance exam and beyond.</p>
        <div className="hero-spots">
          <span className="hero-spot"><strong>10</strong> total spots</span>
          <span className="hero-dot" />
          <span className="hero-spot"><strong>Free</strong> program</span>
          <span className="hero-dot" />
          <span className="hero-spot"><strong>87%+</strong> grade required</span>
          <span className="hero-dot" />
          <span className="hero-spot"><strong>5F / 5M</strong> balance</span>
        </div>
      </div>
      <div className="page-body">
        <div className="steps">
          {STEPS.map((label, i) => (
            <div className="step" key={i}>
              <div className={`step-num ${i < step ? "done" : i === step ? "active" : "idle"}`}>
                {i < step ? "✓" : i+1}
              </div>
              <span className={`step-label ${i === step ? "active" : ""}`}>{label}</span>
              {i < STEPS.length-1 && <div className={`step-line ${i < step ? "done" : ""}`} />}
            </div>
          ))}
        </div>
        {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>⚠ {error}</div>}
        <div className="card">
          {step === 0 && <>
            <div className="section-label">Personal information</div>
            <div className="field-row">
              <div className="field"><label>Full name *</label><input placeholder="Your full name" value={form.fullName} onChange={e => set("fullName", e.target.value)} /></div>
              <div className="field"><label>Age</label><input type="number" placeholder="e.g. 17" value={form.age} onChange={e => set("age", e.target.value)} min="10" max="25" /></div>
            </div>
            <div className="field-row">
              <div className="field"><label>Gender *</label>
                <select value={form.gender} onChange={e => set("gender", e.target.value)}>
                  <option value="">Select gender</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
              </div>
              <div className="field"><label>Grade average (%) *</label>
                <input type="number" placeholder="e.g. 92" min="0" max="100" value={form.grade} onChange={e => set("grade", e.target.value)} />
                <div className="field-hint">Minimum 87% required</div>
              </div>
            </div>
            <div className="field"><label>School name *</label><input placeholder="Your current school" value={form.school} onChange={e => set("school", e.target.value)} /></div>
            <div className="field"><label>City / town</label><input placeholder="Where are you based?" value={form.city} onChange={e => set("city", e.target.value)} /></div>
            <div className="field"><label>How did you hear about this program?</label>
              <select value={form.howHeard} onChange={e => set("howHeard", e.target.value)}>
                <option value="">Select</option>
                <option value="Telegram">Telegram</option>
                <option value="A friend or classmate">A friend or classmate</option>
                <option value="YouTube">YouTube</option>
                <option value="Instagram / TikTok">Instagram / TikTok</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </>}

          {step === 1 && <>
            <div className="section-label">Motivation & goals</div>
            <div className="field">
              <label>Why do you want to join Estamote's Elite? *</label>
              <textarea style={{ minHeight: 120 }} placeholder="Be specific and honest. Why this program, why now, and what do you want to achieve?" value={form.motivation} onChange={e => set("motivation", e.target.value)} />
              <div className="field-hint">{form.motivation.trim().split(/\s+/).filter(Boolean).length} words — aim for at least 50</div>
            </div>
            <div className="field">
              <label>What is your goal for the national entrance exam? *</label>
              <textarea placeholder="What score are you aiming for? Which university and field? Why does it matter to you?" value={form.goalExam} onChange={e => set("goalExam", e.target.value)} />
            </div>
            <div className="field">
              <label>Are you interested in international scholarships? (e.g. MEXT Japan, GKS Korea)</label>
              <select value={form.scholarship} onChange={e => set("scholarship", e.target.value)}>
                <option value="">Select</option>
                <option value="Yes — very interested">Yes — very interested</option>
                <option value="Maybe — want to learn more">Maybe — want to learn more</option>
                <option value="No — entrance exam only">No — focused on entrance exam only</option>
              </select>
              <div className="field-hint">Scholarship guidance is available for all selected students who want it.</div>
            </div>
          </>}

          {step === 2 && <>
            <div className="section-label">Character screening</div>
            <div className="field">
              <label>How will you actively help your peers in this program? *</label>
              <textarea placeholder="Describe concretely how you plan to support others — not just yourself." value={form.helpOthers} onChange={e => set("helpOthers", e.target.value)} />
            </div>
            <div className="field">
              <label>What is your biggest academic weakness, and what are you doing about it? *</label>
              <textarea placeholder="Be honest. Estamote values self-awareness and effort far above pretending you have none." value={form.weakness} onChange={e => set("weakness", e.target.value)} />
            </div>
            <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 12, padding: "14px 18px", marginTop: 8 }}>
              <div style={{ fontSize: 12.5, color: "#92400E", fontWeight: 600, marginBottom: 4 }}>Before you submit</div>
              <div style={{ fontSize: 12.5, color: "#B45309", lineHeight: 1.6 }}>All information must be accurate. Submitting confirms you meet the 87% grade requirement and genuinely want to participate.</div>
            </div>
          </>}

          <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
            {step > 0 && <button className="btn-ghost" onClick={back} style={{ flex: "0 0 100px" }}>← Back</button>}
            {step < 2
              ? <button className="btn-primary" onClick={next} style={{ flex: 1 }}>Next step →</button>
              : <button className="btn-primary gold-btn" onClick={submit} disabled={loading} style={{ flex: 1 }}>
                  {loading ? <span className="spinner dark" /> : "Submit application ✓"}
                </button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Admin ──────────────────────────────────────────────────── */
function AdminPage({ onLogout }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [search, setSearch]     = useState("");
  const [fGender, setFGender]   = useState("All");
  const [fGrade, setFGrade]     = useState("All");
  const [fScholarship, setFS]   = useState("All");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api.getApplicants()
      .then(res => {
        if (res.error) setError(res.error);
        else setStudents(res.applicants || []);
      })
      .catch(() => setError("Failed to load applicants."))
      .finally(() => setLoading(false));
  }, []);

  async function removeStudent(id) {
    if (!window.confirm("Remove this applicant permanently?")) return;
    await api.deleteApplicant(id);
    setStudents(s => s.filter(x => x.id !== id));
  }

  function exportCSV() {
    const cols = ["full_name","phone","gender","age","grade","school","city","scholarship","how_heard","motivation","goal_exam","help_others","weakness","applied_at"];
    const header = cols.join(",");
    const rows = students.map(s => cols.map(c => `"${(s[c]||"").toString().replace(/"/g,'""')}"`).join(","));
    const blob = new Blob([header+"\n"+rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `applicants-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    const mQ = !q || [s.full_name,s.phone,s.school,s.city].some(v=>(v||"").toLowerCase().includes(q));
    const mG  = fGender==="All" || s.gender===fGender;
    const mGr = fGrade==="All" || (fGrade==="90+" && parseFloat(s.grade)>=90) || (fGrade==="87-89" && parseFloat(s.grade)>=87 && parseFloat(s.grade)<90);
    const mS  = fScholarship==="All" || (s.scholarship||"")===fScholarship;
    return mQ && mG && mGr && mS;
  });

  const females  = students.filter(s=>s.gender==="Female").length;
  const males    = students.filter(s=>s.gender==="Male").length;
  const avgGrade = students.length ? (students.reduce((a,s)=>a+parseFloat(s.grade||0),0)/students.length).toFixed(1) : null;
  const intl     = students.filter(s=>(s.scholarship||"").startsWith("Yes")).length;

  return (
    <div className="admin-bg">
      <nav className="nav">
        <div className="nav-brand"><span className="star">★</span> Estamote's <em>Elite</em><span className="nav-badge" style={{marginLeft:8}}>ADMIN</span></div>
        <div className="nav-right">
          <span style={{fontSize:12,color:"rgba(255,255,255,0.35)"}}>{ADMIN_PHONE}</span>
          <button className="nav-logout" onClick={onLogout}>Log out</button>
        </div>
      </nav>
      <div className="admin-body">
        <div className="admin-hdr">
          <div>
            <h1 className="admin-title">Applicant dashboard</h1>
            <p className="admin-sub">All students who submitted a registration — stored in Turso database</p>
          </div>
          <button className="export-btn" onClick={exportCSV}>↓ Export CSV</button>
        </div>

        {error && <div className="alert alert-error" style={{marginBottom:24}}>⚠ {error}</div>}

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total applicants</div>
            <div className="stat-value">{students.length}</div>
            <div className="stat-sub">of 10 spots maximum</div>
            <div className="stat-bar"><div className="stat-bar-fill" style={{width:`${Math.min(students.length/10*100,100)}%`}} /></div>
          </div>
          <div className="stat-card gold-stat">
            <div className="stat-label">Female applicants</div>
            <div className="stat-value" style={{color:"#B45309"}}>{females}</div>
            <div className="stat-sub">target: 5 spots</div>
            <div className="stat-bar"><div className="stat-bar-fill" style={{width:`${Math.min(females/5*100,100)}%`,background:"#D97706"}} /></div>
          </div>
          <div className="stat-card green-stat">
            <div className="stat-label">Male applicants</div>
            <div className="stat-value" style={{color:"#166534"}}>{males}</div>
            <div className="stat-sub">target: 5 spots</div>
            <div className="stat-bar"><div className="stat-bar-fill" style={{width:`${Math.min(males/5*100,100)}%`,background:"#16A34A"}} /></div>
          </div>
          <div className="stat-card blue-stat">
            <div className="stat-label">Average grade</div>
            <div className="stat-value" style={{color:"#1D4ED8"}}>{avgGrade ? `${avgGrade}%` : "—"}</div>
            <div className="stat-sub">{intl} interested in scholarships</div>
          </div>
        </div>

        <div className="filters-row">
          <div className="search-wrap">
            <span className="search-icon">⌕</span>
            <input className="search-input" placeholder="Search by name, phone, or school…" value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <select className="filter-sel" value={fGender} onChange={e=>setFGender(e.target.value)}>
            <option value="All">All genders</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
          </select>
          <select className="filter-sel" value={fGrade} onChange={e=>setFGrade(e.target.value)}>
            <option value="All">All grades</option>
            <option value="90+">90%+</option>
            <option value="87-89">87–89%</option>
          </select>
          <select className="filter-sel" value={fScholarship} onChange={e=>setFS(e.target.value)}>
            <option value="All">All scholarship interest</option>
            <option value="Yes — very interested">Very interested</option>
            <option value="Maybe — want to learn more">Maybe</option>
            <option value="No — entrance exam only">No</option>
          </select>
          <span className="result-count">{filtered.length} of {students.length}</span>
        </div>

        {loading ? (
          <div className="empty"><div style={{fontSize:36,marginBottom:12}}>⏳</div><div className="empty-title">Loading applicants…</div></div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">{students.length===0?"📋":"🔍"}</div>
            <div className="empty-title">{students.length===0?"No applications yet":"No results found"}</div>
            <div className="empty-sub">{students.length===0?"Share the registration link — submissions appear here instantly.":"Try adjusting your search or filters."}</div>
          </div>
        ) : (
          <div className="students-grid">
            {filtered.map(s => (
              <div className="student-card" key={s.id}>
                <div className="sc-header">
                  <div className={`sc-avatar ${s.gender==="Female"?"av-f":"av-m"}`}>{initials(s.full_name)}</div>
                  <div className="sc-name-wrap">
                    <div className="sc-name">{s.full_name}</div>
                    <div className="sc-phone">{s.phone}</div>
                  </div>
                  <span className={`sc-gender-pill ${s.gender==="Female"?"pill-f":"pill-m"}`}>{s.gender==="Female"?"F":"M"}</span>
                </div>
                <div className="sc-body">
                  <div className="sc-row"><span className="sc-lbl">Grade average</span><span className={`grade-pill ${gradeClass(s.grade)}`}>{s.grade}%</span></div>
                  <div className="sc-row"><span className="sc-lbl">School</span><span className="sc-val">{s.school}</span></div>
                  {s.city && <div className="sc-row"><span className="sc-lbl">City</span><span className="sc-val">{s.city}</span></div>}
                  {s.age  && <div className="sc-row"><span className="sc-lbl">Age</span><span className="sc-val">{s.age}</span></div>}
                  {s.scholarship && <div className="sc-row"><span className="sc-lbl">Scholarship</span><span className="sc-val" style={{fontSize:11.5}}>{s.scholarship}</span></div>}
                  {s.how_heard && <div className="sc-row"><span className="sc-lbl">Found via</span><span className="sc-val">{s.how_heard}</span></div>}
                  <div className="sc-divider" />
                  <div className="sc-text-lbl">Motivation</div>
                  <div className={`sc-text-body ${expanded===s.id?"expanded":""}`}>{s.motivation}</div>
                  {expanded === s.id && <>
                    <div className="sc-divider" />
                    <div className="sc-text-lbl">Entrance exam goal</div>
                    <div className="sc-text-body expanded">{s.goal_exam}</div>
                    <div className="sc-divider" />
                    <div className="sc-text-lbl">How they'll help peers</div>
                    <div className="sc-text-body expanded">{s.help_others}</div>
                    <div className="sc-divider" />
                    <div className="sc-text-lbl">Biggest weakness</div>
                    <div className="sc-text-body expanded">{s.weakness}</div>
                  </>}
                  <div className="sc-footer">
                    <div className="sc-date">{fmtDate(s.applied_at)}</div>
                    <div className="sc-actions">
                      <button className="sc-btn-detail" onClick={()=>setExpanded(expanded===s.id?null:s.id)}>{expanded===s.id?"Less":"Full details"}</button>
                      <button className="sc-btn-del" onClick={()=>removeStudent(s.id)}>Remove</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── App Shell ─────────────────────────────────────────────── */
export default function App() {
  const [page, setPage]   = useState("login");
  const [phone, setPhone] = useState("");
  const onLogin  = (ph, isAdmin) => { setPhone(ph); setPage(isAdmin ? "admin" : "register"); };
  const onLogout = () => { setPhone(""); setPage("login"); };
  return (
    <>
      <GlobalStyle />
      {page==="login"    && <LoginPage    onLogin={onLogin} />}
      {page==="register" && <RegistrationPage phone={phone} onLogout={onLogout} />}
      {page==="admin"    && <AdminPage    onLogout={onLogout} />}
    </>
  );
}
