/**
 * Ingest Chrome MCP (or other) full-viewport Superlist PNGs from a staging
 * directory into the committed Visual Delta tree.
 *
 * Staging files are keyed by matrix entry id:
 *   <tmpdir>/page-desktop-task-detail-open.png
 *   <tmpdir>/comp-detail-open.png   (optional; cropped from page if missing)
 *
 * For component entries without a staged clip PNG, crops from the page PNG
 * named by `--from-page=<id>` or the first page entry sharing the same
 * viewport+page+nav fingerprint when `--ids` includes both.
 *
 *   pnpm --dir packages/tasks reference:ingest:delta -- --dir=$TMPDIR/tasks-live-chrome --ids=page-desktop-task-detail-open,comp-detail-open
 */
import { execFile } from "node:child_process";
import { copyFile, mkdir, readFile, readdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import {
  assertComponentClip,
  loadCaptureMatrix,
  type CaptureClip,
  type CaptureMatrixEntry,
} from "./capture-matrix.js";
import {
  committedReferenceRoot,
  ensureDirectory,
  fileExists,
  sha256,
  writeJson,
} from "./runtime.js";

const execFileAsync = promisify(execFile);

function parseArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const hit = process.argv.find((value) => value.startsWith(prefix));
  return hit?.slice(prefix.length);
}

function parseIds(): string[] | undefined {
  const raw = parseArg("ids");
  if (!raw) return undefined;
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

async function imageSize(
  file: string,
): Promise<{ width: number; height: number }> {
  const { stdout } = await execFileAsync("sips", [
    "-g",
    "pixelWidth",
    "-g",
    "pixelHeight",
    file,
  ]);
  const width = Number(stdout.match(/pixelWidth:\s*(\d+)/)?.[1]);
  const height = Number(stdout.match(/pixelHeight:\s*(\d+)/)?.[1]);
  if (!width || !height) throw new Error(`Could not read size for ${file}`);
  return { width, height };
}

async function cropClip(
  source: string,
  output: string,
  clip: CaptureClip,
  viewport: { width: number; height: number },
  deviceScaleFactor: number,
): Promise<void> {
  const sourceSize = await imageSize(source);
  const scaleX = sourceSize.width / viewport.width;
  const scaleY = sourceSize.height / viewport.height;
  const left = Math.max(0, Math.round(clip.x * scaleX));
  const top = Math.max(0, Math.round(clip.y * scaleY));
  const right = Math.min(
    sourceSize.width,
    left + Math.round(clip.width * scaleX),
  );
  const bottom = Math.min(
    sourceSize.height,
    top + Math.round(clip.height * scaleY),
  );
  const targetW = Math.round(clip.width * deviceScaleFactor);
  const targetH = Math.round(clip.height * deviceScaleFactor);
  await ensureDirectory(path.dirname(output));
  const tmp = `${output}.tmp.png`;
  // Pillow crop box is (left, top, right, bottom) — avoids sips cropOffset
  // axis ambiguity that can wrap the wrong strip into the clip.
  await execFileAsync("python3", [
    "-c",
    [
      "from PIL import Image",
      `im = Image.open(${JSON.stringify(source)})`,
      `crop = im.crop((${left}, ${top}, ${right}, ${bottom}))`,
      `crop = crop.resize((${targetW}, ${targetH}), Image.Resampling.LANCZOS)`,
      `crop.save(${JSON.stringify(tmp)})`,
    ].join("\n"),
  ]);
  await execFileAsync("mv", [tmp, output]);
}

async function resizePage(
  source: string,
  output: string,
  viewport: { width: number; height: number },
  deviceScaleFactor: number,
): Promise<void> {
  const targetW = Math.round(viewport.width * deviceScaleFactor);
  const targetH = Math.round(viewport.height * deviceScaleFactor);
  await ensureDirectory(path.dirname(output));
  const size = await imageSize(source);
  if (size.width === targetW && size.height === targetH) {
    await copyFile(source, output);
    return;
  }
  await execFileAsync("sips", [
    "-z",
    String(targetH),
    String(targetW),
    source,
    "--out",
    output,
  ]);
}

function stagingPath(stagingDir: string, entryId: string): string {
  return path.join(stagingDir, `${entryId}.png`);
}

async function main(): Promise<void> {
  const stagingDir =
    parseArg("dir") ?? path.join(os.tmpdir(), "tasks-live-chrome");
  const ids = parseIds();
  const fromPageId = parseArg("from-page");
  const matrix = await loadCaptureMatrix();
  const captureDirectory = path.join(
    committedReferenceRoot,
    matrix.captureId,
  );

  const selected = ids
    ? matrix.entries.filter((entry) => ids.includes(entry.id))
    : matrix.entries.filter((entry) =>
        fileExists(stagingPath(stagingDir, entry.id)).then(Boolean),
      );

  // fileExists is async — resolve selected properly
  let entries: CaptureMatrixEntry[];
  if (ids) {
    entries = matrix.entries.filter((entry) => ids.includes(entry.id));
    const missing = ids.filter((id) => !entries.some((entry) => entry.id === id));
    if (missing.length) {
      throw new Error(`Unknown matrix ids: ${missing.join(", ")}`);
    }
  } else {
    const staged = await readdir(stagingDir).catch(() => [] as string[]);
    const stagedIds = new Set(
      staged.filter((name) => name.endsWith(".png")).map((name) => name.slice(0, -4)),
    );
    let componentFromPage: Record<string, string> = {};
    try {
      componentFromPage = JSON.parse(
        await readFile(
          path.join(stagingDir, "component-from-page.json"),
          "utf8",
        ),
      ) as Record<string, string>;
    } catch {
      componentFromPage = {};
    }
    entries = matrix.entries.filter((entry) => {
      if (stagedIds.has(entry.id)) return true;
      if (entry.kind === "component") {
        const pageId = componentFromPage[entry.id];
        return Boolean(pageId && stagedIds.has(pageId));
      }
      return false;
    });
    if (!entries.length) {
      throw new Error(
        `No staged PNGs in ${stagingDir}. Pass --dir and/or --ids=…`,
      );
    }
  }

  const previousManifestPath = path.join(captureDirectory, "manifest.json");
  let previousScreenshots: Array<Record<string, unknown>> = [];
  let motions: unknown[] = [];
  try {
    const previous = JSON.parse(
      await readFile(previousManifestPath, "utf8"),
    ) as {
      screenshots?: Array<Record<string, unknown>>;
      motions?: unknown[];
    };
    previousScreenshots = previous.screenshots ?? [];
    motions = previous.motions ?? [];
  } catch {
    previousScreenshots = [];
    motions = [];
  }

  const updated = new Map<string, Record<string, unknown>>();

  for (const entry of entries) {
    const viewport = matrix.viewports[entry.viewport];
    if (!viewport) throw new Error(`Unknown viewport ${entry.viewport}`);
    assertComponentClip(entry, viewport, matrix.maxComponentViewportRatio);

    const output = path.join(captureDirectory, entry.file);
    await ensureDirectory(path.dirname(output));
    const staged = stagingPath(stagingDir, entry.id);
    const hasStaged = await fileExists(staged);

    if (entry.kind === "page") {
      if (!hasStaged) {
        throw new Error(`Missing staged page PNG: ${staged}`);
      }
      await resizePage(
        staged,
        output,
        viewport,
        matrix.deviceScaleFactor,
      );
    } else {
      if (!entry.clip) {
        throw new Error(`Component ${entry.id} missing clip`);
      }
      if (hasStaged) {
        await resizePage(
          staged,
          output,
          {
            width: entry.clip.width,
            height: entry.clip.height,
          },
          matrix.deviceScaleFactor,
        );
      } else {
        let componentFromPage: Record<string, string> = {};
        try {
          componentFromPage = JSON.parse(
            await readFile(
              path.join(stagingDir, "component-from-page.json"),
              "utf8",
            ),
          ) as Record<string, string>;
        } catch {
          componentFromPage = {};
        }
        const pageId =
          fromPageId ??
          componentFromPage[entry.id] ??
          entries.find(
            (candidate) =>
              candidate.kind === "page" &&
              candidate.viewport === entry.viewport &&
              candidate.page === entry.page,
          )?.id ??
          matrix.entries.find(
            (candidate) =>
              candidate.kind === "page" &&
              candidate.viewport === entry.viewport &&
              candidate.page === entry.page &&
              candidate.nav.join(">") === entry.nav.join(">"),
          )?.id;
        if (!pageId) {
          throw new Error(
            `No staged clip for ${entry.id} and no --from-page / sibling page id`,
          );
        }
        const pageStaged = stagingPath(stagingDir, pageId);
        const pageCommitted = path.join(
          captureDirectory,
          matrix.entries.find((item) => item.id === pageId)?.file ?? "",
        );
        const source = (await fileExists(pageStaged))
          ? pageStaged
          : pageCommitted;
        if (!(await fileExists(source))) {
          throw new Error(
            `Cannot crop ${entry.id}: missing page source ${pageId}`,
          );
        }
        await cropClip(
          source,
          output,
          entry.clip,
          viewport,
          matrix.deviceScaleFactor,
        );
      }
    }

    const size = await imageSize(output);
    updated.set(entry.id, {
      id: entry.id,
      storyId: entry.storyId,
      kind: entry.kind,
      page: entry.page,
      viewport: entry.viewport,
      state: "chrome-mcp",
      file: entry.file,
      sha256: await sha256(output),
      fixtureOnly: true,
      clip: entry.clip,
      placeholdersApplied: [],
      pixelWidth: size.width,
      pixelHeight: size.height,
    });
    process.stdout.write(
      `ingested ${entry.id} → ${entry.file} (${size.width}×${size.height})\n`,
    );
  }

  const screenshots = [
    ...previousScreenshots.filter((item) => !updated.has(String(item.id))),
    ...updated.values(),
  ];

  await writeJson(previousManifestPath, {
    captureId: matrix.captureId,
    source: "https://app.superlist.com/",
    capturedAt: new Date().toISOString(),
    status: "browser-fixture",
    deviceScaleFactor: matrix.deviceScaleFactor,
    redaction:
      "No overlays. Chrome MCP captures are verbatim viewport PNGs; component shots are subject-clipped from those pages.",
    screenshots,
    motions,
    limitations: [
      "Chrome MCP must write staging PNGs under os.tmpdir()/tasks-live-chrome (workspace paths are denied).",
      "Close Cursor sidebars that steal focus if Flutter clicks appear ignored.",
      "Open task detail via the row's Open task details arrow (not title double-click alone).",
      "Component clips use matrix CSS rectangles scaled from the page PNG.",
    ],
  });

  await mkdir(path.dirname(path.join(committedReferenceRoot, "capture-matrix.json")), {
    recursive: true,
  });
  await copyFile(
    path.join(committedReferenceRoot, "capture-matrix.json"),
    path.join(captureDirectory, "capture-matrix.json"),
  );

  process.stdout.write(
    `Updated ${updated.size} screenshot(s) in ${previousManifestPath}\n`,
  );
}

void main();
