#!/usr/bin/env node
// Weekly marketing and lead brief for the cybersecurity and AI enablement
// practice. Grok proposes angles, outreach drafts, and meeting-prep notes.
// It never sends mail, never posts, never books a calendar, and never writes
// to the live site. A person decides what, if anything, to use.
//
// Usage: npm run growth          (needs GROK_API_KEY)
// Model: GROK_MODEL, default grok-4.5.

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { voiceLine } from "../lib/contact.ts";
import { practice } from "../lib/practice.ts";
import { servicePackages } from "../lib/services.ts";
import { buildBrief, pickNewestModel } from "./site-critique.mjs";

const rootDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const outputPath = path.join(rootDirectory, "critique", "growth-brief.md");

const apiBaseUrl = process.env.GROK_API_BASE_URL || "https://api.x.ai/v1";
const apiKey = process.env.GROK_API_KEY?.trim() || "";
const configuredModel = process.env.GROK_MODEL?.trim() || "grok-4.5";
const autoUpgrade = process.env.GROK_MODEL_AUTO_UPGRADE !== "false";
const maxTokens = Number(process.env.GROK_MAX_TOKENS || 5000);
const isCi = process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true";

function log(message) {
  console.log(`[practice-growth] ${message}`);
}

function warn(message) {
  if (isCi) console.log(`::warning title=Practice growth::${message}`);
  console.warn(`[practice-growth] ${message}`);
}

const systemPrompt = `You are the growth advisor for a cybersecurity and AI enablement consultancy led by ${practice.name}. The public site sells packages. Published contact is the stevo.ai line at ${voiceLine.display} and email. Do not describe a voice assistant. Background and portfolio stay on the site as proof.

Your job is to propose marketing, lead-generation, and meeting-prep work a human can act on later. You do not send messages, post publicly, book calendars, or change the site.

Hard rules:
- Do not invent prices, client names, case studies, or results.
- Do not invent a calendar booking URL.
- Do not recommend turning the homepage back into a job-seeking executive site.
- Do not name an employer or recommend an omission advert.
- Stay inside facts already present in the site brief and the package list.
- The brand is ${practice.name}, never "Stevo.AI" except as a shipped product or the domain.

Structure the response in GitHub-flavoured markdown exactly as:

## This week's focus
Two or three sentences. One audience, one package, one reason to call now.

## Lead angles
A numbered list of three specific outreach angles. Each names the buyer, the pain, the package, and the first sentence of a message.

## First-call talking points
What to ask on a first call, which package fits, and what proof from the site to have ready.

## Meeting prep
What to ask on a first call, and what proof from the site to have ready.

## Do not do
Anything that would overclaim, invent proof, name an employer, or restore voice-assistant marketing copy.

Do not preface your response with any commentary. Begin at "## This week's focus".`;

function packageBrief() {
  return servicePackages
    .map((servicePackage) => {
      return [
        `### ${servicePackage.title}`,
        `Cadence: ${servicePackage.cadence}`,
        servicePackage.description,
        `Best for: ${servicePackage.bestFor}`,
        ...servicePackage.includes.map((item) => `- ${item}`),
      ].join("\n");
    })
    .join("\n\n");
}

async function siteBrief() {
  try {
    return await buildBrief();
  } catch {
    return "(Built export not available; use the package list only.)";
  }
}

async function listModels() {
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
      // Discovery is best-effort.
    }
  }
  return [];
}

async function resolveModel() {
  if (!autoUpgrade) return configuredModel;
  const models = await listModels();
  if (models.length === 0) return configuredModel;
  return pickNewestModel(models, configuredModel);
}

async function requestBrief(model, siteCopy) {
  const response = await fetch(`${apiBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Practice: ${practice.headline}\nIntake: ${voiceLine.label} ${voiceLine.display}\n\nPackages:\n\n${packageBrief()}\n\nSite copy:\n\n${siteCopy}`,
        },
      ],
      max_tokens: maxTokens,
    }),
    signal: AbortSignal.timeout(Number(process.env.GROK_TIMEOUT_MS || 300_000)),
  });

  if (!response.ok) {
    throw new Error(
      `xAI returned ${response.status}: ${(await response.text()).slice(0, 500)}`,
    );
  }

  const payload = await response.json();
  const brief = payload?.choices?.[0]?.message?.content?.trim();
  if (!brief) throw new Error("xAI returned an empty growth brief.");
  return brief;
}

async function main() {
  if (!apiKey) {
    warn(
      "GROK_API_KEY is not set, so no growth brief was requested. Add it to the repository secrets.",
    );
    return;
  }

  const siteCopy = await siteBrief();
  let model = await resolveModel();
  log(`Model: ${model}.`);

  let brief;
  try {
    brief = await requestBrief(model, siteCopy);
  } catch (error) {
    if (model !== configuredModel && (error.message.includes("404") || error.message.includes("403"))) {
      warn(`${model} was unavailable; retrying with ${configuredModel}.`);
      model = configuredModel;
      brief = await requestBrief(model, siteCopy);
    } else {
      throw error;
    }
  }

  const report = [
    "# Practice growth brief",
    "",
    `Generated ${new Date().toISOString()} by \`${model}\`.`,
    "",
    "> Advisory output only. It does not send mail, post, book a meeting, or",
    "> change stevo.ai. Use it as a draft for later AI marketing and lead work.",
    "",
    "---",
    "",
    brief,
    "",
  ].join("\n");

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, report, "utf8");
  log(`Wrote ${path.relative(rootDirectory, outputPath)}.`);

  if (process.env.GITHUB_STEP_SUMMARY) {
    await writeFile(process.env.GITHUB_STEP_SUMMARY, report, { flag: "a" });
  }
}

const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  main().catch((error) => {
    console.error(`[practice-growth] ${error.message}`);
    process.exitCode = 1;
  });
}

export { packageBrief, systemPrompt };
