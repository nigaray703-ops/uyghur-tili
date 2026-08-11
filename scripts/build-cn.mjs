import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(projectRoot, "site");
const outputRoot = path.join(projectRoot, "dist-cn");

const rootFiles = [
  "index.html",
  "app-config.js",
  "uly-transliteration.js",
  "unit-order.js",
  "course-data.js",
  "uyghur-keyboard.js",
  "latin-keyboard.js",
  "sentence-morphemes.js",
  "sentence-glossary.js",
  "progress-transfer.js",
  "audio-controller.js",
  "afanti-content.js",
  "feedback.js",
  "app.js",
  "styles.css",
  "manifest.webmanifest"
];

function ensureDirectory(directory) {
  fs.mkdirSync(directory, { recursive: true });
}

function copyFile(relativePath) {
  const source = path.join(sourceRoot, relativePath);
  const destination = path.join(outputRoot, relativePath);
  ensureDirectory(path.dirname(destination));
  fs.copyFileSync(source, destination);
}

function copyTree(relativeDirectory, includeFile = () => true) {
  const sourceDirectory = path.join(sourceRoot, relativeDirectory);
  for (const entry of fs.readdirSync(sourceDirectory, { withFileTypes: true })) {
    const relativePath = path.join(relativeDirectory, entry.name);
    if (entry.isDirectory()) {
      copyTree(relativePath, includeFile);
    } else if (entry.isFile() && includeFile(relativePath)) {
      copyFile(relativePath);
    }
  }
}

ensureDirectory(outputRoot);
rootFiles.forEach(copyFile);
copyTree("course-data", (relativePath) => relativePath.endsWith(".js"));
copyTree("i18n", (relativePath) => relativePath.endsWith(".js"));
copyFile("assets/logo.png");
copyFile("assets/icon-master.png");
copyFile("assets/apple-touch-icon.png");
copyFile("assets/icon-192.png");
copyFile("assets/icon-512.png");
copyFile("assets/favicon-32.png");
copyTree(
  "assets/fonts",
  (relativePath) => relativePath.endsWith(".woff2") || relativePath.endsWith(".txt")
);
copyTree(
  "assets/audio/human",
  (relativePath) =>
    relativePath.endsWith(".webm") &&
    !path.basename(relativePath).startsWith("human_reading_quote_")
);

if (!fs.existsSync(path.join(outputRoot, "index.html"))) {
  throw new Error("dist-cn/index.html was not generated");
}

const builtIndex = fs.readFileSync(path.join(outputRoot, "index.html"), "utf8");
const referencedAssets = [...builtIndex.matchAll(/(?:src|href)=["']\.\/([^"'?]+)(?:\?[^"']*)?["']/g)]
  .map((match) => match[1]);
const missingAssets = referencedAssets.filter(
  (relativePath) => !fs.existsSync(path.join(outputRoot, relativePath))
);
if (missingAssets.length > 0) {
  throw new Error(`dist-cn is missing referenced assets: ${missingAssets.join(", ")}`);
}

console.log(`Uyghur Tili CloudBase build created at ${outputRoot}`);
