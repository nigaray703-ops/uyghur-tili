import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

const projectRoot = new URL("..", import.meta.url);

function git(args) {
  return spawnSync("git", args, { cwd: projectRoot, encoding: "utf8" });
}

for (const relativePath of [
  "dist-cn/index.html",
  "dist-cn-initial-preview-20260808/index.html",
  "uyghur-tili-dist-cn.zip",
  "site/assets/audio/.DS_Store",
  "site/re-record-audio.html",
  "site/re-record-audio.js",
  "site/assets/audio/human/reading/human_reading_quote_example.webm",
  "site/assets/audio/human/alphabet/manifest.json",
  "docs/superpowers/specs/internal-release-plan.md"
]) {
  assert.equal(
    git(["check-ignore", "-q", relativePath]).status,
    0,
    `${relativePath} must be excluded by .gitignore`
  );
}

const trackedResult = git(["ls-files"]);
assert.equal(trackedResult.status, 0, trackedResult.stderr);
const trackedFiles = trackedResult.stdout.trim().split("\n").filter(Boolean);
const forbiddenTracked = trackedFiles.filter((relativePath) =>
  /(^|\/)(?:\.DS_Store|dist-cn(?:-initial-preview-20260808)?)(?:\/|$)|\.zip$|^docs\/superpowers\/|^site\/re-record-audio\.(?:html|js)$|^site\/assets\/audio\/human\/reading\/human_reading_quote_.*\.webm$|^site\/assets\/audio\/human\/[^/]+\/manifest\.json$/.test(relativePath)
);
assert.deepEqual(forbiddenTracked, [], `forbidden tracked files: ${forbiddenTracked.join(", ")}`);

console.log("repository boundary checks passed");
