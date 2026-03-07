import { useState, useEffect, useRef } from "react";

// ─── THEME CONSTANTS ────────────────────────────────────────────────────────
const C = {
  bg: "#050f08",
  bg2: "#071410",
  card: "rgba(10,35,20,0.6)",
  border: "rgba(52,211,100,0.15)",
  green1: "#0d4f2e",
  green2: "#16a34a",
  green3: "#22c55e",
  lime: "#a3e635",
  gold: "#d4af37",
  text: "#e8f5ee",
  muted: "#6b9e7a",
};

// ─── INLINE STYLES ──────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: ${C.bg};
    color: ${C.text};
    font-family: 'DM Sans', sans-serif;
    overflow-x: hidden;
    cursor: none;
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: ${C.bg}; }
  ::-webkit-scrollbar-thumb { background: ${C.green2}; border-radius: 2px; }

  .playfair { font-family: 'Playfair Display', serif; }
  .mono { font-family: 'DM Mono', monospace; }

  /* CURSOR */
  .cursor {
    width: 12px; height: 12px;
    background: ${C.lime};
    border-radius: 50%;
    position: fixed; top: 0; left: 0;
    pointer-events: none;
    z-index: 9999;
    mix-blend-mode: screen;
    transition: transform 0.1s ease, width 0.2s, height 0.2s, background 0.2s;
  }
  .cursor-follower {
    width: 36px; height: 36px;
    border: 1px solid rgba(163,230,53,0.4);
    border-radius: 50%;
    position: fixed; top: 0; left: 0;
    pointer-events: none;
    z-index: 9998;
    transition: transform 0.15s ease, width 0.2s, height 0.2s;
  }
  .cursor.hover { width: 20px; height: 20px; background: ${C.green3}; }
  .cursor-follower.hover { width: 60px; height: 60px; border-color: rgba(34,197,94,0.5); }

  /* LOADING SCREEN */
  .loader {
    position: fixed; inset: 0;
    background: ${C.bg};
    z-index: 9000;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    transition: opacity 0.8s ease, visibility 0.8s ease;
  }
  .loader.hidden { opacity: 0; visibility: hidden; }

  .plate-container {
    position: relative; width: 200px; height: 200px;
    margin-bottom: 32px;
  }
  .plate {
    width: 180px; height: 180px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 35%, #1a4a2e, #0a2218);
    border: 3px solid rgba(34,197,94,0.3);
    box-shadow: 0 0 60px rgba(22,163,74,0.2), inset 0 0 40px rgba(0,0,0,0.5);
    position: absolute; top: 10px; left: 10px;
    animation: plateAppear 0.6s 1.5s both;
  }
  @keyframes plateAppear {
    from { transform: scale(0) rotate(-180deg); opacity: 0; }
    to { transform: scale(1) rotate(0deg); opacity: 1; }
  }

  .food-item {
    position: absolute;
    font-size: 28px;
    animation: foodFall 0.5s ease-out both;
  }
  @keyframes foodFall {
    from { transform: translateY(-80px) rotate(-20deg); opacity: 0; }
    to { transform: translateY(0) rotate(0deg); opacity: 1; }
  }

  .loader-logo {
    font-family: 'Playfair Display', serif;
    font-size: 36px;
    font-weight: 900;
    background: linear-gradient(135deg, ${C.green3}, ${C.lime});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: logoReveal 0.6s 2.2s both;
    letter-spacing: -1px;
  }
  @keyframes logoReveal {
    from { opacity: 0; transform: translateY(20px); letter-spacing: 20px; }
    to { opacity: 1; transform: translateY(0); letter-spacing: -1px; }
  }

  .loader-sub {
    font-size: 13px;
    color: ${C.muted};
    margin-top: 12px;
    letter-spacing: 2px;
    text-transform: uppercase;
    animation: fadeIn 0.6s 2.5s both;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .loader-bar-wrap {
    width: 200px; height: 2px;
    background: rgba(34,197,94,0.1);
    border-radius: 2px;
    margin-top: 32px;
    overflow: hidden;
    animation: fadeIn 0.3s 0.5s both;
  }
  .loader-bar {
    height: 100%;
    background: linear-gradient(90deg, ${C.green2}, ${C.lime});
    border-radius: 2px;
    animation: loadBar 2s 0.5s cubic-bezier(0.4,0,0.2,1) both;
  }
  @keyframes loadBar { from { width: 0; } to { width: 100%; } }

  /* NAV */
  nav {
    position: fixed; top: 0; left: 0; right: 0;
    padding: 20px 48px;
    display: flex; align-items: center; justify-content: space-between;
    z-index: 100;
    transition: background 0.3s, backdrop-filter 0.3s, border-bottom 0.3s;
  }
  nav.scrolled {
    background: rgba(5,15,8,0.8);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(34,197,94,0.1);
  }
  .nav-logo {
    font-family: 'Playfair Display', serif;
    font-size: 22px; font-weight: 900;
    background: linear-gradient(135deg, ${C.green3}, ${C.lime});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .nav-links { display: flex; gap: 36px; list-style: none; }
  .nav-links a {
    font-size: 14px; color: ${C.muted}; text-decoration: none;
    transition: color 0.2s; letter-spacing: 0.3px;
  }
  .nav-links a:hover { color: ${C.green3}; }
  .nav-cta {
    padding: 10px 24px;
    background: linear-gradient(135deg, ${C.green2}, ${C.green3});
    border: none; border-radius: 100px;
    color: #fff; font-size: 13px; font-weight: 600;
    cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;
    letter-spacing: 0.3px;
  }
  .nav-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(22,163,74,0.4); }

  /* GLASS CARD */
  .glass {
    background: ${C.card};
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid ${C.border};
    border-radius: 20px;
  }

  /* SECTIONS */
  section { min-height: 100vh; padding: 100px 48px; position: relative; overflow: hidden; }

  /* HERO */
  .hero {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    text-align: center;
    background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(22,163,74,0.12) 0%, transparent 70%);
  }

  .hero-tag {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 6px 16px;
    background: rgba(34,197,94,0.08);
    border: 1px solid rgba(34,197,94,0.2);
    border-radius: 100px;
    font-size: 12px; color: ${C.green3};
    letter-spacing: 1.5px; text-transform: uppercase;
    margin-bottom: 32px;
    animation: fadeIn 0.6s 0.2s both;
  }

  .hero-h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(52px, 8vw, 100px);
    font-weight: 900;
    line-height: 0.95;
    letter-spacing: -3px;
    margin-bottom: 28px;
    animation: heroReveal 0.8s 0.4s both;
  }
  @keyframes heroReveal {
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .hero-h1 .accent {
    background: linear-gradient(135deg, ${C.green3} 0%, ${C.lime} 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }

  .hero-sub {
    font-size: clamp(16px, 2vw, 20px);
    color: ${C.muted};
    max-width: 520px;
    line-height: 1.6;
    margin-bottom: 48px;
    animation: fadeIn 0.6s 0.7s both;
  }

  .hero-btns {
    display: flex; gap: 16px;
    animation: fadeIn 0.6s 0.9s both;
  }

  .btn-primary {
    padding: 16px 36px;
    background: linear-gradient(135deg, ${C.green1}, ${C.green2});
    border: 1px solid ${C.green3};
    border-radius: 100px;
    color: #fff; font-size: 15px; font-weight: 600;
    cursor: pointer; transition: all 0.3s;
    letter-spacing: 0.3px;
  }
  .btn-primary:hover {
    background: linear-gradient(135deg, ${C.green2}, ${C.green3});
    transform: translateY(-3px);
    box-shadow: 0 16px 48px rgba(22,163,74,0.4);
  }

  .btn-ghost {
    padding: 16px 36px;
    background: transparent;
    border: 1px solid rgba(34,197,94,0.3);
    border-radius: 100px;
    color: ${C.green3}; font-size: 15px; font-weight: 500;
    cursor: pointer; transition: all 0.3s;
  }
  .btn-ghost:hover {
    background: rgba(34,197,94,0.08);
    border-color: ${C.green3};
    transform: translateY(-3px);
  }

  /* FLOATING FOOD */
  .float-food {
    position: absolute;
    font-size: 40px;
    filter: drop-shadow(0 0 20px rgba(34,197,94,0.3));
    animation: floatAround 6s ease-in-out infinite;
    user-select: none; pointer-events: none;
  }
  @keyframes floatAround {
    0%,100% { transform: translateY(0) rotate(0deg); }
    33% { transform: translateY(-20px) rotate(5deg); }
    66% { transform: translateY(10px) rotate(-3deg); }
  }

  /* HERO MOCKUP */
  .hero-mockup {
    margin-top: 80px;
    width: min(900px, 90vw);
    animation: fadeIn 0.8s 1.1s both;
    position: relative;
  }
  .mockup-inner {
    padding: 28px;
    border-radius: 24px;
    background: rgba(7,20,16,0.9);
    border: 1px solid rgba(34,197,94,0.2);
    box-shadow: 0 0 80px rgba(22,163,74,0.1), 0 40px 100px rgba(0,0,0,0.6);
  }
  .mockup-bar {
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 20px;
  }
  .dot { width: 12px; height: 12px; border-radius: 50%; }

  /* SECTION TITLES */
  .section-label {
    font-size: 11px; letter-spacing: 3px; text-transform: uppercase;
    color: ${C.green3}; font-weight: 600; margin-bottom: 16px;
  }
  .section-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(36px, 5vw, 64px);
    font-weight: 900; line-height: 1.05;
    letter-spacing: -2px;
  }

  /* HOW IT WORKS */
  .steps-grid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 24px; margin-top: 64px;
  }
  .step-card {
    padding: 40px 32px;
    border-radius: 24px;
    background: rgba(10,30,18,0.7);
    border: 1px solid rgba(34,197,94,0.12);
    transition: all 0.4s cubic-bezier(0.34,1.56,0.64,1);
    cursor: default; position: relative; overflow: hidden;
  }
  .step-card::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(34,197,94,0.05), transparent);
    opacity: 0; transition: opacity 0.3s;
  }
  .step-card:hover { transform: translateY(-8px); border-color: rgba(34,197,94,0.3); }
  .step-card:hover::before { opacity: 1; }
  .step-num {
    font-family: 'Playfair Display', serif;
    font-size: 72px; font-weight: 900;
    color: rgba(34,197,94,0.08);
    line-height: 1; margin-bottom: 8px;
  }
  .step-icon { font-size: 36px; margin-bottom: 20px; }
  .step-card h3 { font-size: 20px; font-weight: 700; margin-bottom: 12px; letter-spacing: -0.5px; }
  .step-card p { font-size: 15px; color: ${C.muted}; line-height: 1.7; }

  /* DIET CARDS */
  .diet-grid {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 20px; margin-top: 64px;
  }
  .diet-card {
    padding: 32px 24px;
    border-radius: 20px;
    background: rgba(10,30,18,0.7);
    border: 1px solid rgba(34,197,94,0.12);
    transition: all 0.4s cubic-bezier(0.34,1.56,0.64,1);
    cursor: pointer; text-align: center;
    position: relative; overflow: hidden;
  }
  .diet-card::after {
    content: '';
    position: absolute; bottom: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, ${C.green2}, ${C.lime});
    transform: scaleX(0); transition: transform 0.3s;
    transform-origin: left;
  }
  .diet-card:hover { transform: translateY(-12px) scale(1.02); border-color: rgba(34,197,94,0.35); box-shadow: 0 32px 64px rgba(0,0,0,0.5), 0 0 40px rgba(34,197,94,0.1); }
  .diet-card:hover::after { transform: scaleX(1); }
  .diet-emoji { font-size: 48px; margin-bottom: 16px; display: block; }
  .diet-card h3 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
  .diet-card p { font-size: 13px; color: ${C.muted}; line-height: 1.6; }
  .diet-tag {
    display: inline-block; margin-top: 16px;
    padding: 4px 12px; border-radius: 100px;
    font-size: 11px; font-weight: 600; letter-spacing: 1px;
    background: rgba(34,197,94,0.1);
    border: 1px solid rgba(34,197,94,0.2);
    color: ${C.green3};
  }

  /* TRACKER */
  .tracker-wrap {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 48px; align-items: center; margin-top: 64px;
  }
  .macro-bars { display: flex; flex-direction: column; gap: 20px; }
  .macro-row { display: flex; flex-direction: column; gap: 8px; }
  .macro-label { display: flex; justify-content: space-between; font-size: 14px; }
  .macro-name { font-weight: 600; }
  .macro-val { color: ${C.muted}; font-family: 'DM Mono', monospace; font-size: 13px; }
  .bar-bg { height: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 4px; transition: width 1.5s cubic-bezier(0.4,0,0.2,1); }

  .calorie-ring-wrap {
    display: flex; flex-direction: column; align-items: center; gap: 20px;
  }
  .ring-center {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
    text-align: center;
  }
  .ring-cal { font-family: 'Playfair Display', serif; font-size: 42px; font-weight: 900; color: ${C.lime}; line-height: 1; }
  .ring-sub { font-size: 12px; color: ${C.muted}; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }

  /* PROGRESS */
  .progress-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-top: 64px; }

  /* REWARDS */
  .rewards-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 64px; }
  .badge-card {
    padding: 32px;
    border-radius: 20px;
    background: rgba(10,30,18,0.7);
    border: 1px solid rgba(34,197,94,0.12);
    text-align: center;
    transition: all 0.4s cubic-bezier(0.34,1.56,0.64,1);
    cursor: default;
  }
  .badge-card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 32px 64px rgba(0,0,0,0.4), 0 0 60px rgba(34,197,94,0.15); border-color: rgba(34,197,94,0.3); }
  .badge-icon { font-size: 56px; margin-bottom: 16px; display: block; animation: badgePulse 2s ease-in-out infinite; }
  @keyframes badgePulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.1) rotate(5deg); } }
  .badge-card h3 { font-size: 17px; font-weight: 700; margin-bottom: 8px; }
  .badge-card p { font-size: 13px; color: ${C.muted}; }
  .badge-progress-bar { margin-top: 16px; height: 4px; background: rgba(255,255,255,0.05); border-radius: 2px; overflow: hidden; }
  .badge-fill { height: 100%; background: linear-gradient(90deg, ${C.green2}, ${C.lime}); border-radius: 2px; }

  /* CTA */
  .cta-section {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center; text-align: center;
    background: radial-gradient(ellipse 60% 80% at 50% 50%, rgba(22,163,74,0.1) 0%, transparent 70%);
  }

  /* DASHBOARD PREVIEW */
  .dash-preview {
    display: grid; grid-template-columns: 200px 1fr; gap: 0;
    border-radius: 20px; overflow: hidden;
    border: 1px solid rgba(34,197,94,0.15);
    height: 500px; margin-top: 64px;
    box-shadow: 0 40px 100px rgba(0,0,0,0.6);
  }
  .dash-sidebar {
    background: rgba(5,15,8,0.95);
    border-right: 1px solid rgba(34,197,94,0.1);
    padding: 28px 20px;
  }
  .dash-sidebar-logo { font-family: 'Playfair Display',serif; font-size: 16px; color: ${C.green3}; margin-bottom: 32px; font-weight: 900; }
  .dash-nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; border-radius: 10px;
    font-size: 13px; margin-bottom: 4px; cursor: pointer;
    transition: all 0.2s; color: ${C.muted};
  }
  .dash-nav-item.active { background: rgba(34,197,94,0.12); color: ${C.green3}; }
  .dash-nav-item:hover:not(.active) { background: rgba(34,197,94,0.06); color: ${C.text}; }
  .dash-main { background: rgba(7,20,14,0.9); padding: 28px; overflow: hidden; }
  .dash-cards { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; margin-bottom: 14px; }
  .dash-stat {
    background: rgba(10,30,18,0.8);
    border: 1px solid rgba(34,197,94,0.12);
    border-radius: 14px; padding: 18px;
  }
  .dash-stat-val { font-family: 'Playfair Display',serif; font-size: 28px; font-weight: 900; }
  .dash-stat-label { font-size: 12px; color: ${C.muted}; margin-top: 4px; }

  /* SCROLL REVEAL */
  .reveal { opacity: 0; transform: translateY(40px); transition: all 0.8s cubic-bezier(0.34,1.56,0.64,1); }
  .reveal.visible { opacity: 1; transform: translateY(0); }
  .reveal-delay-1 { transition-delay: 0.1s; }
  .reveal-delay-2 { transition-delay: 0.2s; }
  .reveal-delay-3 { transition-delay: 0.3s; }
  .reveal-delay-4 { transition-delay: 0.4s; }

  /* GRID BACKGROUND */
  .grid-bg {
    position: absolute; inset: 0;
    background-image: linear-gradient(rgba(34,197,94,0.03) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(34,197,94,0.03) 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none;
  }

  /* GLOW ORBS */
  .orb {
    position: absolute; border-radius: 50%;
    filter: blur(80px); pointer-events: none;
    animation: orbFloat 8s ease-in-out infinite;
  }
  @keyframes orbFloat { 0%,100% { transform: translate(0,0); } 50% { transform: translate(20px, -30px); } }

  /* TABS */
  .tabs { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
  .tab {
    padding: 8px 20px; border-radius: 100px;
    font-size: 13px; cursor: pointer; transition: all 0.2s;
    border: 1px solid rgba(34,197,94,0.15);
    color: ${C.muted}; background: transparent; font-family: 'DM Sans', sans-serif;
  }
  .tab.active { background: rgba(34,197,94,0.15); border-color: rgba(34,197,94,0.4); color: ${C.green3}; }
  .tab:hover:not(.active) { border-color: rgba(34,197,94,0.3); color: ${C.text}; }

  /* AUTH MODAL */
  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.8);
    backdrop-filter: blur(10px);
    z-index: 1000;
    display: flex; align-items: center; justify-content: center;
    animation: fadeIn 0.2s;
  }
  .modal-card {
    width: min(480px, 90vw);
    padding: 48px 40px;
    border-radius: 28px;
    background: rgba(8,22,14,0.95);
    border: 1px solid rgba(34,197,94,0.2);
    box-shadow: 0 40px 100px rgba(0,0,0,0.8);
    position: relative;
    animation: modalSlide 0.4s cubic-bezier(0.34,1.56,0.64,1);
  }
  @keyframes modalSlide { from { opacity: 0; transform: translateY(30px) scale(0.95); } to { opacity: 1; transform: none; } }

  .input-wrap {
    position: relative; margin-bottom: 20px;
  }
  .input-wrap input, .input-wrap select {
    width: 100%; padding: 18px 16px 8px;
    background: rgba(10,30,18,0.6);
    border: 1px solid rgba(34,197,94,0.15);
    border-radius: 12px; color: ${C.text};
    font-family: 'DM Sans', sans-serif; font-size: 15px;
    outline: none; transition: border-color 0.2s;
    appearance: none; -webkit-appearance: none;
  }
  .input-wrap select {
    padding-top: 22px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2322c55e' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 16px center;
    padding-right: 40px;
  }
  .input-wrap input:focus, .input-wrap select:focus { border-color: ${C.green3}; }
  .input-wrap label {
    position: absolute; top: 14px; left: 16px;
    font-size: 13px; color: ${C.muted};
    transition: all 0.2s; pointer-events: none;
  }
  .input-wrap input:focus ~ label,
  .input-wrap input:not(:placeholder-shown) ~ label {
    top: 6px; font-size: 10px; letter-spacing: 0.5px; color: ${C.green3};
  }
  /* Keep select labels always in up position */
  .input-wrap select ~ label {
    top: 6px; font-size: 10px; letter-spacing: 0.5px; color: ${C.muted};
  }
  .input-wrap select:focus ~ label {
    color: ${C.green3};
  }
  .input-wrap select option { background: #0a1a10; }
  .modal-close {
    position: absolute; top: 20px; right: 20px;
    background: rgba(34,197,94,0.1); border: none;
    color: ${C.muted}; width: 32px; height: 32px; border-radius: 50%;
    cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
  }
  .modal-close:hover { background: rgba(34,197,94,0.2); color: ${C.text}; }

  /* FOOTER */
  footer {
    padding: 60px 48px 40px;
    border-top: 1px solid rgba(34,197,94,0.1);
  }
  .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 48px; }
  .footer-col h4 { font-size: 14px; font-weight: 700; margin-bottom: 16px; color: ${C.text}; }
  .footer-col p, .footer-col a {
    font-size: 14px; color: ${C.muted}; display: block;
    margin-bottom: 8px; text-decoration: none; line-height: 1.6;
    transition: color 0.2s;
  }
  .footer-col a:hover { color: ${C.green3}; }
  .footer-bottom { display: flex; justify-content: space-between; align-items: center; padding-top: 24px; border-top: 1px solid rgba(34,197,94,0.06); }
  .footer-bottom p { font-size: 13px; color: ${C.muted}; }

  /* STATS STRIP */
  .stats-strip { display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; background: rgba(34,197,94,0.08); border-radius: 20px; overflow: hidden; margin-top: 80px; }
  .stat-item { padding: 40px; background: rgba(5,15,8,1); text-align: center; }
  .stat-val { font-family: 'Playfair Display',serif; font-size: 48px; font-weight: 900; background: linear-gradient(135deg, ${C.green3}, ${C.lime}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .stat-label { font-size: 13px; color: ${C.muted}; margin-top: 8px; letter-spacing: 0.3px; }

  /* GRAPH MOCKUP */
  .graph-bars { display: flex; align-items: flex-end; gap: 8px; height: 120px; }
  .graph-bar {
    flex: 1; border-radius: 6px 6px 0 0;
    background: linear-gradient(180deg, ${C.green3}, ${C.green1});
    transition: height 1s ease-out;
    min-width: 12px;
  }
  .graph-bar.active { background: linear-gradient(180deg, ${C.lime}, ${C.green2}); }

  /* TESTIMONIALS */
  .testimonial-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; margin-top: 64px; }
  .testimonial-card {
    padding: 32px;
    background: rgba(10,30,18,0.7);
    border: 1px solid rgba(34,197,94,0.12);
    border-radius: 20px;
    transition: all 0.3s;
  }
  .testimonial-card:hover { transform: translateY(-6px); border-color: rgba(34,197,94,0.25); }
  .t-stars { color: ${C.lime}; font-size: 16px; margin-bottom: 16px; letter-spacing: 2px; }
  .t-text { font-size: 15px; line-height: 1.7; color: rgba(232,245,238,0.85); margin-bottom: 20px; font-style: italic; }
  .t-author { display: flex; align-items: center; gap: 12px; }
  .t-avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.2); }
  .t-name { font-size: 14px; font-weight: 600; }
  .t-role { font-size: 12px; color: ${C.muted}; }

  @media (max-width: 768px) {
    section { padding: 80px 24px; }
    nav { padding: 16px 24px; }
    .nav-links, .nav-cta { display: none; }
    .steps-grid, .diet-grid, .rewards-grid, .testimonial-grid { grid-template-columns: 1fr; }
    .tracker-wrap { grid-template-columns: 1fr; }
    .progress-grid { grid-template-columns: 1fr; }
    .stats-strip { grid-template-columns: repeat(2,1fr); }
    .footer-grid { grid-template-columns: 1fr 1fr; }
    .hero-h1 { letter-spacing: -2px; }
    .hero-btns { flex-direction: column; align-items: center; }
    .dash-preview { grid-template-columns: 1fr; height: auto; }
    .dash-sidebar { display: none; }
    .dash-cards { grid-template-columns: repeat(2,1fr); }
  }
`;

// ─── SVG RING CHART ──────────────────────────────────────────────────────────
function RingChart({ value = 1580, max = 2000 }) {
  const pct = value / max;
  const r = 70;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;
  return (
    <div style={{ position: "relative", width: 200, height: 200 }}>
      <svg width="200" height="200" viewBox="0 0 200 200" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="100" cy="100" r={r} fill="none" stroke="rgba(34,197,94,0.08)" strokeWidth="14" />
        <circle cx="100" cy="100" r={r} fill="none"
          stroke="url(#ringGrad)" strokeWidth="14"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1.5s cubic-bezier(0.4,0,0.2,1)" }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={C.green2} />
            <stop offset="100%" stopColor={C.lime} />
          </linearGradient>
        </defs>
      </svg>
      <div className="ring-center">
        <div className="ring-cal">{value.toLocaleString()}</div>
        <div className="ring-sub">kcal today</div>
      </div>
    </div>
  );
}

// ─── MINI SPARKLINE ──────────────────────────────────────────────────────────
function Sparkline({ data, color = C.green3 }) {
  const w = 300, h = 80;
  const min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min)) * h * 0.8 - h * 0.1;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill="url(#sparkGrad)" />
    </svg>
  );
}

// ─── LOADING SCREEN ──────────────────────────────────────────────────────────
function Loader({ onDone }) {
  const foods = [
    { e: "🥦", top: "55px", left: "40px", delay: "0.2s" },
    { e: "🥕", top: "55px", left: "95px", delay: "0.4s" },
    { e: "🍅", top: "55px", left: "145px", delay: "0.6s" },
    { e: "🫒", top: "110px", left: "52px", delay: "0.8s" },
    { e: "🫑", top: "110px", left: "130px", delay: "1s" },
    { e: "🥗", top: "95px", left: "85px", delay: "1.2s" },
  ];
  useEffect(() => {
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="loader">
      <div className="plate-container">
        <div className="plate" />
        {foods.map((f, i) => (
          <span key={i} className="food-item"
            style={{ top: f.top, left: f.left, animationDelay: f.delay, animationDuration: "0.5s" }}>
            {f.e}
          </span>
        ))}
      </div>
      <div className="loader-logo">SmartPlate</div>
      <div className="loader-sub">Preparing your experience…</div>
      <div className="loader-bar-wrap">
        <div className="loader-bar" />
      </div>
    </div>
  );
}

// ─── AUTH MODAL ──────────────────────────────────────────────────────────────
function AuthModal({ mode, onClose }) {
  const [tab, setTab] = useState(mode);
  const isLogin = tab === "login";
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
            {isLogin ? "Welcome back" : "Join SmartPlate"}
          </div>
          <div style={{ fontSize: 14, color: C.muted }}>
            {isLogin ? "Sign in to continue your health journey" : "Start your personalized diet journey today"}
          </div>
        </div>
        <div className="tabs" style={{ marginBottom: 28 }}>
          <button className={`tab ${tab === "login" ? "active" : ""}`} onClick={() => setTab("login")}>Sign In</button>
          <button className={`tab ${tab === "signup" ? "active" : ""}`} onClick={() => setTab("signup")}>Create Account</button>
        </div>
        {isLogin ? (
          <>
            <div className="input-wrap">
              <input type="email" placeholder=" " />
              <label>Email address</label>
            </div>
            <div className="input-wrap">
              <input type="password" placeholder=" " />
              <label>Password</label>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
              <div className="input-wrap">
                <input type="text" placeholder=" " />
                <label>Full name</label>
              </div>
              <div className="input-wrap">
                <input type="number" placeholder=" " />
                <label>Age</label>
              </div>
              <div className="input-wrap">
                <input type="number" placeholder=" " />
                <label>Height (cm)</label>
              </div>
              <div className="input-wrap">
                <input type="number" placeholder=" " />
                <label>Weight (kg)</label>
              </div>
            </div>
            <div className="input-wrap">
              <select defaultValue="">
                <option value="" disabled>Select goal</option>
                <option>Lose weight</option>
                <option>Gain muscle</option>
                <option>Maintain weight</option>
                <option>Improve health</option>
              </select>
              <label>Health Goal</label>
            </div>
            <div className="input-wrap">
              <select defaultValue="">
                <option value="" disabled>Select preference</option>
                <option>Vegetarian</option>
                <option>Non-Vegetarian</option>
                <option>Vegan</option>
                <option>Medical Diet</option>
              </select>
              <label>Diet Preference</label>
            </div>
          </>
        )}
        <button className="btn-primary" style={{ width: "100%", marginTop: 8 }}>
          {isLogin ? "Sign In →" : "Create My Diet Plan →"}
        </button>
        {isLogin && (
          <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: C.muted }}>
            Forgot password? <span style={{ color: C.green3, cursor: "pointer" }}>Reset it</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function SmartPlate() {
  const [loaded, setLoaded] = useState(false);
  const [loaderVisible, setLoaderVisible] = useState(true);
  const [navScrolled, setNavScrolled] = useState(false);
  const [modal, setModal] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const cursorRef = useRef(null);
  const followerRef = useRef(null);
  const revealRefs = useRef([]);

  // Cursor
  useEffect(() => {
    const move = (e) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${e.clientX - 6}px, ${e.clientY - 6}px)`;
      }
      if (followerRef.current) {
        followerRef.current.style.transform = `translate(${e.clientX - 18}px, ${e.clientY - 18}px)`;
      }
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  // Hover cursor effect
  useEffect(() => {
    const over = () => { cursorRef.current?.classList.add("hover"); followerRef.current?.classList.add("hover"); };
    const out = () => { cursorRef.current?.classList.remove("hover"); followerRef.current?.classList.remove("hover"); };
    document.querySelectorAll("button, a, .diet-card, .step-card, .badge-card, .testimonial-card, .tab").forEach(el => {
      el.addEventListener("mouseenter", over);
      el.addEventListener("mouseleave", out);
    });
  }, [loaded]);

  // Scroll nav
  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Reveal on scroll
  useEffect(() => {
    if (!loaded) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.15 }
    );
    document.querySelectorAll(".reveal").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [loaded]);

  // Auto-hide loader after animation completes
  useEffect(() => {
    const timer = setTimeout(() => {
      handleLoaderDone();
    }, 3000); // Wait for all animations to complete
    return () => clearTimeout(timer);
  }, []);

  const handleLoaderDone = () => {
    setLoaderVisible(false);
    setTimeout(() => setLoaded(true), 800);
  };

  const macros = [
    { name: "Protein", val: 142, max: 180, unit: "g", color: C.green3, pct: 79 },
    { name: "Carbohydrates", val: 210, max: 280, unit: "g", color: C.lime, pct: 75 },
    { name: "Fats", val: 58, max: 80, unit: "g", color: "#f59e0b", pct: 73 },
    { name: "Fiber", val: 28, max: 35, unit: "g", color: "#38bdf8", pct: 80 },
  ];

  const weekData = [65, 72, 68, 75, 80, 74, 82];
  const weightData = [78, 77.2, 76.8, 76.5, 75.9, 75.4, 74.8];

  const dietTypes = [
    { e: "🥗", name: "Vegetarian", desc: "Plant-based balanced meals rich in nutrients and fiber", tag: "Most Popular" },
    { e: "🍗", name: "Non-Vegetarian", desc: "High-protein diets with lean meats and optimal macros", tag: "Muscle Build" },
    { e: "🌱", name: "Vegan", desc: "100% plant-powered with complete amino acid profiles", tag: "Eco Friendly" },
    { e: "💊", name: "Medical Diet", desc: "Clinically designed for specific health conditions", tag: "Doctor Approved" },
  ];

  const badges = [
    { icon: "🔥", name: "7 Day Streak", desc: "You logged meals 7 days in a row!", pct: 100, color: "#ef4444" },
    { icon: "🥗", name: "SmartPlate Champion", desc: "Completed 30 days of your diet plan", pct: 80, color: C.green3 },
    { icon: "🎯", name: "Goal Getter", desc: "Reached your first milestone weight", pct: 65, color: C.lime },
    { icon: "💪", name: "Protein Pro", desc: "Hit protein goals 5 days in a row", pct: 90, color: "#a78bfa" },
    { icon: "🧘", name: "Mindful Eater", desc: "Logged every meal for a week", pct: 100, color: "#38bdf8" },
    { icon: "🍰", name: "Cheat Meal Earned", desc: "Reward unlocked — enjoy guilt-free!", pct: 100, color: "#f59e0b" },
  ];

  const testimonials = [
    { text: "SmartPlate transformed my relationship with food. Lost 12kg in 3 months and never felt deprived.", name: "Priya Sharma", role: "Lost 12kg in 3 months", avatar: "👩" },
    { text: "The AI diet plan is incredible. It adapts to my schedule and food preferences automatically.", name: "Arjun Mehta", role: "Gained 8kg muscle", avatar: "👨" },
    { text: "As a diabetic, the medical diet feature has been life-changing. My blood sugar is finally stable.", name: "Dr. Nisha Patel", role: "Managed Type 2 Diabetes", avatar: "👩‍⚕️" },
  ];

  const navItems = ["🏠 Dashboard", "🥗 Diet Plan", "📊 Tracker", "📈 Progress", "👤 Profile", "⚙️ Settings"];

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <style>{styles}</style>

      {/* Custom Cursor */}
      <div ref={cursorRef} className="cursor" />
      <div ref={followerRef} className="cursor-follower" />

      {/* Loader */}
      <div className={`loader ${!loaderVisible ? "hidden" : ""}`}>
        <div className="plate-container">
          <div className="plate" />
          {[
            { e: "🥦", top: "55px", left: "40px", delay: "0.2s" },
            { e: "🥕", top: "55px", left: "95px", delay: "0.4s" },
            { e: "🍅", top: "55px", left: "145px", delay: "0.6s" },
            { e: "🫒", top: "110px", left: "52px", delay: "0.8s" },
            { e: "🫑", top: "110px", left: "130px", delay: "1s" },
            { e: "🥗", top: "95px", left: "85px", delay: "1.2s" },
          ].map((f, i) => (
            <span key={i} className="food-item" style={{ top: f.top, left: f.left, animationDelay: f.delay }}>
              {f.e}
            </span>
          ))}
        </div>
        <div className="loader-logo">SmartPlate</div>
        <div className="loader-sub">Preparing your experience…</div>
        <div className="loader-bar-wrap"><div className="loader-bar" /></div>
      </div>

      {/* Auth Modal */}
      {modal && <AuthModal mode={modal} onClose={() => setModal(null)} />}

      {/* NAV */}
      <nav className={navScrolled ? "scrolled" : ""}>
        <div className="nav-logo">SmartPlate</div>
        <ul className="nav-links">
          {["How it works", "Diet Plans", "Tracking", "Rewards", "Pricing"].map(l => (
            <li key={l}><a href="#">{l}</a></li>
          ))}
        </ul>
        <button className="nav-cta" onClick={() => setModal("signup")}>Get Started Free</button>
      </nav>

      {/* ── HERO ── */}
      <section className="hero" style={{ paddingTop: 180, minHeight: "100vh" }}>
        <div className="grid-bg" />
        <div className="orb" style={{ width: 500, height: 500, background: "rgba(22,163,74,0.06)", top: "-100px", left: "-100px", animationDuration: "10s" }} />
        <div className="orb" style={{ width: 400, height: 400, background: "rgba(163,230,53,0.04)", bottom: "0", right: "-80px", animationDuration: "13s", animationDelay: "2s" }} />

        {[
          { e: "🥑", top: "20%", left: "8%", delay: "0s", size: "44px" },
          { e: "🫐", top: "30%", right: "10%", delay: "1s", size: "36px" },
          { e: "🥦", top: "65%", left: "6%", delay: "2s", size: "40px" },
          { e: "🍎", top: "70%", right: "8%", delay: "0.5s", size: "40px" },
          { e: "🥕", top: "15%", right: "15%", delay: "1.5s", size: "32px" },
          { e: "🌿", top: "80%", left: "15%", delay: "3s", size: "36px" },
        ].map((f, i) => (
          <span key={i} className="float-food" style={{ top: f.top, left: f.left, right: f.right, animationDelay: f.delay, fontSize: f.size }}>{f.e}</span>
        ))}

        <div className="hero-tag">
          <span style={{ width: 8, height: 8, background: C.lime, borderRadius: "50%", display: "inline-block", animation: "badgePulse 1.5s infinite" }} />
          AI-Powered Nutrition Intelligence
        </div>

        <h1 className="hero-h1">
          Eat Smart.<br />
          <span className="accent">Achieve</span> Your Goals.
        </h1>

        <p className="hero-sub">
          The most advanced diet management system — personalized to your body, goals, and lifestyle. Powered by AI.
        </p>

        <div className="hero-btns">
          <button className="btn-primary" onClick={() => setModal("signup")}>
            Start Your Journey →
          </button>
          <button className="btn-ghost" onClick={() => setModal("login")}>
            Sign In
          </button>
        </div>

        {/* Stats strip */}
        <div className="stats-strip reveal" style={{ maxWidth: 900, width: "100%" }}>
          {[
            { val: "2.4M+", label: "Active Users" },
            { val: "98%", label: "Goal Achievement" },
            { val: "500+", label: "Diet Plans" },
            { val: "4.9★", label: "App Rating" },
          ].map((s, i) => (
            <div key={i} className="stat-item">
              <div className="stat-val">{s.val}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: C.bg2 }}>
        <div className="grid-bg" />
        <div className="orb" style={{ width: 300, height: 300, background: "rgba(22,163,74,0.05)", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
        <div className="reveal">
          <div className="section-label">The Process</div>
          <h2 className="section-title">How SmartPlate <span style={{ color: C.green3 }}>Works</span></h2>
          <p style={{ color: C.muted, marginTop: 16, maxWidth: 500, fontSize: 17, lineHeight: 1.7 }}>
            Three intelligent steps to transform your nutrition and health.
          </p>
        </div>
        <div className="steps-grid">
          {[
            { num: "01", icon: "📋", title: "Input Your Health Data", desc: "Share your age, weight, height, goals and dietary preferences. Our AI analyzes 40+ health parameters to understand your unique needs.", tag: "2 min setup" },
            { num: "02", icon: "🧬", title: "Get Personalized Plan", desc: "Receive a scientifically-crafted diet plan tailored to your metabolism, goals, and food preferences. Updated weekly based on your progress.", tag: "Instant AI generation" },
            { num: "03", icon: "📈", title: "Track & Achieve Goals", desc: "Log meals, monitor macros, celebrate streaks, and watch your transformation unfold. Earn rewards as you hit milestones.", tag: "Daily insights" },
          ].map((s, i) => (
            <div key={i} className={`step-card reveal reveal-delay-${i + 1}`}>
              <div className="step-num">{s.num}</div>
              <div className="step-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <div style={{ marginTop: 20, display: "inline-block", padding: "4px 12px", borderRadius: 100, fontSize: 11, fontWeight: 600, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", color: C.green3, letterSpacing: 0.5 }}>
                {s.tag}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── DIET PLANS ── */}
      <section>
        <div className="grid-bg" />
        <div className="reveal">
          <div className="section-label">Personalization</div>
          <h2 className="section-title">Your Diet, <span style={{ color: C.green3 }}>Your Rules</span></h2>
          <p style={{ color: C.muted, marginTop: 16, maxWidth: 560, fontSize: 17, lineHeight: 1.7 }}>
            Four expertly curated diet frameworks, each adaptable to thousands of personal combinations.
          </p>
        </div>
        <div className="diet-grid">
          {dietTypes.map((d, i) => (
            <div key={i} className={`diet-card reveal reveal-delay-${i + 1}`}>
              <span className="diet-emoji">{d.e}</span>
              <h3>{d.name}</h3>
              <p>{d.desc}</p>
              <div className="diet-tag">{d.tag}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CALORIE TRACKER ── */}
      <section style={{ background: C.bg2 }}>
        <div className="grid-bg" />
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="reveal">
            <div className="section-label">Daily Tracking</div>
            <h2 className="section-title">Precision <span style={{ color: C.green3 }}>Nutrition</span> Tracking</h2>
          </div>
          <div className="tracker-wrap">
            <div>
              <div className="macro-bars">
                {macros.map((m, i) => (
                  <div key={i} className={`macro-row reveal reveal-delay-${i + 1}`}>
                    <div className="macro-label">
                      <span className="macro-name">{m.name}</span>
                      <span className="macro-val">{m.val}{m.unit} / {m.max}{m.unit}</span>
                    </div>
                    <div className="bar-bg">
                      <div className="bar-fill" style={{ width: `${m.pct}%`, background: `linear-gradient(90deg, ${m.color}88, ${m.color})` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 40, padding: "24px", background: "rgba(10,30,18,0.6)", borderRadius: 16, border: "1px solid rgba(34,197,94,0.1)" }} className="reveal">
                <div className="section-label" style={{ marginBottom: 12 }}>This Week's Calorie Trend</div>
                <Sparkline data={[1850, 1920, 1780, 1950, 1850, 1700, 1580]} color={C.green3} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: C.muted }}>
                  {["Mon","Tue","Wed","Thu","Fri","Sat","Today"].map(d => <span key={d}>{d}</span>)}
                </div>
              </div>
            </div>
            <div className="calorie-ring-wrap reveal">
              <RingChart value={1580} max={2000} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "100%" }}>
                {[
                  { label: "Remaining", val: "420 kcal", color: C.green3 },
                  { label: "Burned", val: "320 kcal", color: C.lime },
                  { label: "Meals logged", val: "3 / 5", color: "#38bdf8" },
                  { label: "Water intake", val: "1.8L / 3L", color: "#a78bfa" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "rgba(10,30,18,0.6)", border: "1px solid rgba(34,197,94,0.1)", borderRadius: 12, padding: "14px 16px" }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.val}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DASHBOARD PREVIEW ── */}
      <section>
        <div className="grid-bg" />
        <div className="reveal">
          <div className="section-label">Your Control Center</div>
          <h2 className="section-title">The <span style={{ color: C.green3 }}>Dashboard</span></h2>
          <p style={{ color: C.muted, marginTop: 16, maxWidth: 480, fontSize: 16, lineHeight: 1.7 }}>
            Everything you need to manage your health journey in one beautifully designed interface.
          </p>
        </div>
        <div className="dash-preview reveal">
          <div className="dash-sidebar">
            <div className="dash-sidebar-logo">SmartPlate</div>
            {navItems.map((item, i) => (
              <div key={i} className={`dash-nav-item ${i === activeTab ? "active" : ""}`} onClick={() => setActiveTab(i)}>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="dash-main">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 13, color: C.muted }}>Good morning,</div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 900 }}>Arjun 👋</div>
              </div>
              <div style={{ fontSize: 12, color: C.muted, fontFamily: "'DM Mono',monospace" }}>
                {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "short", day: "numeric" })}
              </div>
            </div>
            <div className="dash-cards">
              {[
                { val: "1,580", label: "Calories today", color: C.lime },
                { val: "78%", label: "Goal progress", color: C.green3 },
                { val: "7🔥", label: "Day streak", color: "#ef4444" },
              ].map((s, i) => (
                <div key={i} className="dash-stat">
                  <div className="dash-stat-val" style={{ color: s.color }}>{s.val}</div>
                  <div className="dash-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "rgba(10,30,18,0.6)", borderRadius: 14, padding: 20, border: "1px solid rgba(34,197,94,0.1)", marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>WEEKLY PROGRESS</div>
              <div className="graph-bars">
                {weekData.map((v, i) => (
                  <div key={i} className={`graph-bar ${i === 6 ? "active" : ""}`} style={{ height: `${v}%` }} />
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 10, color: C.muted }}>
                {["M","T","W","T","F","S","Su"].map((d, i) => <span key={i}>{d}</span>)}
              </div>
            </div>
            <div style={{ background: "rgba(10,30,18,0.6)", borderRadius: 14, padding: 16, border: "1px solid rgba(34,197,94,0.1)" }}>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>TODAY'S PLAN</div>
              {["🥗 Quinoa Bowl — 420 kcal", "🍌 Banana + Almonds — 280 kcal", "🍗 Grilled Chicken Salad — 520 kcal"].map((m, i) => (
                <div key={i} style={{ fontSize: 13, padding: "8px 0", borderBottom: i < 2 ? "1px solid rgba(34,197,94,0.06)" : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>{m}</span>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: i < 2 ? C.green3 : "rgba(34,197,94,0.2)", display: "inline-block" }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WEEKLY PROGRESS ── */}
      <section style={{ background: C.bg2 }}>
        <div className="grid-bg" />
        <div className="reveal">
          <div className="section-label">Results</div>
          <h2 className="section-title">Watch Your <span style={{ color: C.green3 }}>Progress</span> Unfold</h2>
        </div>
        <div className="progress-grid">
          <div style={{ background: "rgba(10,30,18,0.7)", border: "1px solid rgba(34,197,94,0.12)", borderRadius: 20, padding: 32 }} className="reveal reveal-delay-1">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 12, color: C.muted, letterSpacing: 1 }}>WEIGHT TREND</div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 900, marginTop: 4 }}>
                  74.8 <span style={{ fontSize: 18, color: C.muted }}>kg</span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: C.green3, fontWeight: 700, fontSize: 16 }}>−3.2 kg</div>
                <div style={{ fontSize: 12, color: C.muted }}>This month</div>
              </div>
            </div>
            <Sparkline data={weightData} color={C.lime} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: C.muted }}>
              {["W1","W2","W3","W4","W5","W6","Now"].map(d => <span key={d}>{d}</span>)}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { label: "Goal completion", val: 68, color: C.green3, icon: "🎯" },
              { label: "Diet adherence", val: 84, color: C.lime, icon: "✅" },
              { label: "Activity score", val: 72, color: "#38bdf8", icon: "⚡" },
            ].map((s, i) => (
              <div key={i} className={`reveal reveal-delay-${i + 2}`} style={{ background: "rgba(10,30,18,0.7)", border: "1px solid rgba(34,197,94,0.12)", borderRadius: 16, padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 20 }}>{s.icon}</span>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{s.label}</span>
                  </div>
                  <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 900, color: s.color }}>{s.val}%</span>
                </div>
                <div className="bar-bg" style={{ height: 6 }}>
                  <div className="bar-fill" style={{ width: `${s.val}%`, background: s.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REWARDS ── */}
      <section>
        <div className="grid-bg" />
        <div className="orb" style={{ width: 400, height: 400, background: "rgba(163,230,53,0.05)", bottom: 0, right: 0 }} />
        <div className="reveal">
          <div className="section-label">Gamification</div>
          <h2 className="section-title">Earn <span style={{ color: C.lime }}>Rewards</span> for Consistency</h2>
          <p style={{ color: C.muted, marginTop: 16, maxWidth: 500, fontSize: 17, lineHeight: 1.7 }}>
            Stay motivated with badges, streaks, and the ultimate reward — a guilt-free cheat meal.
          </p>
        </div>
        <div className="rewards-grid">
          {badges.map((b, i) => (
            <div key={i} className={`badge-card reveal reveal-delay-${(i % 3) + 1}`}>
              <span className="badge-icon">{b.icon}</span>
              <h3>{b.name}</h3>
              <p>{b.desc}</p>
              <div className="badge-progress-bar">
                <div className="badge-fill" style={{ width: `${b.pct}%`, background: `linear-gradient(90deg, ${b.color}66, ${b.color})` }} />
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>{b.pct}% complete</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ background: C.bg2 }}>
        <div className="grid-bg" />
        <div className="reveal">
          <div className="section-label">Community</div>
          <h2 className="section-title">Real People, <span style={{ color: C.green3 }}>Real Results</span></h2>
        </div>
        <div className="testimonial-grid">
          {testimonials.map((t, i) => (
            <div key={i} className={`testimonial-card reveal reveal-delay-${i + 1}`}>
              <div className="t-stars">★★★★★</div>
              <div className="t-text">"{t.text}"</div>
              <div className="t-author">
                <div className="t-avatar">{t.avatar}</div>
                <div>
                  <div className="t-name">{t.name}</div>
                  <div className="t-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="grid-bg" />
        <div className="orb" style={{ width: 600, height: 600, background: "rgba(22,163,74,0.08)", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
        <div className="reveal">
          <div style={{ fontSize: 72, marginBottom: 24 }}>🌿</div>
          <div className="section-label">Begin Today</div>
          <h2 className="section-title" style={{ maxWidth: 700, margin: "0 auto 28px" }}>
            Your Best Self is One <span style={{ color: C.green3 }}>Meal Away</span>
          </h2>
          <p style={{ color: C.muted, fontSize: 18, lineHeight: 1.7, maxWidth: 480, margin: "0 auto 48px" }}>
            Join 2.4 million people who've transformed their health with SmartPlate's intelligent nutrition system.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn-primary" style={{ fontSize: 17, padding: "18px 48px" }} onClick={() => setModal("signup")}>
              Start Your SmartPlate Journey →
            </button>
            <button className="btn-ghost" style={{ fontSize: 17, padding: "18px 36px" }}>
              Watch Demo
            </button>
          </div>
          <div style={{ marginTop: 32, fontSize: 13, color: C.muted }}>
            Free forever plan · No credit card required · Cancel anytime
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <div className="footer-grid">
          <div className="footer-col">
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 900, background: `linear-gradient(135deg, ${C.green3}, ${C.lime})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 16 }}>
              SmartPlate
            </div>
            <p>Intelligent diet management powered by AI. Helping 2.4M+ people eat smarter and live healthier.</p>
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              {["🐦 Twitter", "📸 Instagram", "💼 LinkedIn"].map(s => (
                <span key={s} style={{ fontSize: 12, color: C.muted, cursor: "pointer", padding: "6px 12px", border: "1px solid rgba(34,197,94,0.15)", borderRadius: 100 }}>{s}</span>
              ))}
            </div>
          </div>
          {[
            { title: "Product", links: ["Diet Plans", "Calorie Tracker", "Progress Dashboard", "Rewards", "Mobile App"] },
            { title: "Company", links: ["About Us", "Blog", "Careers", "Press"] },
            { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy"] },
          ].map((col, i) => (
            <div key={i} className="footer-col">
              <h4>{col.title}</h4>
              {col.links.map(l => <a key={l} href="#">{l}</a>)}
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <p>© 2026 SmartPlate. All rights reserved.</p>
          <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 12 }}>Made with 🌿 for a healthier world</p>
        </div>
      </footer>
    </div>
  );
}