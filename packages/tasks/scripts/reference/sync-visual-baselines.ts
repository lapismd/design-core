/**
 * Copy Superlist capture-matrix PNGs into Playwright visual baselines for
 * Tasks Shell stories tagged `tasks-reference-visual`.
 *
 *   pnpm --dir packages/tasks reference:sync-visual-baselines
 *   pnpm --dir packages/tasks reference:sync-visual-baselines -- --dry-run
 *
 * Do not use `pnpm test:visual:update` for these stories — that would replace
 * Superlist evidence with our own UI. Re-run this sync after ingesting new
 * captures instead.
 */
import { copyFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  nestedSnapshotFileName,
  type StoryIndexEntry,
} from "../../../../scripts/ui-generator/visual/snapshot-paths.js";
import { VISUAL_SNAPSHOT_DIR } from "../../../../scripts/ui-generator/visual/diff-result.js";
import {
  loadCaptureMatrix,
  type CaptureMatrixEntry,
} from "./capture-matrix.js";
import {
  committedReferenceRoot,
  fileExists,
  tasksPackageRoot,
} from "./runtime.js";

const repoRoot = path.resolve(tasksPackageRoot, "../..");
const dryRun = process.argv.includes("--dry-run");

function isShellStoryId(storyId: string): boolean {
  return (
    storyId.startsWith("tasks-components-tasks-shell--") ||
    storyId.startsWith("tasks-pages-tasks-shell--")
  );
}

function importPathForShellStory(storyId: string): string {
  if (storyId.startsWith("tasks-pages-tasks-shell--")) {
    return "./packages/tasks/src/pages/shell/ShellPage.stories.svelte";
  }
  if (storyId.startsWith("tasks-components-tasks-shell--")) {
    return "./packages/tasks/src/components/tasks-shell/TasksShell.stories.svelte";
  }
  throw new Error(`Not a Tasks Shell story id: ${storyId}`);
}

function storyEntryFor(entry: CaptureMatrixEntry): StoryIndexEntry {
  return {
    id: entry.storyId,
    importPath: importPathForShellStory(entry.storyId),
  };
}

function baselineAbsPath(entry: CaptureMatrixEntry): string {
  return path.join(
    repoRoot,
    VISUAL_SNAPSHOT_DIR,
    nestedSnapshotFileName(storyEntryFor(entry), "chromium", "darwin"),
  );
}

function provenancePath(baselinePng: string): string {
  return baselinePng.replace(/\.png$/i, ".reference-source.json");
}

async function main(): Promise<void> {
  const matrix = await loadCaptureMatrix();
  const captureDir = path.join(committedReferenceRoot, matrix.captureId);
  const shellEntries = matrix.entries.filter(
    (entry) =>
      !entry.coverageOnly &&
      isShellStoryId(entry.storyId) &&
      Boolean(entry.file),
  );

  if (!shellEntries.length) {
    throw new Error("No Tasks Shell capture-matrix entries to sync.");
  }

  let copied = 0;
  for (const entry of shellEntries) {
    const source = path.join(captureDir, entry.file);
    if (!(await fileExists(source))) {
      throw new Error(`Missing Superlist capture for ${entry.id}: ${source}`);
    }
    const dest = baselineAbsPath(entry);
    const relDest = path.relative(repoRoot, dest);
    console.log(`${entry.id} → ${relDest}`);
    if (!dryRun) {
      await mkdir(path.dirname(dest), { recursive: true });
      await copyFile(source, dest);
      await writeFile(
        provenancePath(dest),
        `${JSON.stringify(
          {
            captureId: matrix.captureId,
            entryId: entry.id,
            storyId: entry.storyId,
            source: path.relative(repoRoot, source).replace(/\\/g, "/"),
            viewport: entry.viewport,
            syncedAt: new Date().toISOString(),
          },
          null,
          2,
        )}\n`,
        "utf8",
      );
    }
    copied += 1;
  }

  console.log(
    dryRun
      ? `Dry run: would sync ${copied} Tasks Shell baselines from ${matrix.captureId}.`
      : `Synced ${copied} Tasks Shell baselines from ${matrix.captureId}.`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
