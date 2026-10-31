import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import {
  stagePublicDependencyPatch,
  validatePublicDependencyPatch,
  verifyInstalledDependencyPatch,
} from "./public-dependency-patch.mjs";

const manifest = JSON.parse(
  readFileSync(new URL("../patches/manifest.json", import.meta.url)),
);
const bytes = readFileSync(
  new URL("../patches/bits-ui@2.20.2.patch", import.meta.url),
);

test("public patch validates the exact composed runtime scope and bytes", () => {
  validatePublicDependencyPatch(manifest, bytes);
});

for (const [name, delta] of [
  ["schema", { schemaVersion: 2 }],
  ["package", { package: "other" }],
  ["version", { version: "2.20.3" }],
  ["escaping filename", { patchFile: "../unsafe.patch" }],
  ["registry integrity", { registryIntegrity: "invalid" }],
  ["missing retained fix", { files: manifest.files.slice(1) }],
  [
    "invalid target hash",
    {
      files: manifest.files.map((file) => ({
        ...file,
        afterSha256: "invalid",
      })),
    },
  ],
]) {
  test(`public patch rejects ${name}`, () => {
    assert.throws(() =>
      validatePublicDependencyPatch({ ...manifest, ...delta }, bytes),
    );
  });
}

test("public patch rejects modified bytes", () => {
  assert.throws(() =>
    validatePublicDependencyPatch(
      manifest,
      Buffer.concat([bytes, Buffer.from("\nchanged\n")]),
    ),
  );
});

test("public patch rejects an additional target even with a matching digest", () => {
  const changed = Buffer.concat([
    bytes,
    Buffer.from("\ndiff --git a/other.js b/other.js\n"),
  ]);
  assert.throws(() =>
    validatePublicDependencyPatch(
      {
        ...manifest,
        patchSha256: createHash("sha256").update(changed).digest("hex"),
      },
      changed,
    ),
  );
});

test("public archive stages identical bytes and explicit root pnpm configuration", (t) => {
  const directory = mkdtempSync(
    path.join(tmpdir(), "public-dependency-patch-"),
  );
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const packageRoot = path.join(directory, "package");
  mkdirSync(packageRoot);
  cpSync(
    new URL("../patches", import.meta.url),
    path.join(packageRoot, "patches"),
    { recursive: true },
  );
  const archive = path.join(directory, "core.tgz");
  assert.equal(
    spawnSync("tar", ["-czf", archive, "-C", directory, "package"]).status,
    0,
  );
  const consumer = path.join(directory, "consumer");
  mkdirSync(consumer);
  const staged = stagePublicDependencyPatch(archive, consumer);
  assert.deepEqual(staged.configuration, {
    patchedDependencies: { "bits-ui@2.20.2": "patches/bits-ui@2.20.2.patch" },
  });
  assert.deepEqual(staged.receipt, {
    version: "2.20.2",
    sha256: manifest.patchSha256,
  });
  assert.deepEqual(
    readFileSync(path.join(consumer, "patches/bits-ui@2.20.2.patch")),
    bytes,
  );
});

test("installed dependency verification rejects an unapplied patch or wrong version", (t) => {
  const directory = mkdtempSync(
    path.join(tmpdir(), "installed-dependency-patch-"),
  );
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const expected = structuredClone(manifest);
  writeFileSync(
    path.join(directory, "package.json"),
    JSON.stringify({ name: "bits-ui", version: "2.20.2" }),
  );
  for (const file of expected.files) {
    mkdirSync(path.dirname(path.join(directory, file.path)), {
      recursive: true,
    });
    const payload = `qualified ${file.path}`;
    writeFileSync(path.join(directory, file.path), payload);
    file.afterSha256 = createHash("sha256").update(payload).digest("hex");
  }
  verifyInstalledDependencyPatch(directory, expected);
  writeFileSync(path.join(directory, expected.files[0].path), "unpatched");
  assert.throws(() => verifyInstalledDependencyPatch(directory, expected));
  writeFileSync(
    path.join(directory, "package.json"),
    JSON.stringify({ name: "bits-ui", version: "2.20.3" }),
  );
  assert.throws(() => verifyInstalledDependencyPatch(directory, expected));
});
