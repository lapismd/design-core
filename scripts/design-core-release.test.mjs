import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { realpathSync } from "node:fs";
import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

test("completion caller is a parsed read-only pinned wake-up without recursion", () => {
  const require = createRequire(
    realpathSync(
      new URL("../node_modules/@changesets/cli/package.json", import.meta.url),
    ),
  );
  const { parse } = require("yaml");
  const caller = parse(
    readFileSync(
      new URL("../.github/workflows/dependency-completed.yml", import.meta.url),
      "utf8",
    ),
  );
  assert.deepEqual(Object.keys(caller).sort(), [
    "jobs",
    "name",
    "on",
    "permissions",
  ]);
  assert.equal(caller.name, "Notify dependency completion");
  assert.deepEqual(caller.on, {
    workflow_run: {
      workflows: [
        "CI",
        "Publish Storybook to GitHub Pages",
        "Release public packages",
      ],
      types: ["completed"],
    },
  });
  assert.deepEqual(caller.permissions, {
    contents: "read",
    actions: "read",
    "pull-requests": "read",
  });
  assert.deepEqual(caller.jobs, {
    notify: {
      if: "github.event.workflow_run.conclusion == 'success'",
      uses: "lapismd/dependency-automation/.github/workflows/completion.yml@e3c91cb3bc19f19299842054a9309b0ca44da5b6",
      with: { "automation-ref": "e3c91cb3bc19f19299842054a9309b0ca44da5b6" },
      secrets: {
        "app-private-key": "${{ secrets.LAPIS_DEPENDENCY_APP_PRIVATE_KEY }}",
      },
    },
  });
});

test("qualified runtime guard precedes writer authority without changing the version recipe", () => {
  const workflow = readFileSync(
    new URL("../.github/workflows/release.yml", import.meta.url),
    "utf8",
  );
  const version = workflow.match(
    /\n {2}version:[\s\S]*?(?=\n {2}[\w-]+:|$)/,
  )?.[0];
  const guard = version?.match(
    /- name: Guard qualified version runtime[\s\S]*?(?=\n {6}- )/,
  )?.[0];
  assert.ok(guard, "source-owned shared runtime guard exists");
  assert.match(
    guard,
    /uses: lapismd\/lapis-ci\/actions\/guard-version-runtime@6511f29ec5ecd5f5dd0bd90287e3f7761e6886a3/,
  );
  const condition =
    "if: github.event_name == 'push' && github.repository == 'lapismd/design-core' && github.ref == 'refs/heads/main'";
  assert(guard.includes(condition));
  assert.match(guard, /qualification-file: \.github\/versioning-runtime\.json/);
  assert.doesNotMatch(
    guard,
    /continue-on-error|secrets\.|GITHUB_TOKEN|create-github-app-token/,
  );
  assert(
    version.indexOf("Install dependencies") <
      version.indexOf("Guard qualified version runtime"),
  );
  assert(
    version.indexOf("Guard qualified version runtime") <
      version.indexOf("Create repository version token"),
  );
  assert.equal(
    (
      version.match(
        new RegExp(condition.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
      ) ?? []
    ).length,
    3,
  );
  assert.match(
    version,
    /has_changesets: \$\{\{ steps\.changesets\.outputs\.hasChangesets \|\| 'false' \}\}/,
  );
  assert.match(
    workflow,
    /if: needs\.version\.outputs\.has_changesets != 'true'/,
  );
  const qualification = JSON.parse(
    readFileSync(
      new URL("../.github/versioning-runtime.json", import.meta.url),
    ),
  );
  const manifest = JSON.parse(
    readFileSync(new URL("../package.json", import.meta.url)),
  );
  assert.equal(qualification.cliVersion, "3.0.3");
  assert.equal(qualification.packageManager, manifest.packageManager);
  assert.equal(
    qualification.scripts["release:version"],
    manifest.scripts["release:version"],
  );
  const hash = (file) =>
    createHash("sha256")
      .update(readFileSync(new URL("../" + file, import.meta.url)))
      .digest("hex");
  assert.equal(qualification.configSha256, hash(".changeset/config.json"));
  for (const [file, digest] of Object.entries(qualification.files))
    assert.equal(digest, hash(file), file);
});

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
  const state = readState();
  state.installCalls = (state.installCalls ?? 0) + 1;
  state.installDirs = [...(state.installDirs ?? []), process.cwd()];
  writeState(state);
  if (state.installCalls < Number(process.env.FAKE_NPM_INSTALL_VISIBLE_AFTER ?? "1")) {
    const code = process.env.FAKE_NPM_INSTALL_ERROR ?? "E404";
    const target = process.env.FAKE_NPM_INSTALL_TARGET ?? "@lapismd/design-core";
    console.error(\`npm error code \${code}\`);
    console.error(\`npm error 404 Not Found - GET https://registry.npmjs.org/\${target}/-/\${target.split("/").pop()}-\${version}.tgz - Not found\`);
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
  const state = readState();
  state.auditCalls = (state.auditCalls ?? 0) + 1;
  writeState(state);
  if (process.env.FAKE_NPM_AUDIT_ERROR) {
    console.error("npm error code EINTEGRITY: signature verification failed");
    process.exit(1);
  }
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

function runVerify({
  visibleAfter = 1,
  attempts = 4,
  installVisibleAfter = 1,
  installError = "E404",
  installTarget = "@lapismd/design-core",
  auditError = "",
}) {
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
        FAKE_NPM_INSTALL_VISIBLE_AFTER: String(installVisibleAfter),
        FAKE_NPM_INSTALL_ERROR: installError,
        FAKE_NPM_INSTALL_TARGET: installTarget,
        FAKE_NPM_AUDIT_ERROR: auditError,
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

test("release verify waits for the tarball after metadata becomes visible", () => {
  const { result, state, auditPath } = runVerify({ installVisibleAfter: 3 });

  assert.equal(result.status, 0, result.stderr);
  assert.equal(state.viewCalls, 1);
  assert.equal(state.installCalls, 3);
  assert.equal(state.auditCalls, 1);
  assert.equal(new Set(state.installDirs).size, 3);
  assert.ok(state.installDirs.every((dir) => !existsSync(dir)));
  assert.equal(existsSync(auditPath), true);
});

test("release verify bounds tarball visibility retries without signature evidence", () => {
  const { result, state, auditPath } = runVerify({
    installVisibleAfter: 99,
    attempts: 2,
  });

  assert.notEqual(result.status, 0);
  assert.equal(state.installCalls, 2);
  assert.equal(state.auditCalls, undefined);
  assert.ok(state.installDirs.every((dir) => !existsSync(dir)));
  assert.equal(existsSync(auditPath), false);
});

for (const installError of ["EINTEGRITY", "E401"]) {
  test(`release verify does not retry ${installError} failures`, () => {
    const { result, state } = runVerify({
      installVisibleAfter: 99,
      installError,
    });

    assert.notEqual(result.status, 0);
    assert.equal(state.installCalls, 1);
    assert.equal(state.auditCalls, undefined);
  });
}

test("release verify does not retry another package's missing tarball", () => {
  const { result, state } = runVerify({
    installVisibleAfter: 99,
    installTarget: "@example/missing-dependency",
  });

  assert.notEqual(result.status, 0);
  assert.equal(state.installCalls, 1);
});

test("release verify does not retry or accept failed signature checks", () => {
  const { result, state, auditPath } = runVerify({ auditError: "EINTEGRITY" });

  assert.notEqual(result.status, 0);
  assert.equal(state.installCalls, 1);
  assert.equal(state.auditCalls, 1);
  assert.equal(existsSync(auditPath), false);
});

test("pack-check does not skip packaging failures when the version is published", () => {
  const temporary = mkdtempSync(path.join(tmpdir(), "design-core-pack-test-"));
  try {
    const binDir = path.join(temporary, "bin");
    mkdirSync(binDir);
    const scriptsDir = path.join(temporary, "scripts");
    mkdirSync(scriptsDir);
    const fixtureScript = path.join(scriptsDir, "design-core-release.mjs");
    copyFileSync(releaseScript, fixtureScript);
    copyFileSync(
      path.join(root, "scripts", "public-dependency-patch.mjs"),
      path.join(temporary, "scripts", "public-dependency-patch.mjs"),
    );
    copyFileSync(
      path.join(root, "scripts", "npm-command-env.mjs"),
      path.join(scriptsDir, "npm-command-env.mjs"),
    );
    copyFileSync(
      path.join(root, "scripts", "pack-local.mjs"),
      path.join(scriptsDir, "pack-local.mjs"),
    );
    copyFileSync(
      path.join(root, "package.json"),
      path.join(temporary, "package.json"),
    );
    writeFakeNpm(binDir);
    const packLog = path.join(temporary, "pack.json");
    const fakePnpm = path.join(binDir, "pnpm");
    writeFileSync(
      fakePnpm,
      `#!/usr/bin/env node
import { writeFileSync } from "node:fs";
writeFileSync(process.env.FAKE_PACK_LOG, JSON.stringify(process.argv.slice(2)));
console.error("fixture packaging failure");
process.exit(71);
`,
    );
    chmodSync(fakePnpm, 0o755);
    const version = JSON.parse(
      readFileSync(path.join(root, "package.json"), "utf8"),
    ).version;
    const result = spawnSync(process.execPath, [fixtureScript, "pack-check"], {
      cwd: temporary,
      encoding: "utf8",
      env: {
        ...process.env,
        PATH: `${binDir}${path.delimiter}${process.env.PATH}`,
        FAKE_NPM_STATE: path.join(temporary, "npm.json"),
        FAKE_NPM_VERSION: version,
        FAKE_PACK_LOG: packLog,
      },
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /fixture packaging failure/);
    assert.equal(JSON.parse(readFileSync(packLog, "utf8"))[0], "pack");
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});

test("version PR authority is confined to the canonical main App boundary", () => {
  const workflow = readFileSync(
    new URL("../.github/workflows/release.yml", import.meta.url),
    "utf8",
  );
  const version = workflow.match(/\n  version:[\s\S]*?(?=\n  [\w-]+:|$)/)?.[0];
  assert.ok(version, "version job exists");
  assert.match(
    version,
    /if: github\.event_name == 'push' && github\.repository == 'lapismd\/design-core' && github\.ref == 'refs\/heads\/main'/,
  );
  assert.match(version, /permissions:\n      contents: read\n/);
  assert.doesNotMatch(version, /\n      [\w-]+: write|environment:|id-token:/);
  const checkout = version.match(
    /- name: Check out main[\s\S]*?(?=\n      - )/,
  )?.[0];
  assert.match(checkout, /actions\/checkout@[a-f0-9]{40}/);
  assert.match(checkout, /fetch-depth: 0/);
  assert.match(checkout, /persist-credentials: false/);
  assert.doesNotMatch(checkout, /\n          token:/);
  const app = version.match(
    /- name: Create repository version token[\s\S]*?(?=\n      - )/,
  )?.[0];
  assert.ok(app, "App token mint exists");
  assert.match(app, /id: version-app/);
  assert.match(
    app,
    /actions\/create-github-app-token@64ab729a6294000f5aa4a4bc0b73d1f32bc45510/,
  );
  assert.match(
    app,
    /client-id: \$\{\{ vars\.LAPIS_DEPENDENCY_APP_CLIENT_ID \}\}/,
  );
  assert.match(
    app,
    /private-key: \$\{\{ secrets\.LAPIS_DEPENDENCY_APP_PRIVATE_KEY \}\}/,
  );
  assert.match(app, /owner: lapismd\n          repositories: design-core\n/);
  assert.deepEqual(
    [...app.matchAll(/permission-([\w-]+): (\w+)/g)].map(([, key, value]) => [
      key,
      value,
    ]),
    [
      ["contents", "write"],
      ["pull-requests", "write"],
    ],
  );
  assert.doesNotMatch(app, /skip-token-revoke: true/);
  const changesets = version.match(
    /- name: Create or update Version Packages pull request[\s\S]*/,
  )?.[0];
  assert.match(
    changesets,
    /changesets\/action@63a615b9cd06ba9a3e6d13796c7fbcb080a60a0b/,
  );
  assert.match(changesets, /version: pnpm release:version/);
  assert.match(changesets, /commitMode: github-api/);
  assert.match(changesets, /createGithubReleases: false/);
  assert.match(
    changesets,
    /GITHUB_TOKEN: \$\{\{ steps\.version-app\.outputs\.token \}\}/,
  );
  assert.doesNotMatch(
    changesets,
    /github-token:|publish:|secrets\.GITHUB_TOKEN|github\.token|\|\|/,
  );
  assert.equal((version.match(/GITHUB_TOKEN:/g) ?? []).length, 1);
  assert.equal(
    (workflow.match(/steps\.version-app\.outputs\.token/g) ?? []).length,
    1,
  );
  assert.equal((workflow.match(/create-github-app-token@/g) ?? []).length, 1);
  assert.ok(
    version.indexOf("Install dependencies") <
      version.indexOf("Create repository version token"),
  );
  assert.ok(
    version.indexOf("Create repository version token") <
      version.indexOf("Create or update Version Packages"),
  );
});
