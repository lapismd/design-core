import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Page } from "playwright";

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

const safeSemanticPrefixes = [
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
  "private",
  "shared",
  "meetings",
  "tasks ui reference",
  "review the launch brief",
  "sketch the mobile task flow",
  "prepare the empty-state copy",
  "publish the release checklist",
];

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
 * Flutter exposes meaningful content in aria-labelled semantics nodes. Cover every
 * label that is not a generic control or the synthetic fixture before capture.
 */
export async function installRedactionOverlay(
  page: Page,
): Promise<() => Promise<void>> {
  const regions = await page
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
        return [
          {
            left: Math.max(0, rect.left),
            top: Math.max(0, rect.top),
            width:
              Math.min(window.innerWidth, rect.right) - Math.max(0, rect.left),
            height:
              Math.min(window.innerHeight, rect.bottom) - Math.max(0, rect.top),
          },
        ];
      });
    }, safeSemanticPrefixes);

  const overlayId = "tasks-reference-redactions";
  await page.evaluate(
    ({ id, redactions }) => {
      document.getElementById(id)?.remove();
      const root = document.createElement("div");
      root.id = id;
      root.setAttribute("aria-hidden", "true");
      root.style.cssText =
        "position:fixed;inset:0;pointer-events:none;z-index:2147483647";
      for (const rect of redactions) {
        const cover = document.createElement("div");
        cover.style.cssText = [
          "position:absolute",
          `left:${rect.left}px`,
          `top:${rect.top}px`,
          `width:${rect.width}px`,
          `height:${rect.height}px`,
          "border-radius:4px",
          "background:linear-gradient(135deg,#d9dee8,#cfd6e2)",
        ].join(";");
        root.append(cover);
      }
      document.body.append(root);
    },
    { id: overlayId, redactions: regions },
  );

  return async () => {
    await page.evaluate(
      (id) => document.getElementById(id)?.remove(),
      overlayId,
    );
  };
}

export async function screenshotRedacted(
  page: Page,
  file: string,
): Promise<void> {
  await ensureDirectory(path.dirname(file));
  const remove = await installRedactionOverlay(page);
  try {
    await page.screenshot({ path: file, animations: "disabled" });
  } finally {
    await remove();
  }
}

/** Flutter's web app starts with a one-pixel accessibility activation control. */
export async function enableFlutterSemantics(page: Page): Promise<void> {
  const enable = page.locator(
    'flt-semantics-placeholder[aria-label="Enable accessibility"]',
  );
  if (await enable.count()) {
    await enable.press("Enter").catch(() => undefined);
  }
  await page.waitForTimeout(200);
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
