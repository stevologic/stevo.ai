#!/usr/bin/env node
// Sends the site's copy and structure to Grok for a critique written from the
// perspective of a business advisor who sells vCISO, cybersecurity, and AI
// enablement work -- the buyer this site is written for.
//
// Reads the built export in out/ rather than the source components, so the
// critique covers what a visitor actually reads, in the order they read it.
//
// Usage: npm run critique          (needs GROK_API_KEY)
// Model: GROK_MODEL, default grok-4.5. See resolveModel() for auto-upgrade.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

const rootDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const exportDirectory = path.join(rootDirectory, "out");
const outputPath = path.join(rootDirectory, "critique", "site-critique.md");

const apiBaseUrl = process.env.GROK_API_BASE_URL || "https://api.x.ai/v1";
const apiKey = process.env.GROK_API_KEY?.trim() || "";

// Model IDs use a dot: grok-4.5 is valid, grok-4-5 is not. xAI treats the bare
// name as an auto-updating alias, so this default already tracks the current
// 4.5 snapshot without a pin.
const configuredModel = process.env.GROK_MODEL?.trim() || "grok-4.5";
const autoUpgrade = process.env.GROK_MODEL_AUTO_UPGRADE !== "false";
const reasoningEffort = process.env.GROK_REASONING_EFFORT?.trim() || "";
const maxTokens = Number(process.env.GROK_MAX_TOKENS || 6000);
const requestTimeoutMs = Number(process.env.GROK_TIMEOUT_MS || 300_000);

const isCi = process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true";

function log(message) {
  console.log(`[site-critique] ${message}`);
}

function warn(message) {
  if (isCi) console.log(`::warning title=Site critique::${message}`);
  console.warn(`[site-critique] ${message}`);
}

/* ------------------------------------------------------------------ *
 * Content extraction
 * ------------------------------------------------------------------ */

const entities = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#x27;": "'",
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
  "&middot;": "·",
  "&eacute;": "é",
  "&#xE9;": "é",
};

function decodeEntities(value) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(
      /&[a-z]+;/gi,
      (entity) => entities[entity.toLowerCase()] ?? entity,
    );
}

function textOf(html) {
  return decodeEntities(
    html
      // React leaves <!-- --> markers between interpolated values; they would
      // otherwise split words like "14<!-- -->d".
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Turn an exported page into an ordered outline: headings, prose, list items,
 * and link/button labels, in document order. Scripts and styles are dropped
 * first -- the Next.js flight payload is ~29KB of duplicated markup that would
 * dominate the prompt and tell the model nothing a reader sees.
 */
function outlinePage(html) {
  const body = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<svg[\s\S]*?<\/svg>/gi, "")
    // Stat tiles put the figure and its label in sibling elements, so walking
    // tags alone yields a bare "16" with no idea what it counts. Pair them
    // before the walk to keep each number attached to its meaning.
    .replace(
      /<strong[^>]*>([\s\S]*?)<\/strong>\s*<span[^>]*>([\s\S]*?)<\/span>/gi,
      (_, figure, label) => `<p>${textOf(figure)} — ${textOf(label)}</p>`,
    );

  const title = textOf(body.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "");
  const description = decodeEntities(
    body.match(
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i,
    )?.[1] || "",
  );

  const lines = [];
  let previous = "";
  const pattern =
    /<(h1|h2|h3|h4|p|li|blockquote|dt|dd|a|button|strong|small)\b[^>]*>([\s\S]*?)<\/\1>/gi;

  for (const match of body.matchAll(pattern)) {
    const tag = match[1].toLowerCase();
    const value = textOf(match[2]);
    if (!value || value.length < 2) continue;
    // Nested elements match twice (an <a> inside an <li>, a <strong> inside a
    // <p>); skip a value already carried by its parent.
    if (previous.includes(value)) continue;

    const prefix =
      { h1: "# ", h2: "## ", h3: "### ", h4: "#### ", li: "- ", dt: "- " }[tag] ??
      (tag === "a" || tag === "button" ? "[link/button] " : "");
    lines.push(`${prefix}${value}`);
    previous = value;
  }

  return { title, description, lines };
}

async function buildBrief() {
  const pages = [
    { label: "Home page (/)", file: "index.html" },
    { label: "Résumé page (/resume/)", file: "resume/index.html" },
  ];

  const sections = [];
  for (const page of pages) {
    const filePath = path.join(exportDirectory, page.file);
    let html;
    try {
      html = await readFile(filePath, "utf8");
    } catch {
      throw new Error(
        `${page.file} is missing from out/. Run "npm run build" first.`,
      );
    }
    const { title, description, lines } = outlinePage(html);
    sections.push(
      [
        `=== ${page.label} ===`,
        `Browser title: ${title}`,
        `Meta description: ${description}`,
        "",
        lines.join("\n"),
      ].join("\n"),
    );
  }

  // The canonical achievement record rides along so the critique can judge
  // which claims are backed by verified fact and which are asserted bare.
  let baseline = "";
  try {
    baseline = await readFile(
      path.join(rootDirectory, "content", "achievements.json"),
      "utf8",
    );
  } catch {
    // The critique still works without it; it just cannot cross-check claims.
  }

  return [
    sections.join("\n\n"),
    baseline
      ? `=== Verified achievement record (content/achievements.json, human-maintained ground truth; site claims should trace to this) ===\n${baseline}`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

/* ------------------------------------------------------------------ *
 * Model resolution
 * ------------------------------------------------------------------ */

// Non-text and deliberately weaker variants. A critique needs the strongest
// general reasoning model, not an image or a "non-reasoning" sibling.
const excludedModel =
  /imagine|image|video|audio|embed|tts|whisper|non-reasoning|mini|fast|lite|build/i;

/**
 * Pick the newest usable model.
 *
 * Ranking is by the API's `created` timestamp, never by parsing the version out
 * of the name. xAI ships both grok-4.20 and grok-4.5, and 4.5 is the newer of
 * the two despite 20 > 5 -- any component-wise version comparison silently
 * "upgrades" backwards to an older model. The timestamp is the only
 * authoritative signal.
 */
export function pickNewestModel(models, fallback) {
  const candidates = models
    .filter((model) => typeof model?.id === "string")
    .filter((model) => /^grok/i.test(model.id))
    .filter((model) => !excludedModel.test(model.id))
    .filter((model) => {
      // The xAI-specific endpoint reports modalities; require text output when
      // it does, and accept the model when it does not report them at all.
      const outputs = model.output_modalities || model.outputModalities;
      return !Array.isArray(outputs) || outputs.includes("text");
    })
    .filter((model) => Number.isFinite(Number(model.created)));

  if (candidates.length === 0) return fallback;

  candidates.sort((a, b) => Number(b.created) - Number(a.created));
  return candidates[0].id;
}

async function listModels() {
  // The xAI-specific endpoint carries modality metadata; the OpenAI-compatible
  // one is the fallback.
  for (const endpoint of ["/language-models", "/models"]) {
    try {
      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(30_000),
      });
      if (!response.ok) continue;
      const payload = await response.json();
      const models = payload?.data ?? payload?.models ?? payload;
      if (Array.isArray(models) && models.length > 0) return models;
    } catch {
      // Try the next endpoint; discovery is best-effort by design.
    }
  }
  return [];
}

async function resolveModel() {
  if (!autoUpgrade) {
    log(`Model: ${configuredModel} (auto-upgrade disabled).`);
    return configuredModel;
  }

  const models = await listModels();
  if (models.length === 0) {
    log(`Model: ${configuredModel} (model listing unavailable).`);
    return configuredModel;
  }

  const newest = pickNewestModel(models, configuredModel);
  if (newest === configuredModel) {
    log(`Model: ${configuredModel} (already the newest available).`);
  } else {
    log(`Model: ${newest} (auto-upgraded from ${configuredModel}).`);
  }
  return newest;
}

/* ------------------------------------------------------------------ *
 * Critique
 * ------------------------------------------------------------------ */

const systemPrompt = `You are a seasoned independent business advisor who has spent 20 years buying and selling professional services. You have sat on both sides of the table: as a Fortune 500 CISO who hired vCISOs, fractional security leaders, and AI enablement consultants, and as a principal who built and sold a boutique cybersecurity consultancy.

You are reviewing the marketing site of a solo practitioner who sells vCISO services, cybersecurity consulting, and AI enablement. Your job is to make this site win more qualified engagements.

Judge it the way an economic buyer would. Be direct and specific. Praise sparingly and only where earned; a critique that flatters is useless. Every criticism must name the exact text you are reacting to and offer a concrete rewrite or a specific structural change. Vague advice like "add more social proof" is a failure — say precisely what proof, in which section, and in what words.

Weigh these lenses:
1. Positioning and differentiation — is it obvious within 5 seconds what is sold, to whom, and why this person over a boutique firm or a Big 4 practice? Does it read as a commodity?
2. Credibility and proof — does the evidence justify the claims for a buyer signing a five- or six-figure engagement? What claim is asserted but unproven? Employer names are deliberately omitted for confidentiality; do not advise naming clients or employers, but do say how to convey scale credibly without naming them.
3. Verbiage — jargon, hedging, throat-clearing, abstraction, and consultant-speak. Quote weak lines and rewrite them. Flag anything that sounds AI-generated or generic.
4. Structure and information order — does the sequence match how a buyer actually decides? Is anything buried, redundant, or missing?
5. Conversion — is the call to action clear and low-friction? What objection is left unanswered at the moment of decision?
6. Risk — any claim that is legally, ethically, or professionally risky, overstated, or that a sophisticated buyer would read as a red flag.

Structure your response in GitHub-flavoured markdown exactly as:

## Verdict
Two or three sentences. Would you take a meeting based on this site? What is the single biggest thing costing engagements?

## Scorecard
A markdown table scoring Positioning, Credibility, Verbiage, Structure, and Conversion out of 10, each with a one-line justification.

## The five highest-leverage fixes
A numbered list, ordered by revenue impact. For each: what is wrong, the exact text at fault, and the specific replacement or change.

## Line edits
A markdown table with columns "Current", "Problem", "Suggested". At least six rows quoting real copy from the site.

## What is working
Brief. Only what genuinely helps close business.

## The buyer's unanswered question
The one question a serious buyer is left asking, and where on the page to answer it.

Do not preface your response with any commentary. Begin at "## Verdict".`;

function userPrompt(brief) {
  return `Here is the full readable content and structure of the site, extracted from the built export in document order. Headings are marked with #, list items with -, and interactive elements with [link/button].

Critique it.

${brief}`;
}

async function requestCritique(model, brief) {
  const body = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt(brief) },
    ],
    max_tokens: maxTokens,
  };
  if (reasoningEffort) body.reasoning_effort = reasoningEffort;

  const response = await fetch(`${apiBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(requestTimeoutMs),
  });

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 500);
    const error = new Error(`xAI returned ${response.status}: ${detail}`);
    error.status = response.status;
    error.detail = detail;
    throw error;
  }

  const payload = await response.json();
  const critique = payload?.choices?.[0]?.message?.content?.trim();
  if (!critique) throw new Error("xAI returned an empty critique.");

  return { critique, usage: payload.usage ?? null };
}

async function main() {
  if (!apiKey) {
    const message =
      "GROK_API_KEY is not set, so no critique was requested. Add it to the repository secrets.";
    warn(message);
    // Not a failure: a fork or a contributor without the secret should not see
    // a red build for an advisory job.
    return;
  }

  const brief = await buildBrief();
  log(`Prepared ${brief.split(/\s+/).length} words of site content.`);

  let model = await resolveModel();
  let result;
  try {
    result = await requestCritique(model, brief);
  } catch (error) {
    // An auto-upgraded model that the account cannot reach must not lose the
    // run; fall back to the configured model once.
    if (model !== configuredModel && (error.status === 404 || error.status === 403)) {
      warn(`${model} was unavailable (${error.status}); retrying with ${configuredModel}.`);
      model = configuredModel;
      result = await requestCritique(model, brief);
    } else {
      throw error;
    }
  }

  const generatedAt = new Date().toISOString();
  const report = [
    "# Site critique",
    "",
    `Generated ${generatedAt} by \`${model}\`.`,
    "",
    "> Advisory output from a language model, reviewing the site as a prospective",
    "> buyer of vCISO and AI enablement services. Treat it as a second opinion to",
    "> weigh, not instructions to apply.",
    "",
    "---",
    "",
    result.critique,
    "",
  ].join("\n");

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, report, "utf8");
  log(`Wrote ${path.relative(rootDirectory, outputPath)}.`);

  if (result.usage) {
    log(
      `Tokens: ${result.usage.prompt_tokens ?? "?"} in, ${result.usage.completion_tokens ?? "?"} out.`,
    );
  }

  if (process.env.GITHUB_STEP_SUMMARY) {
    await writeFile(process.env.GITHUB_STEP_SUMMARY, report, { flag: "a" });
  }
  if (process.env.GITHUB_OUTPUT) {
    await writeFile(process.env.GITHUB_OUTPUT, `model=${model}\n`, {
      flag: "a",
    });
  }
}

// Only run when executed directly, so the pure helpers stay unit-testable.
// pathToFileURL rather than string-building the URL: a hand-built "file://" +
// path yields file://C:/... on Windows where import.meta.url is file:///C:/...,
// which never matches and would silently turn this script into a no-op.
const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  main().catch((error) => {
    console.error(`[site-critique] ${error.message}`);
    process.exitCode = 1;
  });
}

export { outlinePage, buildBrief };
