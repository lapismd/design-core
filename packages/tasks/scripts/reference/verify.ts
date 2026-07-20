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
    "Fixture set must cover open and done task states.",
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
  ];
  for (const relative of requiredSpecs) {
    invariant(
      await fileExists(path.join(tasksPackageRoot, relative)),
      `Missing required Tasks contract: ${relative}`,
    );
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
    const manifestPath = path.join(
      committedReferenceRoot,
      directory.name,
      "manifest.json",
    );
    invariant(
      await fileExists(manifestPath),
      `Missing manifest: ${manifestPath}`,
    );
    const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as {
      status?: string;
      screenshots?: Array<{ file: string; sha256: string; redacted: boolean }>;
      motions?: Array<{
        status?: string;
        manifest?: string;
        contactSheet?: string;
      }>;
    };
    invariant(manifest.status, `Manifest has no status: ${manifestPath}`);
    for (const screenshot of manifest.screenshots ?? []) {
      invariant(
        screenshot.redacted === true,
        `Unredacted screenshot declared in ${manifestPath}`,
      );
      const screenshotPath = path.join(
        path.dirname(manifestPath),
        screenshot.file,
      );
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
        motion.manifest,
        `Captured motion has no manifest: ${manifestPath}`,
      );
      invariant(
        motion.contactSheet,
        `Captured motion has no contact sheet: ${manifestPath}`,
      );
      const root = path.dirname(manifestPath);
      invariant(
        await fileExists(path.join(root, motion.manifest)),
        `Missing motion manifest: ${motion.manifest}`,
      );
      invariant(
        await fileExists(path.join(root, motion.contactSheet)),
        `Missing motion contact sheet: ${motion.contactSheet}`,
      );
    }
  }

  process.stdout.write(
    "Tasks reference specs, fixtures, theme, and manifests are valid.\n",
  );
}

void main();
