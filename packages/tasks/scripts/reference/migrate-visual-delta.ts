import { execFile } from "node:child_process";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import {
  assertComponentClip,
  loadCaptureMatrix,
  type CaptureMatrixEntry,
} from "./capture-matrix.js";
import {
  committedReferenceRoot,
  ensureDirectory,
  sha256,
  writeJson,
} from "./runtime.js";

const execFileAsync = promisify(execFile);

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

async function migrateEntry(
  captureDirectory: string,
  entry: CaptureMatrixEntry,
  viewport: { width: number; height: number },
  deviceScaleFactor: number,
): Promise<void> {
  if (!entry.migrateFrom) {
    throw new Error(`Entry ${entry.id} has no migrateFrom source`);
  }
  const source = path.join(captureDirectory, entry.migrateFrom);
  const output = path.join(captureDirectory, entry.file);
  await ensureDirectory(path.dirname(output));

  const sourceSize = await imageSize(source);
  const scaleX = sourceSize.width / viewport.width;
  const scaleY = sourceSize.height / viewport.height;

  if (entry.kind === "page") {
    const targetW = Math.round(viewport.width * deviceScaleFactor);
    const targetH = Math.round(viewport.height * deviceScaleFactor);
    await execFileAsync("sips", [
      "-z",
      String(targetH),
      String(targetW),
      source,
      "--out",
      output,
    ]);
    return;
  }

  if (!entry.clip) throw new Error(`Component ${entry.id} missing clip`);
  const { x, y, width, height } = entry.clip;
  const cropX = Math.max(0, Math.round(x * scaleX));
  const cropY = Math.max(0, Math.round(y * scaleY));
  const cropW = Math.min(sourceSize.width - cropX, Math.round(width * scaleX));
  const cropH = Math.min(
    sourceSize.height - cropY,
    Math.round(height * scaleY),
  );
  const targetW = Math.round(width * deviceScaleFactor);
  const targetH = Math.round(height * deviceScaleFactor);
  const tmp = `${output}.tmp.png`;
  await execFileAsync("sips", [
    "--cropToHeightWidth",
    String(cropH),
    String(cropW),
    "--cropOffset",
    String(cropY),
    String(cropX),
    source,
    "--out",
    tmp,
  ]);
  await execFileAsync("sips", [
    "-z",
    String(targetH),
    String(targetW),
    tmp,
    "--out",
    output,
  ]);
  await execFileAsync("rm", ["-f", tmp]);
}

async function main(): Promise<void> {
  const matrix = await loadCaptureMatrix();
  const captureDirectory = path.join(committedReferenceRoot, matrix.captureId);

  const screenshots: Array<{
    id: string;
    storyId: string;
    kind: string;
    page: string;
    viewport: string;
    state: string;
    file: string;
    sha256: string;
    fixtureOnly: true;
    clip?: CaptureMatrixEntry["clip"];
    placeholdersApplied: string[];
  }> = [];

  for (const entry of matrix.entries) {
    const viewport = matrix.viewports[entry.viewport];
    if (!viewport) throw new Error(`Unknown viewport ${entry.viewport}`);
    assertComponentClip(entry, viewport, matrix.maxComponentViewportRatio);
    await migrateEntry(
      captureDirectory,
      entry,
      viewport,
      matrix.deviceScaleFactor,
    );
    const file = path.join(captureDirectory, entry.file);
    screenshots.push({
      id: entry.id,
      storyId: entry.storyId,
      kind: entry.kind,
      page: entry.page,
      viewport: entry.viewport,
      state: entry.coverageOnly ? "viewport-coverage" : "migrated-browser-crop",
      file: entry.file,
      sha256: await sha256(file),
      fixtureOnly: true,
      clip: entry.clip,
      placeholdersApplied: entry.placeholders,
    });
    process.stdout.write(`migrated ${entry.id}\n`);
  }

  // Preserve motion entries from prior manifest when present.
  let motions: unknown[] = [];
  const previousManifestPath = path.join(captureDirectory, "manifest.json");
  try {
    const previous = JSON.parse(
      await readFile(previousManifestPath, "utf8"),
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
      "Committed Superlist reference captures for Visual Delta. Component shots are subject-clipped. Avatar/banner placeholders applied on live re-capture; migrated crops inherit fixture-list content.",
    screenshots,
    motions,
    limitations: [
      "Initial tree may be migrated/upscaled from prior browser captures until reference:capture:delta runs against a logged-in session.",
      "Component clips use matrix CSS rectangles; live capture prefers locator bounding boxes when available.",
    ],
  });

  // Keep matrix next to the dated capture for static serving.
  await copyFile(
    path.join(committedReferenceRoot, "capture-matrix.json"),
    path.join(captureDirectory, "capture-matrix.json"),
  ).catch(async () => {
    await mkdir(captureDirectory, { recursive: true });
  });
  await copyFile(
    path.join(committedReferenceRoot, "capture-matrix.json"),
    path.join(captureDirectory, "capture-matrix.json"),
  );

  process.stdout.write(
    `Migrated ${screenshots.length} Visual Delta reference screenshots.\n`,
  );
}

void main();
