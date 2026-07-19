import { createHash } from "node:crypto";
import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { EXIT, GeneratorError } from "../errors.js";
import { snapshotKeyMatchesComponent } from "./snapshot-paths.js";

export type SnapshotManifest = Record<string, string>;

function hashFile(filePath: string): string {
  return createHash("sha256").update(readFileSync(filePath)).digest("hex");
}

/** Recursively list `.png` paths relative to `snapshotDir` (posix separators). */
export function listSnapshotRelativePaths(snapshotDir: string): string[] {
  if (!existsSync(snapshotDir)) return [];
  const out: string[] = [];

  const walk = (absDir: string, relDir: string) => {
    for (const name of readdirSync(absDir)) {
      const abs = path.join(absDir, name);
      const rel = relDir ? `${relDir}/${name}` : name;
      if (statSync(abs).isDirectory()) {
        walk(abs, rel.replace(/\\/g, "/"));
        continue;
      }
      if (name.endsWith(".png")) out.push(rel.replace(/\\/g, "/"));
    }
  };

  walk(snapshotDir, "");
  return out.sort();
}

export function buildSnapshotManifest(snapshotDir: string): SnapshotManifest {
  const manifest: SnapshotManifest = {};
  if (!existsSync(snapshotDir)) return manifest;
  for (const rel of listSnapshotRelativePaths(snapshotDir)) {
    manifest[rel] = hashFile(path.join(snapshotDir, rel));
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
  extraIncludes: string[] = [],
): string[] {
  if (!existsSync(snapshotDir)) return [];
  return listSnapshotRelativePaths(snapshotDir).filter((rel) =>
    snapshotKeyMatchesComponent(rel, component, extraIncludes),
  );
}
