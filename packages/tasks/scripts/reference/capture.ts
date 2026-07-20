import path from "node:path";
import { chromium, type Locator, type Page } from "playwright";
import {
  captureScenarios,
  motionContracts,
  referenceViewports,
} from "../../src/lib/reference.js";
import {
  TASKS_REFERENCE_LIST_NAME,
  taskFixtures,
} from "../../src/lib/fixtures.js";
import {
  artifactRoot,
  authStatePath,
  committedReferenceRoot,
  createContactSheet,
  dispatchTouchSwipe,
  ensureDirectory,
  fileExists,
  openSource,
  screenshotRedacted,
  sha256,
  writeJson,
} from "./runtime.js";

type ScreenshotEvidence = {
  id: string;
  page: string;
  viewport: string;
  state: string;
  file: string;
  sha256: string;
  redacted: true;
};

type MotionEvidence = {
  id: string;
  input: string;
  viewport: string;
  status: "captured" | "unavailable";
  keyframes: string[];
  note?: string;
};

async function firstVisible(locator: Locator): Promise<Locator | null> {
  const count = await locator.count();
  for (let index = 0; index < count; index++) {
    const candidate = locator.nth(index);
    if (await candidate.isVisible().catch(() => false)) return candidate;
  }
  return null;
}

async function activateDestination(page: Page, name: string): Promise<void> {
  const control =
    (await firstVisible(
      page.getByRole("button", { name: new RegExp(`^${name}`, "i") }),
    )) ?? (await firstVisible(page.getByText(name, { exact: true })));
  if (!control)
    throw new Error(`Could not find the accessible ${name} destination.`);
  await control.click();
  await page.waitForTimeout(300);
}

async function activateScenario(
  page: Page,
  scenario: (typeof captureScenarios)[number],
): Promise<void> {
  await openSource(page);
  if (scenario.page === "inbox") return activateDestination(page, "Inbox");
  if (scenario.page === "today") return activateDestination(page, "Today");
  if (scenario.page === "tasks") return activateDestination(page, "Tasks");
  if (scenario.page === "updates") return activateDestination(page, "Updates");
  if (scenario.page === "lists") return activateDestination(page, "Lists");

  await activateDestination(page, "Lists");
  const fixture = await firstVisible(
    page.getByText(TASKS_REFERENCE_LIST_NAME, { exact: true }),
  );
  if (!fixture)
    throw new Error(
      "Reference fixture list is missing; run reference:bootstrap.",
    );
  await fixture.click();
  await page.waitForTimeout(300);

  if (scenario.page === "task-detail") {
    const task = await firstVisible(
      page.getByText(taskFixtures[0].title, { exact: true }),
    );
    if (!task)
      throw new Error(
        "Reference fixture task is missing; run reference:bootstrap.",
      );
    await task.dblclick();
    await page.waitForTimeout(300);
  }
}

async function captureMotion(
  page: Page,
  captureDirectory: string,
  motionIds: readonly string[],
): Promise<MotionEvidence[]> {
  const results: MotionEvidence[] = [];
  const fixtureRow = await firstVisible(
    page.getByText(taskFixtures[0].title, { exact: true }),
  );
  const completion = await firstVisible(
    page.getByRole("button", { name: /complete/i }),
  );

  for (const motion of motionContracts.filter((item) =>
    motionIds.includes(item.id),
  )) {
    const motionDirectory = path.join(captureDirectory, "motion", motion.id);
    const keyframes: string[] = [];
    try {
      if (motion.id === "task-complete" && completion) {
        const before = path.join(motionDirectory, "00-before.png");
        const after = path.join(motionDirectory, "01-after.png");
        await screenshotRedacted(page, before);
        await completion.click();
        await page.waitForTimeout(motion.durationMs[1]);
        await screenshotRedacted(page, after);
        keyframes.push(
          path.relative(captureDirectory, before),
          path.relative(captureDirectory, after),
        );
      } else if (motion.id === "task-open-double-click" && fixtureRow) {
        const before = path.join(motionDirectory, "00-before.png");
        const after = path.join(motionDirectory, "01-after.png");
        await screenshotRedacted(page, before);
        await fixtureRow.dblclick();
        await page.waitForTimeout(motion.durationMs[1]);
        await screenshotRedacted(page, after);
        keyframes.push(
          path.relative(captureDirectory, before),
          path.relative(captureDirectory, after),
        );
      } else if (motion.id === "mobile-row-swipe-complete" && fixtureRow) {
        const box = await fixtureRow.boundingBox();
        if (!box) throw new Error("Task row is not in the viewport.");
        const before = path.join(motionDirectory, "00-before.png");
        const after = path.join(motionDirectory, "01-after.png");
        await screenshotRedacted(page, before);
        await dispatchTouchSwipe(
          page,
          { x: box.x + box.width * 0.82, y: box.y + box.height / 2 },
          { x: box.x + box.width * 0.18, y: box.y + box.height / 2 },
          motion.durationMs[1],
        );
        await screenshotRedacted(page, after);
        keyframes.push(
          path.relative(captureDirectory, before),
          path.relative(captureDirectory, after),
        );
      } else {
        results.push({
          id: motion.id,
          input: motion.input,
          viewport: motion.viewport,
          status: "unavailable",
          keyframes,
          note: "Requires the matching fixture state and a verified semantic control.",
        });
        continue;
      }

      await createContactSheet(
        keyframes.map((file) => path.join(captureDirectory, file)),
        path.join(motionDirectory, "contact-sheet.png"),
      ).catch(() => undefined);
      results.push({
        id: motion.id,
        input: motion.input,
        viewport: motion.viewport,
        status: "captured",
        keyframes,
      });
    } catch (error) {
      results.push({
        id: motion.id,
        input: motion.input,
        viewport: motion.viewport,
        status: "unavailable",
        keyframes,
        note: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return results;
}

async function main(): Promise<void> {
  if (!(await fileExists(authStatePath))) {
    throw new Error(
      "Missing local auth state. Run pnpm --dir packages/tasks reference:auth first.",
    );
  }

  const captureId = process.env.TASKS_REFERENCE_CAPTURE_ID ?? "2026-07-20";
  const captureDirectory = path.join(committedReferenceRoot, captureId);
  const rawDirectory = path.join(artifactRoot, "raw", captureId);
  await ensureDirectory(captureDirectory);
  await ensureDirectory(rawDirectory);

  const screenshots: ScreenshotEvidence[] = [];
  const errors: Array<{ id: string; error: string }> = [];

  for (const scenario of captureScenarios) {
    const viewport = referenceViewports.find(
      (item) => item.id === scenario.viewport,
    );
    if (!viewport) throw new Error(`Unknown viewport ${scenario.viewport}.`);

    const browser = await chromium.launch();
    const context = await browser.newContext({
      storageState: authStatePath,
      viewport,
      deviceScaleFactor: viewport.deviceScaleFactor,
      recordVideo: { dir: rawDirectory, size: viewport },
      reducedMotion: "no-preference",
    });
    const page = await context.newPage();

    try {
      await activateScenario(page, scenario);
      const file = path.join(
        captureDirectory,
        "screenshots",
        `${scenario.id}.png`,
      );
      await screenshotRedacted(page, file);
      screenshots.push({
        id: scenario.id,
        page: scenario.page,
        viewport: scenario.viewport,
        state: scenario.state,
        file: path.relative(captureDirectory, file),
        sha256: await sha256(file),
        redacted: true,
      });
    } catch (error) {
      errors.push({
        id: scenario.id,
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      const video = page.video();
      await context.close();
      if (video) {
        await video
          .saveAs(path.join(rawDirectory, `${scenario.id}.webm`))
          .catch(() => undefined);
      }
      await browser.close();
    }
  }

  const desktop = referenceViewports[0];
  const browser = await chromium.launch();
  const context = await browser.newContext({
    storageState: authStatePath,
    viewport: desktop,
    deviceScaleFactor: desktop.deviceScaleFactor,
    recordVideo: { dir: rawDirectory, size: desktop },
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  let motions: MotionEvidence[] = [];
  try {
    await activateScenario(
      page,
      captureScenarios.find((item) => item.id === "desktop-list-detail")!,
    );
    motions = await captureMotion(page, captureDirectory, [
      "task-complete",
      "task-open-double-click",
      "task-reorder-drag",
    ]);
  } catch (error) {
    errors.push({
      id: "motions",
      error: error instanceof Error ? error.message : String(error),
    });
  } finally {
    const video = page.video();
    await context.close();
    if (video) {
      await video
        .saveAs(path.join(rawDirectory, "desktop-interactions.webm"))
        .catch(() => undefined);
    }
    await browser.close();
  }

  const mobile = referenceViewports.find((item) => item.id === "mobile")!;
  const mobileBrowser = await chromium.launch();
  const mobileContext = await mobileBrowser.newContext({
    storageState: authStatePath,
    viewport: mobile,
    deviceScaleFactor: mobile.deviceScaleFactor,
    recordVideo: { dir: rawDirectory, size: mobile },
    reducedMotion: "no-preference",
  });
  const mobilePage = await mobileContext.newPage();
  try {
    await activateScenario(
      mobilePage,
      captureScenarios.find((item) => item.id === "mobile-inbox")!,
    );
    motions.push(
      ...(await captureMotion(mobilePage, captureDirectory, [
        "mobile-row-swipe-complete",
        "mobile-pager-back",
      ])),
    );
  } catch (error) {
    errors.push({
      id: "mobile-motions",
      error: error instanceof Error ? error.message : String(error),
    });
  } finally {
    const video = mobilePage.video();
    await mobileContext.close();
    if (video) {
      await video
        .saveAs(path.join(rawDirectory, "mobile-interactions.webm"))
        .catch(() => undefined);
    }
    await mobileBrowser.close();
  }

  await writeJson(path.join(captureDirectory, "manifest.json"), {
    schemaVersion: 1,
    source: "authenticated Superlist web session",
    capturedAt: new Date().toISOString(),
    status: errors.length ? "partial" : "captured",
    redaction: "semantic allow-list overlay",
    viewports: referenceViewports,
    screenshots,
    motions,
    errors,
  });

  if (!screenshots.length) {
    throw new Error(
      "No screenshots were captured. Check SUPERLIST_REFERENCE_URL and local auth state.",
    );
  }

  process.stdout.write(
    `Captured ${screenshots.length} sanitized screenshots in ${captureDirectory}.\n`,
  );
}

void main();
