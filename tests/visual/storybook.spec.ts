/**
 * Catalog visual suite (nested-import paths and sidecars). Portable hosts
 * should use `defineVisualSuite()` from
 * `storybook-addon-visual-delta/playwright` instead — see `visual-delta init`.
 */
import { expect, test, type Locator, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  baselinePngPath,
  VISUAL_SNAPSHOT_DIR,
} from "../../scripts/ui-generator/visual/diff-result.js";
import { writeDiffArtifactsForBaseline } from "../../packages/storybook-addon-visual-delta/src/playwright/write-diff-artifacts.js";
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
  VISUAL_CAPTURE_CALL_PARAM,
  VISUAL_CAPTURE_READY_ATTR,
  VISUAL_CAPTURE_UNTIL_PARAM,
  instrumenterCallIdForInteraction,
} from "../../packages/storybook-addon-visual-delta/src/shared/interaction-capture.js";
import {
  VISUAL_DELTA_ALIGN_ATTR,
  VISUAL_DELTA_CROP_ATTR,
  VISUAL_DELTA_DELAY_ATTR,
  VISUAL_DELTA_DIFF_THRESHOLD_ATTR,
  VISUAL_DELTA_IGNORE_ATTR_LIST,
  VISUAL_DELTA_INCLUDE_AA_ATTR,
  VISUAL_DELTA_PASS_THRESHOLD_ATTR,
} from "../../packages/storybook-addon-visual-delta/src/shared/capture-params-attrs.js";
import { resolveIgnoreSelectors } from "../../packages/storybook-addon-visual-delta/src/shared/ignore.js";
import {
  settleVisualStoryPage,
  waitForVisualStoryFinished,
} from "../../packages/storybook-addon-visual-delta/src/playwright/readiness.js";
import { readVisualDeltaProjectConfig } from "../../packages/storybook-addon-visual-delta/src/node/project-config.js";

type StorybookIndex = {
  entries: Record<string, StoryIndexEntry>;
};

type InteractionCaptureRequest = {
  storyId: string;
  stepId: string;
  stepLabel?: string;
  captureCallId?: string;
};

const PORTAL_SELECTORS = [
  '[role="dialog"]',
  '[role="listbox"]',
  '[role="menu"]',
  '[data-state="open"]',
].join(", ");

const PACKAGE_ROOT = resolve(".");
const PROJECT_DEFAULTS = readVisualDeltaProjectConfig(PACKAGE_ROOT).defaults;
const isBaselineUpdate = process.env.PLAYWRIGHT_UPDATE_SNAPSHOTS === "1";

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
 */
const screenshotExpectationOptions = isBaselineUpdate
  ? { maxDiffPixelRatio: 0 }
  : {};

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
  captureConfig: EffectiveCaptureOptions,
) {
  return writeDiffArtifactsForBaseline({
    entry: story,
    packageRoot: PACKAGE_ROOT,
    snapshotDir: VISUAL_SNAPSHOT_DIR,
    mode: "nested-import",
    baselinePngAbsPath: baselinePath,
    status,
    error,
    actualPng,
    passThresholdPercent: captureConfig.passThresholdPercent,
    diffThreshold: captureConfig.diffThreshold,
    includeAntiAliasing: captureConfig.includeAntiAliasing,
    captureConfig: {
      ...captureConfig,
      viewport: { width: 1280, height: 900 },
      deviceScaleFactor: 3,
    },
  });
}

function writeSidecarForStory(
  story: StoryIndexEntry,
  status: "passed" | "failed",
  error: string | undefined,
  actualPng: Buffer | null,
  captureConfig: EffectiveCaptureOptions,
) {
  return writeSidecarForBaseline(
    story,
    baselinePngPath(story, PACKAGE_ROOT),
    status,
    error,
    actualPng,
    captureConfig,
  );
}

async function prepareStoryPage(
  page: Page,
  storyId: string,
  options?: {
    visualCaptureUntil?: string;
    visualCaptureCallId?: string;
  },
): Promise<void> {
  const params = new URLSearchParams({
    id: storyId,
    viewMode: "story",
  });
  if (options?.visualCaptureUntil) {
    params.set(VISUAL_CAPTURE_UNTIL_PARAM, options.visualCaptureUntil);
  }
  if (options?.visualCaptureCallId) {
    params.set(VISUAL_CAPTURE_CALL_PARAM, options.visualCaptureCallId);
    params.set("instrument", "true");
  }
  await page.goto(`/iframe.html?${params.toString()}`, {
    waitUntil: "networkidle",
  });

  const root = page.locator("#storybook-root");
  await expect(root).toBeVisible();
  if (!options?.visualCaptureUntil) {
    await waitForVisualStoryFinished(page, storyId);
  }
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

  const options = await visualDeltaCaptureOptions(page);
  await settleVisualStoryPage(page, { delay: options.delay });
}

type EffectiveCaptureOptions = {
  maskSelectors: string[];
  cropToViewport: boolean;
  passThresholdPercent: number;
  diffThreshold: number;
  includeAntiAliasing: boolean;
  delay: number;
  align: "viewport" | "canvas";
};

function defaultCaptureOptions(): EffectiveCaptureOptions {
  return {
    maskSelectors: [],
    cropToViewport: PROJECT_DEFAULTS.cropToViewport,
    passThresholdPercent: PROJECT_DEFAULTS.passThresholdPercent,
    diffThreshold: PROJECT_DEFAULTS.diffThreshold,
    includeAntiAliasing: PROJECT_DEFAULTS.diffIncludeAntiAliasing,
    delay: PROJECT_DEFAULTS.delay,
    align: "viewport",
  };
}

async function visualDeltaCaptureOptions(
  page: Page,
): Promise<EffectiveCaptureOptions> {
  const raw = await page.evaluate(
    (attrs: {
      ignore: string;
      crop: string;
      pass: string;
      diff: string;
      includeAA: string;
      delay: string;
      align: string;
    }) => {
      const root = document.documentElement;
      return {
        ignore: root.getAttribute(attrs.ignore),
        crop: root.getAttribute(attrs.crop),
        pass: root.getAttribute(attrs.pass),
        diff: root.getAttribute(attrs.diff),
        includeAA: root.getAttribute(attrs.includeAA),
        delay: root.getAttribute(attrs.delay),
        align: root.getAttribute(attrs.align),
      };
    },
    {
      ignore: VISUAL_DELTA_IGNORE_ATTR_LIST,
      crop: VISUAL_DELTA_CROP_ATTR,
      pass: VISUAL_DELTA_PASS_THRESHOLD_ATTR,
      diff: VISUAL_DELTA_DIFF_THRESHOLD_ATTR,
      includeAA: VISUAL_DELTA_INCLUDE_AA_ATTR,
      delay: VISUAL_DELTA_DELAY_ATTR,
      align: VISUAL_DELTA_ALIGN_ATTR,
    },
  );
  return {
    maskSelectors: raw.ignore ? raw.ignore.split("\n").filter(Boolean) : [],
    cropToViewport:
      raw.crop == null
        ? PROJECT_DEFAULTS.cropToViewport
        : raw.crop === "1" || raw.crop === "true",
    passThresholdPercent:
      raw.pass == null
        ? PROJECT_DEFAULTS.passThresholdPercent
        : Number(raw.pass),
    diffThreshold:
      raw.diff == null ? PROJECT_DEFAULTS.diffThreshold : Number(raw.diff),
    includeAntiAliasing:
      raw.includeAA == null
        ? PROJECT_DEFAULTS.diffIncludeAntiAliasing
        : raw.includeAA === "1" || raw.includeAA === "true",
    delay: raw.delay == null ? PROJECT_DEFAULTS.delay : Number(raw.delay),
    align: raw.align === "canvas" ? "canvas" : "viewport",
  };
}

async function screenshotStorySubject(
  page: Page,
  story: StoryIndexEntry,
  snapshotPath: string[],
  expectOptions: { maxDiffPixelRatio?: number },
  target: {
    subject: Locator | null;
    clip: { x: number; y: number; width: number; height: number } | null;
  },
): Promise<{
  subject: Locator | null;
  clip: { x: number; y: number; width: number; height: number } | null;
}> {
  const storyId = story.id;
  const root = page.locator("#storybook-root");
  const vdOptions = await visualDeltaCaptureOptions(page);
  const csfMask = resolveIgnoreSelectors(vdOptions.maskSelectors).map(
    (selector) => page.locator(selector),
  );
  const passRatio = !isBaselineUpdate
    ? { maxDiffPixelRatio: vdOptions.passThresholdPercent / 100 }
    : {};
  const mergedExpect = {
    ...expectOptions,
    ...passRatio,
    threshold: vdOptions.diffThreshold,
  };

  target.subject = null;
  target.clip = null;

  if (vdOptions.cropToViewport) {
    await expect(page).toHaveScreenshot(snapshotPath, {
      ...mergedExpect,
      ...(csfMask.length > 0 ? { mask: csfMask } : {}),
    });
  } else {
    const usePortalClip =
      looksLikePortalStory(storyId) ||
      (await page.locator(PORTAL_SELECTORS).count()) > 0;
    target.clip = usePortalClip ? await portalUnionClip(page) : null;
    if (!target.clip) {
      const childCount = await root.locator(":scope > *").count();
      target.subject =
        childCount > 0 ? root.locator(":scope > *").first() : root;
      await expect(target.subject).toBeVisible();
    }
    if (target.clip) {
      await expect(page).toHaveScreenshot(snapshotPath, {
        clip: target.clip,
        ...mergedExpect,
        ...(csfMask.length > 0 ? { mask: csfMask } : {}),
      });
    } else {
      await expect(target.subject!).toHaveScreenshot(snapshotPath, {
        ...mergedExpect,
        ...(csfMask.length > 0 ? { mask: csfMask } : {}),
      });
    }
  }

  return target;
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
      await prepareStoryPage(page, storyId, {
        visualCaptureUntil: stepId,
        visualCaptureCallId: interactionCaptureRequest.captureCallId,
      });
      await page.waitForSelector(
        `html[${VISUAL_CAPTURE_READY_ATTR}="${stepId}"]`,
        { timeout: 30_000 },
      );
      const captureOptions = await visualDeltaCaptureOptions(page);
      await settleVisualStoryPage(page, { delay: captureOptions.delay });

      const snapshotPath = interactionScreenshotRelativePath(
        story,
        stepId,
      ).split("/");
      const target: {
        subject: Locator | null;
        clip: {
          x: number;
          y: number;
          width: number;
          height: number;
        } | null;
      } = { subject: null, clip: null };
      let status: "passed" | "failed" = "passed";
      let error: string | undefined;
      let classificationError: string | null = null;
      try {
        await screenshotStorySubject(
          page,
          story,
          snapshotPath,
          screenshotExpectationOptions,
          target,
        );
      } catch (err) {
        status = "failed";
        error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        const actualPng = await captureActualPng(
          page,
          target.subject,
          target.clip,
          false,
        ).catch(() => null);
        const sidecar = writeSidecarForBaseline(
          story,
          interactionBaselinePngPath(story, stepId, PACKAGE_ROOT),
          status,
          error,
          actualPng,
          captureOptions,
        );
        if (status === "passed" && !sidecar.passed) {
          classificationError =
            sidecar.error ??
            `Visual comparison outcome: ${sidecar.outcome ?? "mismatch"}`;
        }
      }
      if (classificationError) throw new Error(classificationError);
    });
    return;
  }

  for (const story of stories) {
    const storyId = story.id;
    test(storyId, async ({ page }) => {
      await prepareStoryPage(page, storyId);
      await settleAfterPlay(page, storyId);

      const snapshotPath = screenshotRelativePath(story).split("/");
      const target: {
        subject: Locator | null;
        clip: { x: number; y: number; width: number; height: number } | null;
      } = { subject: null, clip: null };

      let status: "passed" | "failed" = "passed";
      let error: string | undefined;
      let classificationError: string | null = null;
      try {
        await screenshotStorySubject(
          page,
          story,
          snapshotPath,
          screenshotExpectationOptions,
          target,
        );
      } catch (err) {
        status = "failed";
        error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        const actualPng = await captureActualPng(
          page,
          target.subject,
          target.clip,
          false,
        ).catch(() => null);
        const vdOptions = await visualDeltaCaptureOptions(page).catch(() =>
          defaultCaptureOptions(),
        );
        const sidecar = writeSidecarForStory(
          story,
          status,
          error,
          actualPng,
          vdOptions,
        );
        if (status === "passed" && !sidecar.passed) {
          classificationError =
            sidecar.error ??
            `Visual comparison outcome: ${sidecar.outcome ?? "mismatch"}`;
        }
      }
      if (classificationError) throw new Error(classificationError);
    });

    const interactions = listInteractionBaselinesOnDisk(story, PACKAGE_ROOT);
    for (const interaction of interactions) {
      test(`${storyId}::interaction::${interaction.stepId}`, async ({
        page,
      }) => {
        await prepareStoryPage(page, storyId, {
          visualCaptureUntil: interaction.stepId,
          visualCaptureCallId:
            instrumenterCallIdForInteraction(storyId, interaction.stepId) ??
            undefined,
        });
        await page.waitForSelector(
          `html[${VISUAL_CAPTURE_READY_ATTR}="${interaction.stepId}"]`,
          { timeout: 30_000 },
        );
        const captureOptions = await visualDeltaCaptureOptions(page);
        await settleVisualStoryPage(page, { delay: captureOptions.delay });

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
        let classificationError: string | null = null;
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
          const sidecar = writeSidecarForBaseline(
            story,
            interaction.pngAbs,
            status,
            error,
            actualPng,
            captureOptions,
          );
          if (status === "passed" && !sidecar.passed) {
            classificationError =
              sidecar.error ??
              `Visual comparison outcome: ${sidecar.outcome ?? "mismatch"}`;
          }
        }
        if (classificationError) throw new Error(classificationError);
      });
    }
  }
});
