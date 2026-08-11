#!/usr/bin/env node
// Applies the advisor critique to the portfolio as real edits: reframes copy,
// recategorises, and reorders content/projects.json so enterprise-relevant
// proof leads and consumer or venture work follows it.
//
// The model returns structured edits against named fields, never a rewritten
// file. Everything is validated before it is written, and the invariants below
// are enforced in code rather than trusted to the prompt:
//
//   * no project is ever removed or hidden -- the new order must be an exact
//     permutation of the existing slugs
//   * repo, slug, siteUrl and sourceUrl are immutable; only framing changes
//   * a project may only be ADDED if discovery already found it on GitHub, and
//     its identity fields must match what GitHub reported
//   * any number in new copy must already appear in that project's own data,
//     so the model cannot invent a metric on a site that sells security work
//
// Usage: npm run optimize:portfolio     (needs GROK_API_KEY)

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

const rootDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const projectsPath = path.join(rootDirectory, "content", "projects.json");
const discoveredPath = path.join(
  rootDirectory,
  "data",
  "discovered.generated.json",
);
const rationalePath = path.join(rootDirectory, "critique", "portfolio-changes.md");

const apiBaseUrl = process.env.GROK_API_BASE_URL || "https://api.x.ai/v1";
const apiKey = process.env.GROK_API_KEY?.trim() || "";
const configuredModel = process.env.GROK_MODEL?.trim() || "grok-4.5";
const maxTokens = Number(process.env.GROK_MAX_TOKENS || 8000);

const CATEGORIES = ["Security", "AI systems", "Products & ventures"];
const IMMUTABLE = ["repo", "slug", "siteUrl", "sourceUrl"];
const EDITABLE = [
  "name",
  "category",
  "featured",
  "tagline",
  "description",
  "metrics",
  "tech",
  "capabilities",
  "statusLabel",
];

const log = (m) => console.log(`[optimize-portfolio] ${m}`);

/** Every number a project already claims, so new copy cannot invent one. */
function numbersIn(value) {
  return new Set(JSON.stringify(value).match(/\d[\d.,]*/g) || []);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

/**
 * Validate the model's edit set against the current portfolio and apply it.
 * Throws on any violation rather than writing a partially-trusted file.
 */
export function applyEdits(current, discovered, edits) {
  assert(edits && typeof edits === "object", "edits must be an object");
  assert(Array.isArray(edits.order), "edits.order must be an array");

  const bySlug = new Map(current.map((p) => [p.slug, p]));
  const discoveredBySlug = new Map((discovered || []).map((p) => [p.slug, p]));

  const currentSlugs = new Set(bySlug.keys());
  const orderSlugs = edits.order.map(String);
  assert(
    new Set(orderSlugs).size === orderSlugs.length,
    "edits.order contains duplicate slugs",
  );

  // Anything new must be a project discovery actually found on GitHub.
  const added = orderSlugs.filter((slug) => !currentSlugs.has(slug));
  for (const slug of added) {
    assert(
      discoveredBySlug.has(slug),
      `"${slug}" is not an existing or discovered project; refusing to invent one`,
    );
  }

  // The core guarantee: nothing may be dropped from the portfolio.
  const missing = [...currentSlugs].filter((slug) => !orderSlugs.includes(slug));
  assert(
    missing.length === 0,
    `refusing to remove ${missing.length} project(s): ${missing.join(", ")}`,
  );

  const overrides = edits.projects || {};
  for (const slug of Object.keys(overrides)) {
    assert(
      orderSlugs.includes(slug),
      `edits.projects has "${slug}", which is not in the order`,
    );
  }

  const result = [];
  for (const slug of orderSlugs) {
    const base = bySlug.get(slug) ?? {
      // Promoting a discovered project: keep GitHub's identity fields exactly.
      ...discoveredBySlug.get(slug),
      discovered: undefined,
    };
    const override = overrides[slug] || {};
    const next = { ...base };
    delete next.discovered;

    for (const [field, value] of Object.entries(override)) {
      assert(
        !IMMUTABLE.includes(field),
        `"${slug}": ${field} is immutable and cannot be edited`,
      );
      assert(
        EDITABLE.includes(field),
        `"${slug}": ${field} is not an editable field`,
      );

      if (field === "category") {
        assert(
          CATEGORIES.includes(value),
          `"${slug}": category "${value}" is not one of ${CATEGORIES.join(", ")}`,
        );
      } else if (field === "featured") {
        assert(typeof value === "boolean", `"${slug}": featured must be boolean`);
      } else if (["metrics", "tech", "capabilities"].includes(field)) {
        assert(
          Array.isArray(value) &&
            value.length > 0 &&
            value.every((v) => typeof v === "string" && v.trim()),
          `"${slug}": ${field} must be a non-empty array of strings`,
        );
      } else {
        assert(
          typeof value === "string" && value.trim().length > 2,
          `"${slug}": ${field} must be a non-empty string`,
        );
        assert(
          value.length <= 400,
          `"${slug}": ${field} is ${value.length} chars, over the 400 limit`,
        );
      }
      next[field] = value;
    }

    // Anti-hallucination: a number in new copy must already exist in this
    // project's own data. Stops invented scale claims on a security site.
    const known = numbersIn(base);
    for (const figure of numbersIn(
      Object.fromEntries(
        Object.entries(override).filter(([f]) => f !== "featured"),
      ),
    )) {
      assert(
        known.has(figure),
        `"${slug}": new copy claims "${figure}", which does not appear in the project's existing data`,
      );
    }

    for (const field of IMMUTABLE) {
      if (base[field] !== undefined) next[field] = base[field];
    }
    result.push(next);
  }

  assert(
    result.length >= current.length,
    "the portfolio shrank, which must never happen",
  );

  // Owner direction: employment is positioned as full-time. The separate
  // advisory lane may use vCISO, but portfolio copy must not recast a product
  // as an employment arrangement.
  assert(
    !/vciso/i.test(JSON.stringify(result)),
    "vCISO belongs to the advisory service, not the product portfolio",
  );
  const retiredEmploymentQualifier = ["frac", "tional"].join("");
  assert(
    !new RegExp(retiredEmploymentQualifier, "i").test(JSON.stringify(result)),
    "part-time employment qualifiers are retired and cannot appear in portfolio copy",
  );
  return result;
}

const systemPrompt = `You are a business advisor with full authority over how this site is framed. Your client is Stephen M Abbott. The site supports three distinct paths: full-time CISO, VP Cybersecurity, and VP AI Enablement opportunities; vCISO plus cybersecurity and IT consulting for the AI-native enterprise; and founder-built companies and products. Present him in the best possible light across all three without confusing permanent employment with advisory services. Never introduce part-time, interim, or on-demand employment qualifiers. The brand voice is Stephen M Abbott, never "Stevo.AI" — that name may appear only as the shipped product named Stevo.AI.

The portfolio must do two jobs at once: lead with enterprise-relevant security and AI evidence for executive hiring teams and advisory buyers, then present consumer and commerce products as proof of founder-level product strategy, engineering execution, automation, and market experimentation.

Your job is to REFRAME, RECATEGORISE and REORDER. You must not remove anything.

Hard rules:
- Return every project slug in "order". Omitting one is a failure. Nothing is ever deleted; lower-relevance work simply moves down.
- Lead with the work that proves enterprise security and AI capability. Consumer products and founder ventures follow as a distinct portfolio lane; never dismiss them as hobbies.
- Never invent a number. Only use figures already present in that project's data. Do not claim users, revenue, customers, or scale that is not given to you.
- Keep every tagline under 120 characters and every description under 400.
- Write for a buyer, not a developer. A tagline should say what the thing does and why it matters, not list technologies.
- "featured" should be true only for the strongest enterprise-relevant proof. Three at most.
- Do not change a project's name unless the current one is genuinely unclear.
- Only include a project in "projects" if you are actually changing it.
- "category" must be exactly one of: "Security", "AI systems", "Products & ventures".
  These are the site's filter buttons. Any other value is rejected.

Return ONLY valid JSON, no markdown fence, in exactly this shape:
{
  "rationale": "2-4 sentences on the ordering and framing decisions you made",
  "order": ["slug-in-new-display-order", "..."],
  "projects": {
    "slug": { "category": "...", "featured": true, "tagline": "...", "description": "...", "metrics": ["..."] }
  }
}`;

async function requestEdits(model, current, discovered, correction = "") {
  const body = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Current portfolio, in display order:\n\n${JSON.stringify(
          current,
          null,
          2,
        )}\n\nProjects discovery found on GitHub that are not yet curated (you may promote these into the order; keep their siteUrl and sourceUrl exactly):\n\n${JSON.stringify(
          discovered,
          null,
          2,
        )}\n\nReorganise the portfolio.${correction ? `\n\n${correction}` : ""}`,
      },
    ],
    max_tokens: maxTokens,
  };

  const response = await fetch(`${apiBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(Number(process.env.GROK_TIMEOUT_MS || 300_000)),
  });
  if (!response.ok) {
    throw new Error(
      `xAI returned ${response.status}: ${(await response.text()).slice(0, 400)}`,
    );
  }

  const payload = await response.json();
  const raw = payload?.choices?.[0]?.message?.content?.trim() || "";
  // Models often wrap JSON in a fence despite instructions.
  const json = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    return { edits: JSON.parse(json), usage: payload.usage };
  } catch {
    throw new Error(`model did not return valid JSON: ${raw.slice(0, 300)}`);
  }
}

async function main() {
  if (!apiKey) {
    log("GROK_API_KEY is not set; no portfolio changes were made.");
    return;
  }

  const current = JSON.parse(await readFile(projectsPath, "utf8"));
  const discovered = JSON.parse(
    await readFile(discoveredPath, "utf8").catch(() => '{"projects":[]}'),
  ).projects;

  // The model occasionally proposes an edit the validator refuses -- an
  // invented category, a dropped project. Feed the exact rejection back and let
  // it correct itself rather than failing a run that is otherwise fine.
  let next;
  let usage;
  let rationale = "";
  let correction = "";
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const result = await requestEdits(
      configuredModel,
      current,
      discovered,
      correction,
    );
    usage = result.usage;
    try {
      next = applyEdits(current, discovered, result.edits);
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

  const before = JSON.stringify(current);
  const after = JSON.stringify(next);
  if (before === after) {
    log("The model proposed no change.");
    return;
  }

  await writeFile(projectsPath, `${JSON.stringify(next, null, 2)}\n`, "utf8");

  const reordered = next
    .map((p, i) => {
      const was = current.findIndex((c) => c.slug === p.slug);
      return was !== i ? `${p.slug}: ${was === -1 ? "new" : was + 1} -> ${i + 1}` : null;
    })
    .filter(Boolean);

  log(`Applied changes to ${next.length} projects (was ${current.length}).`);
  if (reordered.length) log(`Reordered: ${reordered.join(", ")}`);
  if (usage) log(`Tokens: ${usage.prompt_tokens} in, ${usage.completion_tokens} out.`);

  // The rationale rides in the pull request body, so it must actually land.
  // This previously used a bare .catch() and silently wrote nothing when the
  // directory did not exist yet.
  await mkdir(path.dirname(rationalePath), { recursive: true });
  await writeFile(
    rationalePath,
    [
      "## Portfolio changes",
      "",
      rationale || "(no rationale given)",
      "",
      "### Order",
      "",
      ...next.map((p, i) => `${i + 1}. **${p.name}** — ${p.category}${p.featured ? " · featured" : ""}`),
      "",
    ].join("\n"),
    "utf8",
  );
}

const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  main().catch((error) => {
    console.error(`[optimize-portfolio] ${error.message}`);
    process.exitCode = 1;
  });
}
