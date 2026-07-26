#!/usr/bin/env tsx
import { createHash } from "node:crypto";
import {
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { chromium, type Page } from "@playwright/test";
import { PNG } from "pngjs";

type StoryIndexEntry = {
  id: string;
  name: string;
  title: string;
  type: "story" | "docs";
  tags?: string[];
};

type StoryIndex = {
  entries: Record<string, StoryIndexEntry>;
};

type CaptureScope = "component" | "viewport";
type ColourMode = "light" | "dark";

const EXPECTED_SOURCE_REVISION = "b06d1e3f58c3";
const VIEWPORT = { width: 1280, height: 900 } as const;
const DEVICE_SCALE_FACTOR = 3;
const FIXED_TIME = "2026-07-26T10:30:00.000Z";
const SOURCE_URL = process.env.CY0004_STORYBOOK_URL ?? "http://127.0.0.1:6006";
const sourceRoot =
  process.env.CY0004_SOURCE_ROOT ??
  "/Users/stevejuma/code/lapis-notes/.changeyard/workspaces/CY-0004/repo";
const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const referenceRoot = path.join(repoRoot, "reference/lapis/workspace-shell");
const v1Root = path.join(referenceRoot, "storybook");
const v2Root = path.join(referenceRoot, "storybook-v2");
const captureRoot = path.join(referenceRoot, "storybook-v2.capture");
const pluginStyles = {
  fmode: path.join(sourceRoot, "app-shell/plugins/fmode/src/lib/styles.css"),
  notifications: path.join(
    sourceRoot,
    "app-shell/plugins/notifications/src/lib/styles.css",
  ),
} as const;

function assertGuard(): void {
  if (process.env.CY0004_REFERENCE_UPDATE !== "1") {
    throw new Error(
      "Reference capture is guarded. Run pnpm workspace:lapis-reference:update.",
    );
  }
  const actualRevision = execFileSync(
    "jj",
    [
      "--no-pager",
      "--color=never",
      "log",
      "-r",
      "@-",
      "--no-graph",
      "-T",
      "commit_id.short(12)",
    ],
    { cwd: sourceRoot, encoding: "utf8" },
  ).trim();
  if (actualRevision !== EXPECTED_SOURCE_REVISION) {
    throw new Error(
      `CY-0004 must remain pinned to ${EXPECTED_SOURCE_REVISION}; received ${actualRevision}.`,
    );
  }
}

function sha256(bytes: string | Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

async function captureMedianPng(
  capture: () => Promise<Buffer>,
): Promise<Buffer> {
  const samples: PNG[] = [];
  for (let index = 0; index < 3; index += 1) {
    samples.push(PNG.sync.read(await capture()));
  }
  const [first] = samples;
  for (const sample of samples.slice(1)) {
    if (sample.width !== first.width || sample.height !== first.height) {
      throw new Error("CY-0004 screenshot samples changed geometry.");
    }
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

function sourceIdFromV1File(file: string): string {
  return file.replace(/-chromium-darwin\.png$/, "");
}

function parityStoryId(sourceStoryId: string): string {
  return `workspace-parity-cy-0004--${sourceStoryId
    .replace(/^workspace-shell-/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
}

function captureScope(storyId: string): CaptureScope {
  if (
    storyId.includes("-shell-full-shell-") ||
    storyId.includes("-demo-") ||
    storyId.includes("-settings") ||
    storyId.includes("-drag-and-drop-overlays-") ||
    storyId.includes("-plugins-") ||
    storyId.includes("-reference-parity-") ||
    storyId.includes("-public-framework--")
  ) {
    return "viewport";
  }
  return "component";
}

function injectedStyle(storyId: string): keyof typeof pluginStyles | null {
  if (storyId.includes("-plugins-f-mode")) return "fmode";
  if (storyId.includes("-plugins-notifications")) return "notifications";
  return null;
}

async function loadStoryIndex(): Promise<StoryIndex> {
  const response = await fetch(`${SOURCE_URL}/index.json`);
  if (!response.ok) {
    throw new Error(
      `CY-0004 Storybook is not ready at ${SOURCE_URL}: ${response.status}.`,
    );
  }
  return (await response.json()) as StoryIndex;
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
      document.body != null &&
      document.querySelector(
        ".sb-show-preparing-story, .sb-show-preparing-docs",
      ) == null,
  );
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
  });
}

async function applySourceTheme(
  page: Page,
  colourMode: ColourMode,
): Promise<void> {
  await page.evaluate((mode) => {
    document.documentElement.classList.toggle("dark", mode === "dark");
    document.documentElement.classList.toggle("light", mode === "light");
    for (const root of document.querySelectorAll<HTMLElement>(
      "[data-workspace-theme], .workspace-shell",
    )) {
      root.classList.toggle("dark", mode === "dark");
      root.classList.toggle("theme-dark", mode === "dark");
      root.classList.toggle("light", mode === "light");
      root.classList.toggle("theme-light", mode === "light");
      root.setAttribute("data-workspace-theme", mode);
    }
  }, colourMode);
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
}

async function writeJson(file: string, value: unknown): Promise<void> {
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
}

async function main(): Promise<void> {
  assertGuard();
  const index = await loadStoryIndex();
  const sourceStories = Object.values(index.entries)
    .filter((entry) => entry.type === "story")
    .sort((left, right) => left.id.localeCompare(right.id));
  if (sourceStories.length !== 79) {
    throw new Error(
      `Expected 79 CY-0004 stories, received ${sourceStories.length}.`,
    );
  }

  const v1Files = (await readdir(v1Root))
    .filter((file) => file.endsWith(".png"))
    .sort();
  if (v1Files.length !== 52) {
    throw new Error(
      `Expected 52 immutable v1 images, received ${v1Files.length}.`,
    );
  }
  const canonicalIds = new Set(v1Files.map(sourceIdFromV1File));
  for (const sourceId of canonicalIds) {
    if (!index.entries[sourceId]) {
      throw new Error(`v1 references unknown source story ${sourceId}.`);
    }
  }

  const [fmodeCss, notificationsCss] = await Promise.all([
    readFile(pluginStyles.fmode, "utf8"),
    readFile(pluginStyles.notifications, "utf8"),
  ]);
  const injectedCss = { fmode: fmodeCss, notifications: notificationsCss };
  const injectedCssHashes = {
    fmode: sha256(fmodeCss),
    notifications: sha256(notificationsCss),
  };

  await rm(captureRoot, { recursive: true, force: true });
  await Promise.all(
    (["light", "dark"] as const).map((mode) =>
      mkdir(path.join(captureRoot, mode), { recursive: true }),
    ),
  );

  let chromiumVersion = "";
  const captures: Array<{
    storyId: string;
    colourMode: ColourMode;
    file: string;
    scope: CaptureScope;
    injectedCss: keyof typeof pluginStyles | null;
    sha256: string;
  }> = [];

  for (const colourMode of ["light", "dark"] as const) {
    for (const storyId of [...canonicalIds].sort()) {
      const browser = await chromium.launch();
      chromiumVersion ||= browser.version();
      try {
        const context = await browser.newContext({
          viewport: VIEWPORT,
          deviceScaleFactor: DEVICE_SCALE_FACTOR,
          colorScheme: colourMode,
          locale: "en-GB",
          timezoneId: "Europe/London",
        });
        try {
          const page = await context.newPage();
          const fixedTime = Date.parse(FIXED_TIME);
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
                style.dataset.cy0004Capture = "true";
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
          const scope = captureScope(storyId);
          const styleKey = injectedStyle(storyId);
          const params = new URLSearchParams({
            id: storyId,
            viewMode: "story",
            globals: `colorMode:${colourMode}`,
            args: `theme:${colourMode}`,
          });
          await page.goto(`${SOURCE_URL}/iframe.html?${params}`, {
            waitUntil: "networkidle",
          });
          if (styleKey) {
            await page.addStyleTag({
              content: injectedCss[styleKey],
            });
          }
          await waitForStory(page, storyId);
          await applySourceTheme(page, colourMode);
          const observedClock = await page.evaluate(() => ({
            observedTime: Date.now(),
            expectedMarker: (
              globalThis as typeof globalThis & {
                __CY0004_FIXED_TIME__?: number;
              }
            ).__CY0004_FIXED_TIME__,
            dateName: Date.name,
          }));
          const expectedTime = Date.parse(FIXED_TIME);
          if (
            observedClock.observedTime !== expectedTime ||
            observedClock.expectedMarker !== expectedTime
          ) {
            throw new Error(
              `CY-0004 fixed-time guard failed for ${storyId}: expected ${expectedTime}, received ${JSON.stringify(observedClock)}.`,
            );
          }
          if (styleKey) {
            await page.evaluate(
              () =>
                new Promise<void>((resolve) => {
                  window.dispatchEvent(new Event("resize"));
                  requestAnimationFrame(() =>
                    requestAnimationFrame(() => resolve()),
                  );
                }),
            );
          }
          await page.waitForTimeout(100);
          const fileName = `${storyId}-chromium-darwin.png`;
          const output = path.join(captureRoot, colourMode, fileName);
          let screenshot: Buffer;
          if (scope === "viewport") {
            screenshot = await captureMedianPng(() =>
              page.screenshot({
                animations: "disabled",
                caret: "hide",
              }),
            );
          } else {
            const root = page.locator("#storybook-root > *").first();
            if (!(await root.isVisible())) {
              throw new Error(`Component root is not visible for ${storyId}.`);
            }
            screenshot = await captureMedianPng(() =>
              root.screenshot({
                animations: "disabled",
                caret: "hide",
              }),
            );
          }
          await writeFile(output, screenshot);
          captures.push({
            storyId,
            colourMode,
            file: `${colourMode}/${fileName}`,
            scope,
            injectedCss: styleKey,
            sha256: sha256(screenshot),
          });
        } finally {
          await context.close();
        }
      } finally {
        await browser.close();
      }
    }
  }

  const crosswalk = sourceStories.map((story) => {
    const canonical = canonicalIds.has(story.id);
    return {
      sourceStoryId: story.id,
      sourceTitle: story.title,
      sourceName: story.name,
      coverage: canonical ? "new-parity-story" : "interaction-only",
      targetStoryId: canonical ? parityStoryId(story.id) : null,
      reason: canonical
        ? "Canonical v2 visual scene rendered through the public Workspace API."
        : "Source story has interaction coverage but no immutable v1 visual.",
    };
  });

  const inventoryText = captures
    .sort((left, right) => left.file.localeCompare(right.file))
    .map((capture) => `${capture.sha256}  ${capture.file}`)
    .join("\n");
  const manifest = {
    schemaVersion: 2,
    sourceSnapshotRevision: EXPECTED_SOURCE_REVISION,
    canonicalStoryCount: canonicalIds.size,
    interactionOnlyStoryCount: sourceStories.length - canonicalIds.size,
    stories: captures,
  };
  await writeJson(path.join(captureRoot, "manifest.json"), manifest);
  await writeJson(path.join(captureRoot, "crosswalk.json"), {
    schemaVersion: 1,
    sourceSnapshotRevision: EXPECTED_SOURCE_REVISION,
    sourceStoryCount: sourceStories.length,
    entries: crosswalk,
  });
  await writeJson(path.join(captureRoot, "provenance.json"), {
    schemaVersion: 2,
    source: "Standalone CY-0004 workspace-shell Storybook",
    sourceSnapshotRevision: EXPECTED_SOURCE_REVISION,
    sourceUrl: SOURCE_URL,
    capture: {
      chromiumVersion,
      viewport: VIEWPORT,
      deviceScaleFactor: DEVICE_SCALE_FACTOR,
      colourModes: ["light", "dark"],
      themeApplication:
        "Storybook colorMode plus explicit source shell light/dark classes",
      fixedTime: FIXED_TIME,
      animations: "disabled",
      fonts: "awaited",
      storyFinished: "required",
      scope: "explicit per story",
      browserIsolation: "one Chromium process per story and colour mode",
      rasterSampling: "per-channel median of three same-context screenshots",
    },
    injectedCssHashes,
    assetCount: captures.length,
    inventorySha256: sha256(`${inventoryText}\n`),
    v1CanonicalImmutable: true,
    updateGuard: "CY0004_REFERENCE_UPDATE=1",
  });
  await rm(v2Root, { recursive: true, force: true });
  await rename(captureRoot, v2Root);

  console.log(
    `Captured ${captures.length} v2 references from ${canonicalIds.size} stories.`,
  );
}

await main();
