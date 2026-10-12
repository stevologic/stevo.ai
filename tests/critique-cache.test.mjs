import assert from "node:assert/strict";
import { test } from "node:test";
import { contentHash } from "../scripts/critique-content-hash.mjs";

test("unchanged reviewed content and request settings reuse a critique", () => {
  assert.equal(contentHash("same", "prompt", { model: "existing" }), contentHash("same", "prompt", { model: "existing" }));
});
test("content, factual baseline, prompt or model changes invalidate the marker", () => {
  const base = contentHash("same", "prompt", { model: "existing" });
  assert.notEqual(base, contentHash("new factual baseline", "prompt", { model: "existing" }));
  assert.notEqual(base, contentHash("same", "changed prompt", { model: "existing" }));
  assert.notEqual(base, contentHash("same", "prompt", { model: "different" }));
});
