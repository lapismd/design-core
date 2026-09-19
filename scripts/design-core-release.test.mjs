import assert from "node:assert/strict";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const releaseScript = path.join(root, "scripts", "design-core-release.mjs");

function writeFakeNpm(binDir) {
  const fakeNpm = path.join(binDir, "npm");
  writeFileSync(
    fakeNpm,
    `#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const statePath = process.env.FAKE_NPM_STATE;
const version = process.env.FAKE_NPM_VERSION ?? "0.2.1";
const visibleAfter = Number(process.env.FAKE_NPM_VISIBLE_AFTER ?? "1");

function readState() {
  try {
    return JSON.parse(readFileSync(statePath, "utf8"));
  } catch {
    return {};
  }
}

function writeState(state) {
  writeFileSync(statePath, JSON.stringify(state));
}

if (args[0] === "view") {
  const state = readState();
  state.viewCalls = (state.viewCalls ?? 0) + 1;
  writeState(state);
  if (state.viewCalls < visibleAfter) {
    console.error("npm ERR! code E404");
    console.error("npm ERR! 404 Not Found - GET https://registry.npmjs.org/@lapismd%2fdesign-core");
    process.exit(1);
  }
  console.log(JSON.stringify([version]));
  process.exit(0);
}

if (args[0] === "init") {
  writeFileSync(path.join(process.cwd(), "package.json"), "{}\\n");
  process.exit(0);
}

if (args[0] === "install") {
  const spec = args.find((arg) => arg.startsWith("@lapismd/design-core@"));
  if (!spec) {
    console.error("missing design-core install spec");
    process.exit(1);
  }
  const installedVersion = spec.split("@").pop();
  const packageDir = path.join(process.cwd(), "node_modules", "@lapismd", "design-core");
  mkdirSync(packageDir, { recursive: true });
  writeFileSync(
    path.join(packageDir, "package.json"),
    JSON.stringify({ name: "@lapismd/design-core", version: installedVersion }),
  );
  process.exit(0);
}

if (args[0] === "audit" && args[1] === "signatures") {
  console.log(JSON.stringify({ ok: true, attestations: [] }));
  process.exit(0);
}

console.error(\`unexpected npm command: \${args.join(" ")}\`);
process.exit(1);
`,
  );
  chmodSync(fakeNpm, 0o755);
}

function writeManifest(dir, version = "0.2.1") {
  const manifestPath = path.join(dir, "release-manifest.json");
  writeFileSync(
    manifestPath,
    JSON.stringify({
      schemaVersion: 1,
      registry: "https://registry.npmjs.org",
      repository: "lapismd/design-core",
      bootstrapRequired: false,
      packages: [{ name: "@lapismd/design-core", version }],
    }),
  );
  return manifestPath;
}

function runVerify({ visibleAfter, attempts = 4 }) {
  const tmp = mkdtempSync(path.join(tmpdir(), "design-core-release-test-"));
  const binDir = path.join(tmp, "bin");
  mkdirSync(binDir);
  writeFakeNpm(binDir);
  const statePath = path.join(tmp, "state.json");
  const manifestPath = writeManifest(tmp);
  const auditPath = path.join(tmp, "npm-signatures.json");
  const result = spawnSync(
    process.execPath,
    [releaseScript, "verify", manifestPath, auditPath],
    {
      cwd: root,
      env: {
        ...process.env,
        PATH: `${binDir}${path.delimiter}${process.env.PATH}`,
        FAKE_NPM_STATE: statePath,
        FAKE_NPM_VISIBLE_AFTER: String(visibleAfter),
        DESIGN_CORE_RELEASE_VERIFY_ATTEMPTS: String(attempts),
        DESIGN_CORE_RELEASE_VERIFY_DELAY_MS: "1",
      },
      encoding: "utf8",
    },
  );
  const state = existsSync(statePath)
    ? JSON.parse(readFileSync(statePath, "utf8"))
    : {};
  return { result, state, auditPath };
}

test("release verify waits for npm registry publication visibility", () => {
  const { result, state, auditPath } = runVerify({ visibleAfter: 3 });

  assert.equal(result.status, 0, result.stderr);
  assert.equal(state.viewCalls, 3);
  assert.match(result.stdout, /became visible/);
  assert.equal(existsSync(auditPath), true);
});

test("release verify stops after bounded npm registry visibility attempts", () => {
  const { result, state } = runVerify({ visibleAfter: 99, attempts: 2 });

  assert.notEqual(result.status, 0);
  assert.equal(state.viewCalls, 2);
  assert.match(
    result.stderr,
    /@lapismd\/design-core@0\.2\.1 is not published on https:\/\/registry\.npmjs\.org/,
  );
});
