import path from "node:path";
import { chromium, type Locator, type Page } from "playwright";
import {
  assertComponentClip,
  loadCaptureMatrix,
  type CaptureClip,
  type CaptureMatrix,
  type CaptureMatrixEntry,
} from "./capture-matrix.js";
import { firstVisible, runCaptureNav } from "./nav-steps.js";
import {
  TASKS_REFERENCE_LIST_NAME,
  taskFixtures,
} from "../../src/lib/fixtures.js";
import {
  artifactRoot,
  authStatePath,
  committedReferenceRoot,
  ensureDirectory,
  fileExists,
  openSource,
  sha256,
  writeJson,
} from "./runtime.js";

async function resolveClip(
  page: Page,
  entry: CaptureMatrixEntry,
): Promise<CaptureClip> {
  if (entry.locator) {
    const locatorMap: Record<string, () => Locator> = {
      "task-row": () => page.getByText(taskFixtures[0].title, { exact: true }),
      "main-list": () => page.locator("flt-semantics-host, body"),
      composer: () =>
        page.getByRole("button", { name: /new task|add task/i }).first(),
      "detail-rail": () =>
        page.getByText(taskFixtures[0].title, { exact: true }),
      properties: () => page.getByText(/due|priority|label/i).first(),
      feedback: () => page.getByText(/no updates|updates|empty/i).first(),
      filters: () => page.getByText(/for me|all|sort/i).first(),
      sidebar: () => page.getByRole("button", { name: /^Inbox/i }),
      "lists-main": () =>
        page.getByText(TASKS_REFERENCE_LIST_NAME, { exact: true }),
      shell: () => page.locator("body"),
    };
    const factory = locatorMap[entry.locator];
    if (factory) {
      const target = await firstVisible(factory());
      if (target) {
        const box = await target.boundingBox();
        if (box && box.width > 8 && box.height > 8) {
          // Expand row-like clips to a stable band.
          if (entry.locator === "task-row") {
            return {
              x: Math.max(0, box.x - 48),
              y: Math.max(0, box.y - 8),
              width: Math.min(
                page.viewportSize()!.width - box.x + 48,
                box.width + 96,
              ),
              height: Math.max(box.height + 16, 48),
            };
          }
          if (entry.locator === "detail-rail") {
            const vp = page.viewportSize()!;
            return {
              x: Math.min(box.x, vp.width * 0.55),
              y: 48,
              width: vp.width - Math.min(box.x, vp.width * 0.55) - 8,
              height: vp.height - 56,
            };
          }
          return {
            x: Math.max(0, box.x),
            y: Math.max(0, box.y),
            width: box.width,
            height: box.height,
          };
        }
      }
    }
  }
  if (!entry.clip) {
    throw new Error(`No clip available for ${entry.id}`);
  }
  return entry.clip;
}

async function captureEntry(
  page: Page,
  matrix: CaptureMatrix,
  entry: CaptureMatrixEntry,
  captureDirectory: string,
): Promise<{
  id: string;
  storyId: string;
  kind: string;
  page: string;
  viewport: string;
  state: string;
  file: string;
  sha256: string;
  fixtureOnly: true;
  clip?: CaptureClip;
  placeholdersApplied: string[];
}> {
  const viewport = matrix.viewports[entry.viewport];
  if (!viewport) throw new Error(`Unknown viewport ${entry.viewport}`);
  assertComponentClip(entry, viewport, matrix.maxComponentViewportRatio);

  await page.setViewportSize({
    width: viewport.width,
    height: viewport.height,
  });
  await openSource(page);
  await runCaptureNav(page, entry.nav);

  const output = path.join(captureDirectory, entry.file);
  await ensureDirectory(path.dirname(output));

  let clip: CaptureClip | undefined;
  if (entry.kind === "component") {
    clip = await resolveClip(page, entry);
    assertComponentClip(
      { ...entry, clip },
      viewport,
      matrix.maxComponentViewportRatio,
    );
    await page.screenshot({
      path: output,
      animations: "disabled",
      clip,
    });
  } else {
    await page.screenshot({
      path: output,
      animations: "disabled",
      fullPage: false,
    });
  }

  return {
    id: entry.id,
    storyId: entry.storyId,
    kind: entry.kind,
    page: entry.page,
    viewport: entry.viewport,
    state: "live-superlist",
    file: entry.file,
    sha256: await sha256(output),
    fixtureOnly: true,
    clip,
    placeholdersApplied: [],
  };
}

async function main(): Promise<void> {
  if (!(await fileExists(authStatePath))) {
    throw new Error(
      "Missing packages/tasks/.auth/storage-state.json. Run reference:auth, or use reference:migrate:delta to bootstrap from existing browser captures.",
    );
  }

  const matrix = await loadCaptureMatrix();
  const captureDirectory = path.join(committedReferenceRoot, matrix.captureId);
  await ensureDirectory(path.join(artifactRoot, "live-delta"));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    storageState: authStatePath,
    deviceScaleFactor: matrix.deviceScaleFactor,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();

  const screenshots = [];
  const errors: Array<{ id: string; error: string }> = [];

  try {
    for (const entry of matrix.entries) {
      try {
        const shot = await captureEntry(page, matrix, entry, captureDirectory);
        screenshots.push(shot);
        process.stdout.write(`captured ${entry.id}\n`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        errors.push({ id: entry.id, error: message });
        process.stderr.write(`FAILED ${entry.id}: ${message}\n`);
      }
    }
  } finally {
    await context.close();
    await browser.close();
  }

  let motions: unknown[] = [];
  try {
    const previous = JSON.parse(
      await (
        await import("node:fs/promises")
      ).readFile(path.join(captureDirectory, "manifest.json"), "utf8"),
    ) as { motions?: unknown[] };
    motions = previous.motions ?? [];
  } catch {
    motions = [];
  }

  await writeJson(path.join(captureDirectory, "manifest.json"), {
    captureId: matrix.captureId,
    source: "https://app.superlist.com/",
    capturedAt: new Date().toISOString(),
    status: "browser-fixture",
    deviceScaleFactor: matrix.deviceScaleFactor,
    redaction:
      "No overlays. Live Superlist Visual Delta captures are verbatim viewport PNGs; component shots are subject-clipped.",
    screenshots,
    motions,
    errors,
    limitations: [
      errors.length
        ? `${errors.length} entries failed; re-run after fixing nav/auth.`
        : "All matrix entries captured.",
    ],
  });

  if (errors.length) {
    process.exitCode = 1;
  } else {
    process.stdout.write(
      `Captured ${screenshots.length} Visual Delta reference screenshots at DSF ${matrix.deviceScaleFactor}.\n`,
    );
  }
}

void main();
