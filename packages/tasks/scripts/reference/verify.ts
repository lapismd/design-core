import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import {
  captureScenarios,
  motionContracts,
  referenceViewports,
} from "../../src/lib/reference.js";
import {
  TASKS_REFERENCE_LIST_NAME,
  listFixtures,
  taskFixtures,
} from "../../src/lib/fixtures.js";
import {
  assertComponentClip,
  loadCaptureMatrix,
} from "./capture-matrix.js";
import {
  committedReferenceRoot,
  fileExists,
  sha256,
  tasksPackageRoot,
} from "./runtime.js";

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main(): Promise<void> {
  invariant(
    listFixtures[0]?.name === TASKS_REFERENCE_LIST_NAME,
    "Fixture list name drifted.",
  );
  invariant(
    taskFixtures.length >= 4,
    "Fixture set must cover the task-list interaction states.",
  );
  invariant(
    referenceViewports.length === 4,
    "All requested viewports must be present.",
  );
  invariant(
    captureScenarios.some((item) => item.viewport === "mobile"),
    "Mobile capture is required.",
  );
  invariant(
    motionContracts.some((item) => item.input === "double-click"),
    "Double-click contract is required.",
  );
  invariant(
    motionContracts.some((item) => item.input === "swipe-left"),
    "Swipe contract is required.",
  );

  const requiredSpecs = [
    "specs/product.md",
    "specs/interactions.md",
    "specs/styles.md",
    "specs/pages/shell.md",
    "specs/pages/inbox.md",
    "specs/pages/today.md",
    "specs/pages/tasks.md",
    "specs/pages/updates.md",
    "specs/pages/lists.md",
    "specs/pages/list-detail.md",
    "specs/pages/task-detail.md",
    "specs/components/task-row.md",
    "specs/components/tasks-motion.md",
    "src/lib/tasks-theme.css",
    "reference/superlist/capture-matrix.json",
  ];
  for (const relative of requiredSpecs) {
    invariant(
      await fileExists(path.join(tasksPackageRoot, relative)),
      `Missing required Tasks contract: ${relative}`,
    );
  }

  const matrix = await loadCaptureMatrix();
  invariant(
    matrix.deviceScaleFactor === 3,
    "Visual Delta capture matrix must use deviceScaleFactor 3.",
  );
  const storyIds = new Set(
    matrix.entries
      .filter((entry) => !entry.coverageOnly)
      .map((entry) => entry.storyId),
  );
  invariant(
    storyIds.size >= 45,
    "Capture matrix story coverage looks too small.",
  );

  for (const entry of matrix.entries) {
    const viewport = matrix.viewports[entry.viewport];
    invariant(viewport, `Matrix entry ${entry.id} has unknown viewport`);
    assertComponentClip(entry, viewport, matrix.maxComponentViewportRatio);
  }

  const captures = await readdir(committedReferenceRoot, {
    withFileTypes: true,
  });
  const datedDirectories = captures.filter(
    (entry) => entry.isDirectory() && /^\d{4}-\d{2}-\d{2}$/.test(entry.name),
  );
  invariant(
    datedDirectories.length > 0,
    "A dated reference manifest is required.",
  );

  for (const directory of datedDirectories) {
    const root = path.join(committedReferenceRoot, directory.name);
    const manifestPath = path.join(root, "manifest.json");
    invariant(
      await fileExists(manifestPath),
      `Missing manifest: ${manifestPath}`,
    );
    const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as {
      status?: string;
      screenshots?: Array<{
        id?: string;
        storyId?: string;
        kind?: string;
        file: string;
        sha256: string;
        redacted?: boolean;
        fixtureOnly?: boolean;
        clip?: { x: number; y: number; width: number; height: number };
      }>;
      motions?: Array<{
        status?: string;
        manifest?: string;
        contactSheet?: string;
      }>;
    };
    invariant(manifest.status, `Manifest has no status: ${manifestPath}`);

    if (directory.name === matrix.captureId) {
      const byId = new Map(
        (manifest.screenshots ?? []).map((shot) => [shot.id, shot]),
      );
      for (const entry of matrix.entries) {
        const shot = byId.get(entry.id);
        invariant(shot, `Manifest missing matrix id ${entry.id}`);
        invariant(
          shot.file === entry.file,
          `Manifest file drift for ${entry.id}`,
        );
        if (entry.kind === "component" && !entry.allowFullViewport) {
          invariant(
            shot.clip || entry.clip,
            `Component screenshot missing clip metadata: ${entry.id}`,
          );
        }
      }
    }

    for (const screenshot of manifest.screenshots ?? []) {
      invariant(
        screenshot.redacted === true || screenshot.fixtureOnly === true,
        `Screenshot is neither redacted nor fixture-only: ${manifestPath}`,
      );
      const screenshotPath = path.join(root, screenshot.file);
      invariant(
        await fileExists(screenshotPath),
        `Missing captured screenshot: ${screenshot.file}`,
      );
      invariant(
        (await sha256(screenshotPath)) === screenshot.sha256,
        `Checksum mismatch: ${screenshot.file}`,
      );
    }
    for (const motion of manifest.motions ?? []) {
      if (motion.status !== "captured") continue;
      invariant(
        motion.contactSheet,
        `Captured motion has no contact sheet: ${manifestPath}`,
      );
      if (motion.manifest) {
        invariant(
          await fileExists(path.join(root, motion.manifest)),
          `Missing motion manifest: ${motion.manifest}`,
        );
      }
      invariant(
        await fileExists(path.join(root, motion.contactSheet)),
        `Missing motion contact sheet: ${motion.contactSheet}`,
      );
    }
  }

  process.stdout.write(
    "Tasks reference specs, fixtures, theme, capture matrix, and manifests are valid.\n",
  );
}

void main();
