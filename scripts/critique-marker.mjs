import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const execute = promisify(execFile);
export const artifactName = "site-critique-success-marker";

// Artifacts retain a marker across monthly intervals; dependency caches expire
// after seven unused days. Only successful default-branch critique runs qualify.
export async function restoreMarker({ repository, defaultBranch, directory, command = execute }) {
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository) || !defaultBranch) {
    throw new Error("Verified repository/default branch is required");
  }
  const api = async (endpoint) => JSON.parse((await command("gh", ["api", `repos/${repository}/${endpoint}`],
    { encoding: "utf8", maxBuffer: 2_000_000 })).stdout);
  const workflow = await api("actions/workflows/site-critique.yml");
  const artifacts = await api(`actions/artifacts?name=${artifactName}&per_page=100`);
  for (const artifact of artifacts.artifacts) {
    if (artifact.name !== artifactName || artifact.expired || artifact.workflow_run?.head_branch !== defaultBranch) continue;
    const run = await api(`actions/runs/${artifact.workflow_run.id}`);
    if (run.workflow_id !== workflow.id || run.status !== "completed" || run.conclusion !== "success" ||
        run.head_branch !== defaultBranch || !["schedule", "workflow_dispatch"].includes(run.event)) continue;
    await mkdir(directory, { recursive: true });
    await command("gh", ["run", "download", String(run.id), "--repo", repository,
      "--name", artifactName, "--dir", directory], { encoding: "utf8" });
    const hash = (await readFile(path.join(directory, "successful-hash"), "utf8")).trim();
    if (!/^[a-f0-9]{64}$/.test(hash)) throw new Error("Invalid durable critique marker");
    return { restored: true, runId: run.id, hash };
  }
  // Incomplete inventories cannot establish that no successful marker exists.
  if (artifacts.total_count > artifacts.artifacts.length) throw new Error("Marker inventory exceeded bounded page; review before another provider call");
  return { restored: false };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await restoreMarker({ repository: process.env.GITHUB_REPOSITORY,
    defaultBranch: process.env.DEFAULT_BRANCH, directory: path.resolve(".critique-cache") });
  console.log(result.restored ? `Restored successful monthly critique marker from run ${result.runId}.` : "No durable successful marker yet.");
}
