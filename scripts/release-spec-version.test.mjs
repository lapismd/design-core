import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import {
  releaseVersionPages,
  syncReleaseSpecVersion,
} from "./release-spec-version.mjs";

const fact = (version) =>
  `Source package version: \`${version}\` (\`@lapismd/design-core\`).`;
test("current canonical package facts match the source manifest", () => {
  assert.deepEqual(
    syncReleaseSpecVersion({ root: path.resolve(import.meta.dirname, "..") })
      .changed,
    [],
  );
});
function fixture(t) {
  const root = mkdtempSync(path.join(tmpdir(), "core-version-spec-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(path.join(root, "spec/src"), { recursive: true });
  writeFileSync(
    path.join(root, "package.json"),
    JSON.stringify({ name: "@lapismd/design-core", version: "0.13.5" }),
  );
  const source = `# Owned contract\n\n${fact("0.13.4")}\n\nHistorical release 0.13.4 remains evidence.\n`;
  for (const file of releaseVersionPages)
    writeFileSync(path.join(root, file), source);
  return {
    root,
    source,
    read: (file) => readFileSync(path.join(root, file), "utf8"),
  };
}

test("check rejects stale facts without modifying either page; write changes only the two current facts", (t) => {
  const f = fixture(t);
  assert.throws(
    () => syncReleaseSpecVersion({ root: f.root }),
    /Stale canonical/,
  );
  for (const file of releaseVersionPages) assert.equal(f.read(file), f.source);
  assert.deepEqual(syncReleaseSpecVersion({ root: f.root, write: true }), {
    version: "0.13.5",
    changed: releaseVersionPages,
  });
  for (const file of releaseVersionPages)
    assert.equal(
      f.read(file),
      f.source.replace(fact("0.13.4"), fact("0.13.5")),
    );
  assert.deepEqual(syncReleaseSpecVersion({ root: f.root }), {
    version: "0.13.5",
    changed: [],
  });
  assert.deepEqual(syncReleaseSpecVersion({ root: f.root, write: true }), {
    version: "0.13.5",
    changed: [],
  });
});
for (const [name, bad] of [
  ["missing", "# Missing fact\n"],
  ["duplicate", `${fact("0.13.4")}\n${fact("0.13.4")}\n`],
  ["invalid", fact("invalid")],
])
  test(`a ${name} marker fails before writing another page`, (t) => {
    const f = fixture(t);
    writeFileSync(path.join(f.root, releaseVersionPages[1]), bad);
    assert.throws(
      () => syncReleaseSpecVersion({ root: f.root, write: true }),
      /exactly one/,
    );
    assert.equal(f.read(releaseVersionPages[0]), f.source);
    assert.equal(f.read(releaseVersionPages[1]), bad);
  });
test("a symlink cannot redirect canonical output or cause a partial update", (t) => {
  const f = fixture(t),
    target = path.join(f.root, "outside.md"),
    file = path.join(f.root, releaseVersionPages[1]);
  writeFileSync(target, f.source);
  rmSync(file);
  symlinkSync(target, file);
  assert.throws(
    () => syncReleaseSpecVersion({ root: f.root, write: true }),
    /owned regular file/,
  );
  assert.equal(readFileSync(target, "utf8"), f.source);
  assert.equal(f.read(releaseVersionPages[0]), f.source);
});
for (const manifest of [
  { name: "other", version: "0.13.5" },
  { name: "@lapismd/design-core", version: "next" },
])
  test(`invalid package identity/version fails closed: ${JSON.stringify(manifest)}`, (t) => {
    const f = fixture(t);
    writeFileSync(path.join(f.root, "package.json"), JSON.stringify(manifest));
    assert.throws(
      () => syncReleaseSpecVersion({ root: f.root, write: true }),
      /exact Design Core/,
    );
    for (const file of releaseVersionPages)
      assert.equal(f.read(file), f.source);
  });
