import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { EXIT, GeneratorError } from "../errors.js";

export type SnapshotManifest = Record<string, string>;

function hashFile(filePath: string): string {
  return createHash("sha256").update(readFileSync(filePath)).digest("hex");
}

export function buildSnapshotManifest(snapshotDir: string): SnapshotManifest {
  const manifest: SnapshotManifest = {};
  if (!existsSync(snapshotDir)) return manifest;
  for (const name of readdirSync(snapshotDir)) {
    if (!name.endsWith(".png")) continue;
    const full = path.join(snapshotDir, name);
    manifest[name] = hashFile(full);
  }
  return manifest;
}

export function writeSnapshotManifest(
  filePath: string,
  manifest: SnapshotManifest,
) {
  writeFileSync(filePath, `${JSON.stringify(manifest, null, 2)}\n`);
}

export function assertSnapshotManifestUnchanged(
  before: SnapshotManifest,
  after: SnapshotManifest,
  allowedNewKeys: string[] = [],
) {
  const allowed = new Set(allowedNewKeys);
  const changed: string[] = [];
  const removed: string[] = [];

  for (const [key, hash] of Object.entries(before)) {
    if (!(key in after)) {
      removed.push(key);
      continue;
    }
    if (after[key] !== hash) changed.push(key);
  }

  const unexpectedNew = Object.keys(after).filter(
    (key) => !(key in before) && !allowed.has(key),
  );

  if (changed.length || removed.length || unexpectedNew.length) {
    throw new GeneratorError(
      "Snapshot integrity violation",
      EXIT.snapshotIntegrity,
      [
        changed.length ? `changed: ${changed.join(", ")}` : "",
        removed.length ? `removed: ${removed.join(", ")}` : "",
        unexpectedNew.length
          ? `unexpected new: ${unexpectedNew.join(", ")}`
          : "",
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }
}

export function listComponentSnapshotFiles(
  snapshotDir: string,
  component: string,
): string[] {
  if (!existsSync(snapshotDir)) return [];
  const needle = component.toLowerCase().replace(/\s+/g, "-");
  return readdirSync(snapshotDir).filter(
    (name) =>
      name.endsWith(".png") &&
      (name.includes(`-${needle}--`) ||
        name.includes(`shadcn-actions-${needle}`) ||
        name.includes(`shared-${needle}`) ||
        name.startsWith(`${needle}-`)),
  );
}
