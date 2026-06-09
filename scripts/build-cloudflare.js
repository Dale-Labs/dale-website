const {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
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

const REQUIRED_FUNCTION_FILES = [
  path.join("api", "internal", "_middleware.js"),
  path.join("api", "internal", "signal.js"),
  path.join("_lib", "internal-signal", "read-signal.js"),
];

function requireFunctionFiles(functionsRoot, phase) {
  for (const relativePath of REQUIRED_FUNCTION_FILES) {
    if (!existsSync(path.join(functionsRoot, relativePath))) {
      throw new Error(
        `Internal Signal ${relativePath} is missing from the ${phase}.`,
      );
    }
  }
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

  const sourceFromOutput = path.relative(resolvedOutput, resolvedSource);
  if (sourceFromOutput && !sourceFromOutput.startsWith("..") && !path.isAbsolute(sourceFromOutput)) {
    throw new Error("Cloudflare build output cannot contain the project source.");
  }

  const functionsSource = path.join(resolvedSource, "functions");
  if (!existsSync(functionsSource)) {
    throw new Error("Cloudflare Functions source directory is missing.");
  }
  requireFunctionFiles(functionsSource, "source tree");

  if (existsSync(resolvedOutput)) {
    rmSync(resolvedOutput, { recursive: true, force: true });
  }
  mkdirSync(resolvedOutput, { recursive: true });

  for (const entry of readdirSync(resolvedSource)) {
    if (EXCLUDED_ENTRIES.has(entry)) continue;
    copyEntry(
      path.join(resolvedSource, entry),
      path.join(resolvedOutput, entry),
    );
  }

  // Copy the complete tree so nested shared modules remain available to Pages Functions.
  const functionsOutput = path.join(resolvedOutput, "functions");
  copyEntry(functionsSource, functionsOutput);
  requireFunctionFiles(functionsOutput, "build output");

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
