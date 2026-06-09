const {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
} = require("node:fs");
const path = require("node:path");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const DEFAULT_OUTPUT = path.join(PROJECT_ROOT, "dist");
const EXCLUDED_ENTRIES = new Set([
  ".git",
  ".wrangler",
  "d1",
  "dist",
  "functions",
  "node_modules",
  "scripts",
  "tests",
]);

function copyEntry(source, destination) {
  cpSync(source, destination, {
    recursive: statSync(source).isDirectory(),
    force: true,
  });
}

function buildCloudflare({
  sourceRoot = PROJECT_ROOT,
  outputRoot = DEFAULT_OUTPUT,
} = {}) {
  const resolvedSource = path.resolve(sourceRoot);
  const resolvedOutput = path.resolve(outputRoot);

  if (resolvedOutput === resolvedSource) {
    throw new Error("Cloudflare build output cannot be the project root.");
  }

  mkdirSync(resolvedOutput, { recursive: true });

  for (const entry of readdirSync(resolvedSource)) {
    if (EXCLUDED_ENTRIES.has(entry)) continue;
    copyEntry(
      path.join(resolvedSource, entry),
      path.join(resolvedOutput, entry),
    );
  }

  const functionsSource = path.join(resolvedSource, "functions");
  if (!existsSync(functionsSource)) {
    throw new Error("Cloudflare Functions source directory is missing.");
  }

  // Copy the complete tree so nested shared modules remain available to Pages Functions.
  copyEntry(functionsSource, path.join(resolvedOutput, "functions"));

  const signalReader = path.join(
    resolvedOutput,
    "functions",
    "_lib",
    "internal-signal",
    "read-signal.js",
  );
  if (!existsSync(signalReader)) {
    throw new Error("Internal Signal shared modules were not copied into the build output.");
  }

  return resolvedOutput;
}

if (require.main === module) {
  const outputRoot = process.argv[2]
    ? path.resolve(process.cwd(), process.argv[2])
    : DEFAULT_OUTPUT;
  const output = buildCloudflare({ outputRoot });
  console.log(`Cloudflare build written to ${output}`);
}

module.exports = { buildCloudflare };
