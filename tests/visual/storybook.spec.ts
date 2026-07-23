import { expect, test, type Locator, type Page } from "@playwright/test";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { compareBaselineToActualPng } from "../../scripts/ui-generator/visual/compare-pixels.js";
import {
  actualPngPath,
  baselinePngPath,
  buildSidecarBase,
  diffPngPath,
  sidecarJsonPath,
  snapshotPublicRel,
  writeVisualDiffSidecar,
} from "../../scripts/ui-generator/visual/diff-result.js";
import {
  interactionBaselinePngPath,
  listInteractionBaselinesOnDisk,
} from "../../scripts/ui-generator/visual/interaction-baselines.js";
import {
  interactionScreenshotRelativePath,
  screenshotRelativePath,
  type StoryIndexEntry,
} from "../../scripts/ui-generator/visual/snapshot-paths.js";
import {
  VISUAL_CAPTURE_READY_ATTR,
  VISUAL_CAPTURE_UNTIL_PARAM,
} from "../../packages/storybook-addon-visual-delta/src/shared/interaction-capture.js";

type StorybookIndex = {
  entries: Record<string, StoryIndexEntry>;
};

type CaptureMatrixViewport = { width: number; height: number };

type CaptureMatrix = {
  captureId: string;
  viewports: Record<string, CaptureMatrixViewport>;
  entries: Array<{
    storyId: string;
    id: string;
    viewport: string;
    coverageOnly?: boolean;
  }>;
};

type InteractionCaptureRequest = {
  storyId: string;
  stepId: string;
  stepLabel?: string;
};

const PORTAL_SELECTORS = [
  '[role="dialog"]',
  '[role="listbox"]',
  '[role="menu"]',
  '[data-state="open"]',
].join(", ");

const PACKAGE_ROOT = resolve(".");
const isBaselineUpdate = process.env.PLAYWRIGHT_UPDATE_SNAPSHOTS === "1";
const TASKS_REFERENCE_VISUAL_TAG = "tasks-reference-visual";
const FAVA_REFERENCE_VISUAL_TAG = "fava-reference-visual";

const interactionCaptureEnv =
  process.env.PLAYWRIGHT_INTERACTION_CAPTURE?.trim();
const interactionCaptureRequest: InteractionCaptureRequest | null =
  interactionCaptureEnv
    ? (JSON.parse(interactionCaptureEnv) as InteractionCaptureRequest)
    : null;

/**
 * A normal visual comparison permits a small anti-aliasing tolerance. During
 * an explicitly approved update, make the comparison exact so Playwright
 * replaces a baseline even when the intended difference is below that normal
 * threshold (for example, one added icon in a tall ribbon capture).
 *
 * Tasks Shell stories tagged `tasks-reference-visual` compare against Superlist
 * captures (synced into the snapshot tree). Keep that gate tight so styling
 * drift fails the suite.
 */
const screenshotExpectationOptions = isBaselineUpdate
  ? { maxDiffPixelRatio: 0 }
  : {};

/**
 * Tasks Shell stories compare against Superlist full-viewport captures.
 * Keep chrome (canvas, system nav, workspace frame, title) under a tight
 * threshold. Mask fixture content that cannot match live Superlist pixels.
 */
const TASKS_REFERENCE_MASK_SELECTORS = [
  "[data-tasks-list]",
  "[data-tasks-composer]",
  "[data-tasks-nav-account]",
  "[data-tasks-nav-lists]",
  "[data-tasks-shell-detail]",
  "[data-tasks-destination-header] [role='note']",
  "[data-tasks-destination-utilities]",
  ".tasks-list-navigation__icon",
] as const;

const tasksReferenceExpectationOptions = {
  maxDiffPixelRatio: 0.001,
};

const favaReferenceExpectationOptions = {
  maxDiffPixelRatio: 0.001,
};

function loadCaptureMatrix(): CaptureMatrix {
  return JSON.parse(
    readFileSync(
      resolve("packages/tasks/reference/superlist/capture-matrix.json"),
      "utf8",
    ),
  ) as CaptureMatrix;
}

const captureMatrix = loadCaptureMatrix();
const matrixEntryByStoryId = new Map(
  captureMatrix.entries
    .filter((entry) => !entry.coverageOnly)
    .map((entry) => [entry.storyId, entry]),
);

function isTasksReferenceVisual(entry: StoryIndexEntry): boolean {
  return (entry.tags ?? []).includes(TASKS_REFERENCE_VISUAL_TAG);
}

function isFavaReferenceVisual(entry: StoryIndexEntry): boolean {
  return (entry.tags ?? []).includes(FAVA_REFERENCE_VISUAL_TAG);
}

function isReferenceVisual(entry: StoryIndexEntry): boolean {
  return isTasksReferenceVisual(entry) || isFavaReferenceVisual(entry);
}

function loadVisualStories(): StoryIndexEntry[] {
  const indexPath = resolve("storybook-static/index.json");
  const index = JSON.parse(readFileSync(indexPath, "utf8")) as StorybookIndex;
  return Object.values(index.entries)
    .filter((entry) => entry.type === "story")
    .filter((entry) => !(entry.tags ?? []).includes("skip-visual"))
    .sort((a, b) => a.id.localeCompare(b.id));
}

function looksLikePortalStory(storyId: string): boolean {
  return (
    storyId.includes("open-menu") ||
    storyId.includes("--open-") ||
    storyId.includes("dialog") ||
    storyId.includes("popover")
  );
}

/**
 * Union clip of #storybook-root and visible portals (menus/dialogs rendered
 * outside the root). Returns null when the tight first-child shot is enough.
 */
async function portalUnionClip(
  page: Page,
): Promise<{ x: number; y: number; width: number; height: number } | null> {
  return page.evaluate((portalSelector) => {
    const root = document.querySelector("#storybook-root");
    if (!root) return null;
    const rects: DOMRect[] = [root.getBoundingClientRect()];
    for (const el of document.querySelectorAll(portalSelector)) {
      if (!(el instanceof HTMLElement)) continue;
      if (root.contains(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      const style = getComputedStyle(el);
      if (style.visibility === "hidden" || style.display === "none") continue;
      rects.push(r);
    }
    if (rects.length < 2) return null;
    let left = Infinity;
    let top = Infinity;
    let right = -Infinity;
    let bottom = -Infinity;
    for (const r of rects) {
      left = Math.min(left, r.left);
      top = Math.min(top, r.top);
      right = Math.max(right, r.right);
      bottom = Math.max(bottom, r.bottom);
    }
    const x = Math.max(0, Math.floor(left));
    const y = Math.max(0, Math.floor(top));
    const width = Math.ceil(right - left);
    const height = Math.ceil(bottom - top);
    if (width < 1 || height < 1) return null;
    return { x, y, width, height };
  }, PORTAL_SELECTORS);
}

async function captureActualPng(
  page: Page,
  subject: Locator | null,
  clip: { x: number; y: number; width: number; height: number } | null,
  fullViewport: boolean,
): Promise<Buffer> {
  if (fullViewport) {
    return page.screenshot({
      fullPage: false,
      animations: "disabled",
      caret: "hide",
      scale: "device",
      type: "png",
    });
  }
  if (clip) {
    return page.screenshot({
      clip,
      animations: "disabled",
      caret: "hide",
      scale: "device",
      type: "png",
    });
  }
  if (subject) {
    return subject.screenshot({
      animations: "disabled",
      caret: "hide",
      scale: "device",
      type: "png",
    });
  }
  return page.screenshot({
    animations: "disabled",
    caret: "hide",
    scale: "device",
    type: "png",
  });
}

function writeSidecarForBaseline(
  story: StoryIndexEntry,
  baselinePath: string,
  status: "passed" | "failed",
  error: string | undefined,
  actualPng: Buffer | null,
): void {
  const outPath = sidecarJsonPath(baselinePath);
  const base = buildSidecarBase(story, status, error);
  if (!actualPng || !existsSync(baselinePath)) {
    writeVisualDiffSidecar(outPath, base);
    return;
  }
  try {
    const {
      actualPng: fittedActual,
      diffPng,
      ...metrics
    } = compareBaselineToActualPng(baselinePath, actualPng);
    const actualPath = actualPngPath(baselinePath);
    const heatmapPath = diffPngPath(baselinePath);
    writeFileSync(actualPath, fittedActual);
    writeFileSync(heatmapPath, diffPng);
    writeVisualDiffSidecar(outPath, {
      ...base,
      ...metrics,
      actualRel: snapshotPublicRel(actualPath, PACKAGE_ROOT),
      diffRel: snapshotPublicRel(heatmapPath, PACKAGE_ROOT),
    });
  } catch {
    writeVisualDiffSidecar(outPath, base);
  }
}

function writeSidecarForStory(
  story: StoryIndexEntry,
  status: "passed" | "failed",
  error: string | undefined,
  actualPng: Buffer | null,
): void {
  writeSidecarForBaseline(
    story,
    baselinePngPath(story, PACKAGE_ROOT),
    status,
    error,
    actualPng,
  );
}

function referenceViewportForStory(
  storyId: string,
): CaptureMatrixViewport | null {
  const entry = matrixEntryByStoryId.get(storyId);
  if (!entry) return null;
  return captureMatrix.viewports[entry.viewport] ?? null;
}

async function prepareStoryPage(
  page: Page,
  storyId: string,
  options?: { visualCaptureUntil?: string },
): Promise<void> {
  const params = new URLSearchParams({
    id: storyId,
    viewMode: "story",
  });
  if (options?.visualCaptureUntil) {
    params.set(VISUAL_CAPTURE_UNTIL_PARAM, options.visualCaptureUntil);
  }
  await page.goto(`/iframe.html?${params.toString()}`, {
    waitUntil: "networkidle",
  });

  const root = page.locator("#storybook-root");
  await expect(root).toBeVisible();
  await page.evaluate(async () => {
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
  });
}

async function settleAfterPlay(page: Page, storyId: string): Promise<void> {
  await page
    .waitForFunction(
      (id) => {
        const preparing = document.querySelector(
          ".sb-show-preparing-story, .sb-show-preparing-docs",
        );
        if (preparing) return false;
        if (id.includes("open-menu") || id.includes("--open-")) {
          return Boolean(
            document.querySelector(
              '[role="listbox"], [role="menu"], [data-state="open"]',
            ),
          );
        }
        if (id.includes("focused")) {
          return Boolean(
            document.querySelector(
              ':focus-visible, [data-ui-part="input-group"]:has([data-slot="input-group-control"]:focus-visible)',
            ),
          );
        }
        return true;
      },
      storyId,
      { timeout: 5000 },
    )
    .catch(() => {
      /* stories without overlays still screenshot */
    });

  await page.waitForTimeout(100);

  await page.evaluate(() => {
    const active = document.activeElement;
    if (active instanceof HTMLElement) active.blur();
  });
}

async function screenshotStorySubject(
  page: Page,
  story: StoryIndexEntry,
  snapshotPath: string[],
  expectOptions: { maxDiffPixelRatio?: number },
): Promise<{
  subject: Locator | null;
  clip: { x: number; y: number; width: number; height: number } | null;
  referenceVisual: boolean;
}> {
  const storyId = story.id;
  const tasksReferenceVisual = isTasksReferenceVisual(story);
  const favaReferenceVisual = isFavaReferenceVisual(story);
  const referenceVisual = tasksReferenceVisual || favaReferenceVisual;
  const root = page.locator("#storybook-root");

  let subject: Locator | null = null;
  let clip: { x: number; y: number; width: number; height: number } | null =
    null;

  if (tasksReferenceVisual) {
    const mask = TASKS_REFERENCE_MASK_SELECTORS.map((selector) =>
      page.locator(selector),
    );
    await expect(page).toHaveScreenshot(snapshotPath, {
      ...expectOptions,
      mask,
    });
  } else if (favaReferenceVisual) {
    await expect(page).toHaveScreenshot(snapshotPath, expectOptions);
  } else {
    const usePortalClip =
      looksLikePortalStory(storyId) ||
      (await page.locator(PORTAL_SELECTORS).count()) > 0;
    clip = usePortalClip ? await portalUnionClip(page) : null;
    if (!clip) {
      const childCount = await root.locator(":scope > *").count();
      subject = childCount > 0 ? root.locator(":scope > *").first() : root;
      await expect(subject).toBeVisible();
    }
    if (clip) {
      await expect(page).toHaveScreenshot(snapshotPath, {
        clip,
        ...expectOptions,
      });
    } else {
      await expect(subject!).toHaveScreenshot(snapshotPath, expectOptions);
    }
  }

  return { subject, clip, referenceVisual };
}

const stories = loadVisualStories();

test.describe("Storybook visual baselines", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const style = document.createElement("style");
      style.textContent = `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
          caret-color: transparent !important;
        }
      `;
      document.documentElement.appendChild(style);
    });
  });

  // Dedicated create/update of one mid-play interaction (from Visual Delta).
  if (interactionCaptureRequest) {
    const { storyId, stepId } = interactionCaptureRequest;
    const story = stories.find((entry) => entry.id === storyId);
    test(`${storyId}::interaction::${stepId}`, async ({ page }) => {
      test.setTimeout(60_000);
      if (!story) {
        throw new Error(`Unknown story for interaction capture: ${storyId}`);
      }
      if (isTasksReferenceVisual(story)) {
        throw new Error(
          `${storyId} uses Superlist reference baselines; interaction captures are not supported.`,
        );
      }

      await prepareStoryPage(page, storyId, { visualCaptureUntil: stepId });
      await page.waitForSelector(
        `html[${VISUAL_CAPTURE_READY_ATTR}="${stepId}"]`,
        { timeout: 30_000 },
      );
      await page.waitForTimeout(100);
      await page.evaluate(() => {
        const active = document.activeElement;
        if (active instanceof HTMLElement) active.blur();
      });

      const snapshotPath = interactionScreenshotRelativePath(
        story,
        stepId,
      ).split("/");
      let subject: Locator | null = null;
      let clip: {
        x: number;
        y: number;
        width: number;
        height: number;
      } | null = null;
      let status: "passed" | "failed" = "passed";
      let error: string | undefined;
      try {
        const shot = await screenshotStorySubject(
          page,
          story,
          snapshotPath,
          screenshotExpectationOptions,
        );
        subject = shot.subject;
        clip = shot.clip;
      } catch (err) {
        status = "failed";
        error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        const actualPng = await captureActualPng(
          page,
          subject,
          clip,
          false,
        ).catch(() => null);
        writeSidecarForBaseline(
          story,
          interactionBaselinePngPath(story, stepId, PACKAGE_ROOT),
          status,
          error,
          actualPng,
        );
      }
    });
    return;
  }

  for (const story of stories) {
    const storyId = story.id;
    const tasksReferenceVisual = isTasksReferenceVisual(story);
    const favaReferenceVisual = isFavaReferenceVisual(story);
    const referenceVisual = tasksReferenceVisual || favaReferenceVisual;
    test(storyId, async ({ page }) => {
      if (referenceVisual && isBaselineUpdate) {
        const instruction = tasksReferenceVisual
          ? "Re-sync with `pnpm --dir packages/tasks reference:sync-visual-baselines`"
          : "Run `FAVA_SCREEN_CAPTURE=1 pnpm beancount:screens:capture`";
        throw new Error(
          `${storyId} uses a protected reference baseline. ${instruction} instead of Playwright --update-snapshots.`,
        );
      }

      const viewport = tasksReferenceVisual
        ? referenceViewportForStory(storyId)
        : favaReferenceVisual
          ? { width: 1280, height: 900 }
          : null;
      if (viewport) {
        await page.setViewportSize(viewport);
      }

      await prepareStoryPage(page, storyId);
      await settleAfterPlay(page, storyId);

      const snapshotPath = screenshotRelativePath(story).split("/");
      const expectOptions = tasksReferenceVisual
        ? tasksReferenceExpectationOptions
        : favaReferenceVisual
          ? favaReferenceExpectationOptions
          : screenshotExpectationOptions;

      let subject: Locator | null = null;
      let clip: { x: number; y: number; width: number; height: number } | null =
        null;

      let status: "passed" | "failed" = "passed";
      let error: string | undefined;
      try {
        const shot = await screenshotStorySubject(
          page,
          story,
          snapshotPath,
          expectOptions,
        );
        subject = shot.subject;
        clip = shot.clip;
      } catch (err) {
        status = "failed";
        error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        const actualPng = await captureActualPng(
          page,
          subject,
          clip,
          referenceVisual,
        ).catch(() => null);
        writeSidecarForStory(story, status, error, actualPng);
      }
    });

    if (referenceVisual) continue;

    const interactions = listInteractionBaselinesOnDisk(story, PACKAGE_ROOT);
    for (const interaction of interactions) {
      test(`${storyId}::interaction::${interaction.stepId}`, async ({
        page,
      }) => {
        await prepareStoryPage(page, storyId, {
          visualCaptureUntil: interaction.stepId,
        });
        await page.waitForSelector(
          `html[${VISUAL_CAPTURE_READY_ATTR}="${interaction.stepId}"]`,
          { timeout: 30_000 },
        );
        await page.waitForTimeout(100);
        await page.evaluate(() => {
          const active = document.activeElement;
          if (active instanceof HTMLElement) active.blur();
        });

        const snapshotPath = interaction.screenshotRel.split("/");
        let subject: Locator | null = null;
        let clip: {
          x: number;
          y: number;
          width: number;
          height: number;
        } | null = null;
        let status: "passed" | "failed" = "passed";
        let error: string | undefined;
        try {
          const shot = await screenshotStorySubject(
            page,
            story,
            snapshotPath,
            screenshotExpectationOptions,
          );
          subject = shot.subject;
          clip = shot.clip;
        } catch (err) {
          status = "failed";
          error = err instanceof Error ? err.message : String(err);
          throw err;
        } finally {
          const actualPng = await captureActualPng(
            page,
            subject,
            clip,
            false,
          ).catch(() => null);
          writeSidecarForBaseline(
            story,
            interaction.pngAbs,
            status,
            error,
            actualPng,
          );
        }
      });
    }
  }
});
