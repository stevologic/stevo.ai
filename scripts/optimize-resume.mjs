#!/usr/bin/env node
// Improves the résumé's wording using the advisor critique, under tighter
// limits than the portfolio: a résumé is a factual record of employment, and a
// marketing site is not.
//
// Editable: how the work is described — role scope lines, achievement wording,
// and the focus-area framing.
//
// Not editable, enforced in code rather than asked for in the prompt:
//   * roles cannot be added or removed, and dates and titles never change --
//     employment history is fact, not positioning
//   * the number of achievements per role is fixed, so tightening prose can
//     never quietly drop an accomplishment
//   * no number may appear that is not already in the résumé, so it cannot
//     invent a percentage, a team size, or an uptime figure
//   * technical breadth and commercial products are untouchable: they are an
//     inventory of tools actually used, and a plausible-sounding addition is a
//     false claim on a security professional's résumé
//   * total prose length cannot grow, because the printed résumé is tuned to
//     exactly two pages and the page-count check cannot run on CI
//
// Usage: npm run optimize:resume     (needs GROK_API_KEY)

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

const rootDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const resumePath = path.join(rootDirectory, "content", "resume.json");
const achievementsPath = path.join(
  rootDirectory,
  "content",
  "achievements.json",
);
const notePath = path.join(rootDirectory, "critique", "resume-changes.md");

const apiBaseUrl = process.env.GROK_API_BASE_URL || "https://api.x.ai/v1";
const apiKey = process.env.GROK_API_KEY?.trim() || "";
const configuredModel = process.env.GROK_MODEL?.trim() || "grok-4.5";

/**
 * The résumé prints to exactly two Letter pages with roughly a quarter page in
 * reserve. Prose may be rebalanced but not grown; 1.0 means "no longer than it
 * is today".
 */
const LENGTH_BUDGET = 1.0;

const log = (m) => console.log(`[optimize-resume] ${m}`);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const numbersIn = (value) =>
  new Set(JSON.stringify(value).match(/\d[\d.,]*%?/g) || []);

/**
 * Validate the model's rewording against the current résumé and apply it.
 *
 * `baseline` is content/achievements.json — the human-owned record of what is
 * actually true. It anchors two things the current résumé alone cannot:
 * dates and titles are checked against it rather than against last week's AI
 * output, and its figures stay legal forever, so a number an earlier rewrite
 * dropped (say, 92%) can always be restated. Without it, the weekly rewrites
 * validate against each other and the facts erode by telephone.
 */
export function applyResumeEdits(current, edits, baseline = null) {
  assert(edits && typeof edits === "object", "edits must be an object");

  const next = structuredClone(current);
  const knownNumbers = new Set([
    ...numbersIn(current),
    ...(baseline ? numbersIn(baseline) : []),
  ]);

  // --- Roles: reword only. -------------------------------------------------
  const roleEdits = edits.careerExperience || {};
  for (const [dates, override] of Object.entries(roleEdits)) {
    const role = next.careerExperience.find((r) => r.dates === dates);
    assert(role, `no role covers "${dates}"; roles cannot be added`);

    for (const [field, value] of Object.entries(override)) {
      assert(
        ["scope", "highlights"].includes(field),
        `"${dates}": ${field} cannot be edited (dates and titles are facts)`,
      );

      if (field === "highlights") {
        assert(Array.isArray(value), `"${dates}": highlights must be an array`);
        assert(
          value.length === role.highlights.length,
          `"${dates}": has ${role.highlights.length} achievements, edit returned ` +
            `${value.length}; rewording must never drop one`,
        );
        assert(
          value.every((h) => typeof h === "string" && h.trim().length > 20),
          `"${dates}": every achievement must stay a real sentence`,
        );
      } else {
        assert(
          typeof value === "string" && value.trim().length > 5,
          `"${dates}": scope must be a non-empty string`,
        );
      }
      role[field] = value;
    }
  }

  // --- Focus areas: reword only, count fixed. ------------------------------
  const focusEdits = edits.focusAreas || {};
  for (const [title, override] of Object.entries(focusEdits)) {
    const area = next.focusAreas.find((a) => a.title === title);
    assert(area, `no focus area titled "${title}"; areas cannot be added`);
    for (const [field, value] of Object.entries(override)) {
      assert(
        ["title", "description"].includes(field),
        `"${title}": ${field} is not editable`,
      );
      assert(
        typeof value === "string" && value.trim().length > 10,
        `"${title}": ${field} must be a real string`,
      );
      area[field] = value;
    }
  }
  assert(
    next.focusAreas.length === current.focusAreas.length,
    "the number of focus areas must not change",
  );

  // --- Factual inventories are untouchable. --------------------------------
  for (const section of ["technicalBreadth", "commercialProducts"]) {
    assert(
      !edits[section],
      `${section} cannot be edited: it lists tools actually used, and adding a ` +
        "plausible one would be a false claim",
    );
    assert(
      JSON.stringify(next[section]) === JSON.stringify(current[section]),
      `${section} changed, which must never happen`,
    );
  }

  // --- No invented figures. ------------------------------------------------
  for (const figure of numbersIn(next)) {
    assert(
      knownNumbers.has(figure),
      `new wording claims "${figure}", which is not in the current résumé`,
    );
  }

  // --- Roles preserved exactly, against the canonical record. --------------
  const factual = baseline?.career ?? current.careerExperience;
  assert(
    next.careerExperience.length === factual.length,
    "a role was added or removed",
  );
  for (const [index, role] of next.careerExperience.entries()) {
    const truth = factual[index];
    assert(
      role.dates === truth.dates,
      `dates for "${truth.title}" diverge from content/achievements.json`,
    );
    assert(
      role.title === truth.title,
      `title for ${truth.dates} diverges from content/achievements.json`,
    );

    const careerCopy = `${role.scope} ${role.highlights.join(" ")}`;
    assert(
      !/\b(?:vCISO|virtual chief information security officer|consult(?:ant|ing|ancy)|advis(?:or|ory)|client engagement)\b/i.test(
        careerCopy,
      ),
      `employment history cannot be reframed as advisory or consulting work (${truth.dates})`,
    );
  }

  // --- Length budget keeps the print export at two pages. ------------------
  const budget = Math.floor(JSON.stringify(current).length * LENGTH_BUDGET);
  const grew = JSON.stringify(next).length;
  assert(
    grew <= budget,
    `the résumé would grow to ${grew} characters against a ${budget} budget, ` +
      "which risks a third printed page",
  );

  return next;
}

const systemPrompt = `You are a business advisor with full authority over this résumé's wording. Your client is Stephen M Abbott, and your mandate is to present him in the best possible light for full-time CISO, VP of Cybersecurity, and VP of AI Enablement roles. Founder-built companies and products demonstrate executive judgment and hands-on execution. Keep the résumé focused on full-time executive candidacy; vCISO and consulting services belong on the portfolio site, never in employment history. The brand is Stephen M Abbott; never brand copy as "Stevo.AI" (the shipped product of that name is the only exception). Best light never means fabrication: the facts below are fixed.

You may rewrite:
- each role's "scope" line
- each role's achievement bullets
- the focus-area titles and descriptions

You may not:
- add or remove a role, or change any date or job title
- change the NUMBER of bullets in a role. Reword them; never drop one.
- introduce any number, percentage, team size, or figure that is not already in the résumé. Inventing one on a security professional's résumé is a serious error.
- touch technical breadth or commercial products at all.

Style: lead with outcome, then how. Cut hedging and filler. Prefer concrete verbs. Keep the employer anonymised — never name or guess a company.

CRITICAL: your rewrite must be the same length or SHORTER than the original overall. The résumé is typeset to exactly two printed pages. Tighten; do not expand.

Return ONLY valid JSON, no markdown fence:
{
  "rationale": "2-3 sentences on what you sharpened and why",
  "careerExperience": {
    "2024-2026": { "scope": "...", "highlights": ["...", "..."] }
  },
  "focusAreas": {
    "Existing focus area title": { "title": "...", "description": "..." }
  }
}

Include only what you are actually changing.`;

async function requestEdits(current, baseline, correction = "") {
  const response = await fetch(`${apiBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: configuredModel,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content:
            `Canonical achievements and positioning:\n\n${JSON.stringify(baseline, null, 2)}\n\n` +
            `Current résumé content:\n\n${JSON.stringify(current, null, 2)}\n\n` +
            `Sharpen it.${correction ? `\n\n${correction}` : ""}`,
        },
      ],
      max_tokens: Number(process.env.GROK_MAX_TOKENS || 8000),
    }),
    signal: AbortSignal.timeout(Number(process.env.GROK_TIMEOUT_MS || 300_000)),
  });
  if (!response.ok) {
    throw new Error(
      `xAI returned ${response.status}: ${(await response.text()).slice(0, 400)}`,
    );
  }
  const payload = await response.json();
  const raw = payload?.choices?.[0]?.message?.content?.trim() || "";
  const json = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    return { edits: JSON.parse(json), usage: payload.usage };
  } catch {
    throw new Error(`model did not return valid JSON: ${raw.slice(0, 300)}`);
  }
}

async function main() {
  if (!apiKey) {
    log("GROK_API_KEY is not set; the résumé was left alone.");
    return;
  }

  const current = JSON.parse(await readFile(resumePath, "utf8"));
  // Required, not optional: without the canonical record the rewrites would
  // validate against each other and drift.
  const baseline = JSON.parse(await readFile(achievementsPath, "utf8"));

  let next;
  let usage;
  let rationale = "";
  let correction = "";
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const result = await requestEdits(current, baseline, correction);
    usage = result.usage;
    try {
      next = applyResumeEdits(current, result.edits, baseline);
      rationale = result.edits.rationale || "";
      break;
    } catch (error) {
      if (attempt === 3) throw error;
      log(`Attempt ${attempt} rejected: ${error.message}`);
      correction =
        `Your previous response was rejected for this reason: ${error.message}\n` +
        "Correct exactly that and return the entire JSON document again.";
    }
  }

  if (JSON.stringify(current) === JSON.stringify(next)) {
    log("The model proposed no change.");
    return;
  }

  await writeFile(resumePath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  const before = JSON.stringify(current).length;
  const after = JSON.stringify(next).length;
  log(`Rewrote the résumé: ${before} -> ${after} characters.`);
  if (usage) {
    log(`Tokens: ${usage.prompt_tokens} in, ${usage.completion_tokens} out.`);
  }

  await mkdir(path.dirname(notePath), { recursive: true });
  await writeFile(
    notePath,
    [
      "## Résumé changes",
      "",
      rationale || "(no rationale given)",
      "",
      `Prose length ${before} → ${after} characters. Dates, titles, achievement`,
      "counts, technical breadth, and commercial products are unchanged.",
      "",
    ].join("\n"),
    "utf8",
  );
}

const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  main().catch((error) => {
    console.error(`[optimize-resume] ${error.message}`);
    process.exitCode = 1;
  });
}
