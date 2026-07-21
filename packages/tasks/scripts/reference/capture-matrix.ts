import { readFile } from "node:fs/promises";
import path from "node:path";
import { committedReferenceRoot } from "./runtime.js";

export type CaptureClip = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CaptureMatrixEntry = {
  storyId: string;
  id: string;
  kind: "page" | "component";
  page: string;
  viewport: "desktop" | "tablet-landscape" | "tablet-portrait" | "mobile";
  file: string;
  nav: string[];
  placeholders: string[];
  clip?: CaptureClip;
  locator?: string | null;
  notes?: string;
  migrateFrom?: string;
  coverageOnly?: boolean;
  allowFullViewport?: boolean;
};

export type CaptureMatrix = {
  captureId: string;
  deviceScaleFactor: number;
  viewports: Record<
    string,
    {
      width: number;
      height: number;
    }
  >;
  placeholders: Record<
    string,
    {
      kind: string;
      region: CaptureClip;
      label: string;
    }
  >;
  maxComponentViewportRatio: number;
  entries: CaptureMatrixEntry[];
};

export function captureMatrixPath(captureId = "2026-07-20"): string {
  return path.join(committedReferenceRoot, "capture-matrix.json");
}

export async function loadCaptureMatrix(
  captureId = "2026-07-20",
): Promise<CaptureMatrix> {
  const file = captureMatrixPath(captureId);
  return JSON.parse(await readFile(file, "utf8")) as CaptureMatrix;
}

export function entryOutputPath(
  captureDirectory: string,
  entry: CaptureMatrixEntry,
): string {
  return path.join(captureDirectory, entry.file);
}

export function assertComponentClip(
  entry: CaptureMatrixEntry,
  viewport: { width: number; height: number },
  maxRatio: number,
): void {
  if (entry.kind !== "component") return;
  if (!entry.clip) {
    throw new Error(`Component entry ${entry.id} is missing required clip`);
  }
  if (entry.allowFullViewport) return;
  const area = entry.clip.width * entry.clip.height;
  const viewportArea = viewport.width * viewport.height;
  if (area / viewportArea >= maxRatio) {
    throw new Error(
      `Component entry ${entry.id} clip covers ${(
        (area / viewportArea) *
        100
      ).toFixed(1)}% of the viewport (max ${(maxRatio * 100).toFixed(0)}%)`,
    );
  }
}
