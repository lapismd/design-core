/**
 * One-time migration: flat `{storyId}-chromium-darwin.png` → nested
 * `{src/shared-relative-dir}/{storySlug}-chromium-darwin.png`.
 *
 * Usage: pnpm exec tsx scripts/ui-generator/visual/migrate-nested-snapshots.ts
 */
import {
  existsSync,
  mkdirSync,
  renameSync,
  readFileSync,
  unlinkSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  legacyFlatSnapshotName,
  nestedSnapshotFileName,
  type StoryIndexEntry,
} from "./snapshot-paths.js";

type StorybookIndex = {
  entries: Record<string, StoryIndexEntry>;
};

function main() {
  const packageRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../..",
  );
  const snapshotDir = path.join(
    packageRoot,
    "tests/visual/storybook.spec.ts-snapshots",
  );
  const indexPath = path.join(packageRoot, "storybook-static/index.json");
  if (!existsSync(indexPath)) {
    throw new Error(
      `Missing ${indexPath}. Run \`pnpm build-storybook\` first.`,
    );
  }

  const index = JSON.parse(readFileSync(indexPath, "utf8")) as StorybookIndex;
  let moved = 0;
  let missing = 0;
  let skipped = 0;

  for (const entry of Object.values(index.entries)) {
    if (entry.type !== "story") continue;
    if (!entry.importPath) {
      console.warn(`skip (no importPath): ${entry.id}`);
      skipped++;
      continue;
    }

    const fromName = legacyFlatSnapshotName(entry.id);
    const fromPath = path.join(snapshotDir, fromName);
    const toRel = nestedSnapshotFileName(entry);
    const toPath = path.join(snapshotDir, toRel);

    if (!existsSync(fromPath)) {
      if (existsSync(toPath)) {
        skipped++;
        continue;
      }
      // Docs/skip-visual stories may have no baseline
      missing++;
      continue;
    }

    mkdirSync(path.dirname(toPath), { recursive: true });
    if (existsSync(toPath)) {
      unlinkSync(fromPath);
      skipped++;
      continue;
    }
    renameSync(fromPath, toPath);
    moved++;
    console.log(`${fromName} → ${toRel}`);
  }

  console.log(
    `Migration done: moved=${moved} already-nested-or-skip=${skipped} no-flat-file=${missing}`,
  );
}

main();
