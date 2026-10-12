import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { after, test } from "node:test";
import { Linter } from "eslint";

const require = createRequire(import.meta.url);
const pluginEntry = require.resolve("@next/eslint-plugin-next");
const { getRootDirs } = require(path.join(path.dirname(pluginEntry), "utils/get-root-dirs.js"));
const plugin = require("@next/eslint-plugin-next").default;
const fixture = mkdtempSync(path.join(os.tmpdir(), "stevo-lint-root-"));
const roots = [path.join(fixture, "one"), path.join(fixture, "two")];
for (const root of roots) {
  mkdirSync(path.join(root, "pages"), { recursive: true });
  writeFileSync(path.join(root, "pages/about.js"), "export default function About() { return null; }\n");
}
writeFileSync(path.join(fixture, "not-a-directory.txt"), "fixture\n");
mkdirSync(path.join(roots[0], "nested/pages"), { recursive: true });
writeFileSync(path.join(roots[0], "nested/pages/secret.js"), "export default () => null;\n");
after(() => {
  assert.equal(path.dirname(path.resolve(fixture)), path.resolve(os.tmpdir()));
  assert.ok(path.basename(fixture).startsWith("stevo-lint-root-"));
  rmSync(fixture, { recursive: true, force: true });
});
const normalize = (rows) => rows.map((x) => x.replaceAll("\\", "/")).sort();
const context = (rootDir) => ({ cwd: fixture, settings: { next: { rootDir } } });

test("default root preserves the existing cwd", () => {
  assert.deepEqual(getRootDirs({ cwd: fixture, settings: {} }), [fixture]);
});
test("literal and normalized Windows roots select the same directory", () => {
  for (const rootDir of [roots[0].replaceAll("\\", "/"), roots[0].replaceAll("/", "\\")]) {
    assert.deepEqual(normalize(getRootDirs(context(rootDir))), normalize([roots[0]]));
  }
});
test("wildcard and brace roots select directories and exclude files", () => {
  for (const pattern of [path.join(fixture, "*"), path.join(fixture, "{one,two}")]) {
    assert.deepEqual(normalize(getRootDirs(context(pattern))), normalize(roots));
  }
});
test("array roots preserve matches and missing roots remain empty", () => {
  assert.deepEqual(normalize(getRootDirs(context([roots[0], roots[1]]))), normalize(roots));
  assert.deepEqual(getRootDirs(context(path.join(fixture, "missing"))), []);
});

function lint(code, rootDir = path.join(fixture, "{one,two}")) {
  return new Linter().verify(code, {
    files: ["**/*.jsx"],
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
    plugins: { "@next/next": plugin },
    settings: { next: { rootDir } },
    rules: { "@next/next/no-html-link-for-pages": "error" },
  }, { filename: "page.jsx" });
}
test("explicit root settings still reject internal plain anchors", () => {
  const messages = lint('export default () => <a href="/about">About</a>;');
  assert.equal(messages.length, 1);
  assert.equal(messages[0].ruleId, "@next/next/no-html-link-for-pages");
});
test("explicit root settings accept the normal Next Link control", () => {
  assert.deepEqual(lint('import Link from "next/link"; export default () => <Link href="/about">About</Link>;'), []);
});
test("literal roots exclude routes belonging to a nested project", () => {
  assert.deepEqual(lint('export default () => <a href="/secret">Nested project</a>;', roots[0]), []);
});
