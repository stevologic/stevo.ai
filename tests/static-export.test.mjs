import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function exportedPage(path) {
  return readFile(new URL(`../out/${path}`, import.meta.url), "utf8");
}

test("exports the portfolio and professional profile", async () => {
  await Promise.all([
    access(new URL("../out/index.html", import.meta.url)),
    access(new URL("../out/resume/index.html", import.meta.url)),
    access(new URL("../out/CNAME", import.meta.url)),
    access(new URL("../out/og.png", import.meta.url)),
  ]);
});

test("portfolio contains the finished content and social metadata", async () => {
  const html = await exportedPage("index.html");

  assert.match(html, /Build what(?:&apos;|&#x27;|')s next\./i);
  assert.match(html, /Security leadership|Applied AI \+ Cybersecurity/i);
  assert.match(html, /Shiba Studio/);
  assert.match(html, /security-recipes\.ai/);
  assert.match(html, /Services/);
  assert.match(html, /https:\/\/stevo\.ai\/og\.png/);
  assert.doesNotMatch(html, /Your site is taking shape|codex-preview/i);
});

test("professional profile is honest and print-ready", async () => {
  const html = await exportedPage("resume/index.html");

  assert.match(html, /Professional profile/);
  assert.match(html, /Stephen M Abbott/);
  assert.match(html, /Full career r(?:é|&eacute;|&#xE9;)sum(?:é|&eacute;|&#xE9;) available on request/i);
  assert.match(html, /Print \/ save as PDF/);
  assert.doesNotMatch(html, /Chief Information Security Officer|CISO|university|certification/i);
});

test("custom domain is configured", async () => {
  const cname = await readFile(new URL("public/CNAME", root), "utf8");
  assert.equal(cname.trim(), "stevo.ai");
});
