import { createHash } from "node:crypto";
import { appendFile, readFile } from "node:fs/promises";
import process from "node:process";
import { buildBrief } from "./site-critique.mjs";

// Include the actual model prompt and request settings, not just generated timestamps.
export function contentHash(brief, script, settings) {
  return createHash("sha256").update(JSON.stringify({ brief, script, settings })).digest("hex");
}

export async function critiqueHash(brief) {
  brief ??= await buildBrief();
  const script = await readFile(new URL("./site-critique.mjs", import.meta.url), "utf8");
  return contentHash(brief, script, {
    model: process.env.GROK_MODEL || "grok-4.5",
    reasoning: process.env.GROK_REASONING_EFFORT || "",
    maxTokens: process.env.GROK_MAX_TOKENS || "6000",
    autoUpgrade: process.env.GROK_MODEL_AUTO_UPGRADE === "true",
  });
}

if (process.argv[1]?.replace(/\\/g, "/").endsWith("/critique-content-hash.mjs")) {
  const hash = await critiqueHash();
  console.log(`Reviewed content hash: ${hash}`);
  if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `hash=${hash}\n`);
}
