import assert from "node:assert/strict";
import { test } from "node:test";
import { contentHash } from "../scripts/critique-content-hash.mjs";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { restoreMarker, artifactName } from "../scripts/critique-marker.mjs";

test("unchanged reviewed content and request settings reuse a critique", () => {
  assert.equal(contentHash("same", "prompt", { model: "existing" }), contentHash("same", "prompt", { model: "existing" }));
});
test("content, factual baseline, prompt or model changes invalidate the marker", () => {
  const base = contentHash("same", "prompt", { model: "existing" });
  assert.notEqual(base, contentHash("new factual baseline", "prompt", { model: "existing" }));
  assert.notEqual(base, contentHash("same", "changed prompt", { model: "existing" }));
  assert.notEqual(base, contentHash("same", "prompt", { model: "different" }));
});

test("an absent seven-day cache still skips the real critique after a 31-day interval", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "critique-monthly-"));
  const savedEnv = { key: process.env.GROK_API_KEY, skip: process.env.CRITIQUE_SKIP_UNCHANGED };
  const originalFetch = globalThis.fetch;
  let providerCalls = 0;
  try {
    process.env.GROK_API_KEY = "offline-regression-fixture";
    process.env.CRITIQUE_SKIP_UNCHANGED = "true";
    globalThis.fetch = async () => { providerCalls++; throw new Error("Provider must not be called"); };
    const { main } = await import("../scripts/site-critique.mjs?monthly-regression");
    const { critiqueHash } = await import("../scripts/critique-content-hash.mjs");
    const brief = "Unchanged monthly content and factual baseline";
    const hash = await critiqueHash(brief);
    const created = new Date("2026-09-01T09:12:00Z");
    const now = new Date("2026-10-02T09:12:00Z");
    assert.equal((now - created) / 86400000, 31);
    const command = async (_binary, args) => {
      if (args[0] === "run") {
        await mkdir(directory, { recursive: true });
        await writeFile(path.join(directory, "successful-hash"), hash + "\n");
        return { stdout: "" };
      }
      const endpoint = args[1];
      const value = endpoint.includes("/workflows/") ? { id: 42 } : endpoint.includes("/artifacts?") ? {
        total_count: 1, artifacts: [{ name: artifactName, expired: false, created_at: created.toISOString(),
          expires_at: new Date(+created + 90 * 86400000).toISOString(), workflow_run: { id: 7, head_branch: "main" } }],
      } : { id: 7, workflow_id: 42, head_branch: "main", status: "completed", conclusion: "success", event: "schedule" };
      return { stdout: JSON.stringify(value) };
    };
    assert.equal((await restoreMarker({ repository: "stevologic/stevo.ai", defaultBranch: "main", directory, command })).restored, true);
    await main({ brief, markerDirectory: directory });
    assert.equal(providerCalls, 0, "Restored month-old success must skip before model discovery or critique");
  } finally {
    globalThis.fetch = originalFetch;
    for (const [name, value] of [["GROK_API_KEY", savedEnv.key], ["CRITIQUE_SKIP_UNCHANGED", savedEnv.skip]]) {
      if (value === undefined) delete process.env[name]; else process.env[name] = value;
    }
    await rm(directory, { recursive: true, force: true });
  }
});

test("failed, PR-event, expired or foreign-workflow markers cannot suppress a critique", async () => {
  for (const override of [{ conclusion: "failure" }, { event: "pull_request" }, { workflow_id: 99 }]) {
    let downloads = 0;
    const command = async (_binary, args) => {
      if (args[0] === "run") { downloads++; throw new Error("Untrusted download"); }
      return { stdout: JSON.stringify(args[1].includes("/workflows/") ? { id: 42 } : args[1].includes("/artifacts?") ? {
        total_count: 2, artifacts: [
          { name: artifactName, expired: true, workflow_run: { id: 1, head_branch: "main" } },
          { name: artifactName, expired: false, workflow_run: { id: 7, head_branch: "main" } }],
      } : { id: 7, workflow_id: 42, head_branch: "main", status: "completed", conclusion: "success", event: "schedule", ...override }) };
    };
    assert.equal((await restoreMarker({ repository: "stevologic/stevo.ai", defaultBranch: "main", directory: "unused", command })).restored, false);
    assert.equal(downloads, 0);
  }
});

test("artifact read failures and incomplete inventory stop before provider work", async () => {
  await assert.rejects(restoreMarker({ repository: "stevologic/stevo.ai", defaultBranch: "main", directory: "unused",
    command: async () => { throw new Error("API unavailable"); } }), /API unavailable/);
  await assert.rejects(restoreMarker({ repository: "stevologic/stevo.ai", defaultBranch: "main", directory: "unused",
    command: async (_binary, args) => ({ stdout: JSON.stringify(args[1].includes("/workflows/") ? { id: 42 } : { total_count: 101, artifacts: [] }) }) }), /bounded page/);
});
