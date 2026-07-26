import { expect, test, type Page } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

type CrosswalkEntry = {
  sourceStoryId: string;
  targetStoryId: string | null;
  coverage: "new-parity-story" | "interaction-only";
};

type Crosswalk = {
  entries: CrosswalkEntry[];
};

type SourceCapture = {
  storyId: string;
  colourMode: "light" | "dark";
  file: string;
  scope: "component" | "viewport";
};

type SourceManifest = {
  stories: SourceCapture[];
};

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const referenceRoot = path.join(
  repoRoot,
  "reference/lapis/workspace-shell/storybook-v2",
);
const artifactsRoot = path.join(
  repoRoot,
  "test-results/workspace-lapis-parity",
);
const crosswalk = JSON.parse(
  await readFile(path.join(referenceRoot, "crosswalk.json"), "utf8"),
) as Crosswalk;
const manifest = JSON.parse(
  await readFile(path.join(referenceRoot, "manifest.json"), "utf8"),
) as SourceManifest;
const canonical = crosswalk.entries.filter(
  (
    entry,
  ): entry is CrosswalkEntry & {
    targetStoryId: string;
    coverage: "new-parity-story";
  } => entry.coverage === "new-parity-story" && entry.targetStoryId !== null,
);
const captures = new Map(
  manifest.stories.map((capture) => [
    `${capture.storyId}:${capture.colourMode}`,
    capture,
  ]),
);
const requestedStory = process.env.CY0004_PARITY_STORY;
const selected = requestedStory
  ? canonical.filter(
      (entry) =>
        entry.sourceStoryId === requestedStory ||
        entry.targetStoryId === requestedStory,
    )
  : canonical;
const fixedTime = Date.parse("2026-07-26T10:30:00.000Z");

async function captureMedianPng(
  capture: () => Promise<Buffer>,
): Promise<Buffer> {
  const samples: PNG[] = [];
  for (let index = 0; index < 3; index += 1) {
    samples.push(PNG.sync.read(await capture()));
  }
  const [first] = samples;
  for (const sample of samples.slice(1)) {
    expect(
      { width: sample.width, height: sample.height },
      "candidate screenshot samples keep stable geometry",
    ).toEqual({ width: first.width, height: first.height });
  }
  const median = new PNG({ width: first.width, height: first.height });
  for (let offset = 0; offset < median.data.length; offset += 1) {
    const left = samples[0].data[offset];
    const middle = samples[1].data[offset];
    const right = samples[2].data[offset];
    median.data[offset] =
      left +
      middle +
      right -
      Math.min(left, middle, right) -
      Math.max(left, middle, right);
  }
  return PNG.sync.write(median);
}

async function waitForStory(page: Page, storyId: string): Promise<void> {
  await page.waitForFunction((id) => {
    const channel = (
      globalThis as typeof globalThis & {
        __STORYBOOK_ADDONS_CHANNEL__?: {
          last?: (
            eventName: string,
          ) => Array<{ storyId?: string; status?: string }> | undefined;
        };
      }
    ).__STORYBOOK_ADDONS_CHANNEL__;
    return (
      channel?.last?.("storyFinished")?.[0]?.storyId === id &&
      channel.last("storyFinished")?.[0]?.status === "success"
    );
  }, storyId);
  await page.waitForFunction(
    () =>
      document.querySelector(
        ".sb-show-preparing-story, .sb-show-preparing-docs",
      ) === null,
  );
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
  });
}

test.describe("CY-0004 live Workspace parity", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript({
      content: `
        (() => {
          const NativeDate = Date;
          const fixed = ${fixedTime};
          class FrozenDate extends NativeDate {
            constructor(...args) {
              super(...(args.length === 0 ? [fixed] : args));
            }
            static now() {
              return fixed;
            }
          }
          Object.defineProperty(globalThis, "Date", { value: FrozenDate });
          Object.defineProperty(globalThis, "__CY0004_FIXED_TIME__", {
            value: fixed,
          });
          const style = document.createElement("style");
          style.textContent = ${JSON.stringify(`
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
          caret-color: transparent !important;
        }
      `)};
          document.documentElement.append(style);
        })();
      `,
    });
  });

  for (const entry of selected) {
    for (const colourMode of ["light", "dark"] as const) {
      test(`${entry.sourceStoryId} ${colourMode}`, async ({ page }) => {
        const sourceCapture = captures.get(
          `${entry.sourceStoryId}:${colourMode}`,
        );
        expect(sourceCapture).toBeDefined();
        const params = new URLSearchParams({
          id: entry.targetStoryId,
          viewMode: "story",
          globals: `theme:lapis;colorMode:${colourMode}`,
        });
        await page.goto(`/iframe.html?${params}`, {
          waitUntil: "networkidle",
        });
        await waitForStory(page, entry.targetStoryId);
        await page
          .locator("[data-cy0004-parity-ready='true']")
          .waitFor({ state: "attached" });
        expect(
          await page.evaluate(() => ({
            observedTime: Date.now(),
            expectedMarker: (
              globalThis as typeof globalThis & {
                __CY0004_FIXED_TIME__?: number;
              }
            ).__CY0004_FIXED_TIME__,
          })),
          "target fixed-time guard",
        ).toEqual({
          observedTime: fixedTime,
          expectedMarker: fixedTime,
        });

        const targetBytes = await captureMedianPng(() =>
          sourceCapture!.scope === "viewport"
            ? page.screenshot({
                animations: "disabled",
                caret: "hide",
              })
            : page.locator("#storybook-root > *").first().screenshot({
                animations: "disabled",
                caret: "hide",
              }),
        );
        const sourceBytes = await readFile(
          path.join(referenceRoot, sourceCapture!.file),
        );
        const source = PNG.sync.read(sourceBytes);
        const target = PNG.sync.read(targetBytes);
        const width = Math.max(source.width, target.width);
        const height = Math.max(source.height, target.height);
        const diff = new PNG({ width, height });
        const comparable =
          source.width === target.width && source.height === target.height;
        const differingPixels = comparable
          ? pixelmatch(
              source.data,
              target.data,
              diff.data,
              source.width,
              source.height,
              { threshold: 0 },
            )
          : width * height;

        if (!comparable || differingPixels > 0) {
          const artifactDir = path.join(
            artifactsRoot,
            entry.sourceStoryId,
            colourMode,
          );
          await mkdir(artifactDir, { recursive: true });
          await Promise.all([
            writeFile(path.join(artifactDir, "source.png"), sourceBytes),
            writeFile(path.join(artifactDir, "target.png"), targetBytes),
            writeFile(path.join(artifactDir, "diff.png"), PNG.sync.write(diff)),
            writeFile(
              path.join(artifactDir, "dom.html"),
              await page.locator("#storybook-root").innerHTML(),
            ),
            writeFile(
              path.join(artifactDir, "state.json"),
              `${JSON.stringify(
                await page.evaluate(() => ({
                  layout: document
                    .querySelector("[data-app-shell-root]")
                    ?.getAttribute("data-workspace-layout"),
                  viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight,
                    deviceScaleFactor: window.devicePixelRatio,
                  },
                })),
                null,
                2,
              )}\n`,
            ),
          ]);
        }

        expect(
          {
            source: { width: source.width, height: source.height },
            target: { width: target.width, height: target.height },
          },
          "source and target capture geometry",
        ).toEqual({
          source: { width: source.width, height: source.height },
          target: { width: source.width, height: source.height },
        });
        expect(
          differingPixels,
          `zero-pixel parity; artifacts: ${path.relative(repoRoot, artifactsRoot)}`,
        ).toBe(0);
      });
    }
  }
});
