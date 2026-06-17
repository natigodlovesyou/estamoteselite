import { useState, useEffect, useCallback, useRef } from "react";

const ADMIN_PHONE  = "+251945847280";
const ADMIN_PASS   = "#estaomte2000";
const ADMIN_SECRET = process.env.REACT_APP_ADMIN_SECRET || "estamote-admin-secret";

const api = {
  checkPhone: (phone) =>
    fetch(`/api/check/${encodeURIComponent(phone)}`).then(r => r.json()),
  uploadPhotos: (formData) =>
    fetch("/api/upload-photos", { method: "POST", body: formData }).then(r => r.json()),
  submit: (data) =>
    fetch("/api/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(r => r.json()),
  getApplicants: () =>
    fetch("/api/admin/applicants", { headers: { "x-admin-token": ADMIN_SECRET } }).then(r => r.json()),
  deleteApplicant: (id) =>
    fetch(`/api/admin/applicants/${id}`, {
      method: "DELETE",
      headers: { "x-admin-token": ADMIN_SECRET },
    }).then(r => r.json()),
};

const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600;1,700&display=swap');

    :root {
      --navy:       #08172E;
      --navy-2:     #0F2340;
      --navy-3:     #162E52;
      --gold:       #C9902A;
      --gold-lt:    #F2BC47;
      --gold-pale:  #FEF6E4;
      --gold-glow:  rgba(242,188,71,0.18);
      --cream:      #FAF7F2;
      --white:      #FFFFFF;
      --text:       #0C1B2E;
      --muted:      #64748B;
      --border:     #E8EDF5;
      --border-md:  #C8D3E8;
      --success:    #0F7B4A;
      --success-bg: #EAFAF2;
      --danger:     #BE1C1C;
      --danger-bg:  #FEE8E8;
      --info:       #1A4FAB;
      --info-bg:    #EBF2FF;
      --purple:     #6B3FC8;
      --purple-bg:  #F3EEFF;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'Inter', sans-serif;
      background: var(--navy);
      color: var(--text);
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    input, select, textarea, button { font-family: 'Inter', sans-serif; }
    button { cursor: pointer; }

    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border-md); border-radius: 3px; }

    /* ── Animations ── */
    @keyframes fadeUp   { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
    @keyframes shimmer  { 0%,100% { opacity:.6; } 50% { opacity:1; } }
    @keyframes pulse    { 0%,100% { transform:scale(1); } 50% { transform:scale(1.04); } }
    @keyframes spin     { to { transform:rotate(360deg); } }
    @keyframes floatUp  { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
    @keyframes glowPulse{ 0%,100% { box-shadow:0 0 20px rgba(242,188,71,.2); } 50% { box-shadow:0 0 40px rgba(242,188,71,.45); } }
    @keyframes gradMove { 0% { background-position:0% 50%; } 50% { background-position:100% 50%; } 100% { background-position:0% 50%; } }
    @keyframes starFloat{ 0%,100% { transform:translateY(0) rotate(0deg); opacity:.7; } 50% { transform:translateY(-18px) rotate(15deg); opacity:1; } }
    @keyframes countUp  { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }

    .anim-fade-up  { animation: fadeUp .55s cubic-bezier(.22,1,.36,1) both; }
    .anim-fade-in  { animation: fadeIn .4s ease both; }
    .anim-d1 { animation-delay:.08s; }
    .anim-d2 { animation-delay:.16s; }
    .anim-d3 { animation-delay:.24s; }
    .anim-d4 { animation-delay:.32s; }
    .anim-d5 { animation-delay:.40s; }

    /* ── Fields ── */
    .field { margin-bottom: 20px; }
    .field label {
      display: flex; align-items: center; gap: 5px;
      font-size: 12.5px; font-weight: 700; color: var(--navy);
      margin-bottom: 7px; letter-spacing: .03em; text-transform: uppercase;
    }
    .field label .req { color: var(--gold); font-size: 14px; }
    .field input, .field select, .field textarea {
      width: 100%; padding: 13px 16px;
      border: 2px solid var(--border);
      border-radius: 12px; font-size: 14.5px; color: var(--text);
      outline: none; transition: border-color .2s, box-shadow .2s, background .2s;
      background: var(--white);
      appearance: none; -webkit-appearance: none;
    }
    .field input:hover, .field select:hover, .field textarea:hover { border-color: var(--border-md); }
    .field input:focus, .field select:focus, .field textarea:focus {
      border-color: var(--gold);
      box-shadow: 0 0 0 4px rgba(201,144,42,.12);
      background: #FFFDF8;
    }
    .field input::placeholder, .field textarea::placeholder { color: #A8B4C4; }
    .field textarea { resize: vertical; min-height: 100px; line-height: 1.65; }
    .field select {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%2364748B' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round' d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
      background-repeat: no-repeat; background-position: right 14px center; padding-right: 40px;
    }
    .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .field-hint { font-size: 12px; color: var(--muted); margin-top: 6px; display: flex; align-items: center; gap: 4px; }
    .word-count-bar { height: 3px; border-radius: 2px; margin-top: 8px; background: var(--border); overflow: hidden; }
    .word-count-fill { height: 100%; border-radius: 2px; transition: width .3s, background .3s; }

    /* ── Buttons ── */
    .btn-primary {
      display: flex; align-items: center; justify-content: center; gap: 9px;
      width: 100%; padding: 15px 24px;
      background: var(--navy); color: var(--white);
      border: none; border-radius: 13px;
      font-size: 15.5px; font-weight: 700; letter-spacing: .02em;
      transition: all .2s; position: relative; overflow: hidden;
    }
    .btn-primary::before {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,.08) 0%, transparent 60%);
      opacity: 0; transition: opacity .2s;
    }
    .btn-primary:hover:not(:disabled)::before { opacity: 1; }
    .btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(8,23,46,.3); }
    .btn-primary:active { transform: translateY(0); }
    .btn-primary:disabled { opacity: .5; cursor: not-allowed; }
    .btn-gold {
      background: linear-gradient(135deg, #D4A030 0%, #F2BC47 50%, #C9902A 100%);
      background-size: 200% 200%;
      color: var(--navy);
      animation: gradMove 4s ease infinite;
      box-shadow: 0 4px 20px rgba(201,144,42,.35);
    }
    .btn-gold:hover:not(:disabled) { box-shadow: 0 8px 32px rgba(201,144,42,.5); transform: translateY(-2px); }
    .btn-ghost {
      background: none; border: 2px solid var(--border); border-radius: 12px;
      padding: 13px 18px; font-size: 14px; color: var(--muted);
      font-weight: 600; transition: all .2s;
    }
    .btn-ghost:hover { border-color: var(--border-md); color: var(--text); background: var(--cream); }

    /* ── Alerts ── */
    .alert { border-radius: 12px; padding: 13px 16px; font-size: 14px; margin-bottom: 20px; display: flex; align-items: flex-start; gap: 10px; font-weight: 500; }
    .alert-error   { background: var(--danger-bg);  color: var(--danger);  border: 1.5px solid #FCC; }
    .alert-success { background: var(--success-bg); color: var(--success); border: 1.5px solid #B2F0D4; }
    .alert-info    { background: var(--info-bg);    color: var(--info);    border: 1.5px solid #C0D8FF; }

    /* ── Section label ── */
    .section-label {
      font-size: 10.5px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase;
      color: var(--gold); margin-bottom: 18px; margin-top: 30px;
      display: flex; align-items: center; gap: 10px;
    }
    .section-label:first-child { margin-top: 0; }
    .section-label::after { content: ''; flex: 1; height: 1.5px; background: linear-gradient(90deg, var(--gold-pale), transparent); }

    /* ── Nav ── */
    .nav {
      background: rgba(8,23,46,.97); backdrop-filter: blur(12px);
      padding: 0 36px; height: 66px;
      display: flex; align-items: center; justify-content: space-between;
      border-bottom: 1px solid rgba(242,188,71,.12);
      position: sticky; top: 0; z-index: 100;
    }
    .nav-brand {
      font-family: 'Playfair Display', serif; font-size: 19px;
      color: var(--white); display: flex; align-items: center; gap: 10px;
    }
    .nav-star { color: var(--gold-lt); animation: starFloat 4s ease-in-out infinite; display: inline-block; }
    .nav-brand em { color: var(--gold-lt); font-style: normal; }
    .nav-right { display: flex; align-items: center; gap: 16px; }
    .nav-phone-tag { font-size: 12px; color: rgba(255,255,255,.3); font-family: monospace; }
    .nav-logout {
      font-size: 13px; color: rgba(255,255,255,.4); background: none; border: none;
      padding: 6px 12px; border-radius: 8px; transition: all .15s; font-weight: 500;
    }
    .nav-logout:hover { color: var(--gold-lt); background: rgba(242,188,71,.08); }
    .nav-badge {
      background: linear-gradient(135deg, rgba(201,144,42,.3), rgba(242,188,71,.2));
      color: var(--gold-lt); font-size: 10px; font-weight: 800;
      letter-spacing: .1em; padding: 4px 12px; border-radius: 20px;
      border: 1px solid rgba(242,188,71,.25);
    }

    /* ── Card ── */
    .card {
      background: var(--white); border-radius: 22px; padding: 40px 44px;
      border: 1px solid var(--border);
      box-shadow: 0 4px 32px rgba(8,23,46,.07), 0 1px 4px rgba(8,23,46,.04);
    }

    /* ── Steps ── */
    .steps-wrap { margin-bottom: 36px; }
    .steps { display: flex; align-items: center; }
    .step { display: flex; align-items: center; gap: 9px; flex: 1; }
    .step-num {
      width: 32px; height: 32px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 800; flex-shrink: 0; transition: all .3s;
    }
    .step-num.done   { background: var(--success); color: var(--white); box-shadow: 0 2px 8px rgba(15,123,74,.3); }
    .step-num.active { background: var(--navy); color: var(--white); box-shadow: 0 2px 10px rgba(8,23,46,.25); animation: glowPulse 2.5s ease-in-out infinite; }
    .step-num.idle   { background: var(--border); color: var(--muted); }
    .step-label { font-size: 12px; font-weight: 600; color: var(--muted); white-space: nowrap; }
    .step-label.active { color: var(--navy); }
    .step-line { flex: 1; height: 2px; background: var(--border); margin: 0 6px; border-radius: 1px; transition: background .3s; }
    .step-line.done { background: var(--success); }
    .step-progress { height: 3px; background: var(--border); border-radius: 2px; margin-top: 16px; overflow: hidden; }
    .step-progress-fill { height: 100%; background: linear-gradient(90deg, var(--navy), var(--gold)); border-radius: 2px; transition: width .4s cubic-bezier(.22,1,.36,1); }

    /* ── Login page ── */
    .login-bg {
      min-height: 100vh; display: flex; position: relative; overflow: hidden;
      background: radial-gradient(ellipse at 20% 50%, #0F2340 0%, #08172E 60%);
    }
    .login-left {
      flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center;
      padding: 60px 48px; position: relative; z-index: 1;
    }
    .login-right {
      width: 480px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
      padding: 40px 48px 40px 24px;
    }
    .login-orb-1 { position: absolute; width: 700px; height: 700px; border-radius: 50%; background: radial-gradient(circle, rgba(201,144,42,.12) 0%, transparent 70%); top: -200px; left: -200px; pointer-events: none; animation: floatUp 8s ease-in-out infinite; }
    .login-orb-2 { position: absolute; width: 500px; height: 500px; border-radius: 50%; background: radial-gradient(circle, rgba(107,63,200,.08) 0%, transparent 70%); bottom: -150px; right: 400px; pointer-events: none; animation: floatUp 11s ease-in-out infinite reverse; }
    .login-stars { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
    .login-star { position: absolute; background: var(--gold-lt); border-radius: 50%; animation: shimmer 3s ease-in-out infinite; }

    .login-badge {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(242,188,71,.1); border: 1px solid rgba(242,188,71,.25);
      border-radius: 24px; padding: 6px 16px; margin-bottom: 28px;
      font-size: 12px; font-weight: 700; color: var(--gold-lt); letter-spacing: .08em; text-transform: uppercase;
    }
    .login-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--gold-lt); animation: pulse 1.5s ease-in-out infinite; }
    .login-headline {
      font-family: 'Playfair Display', serif;
      font-size: clamp(36px, 4vw, 56px); font-weight: 800;
      color: var(--white); line-height: 1.12; margin-bottom: 20px;
    }
    .login-headline em { color: var(--gold-lt); font-style: italic; display: block; }
    .login-tagline { font-size: 16px; color: rgba(255,255,255,.55); line-height: 1.7; margin-bottom: 40px; max-width: 420px; }
    .login-stats { display: flex; gap: 32px; }
    .login-stat-val { font-size: 28px; font-weight: 800; color: var(--white); line-height: 1; margin-bottom: 4px; }
    .login-stat-val span { color: var(--gold-lt); }
    .login-stat-lbl { font-size: 12px; color: rgba(255,255,255,.4); font-weight: 500; }
    .login-divider-v { width: 1px; background: rgba(255,255,255,.1); }
    .login-testimonial {
      margin-top: 48px; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.08);
      border-radius: 16px; padding: 20px 24px; max-width: 420px;
    }
    .login-testimonial-text { font-size: 14px; color: rgba(255,255,255,.65); line-height: 1.65; font-style: italic; margin-bottom: 12px; }
    .login-testimonial-author { font-size: 12px; color: var(--gold-lt); font-weight: 700; }

    .login-card {
      background: var(--white); border-radius: 24px; padding: 48px 44px;
      width: 100%; max-width: 420px;
      box-shadow: 0 32px 80px rgba(0,0,0,.35), 0 0 0 1px rgba(255,255,255,.05);
    }
    .login-emblem { display: flex; align-items: center; gap: 14px; margin-bottom: 32px; }
    .login-emblem-icon {
      width: 52px; height: 52px; background: var(--navy); border-radius: 15px;
      display: flex; align-items: center; justify-content: center; font-size: 24px;
      box-shadow: 0 4px 16px rgba(8,23,46,.3);
    }
    .login-emblem-name { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: var(--navy); line-height: 1.2; }
    .login-emblem-tag { font-size: 11px; color: var(--muted); letter-spacing: .08em; text-transform: uppercase; margin-top: 3px; }
    .login-gold-bar { width: 40px; height: 3px; background: linear-gradient(90deg, var(--gold), var(--gold-lt)); border-radius: 2px; margin-bottom: 24px; }
    .login-card-title { font-size: 26px; font-weight: 800; color: var(--navy); margin-bottom: 6px; }
    .login-card-sub { font-size: 14px; color: var(--muted); margin-bottom: 28px; line-height: 1.55; }
    .login-footer { font-size: 12px; color: #B0BAC8; text-align: center; margin-top: 24px; }
    .show-pass { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--muted); font-size: 12px; font-weight: 600; padding: 4px; transition: color .15s; }
    .show-pass:hover { color: var(--navy); }
    .pass-wrap { position: relative; }
    .pass-wrap input { padding-right: 52px; }

    /* ── Hero ── */
    .reg-hero {
      background: linear-gradient(160deg, var(--navy) 0%, var(--navy-2) 40%, #1A3366 100%);
      padding: 64px 36px 56px; text-align: center; position: relative; overflow: hidden;
    }
    .reg-hero::before {
      content: ''; position: absolute; inset: 0;
      background: radial-gradient(ellipse at 70% 50%, rgba(201,144,42,.1) 0%, transparent 60%);
      pointer-events: none;
    }
    .hero-eyebrow {
      display: inline-flex; align-items: center; gap: 8px;
      font-size: 11px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase;
      color: var(--gold-lt); background: rgba(242,188,71,.1);
      border: 1px solid rgba(242,188,71,.25); border-radius: 24px; padding: 6px 16px; margin-bottom: 22px;
    }
    .hero-eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--gold-lt); animation: pulse 1.5s ease-in-out infinite; }
    .hero-title { font-family: 'Playfair Display', serif; font-size: clamp(28px,4vw,46px); color: var(--white); margin-bottom: 14px; line-height: 1.15; font-weight: 800; }
    .hero-title em { color: var(--gold-lt); font-style: italic; }
    .hero-desc { font-size: 16px; color: rgba(255,255,255,.6); max-width: 520px; margin: 0 auto 32px; line-height: 1.7; }
    .hero-pills { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; }
    .hero-pill {
      display: flex; align-items: center; gap: 7px;
      font-size: 13px; font-weight: 600; color: rgba(255,255,255,.75);
      background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.1);
      border-radius: 24px; padding: 8px 16px;
    }
    .hero-pill-icon { font-size: 15px; }

    /* ── Page ── */
    .page-bg { background: var(--cream); min-height: 100vh; }
    .page-body { max-width: 740px; margin: 0 auto; padding: 44px 24px 80px; }

    /* ── Upload zone ── */
    .upload-zone {
      border: 2px dashed var(--border-md); border-radius: 16px;
      padding: 32px 24px; text-align: center; cursor: pointer;
      transition: all .25s; background: var(--cream); position: relative;
      overflow: hidden;
    }
    .upload-zone::before {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(135deg, var(--gold-glow) 0%, transparent 60%);
      opacity: 0; transition: opacity .25s;
    }
    .upload-zone:hover, .upload-zone.drag { border-color: var(--gold); }
    .upload-zone:hover::before, .upload-zone.drag::before { opacity: 1; }
    .upload-zone.has-file { border-color: var(--success); border-style: solid; background: var(--success-bg); }
    .upload-zone input[type=file] { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
    .upload-icon-wrap { width: 60px; height: 60px; border-radius: 50%; background: var(--gold-pale); display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; font-size: 26px; transition: transform .2s; }
    .upload-zone:hover .upload-icon-wrap { transform: scale(1.08); }
    .upload-title { font-size: 15px; font-weight: 700; color: var(--navy); margin-bottom: 5px; }
    .upload-sub { font-size: 12.5px; color: var(--muted); line-height: 1.5; }
    .upload-preview { width: 100%; max-height: 200px; object-fit: cover; border-radius: 12px; margin-top: 14px; border: 2px solid rgba(15,123,74,.2); }
    .upload-success-info { display: flex; align-items: center; gap: 8px; margin-top: 10px; font-size: 13px; color: var(--success); font-weight: 600; }
    .upload-remove { font-size: 12px; color: var(--danger); font-weight: 600; margin-top: 8px; background: none; border: none; text-decoration: underline; cursor: pointer; }

    /* ── Lightbox ── */
    .lightbox { position: fixed; inset: 0; background: rgba(0,0,0,.94); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 24px; animation: fadeIn .2s; }
    .lightbox-inner { position: relative; max-width: 90vw; max-height: 90vh; }
    .lightbox-inner img { max-width: 100%; max-height: 90vh; border-radius: 12px; object-fit: contain; display: block; }
    .lightbox-close { position: absolute; top: -44px; right: 0; background: rgba(255,255,255,.1); border: none; color: white; font-size: 22px; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background .15s; }
    .lightbox-close:hover { background: rgba(255,255,255,.2); }
    .lightbox-label { position: absolute; bottom: -36px; left: 0; right: 0; text-align: center; font-size: 12px; color: rgba(255,255,255,.5); font-weight: 600; text-transform: uppercase; letter-spacing: .1em; }

    /* ── Success ── */
    .success-page { min-height: calc(100vh - 66px); display: flex; align-items: center; justify-content: center; padding: 48px 24px; background: var(--cream); }
    .success-card { background: var(--white); border-radius: 28px; padding: 60px 52px; text-align: center; max-width: 560px; width: 100%; border: 1px solid var(--border); box-shadow: 0 8px 48px rgba(8,23,46,.08); animation: fadeUp .6s cubic-bezier(.22,1,.36,1); }
    .success-burst { width: 88px; height: 88px; border-radius: 50%; background: linear-gradient(135deg, var(--success-bg), #D0FAE8); border: 3px solid #9FECCD; display: flex; align-items: center; justify-content: center; margin: 0 auto 28px; font-size: 36px; animation: glowPulse 2.5s ease-in-out infinite; }
    .success-title { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 800; color: var(--navy); margin-bottom: 14px; }
    .success-body { font-size: 15px; color: var(--muted); line-height: 1.75; margin-bottom: 32px; }
    .success-body strong { color: var(--navy); }
    .success-body em { color: var(--gold); font-style: normal; font-weight: 600; }
    .success-ref { background: var(--cream); border-radius: 16px; padding: 20px 24px; border: 1.5px solid var(--border); }
    .success-ref-lbl { font-size: 10.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .1em; color: var(--muted); margin-bottom: 6px; }
    .success-ref-val { font-size: 20px; font-weight: 700; color: var(--navy); font-family: monospace; }
    .success-steps { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-top: 28px; }
    .success-step { background: var(--cream); border-radius: 14px; padding: 16px 12px; text-align: center; }
    .success-step-icon { font-size: 22px; margin-bottom: 8px; }
    .success-step-text { font-size: 12px; color: var(--muted); font-weight: 500; line-height: 1.4; }
    .success-step-text strong { color: var(--navy); display: block; margin-bottom: 3px; }

    /* ── Warning box ── */
    .warning-box { background: #FFFBEB; border: 1.5px solid #FDE68A; border-radius: 14px; padding: 16px 20px; }
    .warning-box-title { font-size: 13px; color: #92400E; font-weight: 700; margin-bottom: 5px; display: flex; align-items: center; gap: 6px; }
    .warning-box-body { font-size: 13px; color: #B45309; line-height: 1.65; }

    /* ── Admin ── */
    .admin-bg { background: #ECF1F8; min-height: 100vh; }
    .admin-body { max-width: 1200px; margin: 0 auto; padding: 36px 24px 72px; }
    .admin-hdr { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 32px; gap: 16px; flex-wrap: wrap; }
    .admin-title { font-family: 'Playfair Display', serif; font-size: 28px; color: var(--navy); margin-bottom: 4px; font-weight: 800; }
    .admin-sub { font-size: 14px; color: var(--muted); }
    .admin-actions { display: flex; gap: 10px; align-items: center; }
    .export-btn { display: flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 700; color: var(--navy); background: var(--white); border: 2px solid var(--border); border-radius: 11px; padding: 9px 18px; transition: all .2s; }
    .export-btn:hover { border-color: var(--gold); box-shadow: 0 2px 12px rgba(0,0,0,.07); transform: translateY(-1px); }

    .stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 32px; }
    .stat-card {
      background: var(--white); border-radius: 18px; padding: 22px 24px;
      border: 1px solid var(--border); position: relative; overflow: hidden;
      box-shadow: 0 2px 8px rgba(8,23,46,.05);
      transition: transform .2s, box-shadow .2s;
    }
    .stat-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(8,23,46,.09); }
    .stat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; border-radius: 18px 18px 0 0; }
    .stat-card.s-navy::before  { background: linear-gradient(90deg, var(--navy), var(--navy-3)); }
    .stat-card.s-gold::before  { background: linear-gradient(90deg, var(--gold), var(--gold-lt)); }
    .stat-card.s-green::before { background: linear-gradient(90deg, var(--success), #2DD4BF); }
    .stat-card.s-blue::before  { background: linear-gradient(90deg, var(--info), #6366F1); }
    .stat-icon { font-size: 28px; margin-bottom: 10px; }
    .stat-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .09em; color: var(--muted); margin-bottom: 8px; }
    .stat-value { font-size: 38px; font-weight: 800; color: var(--navy); line-height: 1; animation: countUp .4s ease both; }
    .stat-sub { font-size: 12px; color: var(--muted); margin-top: 6px; }
    .stat-bar { height: 5px; background: var(--border); border-radius: 3px; margin-top: 12px; overflow: hidden; }
    .stat-bar-fill { height: 100%; border-radius: 3px; transition: width .6s cubic-bezier(.22,1,.36,1); }

    /* ── Student cards ── */
    .students-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(350px,1fr)); gap: 22px; }
    .student-card {
      background: var(--white); border-radius: 20px; overflow: hidden;
      border: 1px solid var(--border);
      transition: box-shadow .25s, transform .25s;
      box-shadow: 0 2px 10px rgba(8,23,46,.06);
    }
    .student-card:hover { box-shadow: 0 12px 40px rgba(8,23,46,.13); transform: translateY(-4px); }
    .sc-header {
      background: linear-gradient(135deg, var(--navy) 0%, var(--navy-3) 100%);
      padding: 22px 24px; display: flex; align-items: center; gap: 14px; position: relative;
    }
    .sc-header::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, var(--gold), var(--gold-lt), transparent); }
    .sc-avatar {
      width: 52px; height: 52px; border-radius: 50%; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; font-weight: 800; border: 2.5px solid rgba(255,255,255,.18);
    }
    .av-f { background: rgba(242,188,71,.2); color: var(--gold-lt); }
    .av-m { background: rgba(99,179,237,.2); color: #93C5FD; }
    .sc-name-wrap { flex: 1; min-width: 0; }
    .sc-name { font-size: 16px; font-weight: 700; color: var(--white); margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .sc-phone { font-size: 12px; color: rgba(255,255,255,.42); font-family: monospace; }
    .sc-gender-pill { font-size: 10px; font-weight: 800; padding: 4px 11px; border-radius: 20px; letter-spacing: .07em; flex-shrink: 0; }
    .pill-f { background: rgba(242,188,71,.18); color: var(--gold-lt); border: 1px solid rgba(242,188,71,.25); }
    .pill-m { background: rgba(147,197,253,.18); color: #93C5FD; border: 1px solid rgba(147,197,253,.25); }
    .sc-body { padding: 20px 24px; }
    .sc-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .sc-lbl { font-size: 12px; color: var(--muted); font-weight: 600; text-transform: uppercase; letter-spacing: .04em; }
    .sc-val { font-size: 13.5px; color: var(--text); font-weight: 600; text-align: right; max-width: 58%; }
    .grade-pill { display: inline-flex; align-items: center; gap: 4px; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 800; }
    .g-hi { background: var(--success-bg); color: var(--success); border: 1px solid #B2EDD0; }
    .g-ok { background: var(--info-bg);    color: var(--info);    border: 1px solid #C0D8FF; }
    .g-lo { background: var(--danger-bg);  color: var(--danger);  border: 1px solid #FFBBBB; }
    .sc-divider { border: none; border-top: 1px solid var(--border); margin: 14px 0; }
    .sc-text-lbl { font-size: 10.5px; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: .09em; margin-bottom: 6px; }
    .sc-text-body { font-size: 13px; color: #64748B; line-height: 1.65; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .sc-text-body.expanded { display: block; }
    .sc-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--border); }
    .sc-date { font-size: 11px; color: #B0BAC8; font-weight: 500; }
    .sc-actions { display: flex; gap: 7px; }
    .sc-btn { font-size: 12px; border: none; border-radius: 8px; padding: 6px 12px; font-family: 'Inter',sans-serif; font-weight: 700; transition: all .15s; }
    .sc-btn-detail { background: var(--info-bg); color: var(--info); }
    .sc-btn-detail:hover { background: #DBEAFF; }
    .sc-btn-del { background: var(--danger-bg); color: var(--danger); }
    .sc-btn-del:hover { background: #FECACA; }

    /* ── Docs preview ── */
    .docs-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px; }
    .doc-thumb { border-radius: 12px; overflow: hidden; border: 1.5px solid var(--border); position: relative; cursor: pointer; }
    .doc-thumb-img { width: 100%; height: 110px; object-fit: cover; display: block; transition: transform .25s; }
    .doc-thumb:hover .doc-thumb-img { transform: scale(1.05); }
    .doc-thumb-label { font-size: 10px; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: .07em; padding: 6px 10px; background: var(--cream); border-bottom: 1px solid var(--border); }
    .doc-thumb-overlay { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(8,23,46,.7)); padding: 20px 10px 8px; opacity: 0; transition: opacity .2s; display: flex; align-items: flex-end; justify-content: center; }
    .doc-thumb:hover .doc-thumb-overlay { opacity: 1; }
    .doc-thumb-overlay span { font-size: 11px; color: var(--white); font-weight: 700; letter-spacing: .06em; text-transform: uppercase; }

    /* ── Filters ── */
    .filters-row { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; flex-wrap: wrap; }
    .search-wrap { flex: 1; min-width: 220px; position: relative; }
    .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--muted); font-size: 16px; pointer-events: none; }
    .search-input { width: 100%; padding: 10px 14px 10px 40px; border: 2px solid var(--border); border-radius: 11px; font-size: 14px; font-family: 'Inter',sans-serif; outline: none; background: var(--white); color: var(--text); transition: border-color .18s; }
    .search-input:focus { border-color: var(--gold); }
    .filter-sel { padding: 10px 34px 10px 13px; border: 2px solid var(--border); border-radius: 11px; font-size: 13px; font-family: 'Inter',sans-serif; background: var(--white); color: var(--text); outline: none; appearance: none; cursor: pointer; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%2364748B' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round' d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 11px center; font-weight: 600; transition: border-color .18s; }
    .filter-sel:focus { border-color: var(--gold); }
    .result-count { font-size: 13px; color: var(--muted); white-space: nowrap; font-weight: 600; }

    /* ── Empty state ── */
    .empty { text-align: center; padding: 80px 24px; }
    .empty-icon { font-size: 56px; margin-bottom: 16px; opacity: .7; }
    .empty-title { font-size: 18px; font-weight: 700; color: var(--navy); margin-bottom: 8px; }
    .empty-sub { font-size: 14px; color: var(--muted); max-width: 360px; margin: 0 auto; line-height: 1.6; }

    /* ── Spinner ── */
    .spinner { width: 20px; height: 20px; border: 2.5px solid rgba(255,255,255,.3); border-top-color: white; border-radius: 50%; animation: spin .7s linear infinite; display: inline-block; }
    .spinner.dark { border-color: rgba(8,23,46,.15); border-top-color: var(--navy); }

    /* ── Character counter pill ── */
    .char-pill { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 20px; }
    .char-pill.good { background: var(--success-bg); color: var(--success); }
    .char-pill.warn { background: #FEF9C3; color: #854D0E; }
    .char-pill.bad  { background: var(--border); color: var(--muted); }

    @media (max-width: 900px) {
      .login-left { display: none; }
      .login-right { width: 100%; padding: 32px 20px; }
    }
    @media (max-width: 600px) {
      .login-card { padding: 36px 24px; }
      .card { padding: 26px 20px; }
      .field-row { grid-template-columns: 1fr; }
      .stats-grid { grid-template-columns: 1fr 1fr; }
      .students-grid { grid-template-columns: 1fr; }
      .admin-hdr { flex-direction: column; align-items: flex-start; }
      .hero-title { font-size: 26px; }
      .nav { padding: 0 18px; }
      .admin-body, .page-body { padding-left: 16px; padding-right: 16px; }
      .docs-row { grid-template-columns: 1fr; }
      .success-steps { grid-template-columns: 1fr; }
      .success-card { padding: 40px 28px; }
    }
  `}</style>
);

/* ── Helpers ──────────────────────────────────────────────────── */
const initials   = n => n.trim().split(/\s+/).map(w=>w[0]).join("").toUpperCase().slice(0,2);
const gradeClass = g => parseFloat(g)>=90?"g-hi":parseFloat(g)>=87?"g-ok":"g-lo";
const fmtDate    = iso => new Date(iso).toLocaleString("en-GB",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});
const fmtSize    = b => b>1048576?`${(b/1048576).toFixed(1)} MB`:`${Math.round(b/1024)} KB`;
const wordCount  = t => t.trim().split(/\s+/).filter(Boolean).length;

/* ── Lightbox ──────────────────────────────────────────────────── */
function Lightbox({ src, label, onClose }) {
  useEffect(() => {
    const fn = e => e.key==="Escape" && onClose();
    window.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", fn); document.body.style.overflow = ""; };
  }, [onClose]);
  return (
    <div className="lightbox" onClick={onClose}>
      <div className="lightbox-inner" onClick={e=>e.stopPropagation()}>
        <button className="lightbox-close" onClick={onClose}>×</button>
        <img src={src} alt={label} />
        <div className="lightbox-label">{label}</div>
      </div>
    </div>
  );
}

/* ── Photo Upload Zone ─────────────────────────────────────────── */
function PhotoZone({ label, hint, icon, value, onChange }) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef();

  function handleFile(file) {
    if (!file) return;
    if (file.size > 5*1024*1024) { alert("File is too large. Maximum size is 5MB."); return; }
    const preview = URL.createObjectURL(file);
    onChange({ file, preview, name: file.name, size: file.size });
  }

  return (
    <div>
      <div style={{fontSize:12.5,fontWeight:700,color:"var(--navy)",marginBottom:8,textTransform:"uppercase",letterSpacing:".03em",display:"flex",alignItems:"center",gap:6}}>
        {icon} {label} <span style={{color:"var(--gold)"}}>*</span>
      </div>
      <div
        className={`upload-zone ${drag?"drag":""} ${value?"has-file":""}`}
        onDragOver={e=>{e.preventDefault();setDrag(true);}}
        onDragLeave={()=>setDrag(false)}
        onDrop={e=>{e.preventDefault();setDrag(false);handleFile(e.dataTransfer.files[0]);}}
        onClick={()=>!value && inputRef.current?.click()}
      >
        {!value ? (
          <>
            <div className="upload-icon-wrap">{icon}</div>
            <div className="upload-title">Drop your photo here or click to browse</div>
            <div className="upload-sub">{hint}</div>
            <div className="upload-sub" style={{marginTop:6,color:"var(--border-md)"}}>JPG • PNG • HEIC &nbsp;·&nbsp; Max 5MB</div>
          </>
        ) : (
          <>
            <img className="upload-preview" src={value.preview} alt="preview" />
            <div className="upload-success-info">✓ {value.name} <span style={{color:"var(--muted)",fontWeight:400}}>({fmtSize(value.size)})</span></div>
            <button className="upload-remove" onClick={e=>{e.stopPropagation();onChange(null);}} type="button">
              Remove and choose a different photo
            </button>
          </>
        )}
        <input ref={inputRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])} />
      </div>
    </div>
  );
}

/* ── Floating stars decoration ─────────────────────────────────── */
function Stars() {
  const stars = Array.from({length:12},(_,i)=>({
    id:i, size:Math.random()*3+1,
    top:`${Math.random()*90}%`, left:`${Math.random()*90}%`,
    delay:`${Math.random()*4}s`, dur:`${3+Math.random()*3}s`,
  }));
  return (
    <div className="login-stars">
      {stars.map(s=>(
        <div key={s.id} className="login-star" style={{
          width:s.size,height:s.size,
          top:s.top,left:s.left,
          animationDelay:s.delay,animationDuration:s.dur,
        }}/>
      ))}
    </div>
  );
}

/* ── Login Page ─────────────────────────────────────────────────── */
function LoginPage({ onLogin }) {
  const [phone,setPhone]         = useState("");
  const [pass,setPass]           = useState("");
  const [showPass,setShowPass]   = useState(false);
  const [error,setError]         = useState("");
  const [loading,setLoading]     = useState(false);
  const isAdmin = phone.trim()===ADMIN_PHONE;

  async function handle() {
    const p = phone.trim();
    if (!p) { setError("Please enter your phone number to continue."); return; }
    if (isAdmin) {
      if (!pass) { setError("Please enter the admin password."); return; }
      if (pass!==ADMIN_PASS) { setError("Incorrect password. Please try again."); return; }
      onLogin(p,true); return;
    }
    setLoading(true); setError("");
    try {
      const res = await api.checkPhone(p);
      if (res.exists) setError("🎉 Your application is already submitted! Contact Estamote directly if you need to make changes.");
      else onLogin(p,false);
    } catch { setError("Connection error. Please check your internet and try again."); }
    finally { setLoading(false); }
  }

  return (
    <div className="login-bg">
      <Stars />
      <div className="login-orb-1"/><div className="login-orb-2"/>

      {/* Left — hero content */}
      <div className="login-left">
        <div style={{maxWidth:480}}>
          <div className="login-badge anim-fade-up">
            <span className="login-badge-dot"/>
            Now accepting applications
          </div>
          <h1 className="login-headline anim-fade-up anim-d1">
            The program that changes<em>everything.</em>
          </h1>
          <p className="login-tagline anim-fade-up anim-d2">
            Estamote's Elite is a free, premium mentorship program for 10 extraordinary students.
            Real preparation. Real results. A mentor who walked the same path and made it.
          </p>
          <div className="login-stats anim-fade-up anim-d3">
            <div>
              <div className="login-stat-val"><span>10</span></div>
              <div className="login-stat-lbl">Total spots</div>
            </div>
            <div className="login-divider-v"/>
            <div>
              <div className="login-stat-val"><span>100%</span></div>
              <div className="login-stat-lbl">Free forever</div>
            </div>
            <div className="login-divider-v"/>
            <div>
              <div className="login-stat-val"><span>1</span></div>
              <div className="login-stat-lbl">Dedicated mentor</div>
            </div>
          </div>
          <div className="login-testimonial anim-fade-up anim-d4">
            <div className="login-testimonial-text">
              "I built this program because I wished someone had done this for me. Every resource, every mistake, every lesson — it's all yours. The only condition: you have to actually want it."
            </div>
            <div className="login-testimonial-author">— Estamote, Mentor & Founder</div>
          </div>
        </div>
      </div>

      {/* Right — login card */}
      <div className="login-right">
        <div className="login-card anim-fade-up">
          <div className="login-emblem">
            <div className="login-emblem-icon">★</div>
            <div>
              <div className="login-emblem-name">Estamote's Elite</div>
              <div className="login-emblem-tag">Premium Mentorship · Class of 2025</div>
            </div>
          </div>
          <div className="login-gold-bar"/>
          <h2 className="login-card-title">Begin your application</h2>
          <p className="login-card-sub">Enter your Ethiopian phone number — it's your unique ID. No account, no password, no hassle.</p>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="field">
            <label>Phone number <span className="req">*</span></label>
            <input type="tel" placeholder="+251 9__ __ __ __" value={phone}
              onChange={e=>{setPhone(e.target.value);setError("");}}
              onKeyDown={e=>e.key==="Enter"&&handle()} autoFocus />
            <div className="field-hint">📱 This number will be used to contact you if you advance</div>
          </div>

          {isAdmin && (
            <div className="field">
              <label>Admin password <span className="req">*</span></label>
              <div className="pass-wrap">
                <input type={showPass?"text":"password"} placeholder="Enter password"
                  value={pass} onChange={e=>{setPass(e.target.value);setError("");}}
                  onKeyDown={e=>e.key==="Enter"&&handle()} />
                <button className="show-pass" onClick={()=>setShowPass(s=>!s)} type="button">
                  {showPass?"Hide":"Show"}
                </button>
              </div>
            </div>
          )}

          <button className="btn-primary btn-gold" onClick={handle} disabled={loading} style={{marginTop:8}}>
            {loading ? <span className="spinner dark" style={{borderTopColor:"var(--navy)"}}/> : <>Start my application →</>}
          </button>

          <div style={{display:"flex",alignItems:"center",gap:16,margin:"20px 0 0",justifyContent:"center",flexWrap:"wrap"}}>
            {["✓ Completely free","✓ 10 spots only","✓ Opens one chance"].map(t=>(
              <span key={t} style={{fontSize:12,color:var_muted,fontWeight:600}}>{t}</span>
            ))}
          </div>
          <div className="login-footer">Built with purpose. For the ones who truly want it.</div>
        </div>
      </div>
    </div>
  );
}

const var_muted = "var(--muted)";

/* ── Registration Page ──────────────────────────────────────────── */
const STEPS = ["Personal info","Motivation","Character","Documents"];
const STEP_HINTS = [
  "Tell us who you are",
  "Tell us why you belong here",
  "Show us your character",
  "Verify your documents",
];

function RegistrationPage({ phone, onLogout }) {
  const [step,setStep]       = useState(0);
  const [done,setDone]       = useState(false);
  const [error,setError]     = useState("");
  const [loading,setLoading] = useState(false);
  const [uploadMsg,setUploadMsg] = useState("");
  const [form,setForm] = useState({
    fullName:"",gender:"",age:"",grade:"",school:"",city:"",
    motivation:"",goalExam:"",scholarship:"",
    helpOthers:"",weakness:"",howHeard:"",
  });
  const [nationalId,setNationalId]   = useState(null);
  const [certificate,setCertificate] = useState(null);
  const set = useCallback((k,v)=>{setForm(f=>({...f,[k]:v}));setError("");},[]);

  function validate(s) {
    if (s===0) {
      if (!form.fullName.trim()) return "Please enter your full name.";
      if (!form.gender)          return "Please select your gender.";
      if (!form.grade)           return "Please enter your grade average.";
      if (parseFloat(form.grade)<87) return "Minimum grade of 87% required. If your grade is below this, unfortunately you do not qualify for this program.";
      if (!form.school.trim())   return "Please enter your school name.";
    }
    if (s===1) {
      if (!form.motivation.trim()) return "Please write your motivation statement.";
      if (wordCount(form.motivation)<20) return "Your motivation statement is too short. Please write at least 20 words — this is your chance to stand out.";
      if (!form.goalExam.trim())   return "Please describe your entrance exam goal.";
    }
    if (s===2) {
      if (!form.helpOthers.trim()) return "Please answer how you will support your peers.";
      if (!form.weakness.trim())   return "Please describe your biggest academic weakness.";
    }
    if (s===3) {
      if (!nationalId)  return "Your National ID photo is required to verify your identity.";
      if (!certificate) return "Your School Certificate photo is required to verify your grade.";
    }
    return null;
  }

  function next() {
    const err = validate(step);
    if (err) { setError(err); return; }
    setError(""); setStep(s=>s+1);
    window.scrollTo({top:0,behavior:"smooth"});
  }
  function back() { setError(""); setStep(s=>s-1); window.scrollTo({top:0,behavior:"smooth"}); }

  async function submit() {
    const err = validate(3);
    if (err) { setError(err); return; }
    setLoading(true); setError("");
    try {
      setUploadMsg("Uploading your documents securely…");
      const fd = new FormData();
      fd.append("nationalId",nationalId.file);
      fd.append("certificate",certificate.file);
      const up = await api.uploadPhotos(fd);
      if (up.error) { setError(up.error); setLoading(false); setUploadMsg(""); return; }

      setUploadMsg("Saving your application…");
      const res = await api.submit({
        ...form, phone,
        nationalIdUrl: up.nationalIdUrl,
        certificateUrl: up.certificateUrl,
      });
      if (res.error) setError(res.error);
      else { setDone(true); window.scrollTo({top:0,behavior:"smooth"}); }
    } catch { setError("Connection error. Please check your internet and try again."); }
    finally { setLoading(false); setUploadMsg(""); }
  }

  if (done) return (
    <div className="page-bg">
      <nav className="nav">
        <div className="nav-brand"><span className="nav-star">★</span> Estamote's <em>Elite</em></div>
        <button className="nav-logout" onClick={onLogout}>Log out</button>
      </nav>
      <div className="success-page">
        <div className="success-card">
          <div className="success-burst">🎯</div>
          <h2 className="success-title">You're in the running!</h2>
          <p className="success-body">
            Congratulations, <strong>{form.fullName}</strong>. Your application has been received and is now in Estamote's hands.<br /><br />
            The selection process takes 1–1.5 months. You'll be contacted via phone at <strong>{phone}</strong> if you advance to the next stage. Until then —<br /><br />
            <em>Stay disciplined. Stay hungry. This is just the beginning.</em>
          </p>
          <div className="success-ref">
            <div className="success-ref-lbl">Your application reference</div>
            <div className="success-ref-val">{phone}</div>
          </div>
          <div className="success-steps">
            {[
              {icon:"📋",title:"Stage 1 done",desc:"Application submitted"},
              {icon:"👁️",title:"Stage 2 next",desc:"Telegram group observation"},
              {icon:"🏆",title:"Final goal",desc:"Be selected as 1 of 10"},
            ].map(s=>(
              <div className="success-step" key={s.title}>
                <div className="success-step-icon">{s.icon}</div>
                <div className="success-step-text">
                  <strong>{s.title}</strong>
                  {s.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const wc = wordCount(form.motivation);
  const wcPct = Math.min(wc/80*100,100);
  const wcClass = wc>=50?"good":wc>=20?"warn":"bad";

  return (
    <div className="page-bg">
      <nav className="nav">
        <div className="nav-brand"><span className="nav-star">★</span> Estamote's <em>Elite</em></div>
        <div className="nav-right">
          <span className="nav-phone-tag">{phone}</span>
          <button className="nav-logout" onClick={onLogout}>Log out</button>
        </div>
      </nav>

      {/* Hero */}
      <div className="reg-hero">
        <div className="hero-eyebrow"><span className="hero-eyebrow-dot"/>Applications open · 10 spots only</div>
        <h1 className="hero-title">Apply for <em>Estamote's Elite</em></h1>
        <p className="hero-desc">This isn't just a mentorship. It's the full preparation system — notes, live coaching, weekly competitions, peer support, and scholarship guidance. All free. All real.</p>
        <div className="hero-pills">
          {[
            {icon:"🎓",text:"87%+ grade required"},
            {icon:"🆓",text:"Completely free"},
            {icon:"👥",text:"5 female · 5 male"},
            {icon:"🌍",text:"Scholarship guidance"},
            {icon:"🏆",text:"Weekly competitions"},
          ].map(p=>(
            <div className="hero-pill" key={p.text}><span className="hero-pill-icon">{p.icon}</span>{p.text}</div>
          ))}
        </div>
      </div>

      <div className="page-body">
        {/* Progress */}
        <div className="steps-wrap">
          <div className="steps">
            {STEPS.map((label,i)=>(
              <div className="step" key={i}>
                <div className={`step-num ${i<step?"done":i===step?"active":"idle"}`}>
                  {i<step?"✓":i+1}
                </div>
                <span className={`step-label ${i===step?"active":""}`}>{label}</span>
                {i<STEPS.length-1 && <div className={`step-line ${i<step?"done":""}`}/>}
              </div>
            ))}
          </div>
          <div className="step-progress">
            <div className="step-progress-fill" style={{width:`${(step/3)*100}%`}}/>
          </div>
          <div style={{fontSize:12.5,color:"var(--muted)",marginTop:10,fontWeight:500}}>
            Step {step+1} of 4 — {STEP_HINTS[step]}
          </div>
        </div>

        {error && <div className="alert alert-error anim-fade-up">⚠ {error}</div>}

        <div className="card anim-fade-up">

          {/* ── Step 0: Personal ── */}
          {step===0 && <>
            <div className="section-label">Who are you?</div>
            <div className="field-row">
              <div className="field">
                <label>Full name <span className="req">*</span></label>
                <input placeholder="e.g. Abebe Girma" value={form.fullName} onChange={e=>set("fullName",e.target.value)} />
              </div>
              <div className="field">
                <label>Age</label>
                <input type="number" placeholder="e.g. 17" value={form.age} onChange={e=>set("age",e.target.value)} min="10" max="25"/>
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label>Gender <span className="req">*</span></label>
                <select value={form.gender} onChange={e=>set("gender",e.target.value)}>
                  <option value="">Select your gender</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
              </div>
              <div className="field">
                <label>Grade average (%) <span className="req">*</span></label>
                <input type="number" placeholder="e.g. 92" min="0" max="100" value={form.grade} onChange={e=>set("grade",e.target.value)}/>
                <div className="field-hint">📊 Minimum 87% required for this program</div>
              </div>
            </div>
            <div className="field">
              <label>School name <span className="req">*</span></label>
              <input placeholder="Your current school" value={form.school} onChange={e=>set("school",e.target.value)}/>
            </div>
            <div className="field">
              <label>City / town</label>
              <input placeholder="Where are you based? (e.g. Addis Ababa)" value={form.city} onChange={e=>set("city",e.target.value)}/>
            </div>
            <div className="field">
              <label>How did you hear about this program?</label>
              <select value={form.howHeard} onChange={e=>set("howHeard",e.target.value)}>
                <option value="">Select</option>
                <option value="Telegram">Telegram</option>
                <option value="A friend or classmate">A friend or classmate</option>
                <option value="YouTube">YouTube</option>
                <option value="Instagram / TikTok">Instagram / TikTok</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </>}

          {/* ── Step 1: Motivation ── */}
          {step===1 && <>
            <div className="section-label">Why do you belong here?</div>
            <div className="alert alert-info">
              💡 This is your biggest chance to stand out. Be specific, be honest, be yourself. Vague answers don't get selected.
            </div>
            <div className="field">
              <label>Why do you want to join Estamote's Elite? <span className="req">*</span></label>
              <textarea style={{minHeight:130}} placeholder="Why this program? Why now? What do you hope to achieve — for yourself and the people around you? Don't be generic. Be real." value={form.motivation} onChange={e=>set("motivation",e.target.value)}/>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:8}}>
                <div className="field-hint">{wc} words</div>
                <span className={`char-pill ${wcClass}`}>
                  {wc<20?"Too short":wc<50?"Getting there ":"Strong ✓"}
                </span>
              </div>
              <div className="word-count-bar">
                <div className="word-count-fill" style={{width:`${wcPct}%`,background:wc>=50?"var(--success)":wc>=20?"#F59E0B":"var(--border-md)"}}/>
              </div>
            </div>
            <div className="field">
              <label>What is your goal for the national entrance exam? <span className="req">*</span></label>
              <textarea placeholder="What score are you targeting? Which university and field? Why does this matter to you personally? Paint the picture." value={form.goalExam} onChange={e=>set("goalExam",e.target.value)}/>
            </div>
            <div className="field">
              <label>Are you interested in international scholarships? (MEXT Japan, GKS Korea…)</label>
              <select value={form.scholarship} onChange={e=>set("scholarship",e.target.value)}>
                <option value="">Select</option>
                <option value="Yes — very interested">Yes — very interested</option>
                <option value="Maybe — want to learn more">Maybe — I want to learn more</option>
                <option value="No — entrance exam only">No — focused on the entrance exam for now</option>
              </select>
              <div className="field-hint">🌍 Scholarship guidance is available for all 10 selected students who want it — at no extra cost.</div>
            </div>
          </>}

          {/* ── Step 2: Character ── */}
          {step===2 && <>
            <div className="section-label">Show us your character</div>
            <div className="alert alert-info">
              🔍 This is the character filter. Estamote is looking for people who are humble, honest, and genuinely care about others — not just themselves.
            </div>
            <div className="field">
              <label>How will you actively help your peers in this program? <span className="req">*</span></label>
              <textarea placeholder="Be concrete. Saying 'I will help when needed' is not enough. How exactly will you contribute? What strengths will you bring to the group?" value={form.helpOthers} onChange={e=>set("helpOthers",e.target.value)}/>
            </div>
            <div className="field">
              <label>What is your biggest academic weakness, and what are you doing about it? <span className="req">*</span></label>
              <textarea placeholder="Be honest — not perfect. Estamote values students who can look at themselves clearly and take action. Pretending you have no weaknesses is a red flag." value={form.weakness} onChange={e=>set("weakness",e.target.value)}/>
            </div>
            <div className="warning-box" style={{marginTop:8}}>
              <div className="warning-box-title">⚡ One more step after this</div>
              <div className="warning-box-body">The final step will ask you to upload a photo of your National ID and your school grade certificate. Have them ready on your phone or computer — clear, readable photos only.</div>
            </div>
          </>}

          {/* ── Step 3: Documents ── */}
          {step===3 && <>
            <div className="section-label">Verify your identity</div>
            <p style={{fontSize:14,color:"var(--muted)",lineHeight:1.7,marginBottom:24}}>
              These documents confirm you are who you say you are — and that your grades are real. Both are <strong style={{color:"var(--navy)"}}>required</strong>. Documents are stored securely and are only visible to Estamote.
            </p>
            <div style={{display:"grid",gap:22}}>
              <PhotoZone
                label="National ID card"
                hint="Clear photo of the front side of your Ethiopian National ID"
                icon="🪪"
                value={nationalId}
                onChange={setNationalId}
              />
              <PhotoZone
                label="School grade certificate"
                hint="Your most recent grade report clearly showing your percentage average"
                icon="📄"
                value={certificate}
                onChange={setCertificate}
              />
            </div>
            <div className="alert alert-info" style={{marginTop:20}}>
              🔒 Your photos are uploaded directly to Cloudinary's secure servers. They are never shared with anyone outside this program and are only accessible to Estamote.
            </div>
          </>}

          {/* Nav */}
          <div style={{display:"flex",gap:10,marginTop:32}}>
            {step>0 && <button className="btn-ghost" onClick={back} style={{flex:"0 0 110px"}} disabled={loading}>← Back</button>}
            {step<3
              ? <button className="btn-primary" onClick={next} style={{flex:1}}>Continue to step {step+2} →</button>
              : <button className="btn-primary btn-gold" onClick={submit} disabled={loading} style={{flex:1}}>
                  {loading
                    ? <><span className="spinner dark" style={{borderTopColor:"var(--navy)"}}/> {uploadMsg||"Submitting…"}</>
                    : "Submit my application ✓"
                  }
                </button>
            }
          </div>
        </div>

        <div style={{textAlign:"center",marginTop:24,fontSize:12,color:"var(--muted)"}}>
          Questions? Reach out to Estamote directly on Telegram.
        </div>
      </div>
    </div>
  );
}

/* ── Admin Page ─────────────────────────────────────────────────── */
function AdminPage({ onLogout }) {
  const [students,setStudents] = useState([]);
  const [loading,setLoading]   = useState(true);
  const [error,setError]       = useState("");
  const [search,setSearch]     = useState("");
  const [fGender,setFGender]   = useState("All");
  const [fGrade,setFGrade]     = useState("All");
  const [fScholarship,setFS]   = useState("All");
  const [expanded,setExpanded] = useState(null);
  const [lightbox,setLightbox] = useState(null);

  useEffect(()=>{
    api.getApplicants()
      .then(res=>{ if(res.error) setError(res.error); else setStudents(res.applicants||[]); })
      .catch(()=>setError("Failed to load applicants."))
      .finally(()=>setLoading(false));
  },[]);

  async function removeStudent(id) {
    if (!window.confirm("Remove this applicant permanently?")) return;
    await api.deleteApplicant(id);
    setStudents(s=>s.filter(x=>x.id!==id));
  }

  function exportCSV() {
    const cols=["full_name","phone","gender","age","grade","school","city","scholarship","how_heard","motivation","goal_exam","help_others","weakness","national_id_url","certificate_url","applied_at"];
    const blob=new Blob([cols.join(",")+"\n"+students.map(s=>cols.map(c=>`"${(s[c]||"").toString().replace(/"/g,'""')}"`).join(",")).join("\n")],{type:"text/csv"});
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`applicants-${Date.now()}.csv`; a.click();
  }

  const filtered=students.filter(s=>{
    const q=search.toLowerCase();
    const mQ=!q||[s.full_name,s.phone,s.school,s.city].some(v=>(v||"").toLowerCase().includes(q));
    const mG=fGender==="All"||s.gender===fGender;
    const mGr=fGrade==="All"||(fGrade==="90+"&&parseFloat(s.grade)>=90)||(fGrade==="87-89"&&parseFloat(s.grade)>=87&&parseFloat(s.grade)<90);
    const mS=fScholarship==="All"||(s.scholarship||"")===fScholarship;
    return mQ&&mG&&mGr&&mS;
  });

  const females=students.filter(s=>s.gender==="Female").length;
  const males=students.filter(s=>s.gender==="Male").length;
  const avgGrade=students.length?(students.reduce((a,s)=>a+parseFloat(s.grade||0),0)/students.length).toFixed(1):null;
  const intl=students.filter(s=>(s.scholarship||"").startsWith("Yes")).length;

  return (
    <div className="admin-bg">
      {lightbox && <Lightbox src={lightbox.src} label={lightbox.label} onClose={()=>setLightbox(null)}/>}
      <nav className="nav">
        <div className="nav-brand"><span className="nav-star">★</span> Estamote's <em>Elite</em><span className="nav-badge" style={{marginLeft:10}}>ADMIN</span></div>
        <div className="nav-right">
          <span className="nav-phone-tag">{ADMIN_PHONE}</span>
          <button className="nav-logout" onClick={onLogout}>Log out</button>
        </div>
      </nav>

      <div className="admin-body">
        <div className="admin-hdr">
          <div>
            <h1 className="admin-title">Applicant Dashboard</h1>
            <p className="admin-sub">All submitted applications — data in Turso · photos in Cloudinary</p>
          </div>
          <div className="admin-actions">
            <button className="export-btn" onClick={exportCSV}>↓ Export CSV</button>
          </div>
        </div>

        {error && <div className="alert alert-error" style={{marginBottom:24}}>⚠ {error}</div>}

        <div className="stats-grid">
          {[
            {cls:"s-navy",icon:"👥",label:"Total applicants",val:students.length,sub:`${10-students.length} spots remaining`,pct:students.length/10*100,barColor:"var(--navy)"},
            {cls:"s-gold",icon:"👩",label:"Female applicants",val:females,sub:"Target: 5 spots",pct:females/5*100,barColor:"var(--gold)"},
            {cls:"s-green",icon:"👨",label:"Male applicants",val:males,sub:"Target: 5 spots",pct:males/5*100,barColor:"var(--success)"},
            {cls:"s-blue",icon:"📊",label:"Average grade",val:avgGrade?`${avgGrade}%`:"—",sub:`${intl} want scholarships`,pct:avgGrade?parseFloat(avgGrade):0,barColor:"var(--info)"},
          ].map((s,i)=>(
            <div className={`stat-card ${s.cls}`} key={i}>
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.val}</div>
              <div className="stat-sub">{s.sub}</div>
              <div className="stat-bar"><div className="stat-bar-fill" style={{width:`${Math.min(s.pct,100)}%`,background:s.barColor}}/></div>
            </div>
          ))}
        </div>

        <div className="filters-row">
          <div className="search-wrap">
            <span className="search-icon">⌕</span>
            <input className="search-input" placeholder="Search by name, phone, school, or city…" value={search} onChange={e=>setSearch(e.target.value)}/>
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
          <div className="empty"><div style={{fontSize:40,marginBottom:14}}>⏳</div><div className="empty-title">Loading applicants…</div></div>
        ) : filtered.length===0 ? (
          <div className="empty">
            <div className="empty-icon">{students.length===0?"📋":"🔍"}</div>
            <div className="empty-title">{students.length===0?"No applications yet":"No results found"}</div>
            <div className="empty-sub">{students.length===0?"Share the registration link — every submission appears here instantly in real time.":"Try adjusting your search filters."}</div>
          </div>
        ) : (
          <div className="students-grid">
            {filtered.map(s=>(
              <div className="student-card" key={s.id}>
                <div className="sc-header">
                  <div className={`sc-avatar ${s.gender==="Female"?"av-f":"av-m"}`}>{initials(s.full_name)}</div>
                  <div className="sc-name-wrap">
                    <div className="sc-name">{s.full_name}</div>
                    <div className="sc-phone">{s.phone}</div>
                  </div>
                  <span className={`sc-gender-pill ${s.gender==="Female"?"pill-f":"pill-m"}`}>{s.gender==="Female"?"FEMALE":"MALE"}</span>
                </div>
                <div className="sc-body">
                  <div className="sc-row"><span className="sc-lbl">Grade</span><span className={`grade-pill ${gradeClass(s.grade)}`}>{s.grade}%</span></div>
                  <div className="sc-row"><span className="sc-lbl">School</span><span className="sc-val">{s.school}</span></div>
                  {s.city && <div className="sc-row"><span className="sc-lbl">City</span><span className="sc-val">{s.city}</span></div>}
                  {s.age  && <div className="sc-row"><span className="sc-lbl">Age</span><span className="sc-val">{s.age} years</span></div>}
                  {s.scholarship && <div className="sc-row"><span className="sc-lbl">Scholarship</span><span className="sc-val" style={{fontSize:11.5}}>{s.scholarship}</span></div>}
                  {s.how_heard && <div className="sc-row"><span className="sc-lbl">Found via</span><span className="sc-val">{s.how_heard}</span></div>}

                  {/* Documents — always shown */}
                  <div className="sc-divider"/>
                  <div className="sc-text-lbl">Verification documents</div>
                  <div className="docs-row">
                    {[
                      {url:s.national_id_url,label:"National ID"},
                      {url:s.certificate_url,label:"Certificate"},
                    ].map(doc=>(
                      <div className="doc-thumb" key={doc.label} onClick={()=>setLightbox({src:doc.url,label:doc.label})}>
                        <div className="doc-thumb-label">{doc.label}</div>
                        <img className="doc-thumb-img" src={doc.url} alt={doc.label}/>
                        <div className="doc-thumb-overlay"><span>View full size</span></div>
                      </div>
                    ))}
                  </div>

                  <div className="sc-divider"/>
                  <div className="sc-text-lbl">Motivation</div>
                  <div className={`sc-text-body ${expanded===s.id?"expanded":""}`}>{s.motivation}</div>

                  {expanded===s.id && <>
                    <div className="sc-divider"/>
                    <div className="sc-text-lbl">Entrance exam goal</div>
                    <div className="sc-text-body expanded">{s.goal_exam}</div>
                    <div className="sc-divider"/>
                    <div className="sc-text-lbl">How they'll help peers</div>
                    <div className="sc-text-body expanded">{s.help_others}</div>
                    <div className="sc-divider"/>
                    <div className="sc-text-lbl">Biggest weakness</div>
                    <div className="sc-text-body expanded">{s.weakness}</div>
                  </>}

                  <div className="sc-footer">
                    <div className="sc-date">Applied {fmtDate(s.applied_at)}</div>
                    <div className="sc-actions">
                      <button className="sc-btn sc-btn-detail" onClick={()=>setExpanded(expanded===s.id?null:s.id)}>
                        {expanded===s.id?"Less":"Full details"}
                      </button>
                      <button className="sc-btn sc-btn-del" onClick={()=>removeStudent(s.id)}>Remove</button>
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

/* ── App Shell ──────────────────────────────────────────────────── */
export default function App() {
  const [page,setPage]   = useState("login");
  const [phone,setPhone] = useState("");
  const onLogin  = (ph,isAdmin)=>{ setPhone(ph); setPage(isAdmin?"admin":"register"); };
  const onLogout = ()=>{ setPhone(""); setPage("login"); };
  return (
    <>
      <GlobalStyle/>
      {page==="login"    && <LoginPage    onLogin={onLogin}/>}
      {page==="register" && <RegistrationPage phone={phone} onLogout={onLogout}/>}
      {page==="admin"    && <AdminPage    onLogout={onLogout}/>}
    </>
  );
}
