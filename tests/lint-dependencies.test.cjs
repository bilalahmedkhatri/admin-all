const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { createRequire } = require("node:module");
const fs = require("node:fs");

test("Next lint resolves the scoped replacement and retains the default cwd root", () => {
 const entry = require.resolve("@next/eslint-plugin-next");
 const fromPlugin = createRequire(entry);
 const replacement = fromPlugin("fast-glob/package.json");
 assert.equal(replacement.name, "tinyglobby");
 assert.equal(replacement.version, "0.2.17");
 assert.equal(typeof fromPlugin("fast-glob").globSync, "function");
 const { getRootDirs } = require(path.join(path.dirname(entry), "utils/get-root-dirs.js"));
 assert.deepEqual(getRootDirs({ cwd: process.cwd(), settings: {} }), [process.cwd()]);
});

test("custom Next roots fail before using incompatible directory-glob defaults", async () => {
 const { assertDefaultNextRoot } = await import("../tooling/lint-root-guard.mjs");
 const normal = [{ settings: { next: {} } }];
 assert.equal(assertDefaultNextRoot(normal), normal);
 for (const rootDir of [".", "src/*", ["apps/*"], ""]) {
  assert.throws(() => assertDefaultNextRoot([{ settings: { next: { rootDir } } }]), /Custom settings.next.rootDir is unsupported/);
 }
});

test("real Next ESLint rules still report violations with the replacement installed", async () => {
 const { ESLint } = require("eslint");
 const eslint = new ESLint({ overrideConfig: [{ rules: { "@next/next/no-img-element": "error" } }] });
 const [result] = await eslint.lintText('export default function LintRegression(){ return <img src="/test.png" alt="Example" />; }', { filePath: "src/components/LintRegression.tsx" });
 assert.ok(result.messages.some(message => message.ruleId === "@next/next/no-img-element" && message.severity === 2));
});

test("lockfile retains no micromatch/braces dependency from the removed glob chain", () => {
 const lock = JSON.parse(fs.readFileSync(path.join(__dirname, "../package-lock.json"), "utf8"));
 const packages = Object.entries(lock.packages);
 assert.ok(!packages.some(([name, data]) => /(?:^|\/)node_modules\/(?:micromatch|braces)$/.test(name) || ["micromatch", "braces", "fast-glob"].includes(data.name)));
});
