import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const patchFile = "bits-ui@2.20.2.patch";
const runtimeFiles = [
  "dist/bits/link-preview/link-preview.svelte.js",
  "dist/bits/slider/slider.svelte.js",
  "dist/bits/utilities/focus-scope/focus-scope.svelte.js",
];

export function validatePublicDependencyPatch(manifest, bytes) {
  assert.equal(
    manifest.schemaVersion,
    1,
    "Unsupported dependency patch schema",
  );
  assert.equal(manifest.package, "bits-ui", "Unexpected patched package");
  assert.equal(manifest.version, "2.20.2", "Unexpected patched version");
  assert.equal(manifest.patchFile, patchFile, "Unexpected patch filename");
  assert.match(manifest.registryIntegrity, /^sha512-[A-Za-z0-9+/]+={0,2}$/);
  assert.equal(
    createHash("sha256").update(bytes).digest("hex"),
    manifest.patchSha256,
    "Published dependency patch checksum differs",
  );
  assert.deepEqual(
    manifest.files.map((file) => file.path).sort(),
    runtimeFiles,
    "Dependency patch must retain all three qualified runtime files",
  );
  for (const file of manifest.files) {
    assert.match(file.sha256, /^[a-f0-9]{64}$/);
    assert.match(file.afterSha256, /^[a-f0-9]{64}$/);
  }
  const changed = [
    ...bytes.toString("utf8").matchAll(/^diff --git a\/(\S+) b\/(\S+)$/gm),
  ]
    .map(([, before, after]) => {
      assert.equal(
        before,
        after,
        "Dependency patch cannot rename runtime files",
      );
      return before;
    })
    .sort();
  assert.deepEqual(
    changed,
    runtimeFiles,
    "Dependency patch target scope differs",
  );
}

export function verifyInstalledDependencyPatch(directory, manifest) {
  const installed = JSON.parse(
    readFileSync(path.join(directory, "package.json")),
  );
  assert.equal(
    installed.name,
    manifest.package,
    "Installed patched package differs",
  );
  assert.equal(
    installed.version,
    manifest.version,
    "Installed patched version differs",
  );
  for (const file of manifest.files) {
    assert.equal(
      createHash("sha256")
        .update(readFileSync(path.join(directory, file.path)))
        .digest("hex"),
      file.afterSha256,
      `Installed dependency patch differs: ${file.path}`,
    );
  }
}

function archiveFile(tarball, member) {
  const result = spawnSync(
    "tar",
    ["-xOf", tarball, `package/patches/${member}`],
    {
      timeout: 10_000,
      maxBuffer: 256 * 1024,
    },
  );
  assert.equal(
    result.status,
    0,
    `Missing public dependency patch file: ${member}`,
  );
  return result.stdout;
}

/** Explicit consumer-root intake; dependency pnpm metadata does not propagate. */
export function stagePublicDependencyPatch(tarball, fixture) {
  const manifest = JSON.parse(
    archiveFile(tarball, "manifest.json").toString("utf8"),
  );
  const bytes = archiveFile(tarball, patchFile);
  validatePublicDependencyPatch(manifest, bytes);
  mkdirSync(path.join(fixture, "patches"));
  writeFileSync(path.join(fixture, "patches", patchFile), bytes);
  return {
    manifest,
    configuration: {
      patchedDependencies: { "bits-ui@2.20.2": `patches/${patchFile}` },
    },
    receipt: { version: manifest.version, sha256: manifest.patchSha256 },
  };
}
