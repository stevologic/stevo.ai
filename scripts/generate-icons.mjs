#!/usr/bin/env node
// Renders the site's brand mark -- an accent circle with an italic serif "S",
// the same mark used in the header and footer -- into every icon size, using
// headless Chrome so the glyph is rasterized by a real text engine.
//
// Usage: npm run icons
// Set CHROME_PATH to override browser discovery.

import { writeFile, mkdtemp, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PUBLIC_DIR = fileURLToPath(new URL("../public/", import.meta.url));
const DEBUG_PORT = 9351;

// Theme tokens from app/globals.css.
const INK = "#0f1014";
const ACCENT = "#b0aec2";

const CANDIDATES = [
  process.env.CHROME_PATH,
  process.env.PUPPETEER_EXECUTABLE_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean);

const chromePath = CANDIDATES.find((candidate) => existsSync(candidate));
if (!chromePath) {
  console.error("generate-icons - no Chrome or Edge found. Set CHROME_PATH.");
  process.exit(1);
}

/**
 * @param size      canvas size in px
 * @param circle    circle diameter as a fraction of the canvas
 * @param backdrop  square background colour, or null for transparency
 * @param glyph     glyph size as a fraction of the circle. Small icons need a
 *                  proportionally larger letter: an italic serif "S" has thin
 *                  diagonal strokes that vanish into anti-aliasing at 16px.
 */
function markPage(size, circle, backdrop, glyph = 0.66) {
  const diameter = Math.round(size * circle);
  const fontSize = diameter * glyph;
  return `<!doctype html><meta charset="utf-8"><style>
    html,body{margin:0;padding:0;width:${size}px;height:${size}px;
      background:${backdrop ?? "transparent"};}
    .wrap{width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;}
    .mark{width:${diameter}px;height:${diameter}px;border-radius:50%;
      background:${ACCENT};color:${INK};
      display:flex;align-items:center;justify-content:center;
      font-family:"Iowan Old Style",Baskerville,"Times New Roman",Times,serif;
      font-size:${fontSize}px;font-style:italic;font-weight:700;
      line-height:1;letter-spacing:0;}
    .mark span{transform:translateY(-${(fontSize * 0.045).toFixed(2)}px);}
  </style><div class="wrap"><div class="mark"><span>S</span></div></div>`;
}

// Small sizes go full bleed so the glyph gets every pixel. Larger sizes sit on
// an ink field; the 512 keeps the mark inside the maskable safe zone.
const TARGETS = [
  { file: "favicon-16x16.png", size: 16, circle: 1, backdrop: null, glyph: 0.92 },
  { file: "favicon-32x32.png", size: 32, circle: 1, backdrop: null, glyph: 0.82 },
  { file: "apple-touch-icon.png", size: 180, circle: 0.82, backdrop: INK, glyph: 0.66 },
  { file: "icon-192.png", size: 192, circle: 0.82, backdrop: INK, glyph: 0.66 },
  { file: "icon-512.png", size: 512, circle: 0.62, backdrop: INK, glyph: 0.66 },
];
const ICO_SIZES = [
  { size: 16, glyph: 0.92 },
  { size: 32, glyph: 0.82 },
  { size: 48, glyph: 0.78 },
];

const workDir = await mkdtemp(path.join(tmpdir(), "stevo-icons-"));
const chrome = spawn(
  chromePath,
  [
    "--headless=new", "--disable-gpu", "--no-sandbox", "--no-first-run",
    "--hide-scrollbars", "--force-device-scale-factor=1",
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${path.join(workDir, "profile")}`,
    "about:blank",
  ],
  { stdio: "ignore" },
);

async function devtoolsUrl() {
  for (let i = 0; i < 80; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
      return (await res.json()).webSocketDebuggerUrl;
    } catch {
      await new Promise((r) => setTimeout(r, 250));
    }
  }
  throw new Error("Chrome DevTools never became available");
}

const ws = new WebSocket(await devtoolsUrl());
await new Promise((resolve) => (ws.onopen = resolve));

let messageId = 0;
const pending = new Map();
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (!msg.id || !pending.has(msg.id)) return;
  const { resolve, reject } = pending.get(msg.id);
  pending.delete(msg.id);
  if (msg.error) reject(new Error(JSON.stringify(msg.error)));
  else resolve(msg.result);
};
const rpc = (method, params = {}, sessionId) =>
  new Promise((resolve, reject) => {
    const id = ++messageId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params, sessionId }));
  });

const { targetId } = await rpc("Target.createTarget", { url: "about:blank" });
const { sessionId } = await rpc("Target.attachToTarget", { targetId, flatten: true });
const call = (method, params) => rpc(method, params, sessionId);
await call("Page.enable");

async function shoot(size, circle, backdrop, glyph) {
  await call("Emulation.setDeviceMetricsOverride", {
    width: size, height: size, deviceScaleFactor: 1, mobile: false,
  });
  await call("Emulation.setDefaultBackgroundColorOverride", {
    color: { r: 0, g: 0, b: 0, a: 0 },
  });
  const html = markPage(size, circle, backdrop, glyph);
  await call("Page.navigate", {
    url: `data:text/html;charset=utf-8,${encodeURIComponent(html)}`,
  });
  await new Promise((r) => setTimeout(r, 260));
  const { data } = await call("Page.captureScreenshot", {
    format: "png",
    clip: { x: 0, y: 0, width: size, height: size, scale: 1 },
    captureBeyondViewport: true,
  });
  return Buffer.from(data, "base64");
}

const written = [];
for (const { file, size, circle, backdrop, glyph } of TARGETS) {
  const png = await shoot(size, circle, backdrop, glyph);
  await writeFile(path.join(PUBLIC_DIR, file), png);
  written.push(`${file} (${size}px, ${(png.length / 1024).toFixed(1)} KB)`);
}

// favicon.ico: PNG-encoded entries, supported by every current browser.
const icoImages = [];
for (const { size, glyph } of ICO_SIZES) {
  icoImages.push({ size, png: await shoot(size, 1, null, glyph) });
}

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(icoImages.length, 4);

let offset = 6 + icoImages.length * 16;
const entries = [];
for (const { size, png } of icoImages) {
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size >= 256 ? 0 : size, 0);
  entry.writeUInt8(size >= 256 ? 0 : size, 1);
  entry.writeUInt8(0, 2);
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(offset, 12);
  entries.push(entry);
  offset += png.length;
}

const ico = Buffer.concat([header, ...entries, ...icoImages.map((i) => i.png)]);
await writeFile(path.join(PUBLIC_DIR, "favicon.ico"), ico);
written.push(
  `favicon.ico (${ICO_SIZES.map((i) => i.size).join("/")}px, ${(ico.length / 1024).toFixed(1)} KB)`,
);

console.log("generate-icons - wrote:");
for (const line of written) console.log(`  ${line}`);

ws.close();
chrome.kill();
// Chrome releases its profile lock asynchronously; a failed cleanup of a temp
// directory must never fail the generation that already succeeded.
await new Promise((resolve) => setTimeout(resolve, 400));
await rm(workDir, { recursive: true, force: true }).catch(() => {});
process.exit(0);
