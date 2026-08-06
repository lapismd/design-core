import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import {
  stepIdFromInteractionSnapshotName,
  type VisualDeltaInteraction,
} from "@lapismd/storybook-addon-visual-delta/src/shared/interaction-capture.js";
import { VISUAL_BASELINE_SUFFIX } from "@lapismd/storybook-addon-visual-delta/node";
import {
  interactionScreenshotRelativePath,
  nestedSnapshotFileName,
  screenshotRelativePath,
  storySlugFromId,
  type StoryIndexEntry,
} from "./snapshot-paths.js";
import { VISUAL_SNAPSHOT_DIR } from "./diff-result.js";

export type DiscoveredInteractionBaseline = {
  stepId: string;
  /** Relative path for `toHaveScreenshot` (no project suffix). */
  screenshotRel: string;
  /** Absolute on-disk PNG path. */
  pngAbs: string;
  /** `/visual-baselines/…` URL. */
  src: string;
};

/** Absolute PNG path for a mid-play interaction baseline. */
export function interactionBaselinePngPath(
  entry: StoryIndexEntry,
  stepId: string,
  packageRoot: string,
  project = "chromium",
): string {
  const rel = interactionScreenshotRelativePath(entry, stepId);
  const withSuffix = rel.replace(/\.png$/, `-${project}.png`);
  return path.join(packageRoot, VISUAL_SNAPSHOT_DIR, withSuffix);
}

/** Public URL for an interaction baseline PNG. */
export function interactionBaselineUrl(
  entry: StoryIndexEntry,
  stepId: string,
  project = "chromium",
): string {
  const rel = interactionScreenshotRelativePath(entry, stepId);
  const withSuffix = rel.replace(/\.png$/, `-${project}.png`);
  return `/visual-baselines/${withSuffix}`;
}

/**
 * Discover opted-in interaction baselines already on disk for a story
 * (`{slug}--{stepId}-chromium.png`).
 */
export function listInteractionBaselinesOnDisk(
  entry: StoryIndexEntry,
  packageRoot: string,
  project = "chromium",
): DiscoveredInteractionBaseline[] {
  if (!entry.importPath) return [];
  const primaryRel = screenshotRelativePath(entry);
  const dirRel = path.posix.dirname(primaryRel);
  const dirAbs = path.join(packageRoot, VISUAL_SNAPSHOT_DIR, dirRel);
  if (!existsSync(dirAbs)) return [];

  const slug = storySlugFromId(entry.id);
  const out: DiscoveredInteractionBaseline[] = [];
  for (const name of readdirSync(dirAbs)) {
    if (!name.endsWith(`-${project}.png`)) continue;
    if (name.includes(`-${project}-`)) continue; // skip legacy platform-qualified
    const stepId = stepIdFromInteractionSnapshotName(name, slug);
    if (!stepId) continue;
    const pngAbs = path.join(dirAbs, name);
    const screenshotRel = interactionScreenshotRelativePath(entry, stepId);
    out.push({
      stepId,
      screenshotRel,
      pngAbs,
      src: `/visual-baselines/${dirRel}/${name}`.replace(/\\/g, "/"),
    });
  }
  return out.sort((a, b) => a.stepId.localeCompare(b.stepId));
}

export function visualDeltaInteractionEntry(
  entry: StoryIndexEntry,
  stepId: string,
  label: string,
): VisualDeltaInteraction {
  return {
    id: stepId,
    label,
    src: interactionBaselineUrl(entry, stepId),
  };
}

/** Nested filename helper mirroring primary baselines. */
export function interactionNestedSnapshotFileName(
  entry: StoryIndexEntry,
  stepId: string,
  project = "chromium",
): string {
  const primary = nestedSnapshotFileName(entry, project);
  const suffix = `-${project}.png`;
  if (!primary.endsWith(suffix)) {
    throw new Error(`Unexpected snapshot name: ${primary}`);
  }
  return primary.replace(
    new RegExp(`${suffix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`),
    `--${stepId}${suffix}`,
  );
}

export { VISUAL_BASELINE_SUFFIX };
