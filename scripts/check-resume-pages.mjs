#!/usr/bin/env node
// Prints out/resume/ with real headless Chrome and fails if the PDF is not
// exactly two pages.
//
// Measuring the DOM in a browser viewport is NOT a substitute. Print layout
// differs in ways a screen measurement cannot see: `break-inside: avoid`
// relocates whole blocks, Chrome's default orphans/widows of 2 pushes trailing
// lines to the next page, and width media queries resolve against the page box
// rather than the window. This has silently regressed twice. Only the PDF is
// authoritative.
//
// Usage: npm run verify:pdf   (after npm run build)
// Set CHROME_PATH to override browser discovery. Exits 0 and skips if no
// browser is found, so the check never blocks a machine without Chrome.

import { createServer } from "node:http";
import { readFile, stat, mkdtemp, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { tmpdir } from "node:os";
import path from "node:path";

const execFileAsync = promisify(execFile);

const EXPECTED_PAGES = 2;
const ROOT = new URL("../out/", import.meta.url);
const OUT_DIR = path.normalize(ROOT.pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const PORT = 4187;

const CANDIDATES = [
  process.env.CHROME_PATH,
  process.env.PUPPETEER_EXECUTABLE_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean);

const chromePath = CANDIDATES.find((candidate) => existsSync(candidate));

if (!chromePath) {
  console.log(
    "verify:pdf - skipped, no Chrome or Edge found. Set CHROME_PATH to enable.",
  );
  process.exit(0);
}

if (!existsSync(path.join(OUT_DIR, "resume/index.html"))) {
  console.error("verify:pdf - out/resume/index.html is missing. Run npm run build first.");
  process.exit(1);
}

const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".txt": "text/plain",
  ".webmanifest": "application/manifest+json",
  ".woff2": "font/woff2",
};

const server = createServer(async (req, res) => {
  try {
    let file = path.join(OUT_DIR, decodeURIComponent(req.url.split("?")[0]));
    try {
      if ((await stat(file)).isDirectory()) file = path.join(file, "index.html");
    } catch {
      if (!path.extname(file)) file += ".html";
    }
    const body = await readFile(file);
    res.writeHead(200, {
      "content-type": MIME[path.extname(file)] || "application/octet-stream",
    });
    res.end(body);
  } catch {
    res.writeHead(404).end("not found");
  }
});

function countPages(pdf) {
  const text = pdf.toString("latin1");
  const counts = [...text.matchAll(/\/Type\s*\/Pages[\s\S]{0,600}?\/Count\s+(\d+)/g)].map(
    (match) => Number(match[1]),
  );
  if (counts.length) return Math.max(...counts);
  return (text.match(/\/Type\s*\/Page[^s]/g) || []).length;
}

const workDir = await mkdtemp(path.join(tmpdir(), "resume-pdf-"));
const pdfPath = path.join(workDir, "resume.pdf");

await new Promise((resolve) => server.listen(PORT, resolve));

let exitCode = 0;
try {
  await execFileAsync(
    chromePath,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--no-first-run",
      "--no-pdf-header-footer",
      "--run-all-compositor-stages-before-draw",
      "--virtual-time-budget=10000",
      `--user-data-dir=${path.join(workDir, "profile")}`,
      `--print-to-pdf=${pdfPath}`,
      `http://127.0.0.1:${PORT}/resume/`,
    ],
    { timeout: 120_000 },
  );

  const pages = countPages(await readFile(pdfPath));

  if (pages === EXPECTED_PAGES) {
    console.log(`verify:pdf - resume exports to ${pages} pages.`);
  } else {
    console.error(
      `verify:pdf - resume exports to ${pages} pages, expected ${EXPECTED_PAGES}.\n` +
        "Tighten the @media print block in app/globals.css, rebuild, and re-run.",
    );
    exitCode = 1;
  }
} catch (error) {
  console.error(`verify:pdf - failed to print the resume: ${error.message}`);
  exitCode = 1;
} finally {
  server.close();
  await rm(workDir, { recursive: true, force: true });
}

process.exit(exitCode);
