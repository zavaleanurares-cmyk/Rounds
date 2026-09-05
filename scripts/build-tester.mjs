#!/usr/bin/env node
/**
 * Wraps the packed app in a phone, and writes one self-contained HTML file.
 *
 *   npx expo export --platform web
 *   node scripts/pack-app.mjs
 *   node scripts/build-tester.mjs   →  /tmp/rounds-tester.html
 *
 * Three things make this work rather than just look like it works:
 *
 *  · The app runs at the TOP LEVEL, not in an iframe. An iframe would be
 *    tidier, but its document has an opaque origin, and expo-router's
 *    `history.replaceState` throws there — navigation dies on the first tap.
 *  · `window.innerWidth/innerHeight` are shimmed to the phone's size before the
 *    bundle loads. React Native Web's `Dimensions` reads exactly those, and two
 *    screens (the venue map, the live-room map) project points across the
 *    window width — unshimmed they would draw for a desktop and be clipped to a
 *    phone.
 *  · `history.pushState/replaceState` keep the URL fixed. Left alone the app
 *    rewrites the address to `/welcome`, `/sign-in` and so on, and a reload on
 *    a static host then 404s.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const packed = readFileSync('/tmp/rounds-app.html', 'utf8');
const js = packed.match(/<script>([\s\S]*)<\/script>/)?.[1];
if (!js) {
  console.error('No inlined bundle in /tmp/rounds-app.html — run scripts/pack-app.mjs first.');
  process.exit(1);
}

const page = String.raw`<title>ROUNDS on device</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600&display=swap">
<style>
/*
  Single-theme on purpose. ROUNDS is a dark app — it has one visual world, built
  around an aurora on near-black — and a harness that went light in a light OS
  would misrepresent the thing it exists to show. Every colour is painted
  explicitly so the page holds on either host ground.

  The palette is the app's own, lifted from src/design/tokens.ts, so the chrome
  around the phone reads as part of ROUNDS rather than a generic device mock.
*/
:root {
  --canvas:    #06070B;
  --elevated:  #0E1017;
  --surface:   #151A24;
  --line:      rgba(255,255,255,0.09);
  --tint:      #7CB3FF;
  --tint-deep: #3B82F6;
  --live:      #30D158;
  --ink:       #EBEBF5;
  --ink-2:     rgba(235,235,245,0.60);
  --ink-3:     rgba(235,235,245,0.32);
  --rail: 292px;
  color-scheme: dark;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--canvas);
  color: var(--ink);
  font: 15px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  overflow: hidden;
  height: 100vh;
}

/* The label face is the app's own numeric face. */
.label {
  font-family: "Barlow Condensed", "Arial Narrow", sans-serif;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 13px;
  color: var(--ink-3);
}

/* ─────────────────────────────────────────────── the workbench */

#stage {
  position: fixed;
  inset: 0;
  display: grid;
  grid-template-columns: var(--rail) 1fr;
}

/*
  A phone on a bar table under neon. The app's own aurora, at a fraction of its
  strength, so the device sits in the product's light rather than on a grey
  backdrop.
*/
#table {
  position: relative;
  display: grid;
  place-items: center;
  overflow: hidden;
  background:
    radial-gradient(58vw 58vw at 22% 8%,  rgba(59,130,246,0.16), transparent 62%),
    radial-gradient(46vw 46vw at 88% 26%, rgba(139,92,246,0.13), transparent 60%),
    radial-gradient(40vw 40vw at 62% 96%, rgba(48,209,88,0.07),  transparent 58%),
    var(--canvas);
}

/* ─────────────────────────────────────────────── the device */

#device {
  position: relative;
  border-radius: var(--frame-radius);
  padding: var(--bezel);
  /* Titanium: a hard rim, a soft body, and a highlight down one edge. */
  background:
    linear-gradient(148deg, #6E7A88 0%, #2A3038 26%, #1A1E25 52%, #333A44 78%, #79838F 100%);
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.16),
    0 2px 3px rgba(0,0,0,0.5) inset,
    0 40px 90px -20px rgba(0,0,0,0.85),
    0 0 120px -30px rgba(59,130,246,0.45);
  transform: scale(var(--fit));
  transform-origin: center;
  transition: transform 180ms ease;
}

#screen {
  position: relative;
  width: var(--w);
  height: var(--h);
  border-radius: var(--screen-radius);
  overflow: hidden;
  background: var(--canvas);
}

/* The app itself. Absolutely positioned so its flex root fills the screen. */
#root {
  position: absolute;
  left: 0;
  right: 0;
  top: var(--status-h);
  bottom: var(--home-h);
  display: flex;
}

/* ── status bar ── */

#status {
  position: absolute;
  inset: 0 0 auto 0;
  height: var(--status-h);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 max(22px, calc(var(--w) * 0.07)) 0 max(26px, calc(var(--w) * 0.08));
  /* Painted in the app's canvas colour so the strip reads as part of the app. */
  background: linear-gradient(180deg, #0A0D14, var(--canvas));
  font-variant-numeric: tabular-nums;
  pointer-events: none;
  z-index: 3;
}
#clock { font-size: 15px; font-weight: 600; letter-spacing: 0.01em; padding-top: 3px; }
#status .glyphs { display: flex; align-items: center; gap: 5px; padding-top: 3px; }

/* ── Dynamic Island ── */

#island {
  position: absolute;
  top: 11px;
  left: 50%;
  transform: translateX(-50%);
  width: 122px;
  height: 35px;
  border-radius: 20px;
  background: #000;
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 11px;
}
/* The lens, which is the only thing that gives the island its scale. */
#island::after {
  content: "";
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: radial-gradient(circle at 32% 30%, #2C3E57, #05070C 70%);
  box-shadow: 0 0 0 1px rgba(255,255,255,0.07);
}

/* ── home indicator ── */

#home {
  position: absolute;
  inset: auto 0 0 0;
  height: var(--home-h);
  background: var(--canvas);
  display: grid;
  place-items: center;
  pointer-events: none;
  z-index: 3;
}
#home::after {
  content: "";
  width: 140px;
  height: 5px;
  border-radius: 3px;
  background: rgba(255,255,255,0.42);
}

/* ── the SE, which has neither ── */

body[data-device="se"] #island,
body[data-device="se"] #home::after { display: none; }
body[data-device="se"] #home {
  background: transparent;
}
/* Its home button lives in the bottom bezel, outside the screen. */
#homebutton {
  display: none;
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  width: 46px;
  height: 46px;
  border-radius: 50%;
  border: 1.5px solid rgba(255,255,255,0.22);
  background: linear-gradient(160deg, #2B313A, #14181E);
}
body[data-device="se"] #homebutton { display: block; }

/* ── side buttons ── */

.btn-side {
  position: absolute;
  background: linear-gradient(90deg, #4C5560, #262C34);
  border-radius: 2px;
}
.btn-side.power  { right: -3px; top: 21%; width: 3px; height: 12%; }
.btn-side.up     { left: -3px; top: 19%; width: 3px; height: 8%; }
.btn-side.down   { left: -3px; top: 29%; width: 3px; height: 8%; }
.btn-side.action { left: -3px; top: 12%; width: 3px; height: 4.5%; }
body[data-device="se"] .btn-side.action { display: none; }

/* ─────────────────────────────────────────────── the rail */

#rail {
  background: var(--elevated);
  border-right: 1px solid var(--line);
  padding: 24px 22px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  overflow-y: auto;
}

#brand { display: flex; flex-direction: column; gap: 3px; }
#brand .top { display: flex; align-items: center; gap: 9px; }
#brand h1 {
  margin: 0;
  font-family: "Barlow Condensed", "Arial Narrow", sans-serif;
  font-weight: 600;
  font-size: 30px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
#brand .dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--live);
  box-shadow: 0 0 10px var(--live);
  align-self: center;
}

.group { display: flex; flex-direction: column; gap: 10px; }

.choices { display: flex; flex-direction: column; gap: 6px; }

button {
  font: inherit;
  color: var(--ink);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 11px;
  padding: 10px 13px;
  text-align: left;
  cursor: pointer;
  transition: border-color 120ms ease, background 120ms ease;
}
button:hover { border-color: rgba(255,255,255,0.2); }
button:focus-visible { outline: 2px solid var(--tint); outline-offset: 2px; }

button[aria-pressed="true"] {
  border-color: var(--tint-deep);
  background: linear-gradient(180deg, rgba(59,130,246,0.22), rgba(59,130,246,0.10));
}

.choice { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; }
.choice > span:first-child { white-space: nowrap; }
.choice .dim {
  font-family: "Barlow Condensed", "Arial Narrow", sans-serif;
  font-variant-numeric: tabular-nums;
  color: var(--ink-3);
  font-size: 14px;
  letter-spacing: 0.04em;
}
button[aria-pressed="true"] .dim { color: var(--tint); }

.row { display: flex; gap: 6px; }
.row button { flex: 1; text-align: center; }

/* Notes: the part that stops somebody reporting a bug that isn't one. */
#notes {
  margin-top: auto;
  padding-top: 18px;
  border-top: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  gap: 9px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--ink-2);
}
#notes b { color: var(--ink); font-weight: 600; }
#notes p { margin: 0; }
#notes code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12.5px;
  color: var(--tint);
  background: rgba(124,179,255,0.10);
  border-radius: 4px;
  padding: 1px 5px;
}

/* ─────────────────────────────────────────────── full screen */

body.bare #rail,
body.bare #device::before { display: none; }
body.bare #stage { grid-template-columns: 1fr; }
body.bare #table { background: var(--canvas); }
body.bare #device {
  padding: 0;
  border-radius: 0;
  background: none;
  box-shadow: none;
  transform: none;
}
body.bare .btn-side, body.bare #homebutton { display: none; }
body.bare #screen {
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  border-radius: 0;
}
body.bare #status, body.bare #island { display: none; }
body.bare #home { height: env(safe-area-inset-bottom, 0px); }
body.bare #root { top: env(safe-area-inset-top, 0px); }

/* A way back out that does not need the rail. */
#exit {
  display: none;
  position: fixed;
  right: 12px;
  bottom: calc(env(safe-area-inset-bottom, 0px) + 12px);
  z-index: 40;
  border-radius: 999px;
  padding: 9px 15px;
  background: rgba(21,26,36,0.86);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}
body.bare #exit { display: block; }

/* On a real phone the rail has nowhere to go: the app takes the screen. */
@media (max-width: 900px) {
  #stage { grid-template-columns: 1fr; }
  #rail { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  #device { transition: none; }
}
</style>

<div id="stage">
  <aside id="rail">
    <div id="brand">
      <span class="top"><h1>Rounds</h1><span class="dot"></span></span>
      <span class="label">Running on this page, not a mock</span>
    </div>

    <div class="group">
      <span class="label">Device</span>
      <div class="choices" id="devices"></div>
    </div>

    <div class="group">
      <span class="label">State</span>
      <button id="demo" class="choice">
        <span>Load 14 weeks of history</span>
      </button>
      <div class="row">
        <button id="reload">Reload</button>
        <button id="reset">Wipe</button>
      </div>
      <button id="fullscreen">Use the whole screen</button>
    </div>

    <div id="notes">
      <p class="label" style="color:var(--ink-3)">Reading the results</p>
      <p><b>No backend is attached.</b> Everything runs on this device, which is
        how the app is built to work — the network is reconciliation, never a
        dependency.</p>
      <p><b>Signing in:</b> any email, then <code>any 6 digits</code>. There is
        no server to send a real code.</p>
      <p><b>Not testable here:</b> the map tiles, the QR scanner, push
        notifications and the Live Activity — all four need a native build. And
        <b>Export my data</b>, because a hosted page is not allowed to hand you
        a file.</p>
      <p><b>Wipe</b> clears everything and returns the app to the state a new
        install opens in.</p>
    </div>
  </aside>

  <main id="table">
    <div id="device">
      <span class="btn-side action"></span>
      <span class="btn-side up"></span>
      <span class="btn-side down"></span>
      <span class="btn-side power"></span>
      <div id="screen">
        <div id="status">
          <span id="clock">—</span>
          <span class="glyphs">
            <svg width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden="true">
              <rect x="0"  y="8"   width="3" height="4"  rx="1" fill="#fff"/>
              <rect x="5"  y="5.5" width="3" height="6.5" rx="1" fill="#fff"/>
              <rect x="10" y="3"   width="3" height="9"  rx="1" fill="#fff"/>
              <rect x="15" y="0.5" width="3" height="11.5" rx="1" fill="#fff" opacity="0.35"/>
            </svg>
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden="true">
              <path d="M8 10.4 5.9 8.2a3 3 0 0 1 4.2 0L8 10.4Z" fill="#fff"/>
              <path d="M3.6 5.9a6.3 6.3 0 0 1 8.8 0" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>
              <path d="M1.2 3.4a9.7 9.7 0 0 1 13.6 0" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>
            </svg>
            <svg width="26" height="13" viewBox="0 0 26 13" fill="none" aria-hidden="true">
              <rect x="0.6" y="0.6" width="21" height="11.8" rx="3.6" stroke="#fff" stroke-opacity="0.4" stroke-width="1.1"/>
              <rect x="2.2" y="2.2" width="15" height="8.6" rx="2.2" fill="#fff"/>
              <path d="M23.4 4.4v4.2a2.4 2.4 0 0 0 0-4.2Z" fill="#fff" fill-opacity="0.45"/>
            </svg>
          </span>
        </div>
        <div id="island"></div>
        <div id="root"></div>
        <div id="home"></div>
      </div>
      <div id="homebutton"></div>
    </div>
  </main>
</div>

<button id="exit">Show the frame</button>

<script>
/*
  Everything below runs BEFORE the app bundle, because the bundle reads
  window.innerWidth the moment it initialises React Native Web's Dimensions.
*/
(function () {
  'use strict';

  var DEVICES = [
    { id: 'se',    name: 'iPhone SE',        w: 375, h: 667, frame: 62, radius: 48, screen: 3,  status: 24, home: 0  },
    { id: '16',    name: 'iPhone 16',        w: 393, h: 852, frame: 12, radius: 58, screen: 47, status: 54, home: 34 },
    { id: '16pm',  name: 'iPhone 16 Pro Max', w: 440, h: 956, frame: 12, radius: 66, screen: 55, status: 56, home: 34 }
  ];

  var device = DEVICES[1];
  var bare = false;

  /* ── the two shims the app needs ── */

  var shimW = device.w, shimH = device.h - device.status - device.home;

  function defineSize(prop, get) {
    try {
      Object.defineProperty(window, prop, { configurable: true, get: get });
    } catch (e) {
      /* If the browser refuses, layout still works from the element's own size;
         only the two map projections would be off. Not worth failing over. */
    }
  }
  defineSize('innerWidth',  function () { return bare ? document.documentElement.clientWidth  : shimW; });
  defineSize('innerHeight', function () { return bare ? document.documentElement.clientHeight : shimH; });

  /*
    Freeze the address bar. expo-router rewrites it to /welcome, /sign-in and so
    on; on a static host a reload of one of those 404s, and this page is served
    from a path the router knows nothing about.
  */
  var push = history.pushState.bind(history);
  var replace = history.replaceState.bind(history);
  history.pushState = function (s) { try { push(s, '', location.href); } catch (e) {} };
  history.replaceState = function (s) { try { replace(s, '', location.href); } catch (e) {} };

  /* ── the frame ── */

  var root = document.documentElement;
  var body = document.body;

  function fit() {
    if (bare) { root.style.setProperty('--fit', '1'); return; }
    var railW = window.matchMedia('(max-width: 900px)').matches ? 0 : 292;
    var availW = document.documentElement.clientWidth - railW - 56;
    var availH = document.documentElement.clientHeight - 56;
    var full = device.w + device.frame * 2;
    var fullH = device.h + device.frame * 2;
    root.style.setProperty('--fit', String(Math.min(1, availW / full, availH / fullH)));
  }

  function apply() {
    shimW = device.w;
    shimH = device.h - device.status - device.home;
    body.dataset.device = device.id;
    root.style.setProperty('--w', device.w + 'px');
    root.style.setProperty('--h', device.h + 'px');
    root.style.setProperty('--bezel', device.frame + 'px');
    root.style.setProperty('--frame-radius', device.radius + 'px');
    root.style.setProperty('--screen-radius', device.screen + 'px');
    root.style.setProperty('--status-h', device.status + 'px');
    root.style.setProperty('--home-h', device.home + 'px');
    fit();
    /* React Native Web re-measures on resize, and only on resize. */
    window.dispatchEvent(new Event('resize'));
    document.querySelectorAll('#devices button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.id === device.id));
    });
  }

  var list = document.getElementById('devices');
  DEVICES.forEach(function (d) {
    var b = document.createElement('button');
    b.className = 'choice';
    b.dataset.id = d.id;
    b.innerHTML = '<span></span><span class="dim"></span>';
    b.firstChild.textContent = d.name;
    b.lastChild.textContent = d.w + '×' + d.h;
    b.onclick = function () { device = d; apply(); };
    list.appendChild(b);
  });

  function setBare(next) {
    bare = next;
    body.classList.toggle('bare', bare);
    document.getElementById('fullscreen').textContent =
      bare ? 'Back to the frame' : 'Use the whole screen';
    apply();
  }

  document.getElementById('fullscreen').onclick = function () { setBare(!bare); };
  document.getElementById('exit').onclick = function () { setBare(false); };
  document.getElementById('reload').onclick = function () { location.reload(); };

  /*
    The demo hook the app already has: it fills fourteen weeks of plausible
    history, and only ever when there are no real logs, so it cannot overwrite
    anything somebody entered.
  */
  document.getElementById('demo').onclick = function () {
    try { localStorage.setItem('rounds.wants-demo', JSON.stringify('1')); } catch (e) {}
    location.reload();
  };

  document.getElementById('reset').onclick = function () {
    try {
      Object.keys(localStorage)
        .filter(function (k) { return k.indexOf('rounds.') === 0; })
        .forEach(function (k) { localStorage.removeItem(k); });
    } catch (e) {}
    location.reload();
  };

  /* The clock is the detail that sells a device frame. Real time, real format. */
  function tick() {
    var d = new Date();
    document.getElementById('clock').textContent =
      d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M/i, '');
    setTimeout(tick, 20000);
  }
  tick();

  window.addEventListener('resize', fit);

  /* A phone inside a phone is silly: on a narrow screen, open bare. */
  apply();
  if (document.documentElement.clientWidth < 900) setBare(true);
})();
</script>

<script>APP_BUNDLE</script>
`;

const out = page.replace('APP_BUNDLE', () => js);
writeFileSync('/tmp/rounds-tester.html', out);
console.log(`built /tmp/rounds-tester.html (${(Buffer.byteLength(out) / 1048576).toFixed(1)} MB)`);
