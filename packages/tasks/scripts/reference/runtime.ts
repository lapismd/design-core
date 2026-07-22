import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Page } from "playwright";
import {
  TASKS_REFERENCE_LIST_NAME,
  taskFixtures,
} from "../../src/lib/fixtures.js";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const execFileAsync = promisify(execFile);

export const tasksPackageRoot = path.resolve(scriptDirectory, "../..");
export const authStatePath = path.join(
  tasksPackageRoot,
  ".auth/storage-state.json",
);
export const artifactRoot = path.join(tasksPackageRoot, ".reference-artifacts");
export const committedReferenceRoot = path.join(
  tasksPackageRoot,
  "reference/superlist",
);
export const sourceUrl =
  process.env.SUPERLIST_REFERENCE_URL ?? "https://app.superlist.com/";

const genericSemanticPrefixes = [
  "enable accessibility",
  "inbox",
  "today",
  "tasks",
  "updates",
  "lists",
  "new task",
  "add task",
  "share",
  "filter",
  "sort",
  "more",
  "close",
  "back",
  "complete",
  "completed",
  "due",
  "assignee",
  "priority",
  "label",
  "search",
  "all",
  "synthetic task fixture",
  "reference lists",
];

const safeSemanticPrefixes = [
  ...genericSemanticPrefixes,
  TASKS_REFERENCE_LIST_NAME,
  ...taskFixtures.map((task) => task.title),
].map((label) => label.toLocaleLowerCase());

export function isAllowedSemanticLabel(label: string): boolean {
  const normalised = label.trim().toLocaleLowerCase();
  return safeSemanticPrefixes.some((prefix) => normalised.startsWith(prefix));
}

export async function fileExists(file: string): Promise<boolean> {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

export async function ensureDirectory(directory: string): Promise<void> {
  await mkdir(directory, { recursive: true });
}

export async function sha256(file: string): Promise<string> {
  return createHash("sha256")
    .update(await readFile(file))
    .digest("hex");
}

/**
 * Capture only approved fixture labels. This fails closed rather than producing
 * opaque replacement bars that would compromise the visual reference.
 */
export async function assertFixtureOnlyPage(page: Page): Promise<void> {
  const unapproved = await page
    .locator("[aria-label]")
    .evaluateAll((nodes, allowedPrefixes) => {
      const allowed = allowedPrefixes as string[];
      return nodes.flatMap((node) => {
        const element = node as HTMLElement;
        const label =
          element.getAttribute("aria-label")?.trim().toLocaleLowerCase() ?? "";
        const rect = element.getBoundingClientRect();
        const permitted = allowed.some((prefix) => label.startsWith(prefix));
        if (
          !label ||
          permitted ||
          rect.width < 3 ||
          rect.height < 3 ||
          rect.right <= 0 ||
          rect.bottom <= 0 ||
          rect.left >= window.innerWidth ||
          rect.top >= window.innerHeight
        ) {
          return [];
        }
        return [label];
      });
    }, safeSemanticPrefixes);
  if (unapproved.length) {
    throw new Error(
      `Refusing capture with unapproved semantic labels: ${[
        ...new Set(unapproved),
      ]
        .slice(0, 5)
        .join(", ")}`,
    );
  }
}

export async function screenshotFixture(
  page: Page,
  file: string,
): Promise<void> {
  await ensureDirectory(path.dirname(file));
  await assertFixtureOnlyPage(page);
  await page.screenshot({ path: file, animations: "disabled" });
}

/** Flutter's web app starts with a one-pixel accessibility activation control. */
export async function enableFlutterSemantics(page: Page): Promise<void> {
  const enable = page.locator(
    'flt-semantics-placeholder[aria-label="Enable accessibility"]',
  );
  if (await enable.count()) {
    await enable.click({ force: true }).catch(() => undefined);
    await enable.press("Enter").catch(() => undefined);
  }
  // Some Superlist builds expose the control without the placeholder attribute.
  const fallback = page.getByLabel(/^Enable accessibility$/i);
  if (await fallback.count()) {
    await fallback
      .first()
      .click({ force: true })
      .catch(() => undefined);
  }
  await page.waitForTimeout(250);
}

export async function openSource(page: Page): Promise<void> {
  await page.goto(sourceUrl, { waitUntil: "domcontentloaded" });
  await enableFlutterSemantics(page);
  await page.waitForTimeout(500);
}

export async function writeJson(file: string, value: unknown): Promise<void> {
  await ensureDirectory(path.dirname(file));
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
}

export async function dispatchTouchSwipe(
  page: Page,
  from: { x: number; y: number },
  to: { x: number; y: number },
  durationMs: number,
): Promise<void> {
  const session = await page.context().newCDPSession(page);
  const steps = Math.max(3, Math.round(durationMs / 16));
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: from.x, y: from.y, id: 1 }],
  });
  for (let step = 1; step < steps; step++) {
    const progress = step / steps;
    await session.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [
        {
          x: from.x + (to.x - from.x) * progress,
          y: from.y + (to.y - from.y) * progress,
          id: 1,
        },
      ],
    });
    await page.waitForTimeout(16);
  }
  await session.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
}

/** Creates an inspectable two-or-more-frame contact sheet without committing raw video. */
export async function createContactSheet(
  keyframes: readonly string[],
  output: string,
): Promise<void> {
  if (keyframes.length < 2) return;
  await ensureDirectory(path.dirname(output));
  const inputs = keyframes.flatMap((file) => ["-i", file]);
  await execFileAsync("ffmpeg", [
    "-y",
    ...inputs,
    "-filter_complex",
    `hstack=inputs=${keyframes.length}`,
    "-frames:v",
    "1",
    output,
  ]);
}
