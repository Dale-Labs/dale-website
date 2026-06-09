import assert from "node:assert/strict";
import { createRequire } from "node:module";
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const require = createRequire(import.meta.url);
const { buildCloudflare } = require("../scripts/build-cloudflare.js");

test("Cloudflare build recursively copies existing and nested function libraries", () => {
  const workspace = mkdtempSync(path.join(os.tmpdir(), "dale-cloudflare-build-"));
  const sourceRoot = path.join(workspace, "source");
  const outputRoot = path.join(workspace, "output");

  mkdirSync(path.join(sourceRoot, "functions", "_lib", "internal-signal"), {
    recursive: true,
  });
  mkdirSync(path.join(sourceRoot, "functions", "api", "internal"), {
    recursive: true,
  });
  writeFileSync(path.join(sourceRoot, "index.html"), "DALE");
  writeFileSync(path.join(sourceRoot, "functions", "_lib", "auth.js"), "export {};");
  writeFileSync(
    path.join(sourceRoot, "functions", "_lib", "internal-signal", "read-signal.js"),
    "export function readInternalSignal() {}",
  );
  writeFileSync(
    path.join(sourceRoot, "functions", "api", "internal", "_middleware.js"),
    "export function onRequest() {}",
  );
  writeFileSync(
    path.join(sourceRoot, "functions", "api", "internal", "signal.js"),
    "export function onRequestGet() {}",
  );

  mkdirSync(outputRoot, { recursive: true });
  writeFileSync(path.join(outputRoot, "stale-file.txt"), "stale");

  buildCloudflare({ sourceRoot, outputRoot });

  assert.equal(existsSync(path.join(outputRoot, "stale-file.txt")), false);
  assert.equal(
    existsSync(path.join(outputRoot, "functions", "_lib", "auth.js")),
    true,
  );
  assert.equal(
    existsSync(
      path.join(
        outputRoot,
        "functions",
        "_lib",
        "internal-signal",
        "read-signal.js",
      ),
    ),
    true,
  );
  assert.equal(
    existsSync(
      path.join(outputRoot, "functions", "api", "internal", "_middleware.js"),
    ),
    true,
  );
  assert.equal(
    existsSync(
      path.join(outputRoot, "functions", "api", "internal", "signal.js"),
    ),
    true,
  );
});
