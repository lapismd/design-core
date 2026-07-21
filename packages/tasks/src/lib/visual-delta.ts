/**
 * Generated lookup helpers for Superlist Visual Delta captures.
 * Source of truth: packages/tasks/reference/superlist/capture-matrix.json
 */
import matrix from "../../reference/superlist/capture-matrix.json" with { type: "json" };

const captureRoot = `/tasks-reference/${matrix.captureId}`;

export type TasksVisualDeltaParams = {
  images: string[];
  opacity: number;
  colorInversion: boolean;
  align: "canvas";
  placement: "right";
  passThresholdPercent: number;
};

const entryByStoryId = new Map<string, (typeof matrix.entries)[number]>();
for (const entry of matrix.entries) {
  if (entry.coverageOnly) continue;
  if (!entryByStoryId.has(entry.storyId)) {
    entryByStoryId.set(entry.storyId, entry);
  }
}

const entryById = new Map(matrix.entries.map((entry) => [entry.id, entry]));

export function referenceCaptureSource(id: string): string {
  const entry = entryById.get(id);
  if (!entry) throw new Error(`Unknown Tasks reference capture id: ${id}`);
  return `${captureRoot}/${entry.file}`;
}

export function visualDeltaForCaptureIds(
  ...ids: readonly string[]
): TasksVisualDeltaParams {
  return {
    images: ids.map((id) => referenceCaptureSource(id)),
    opacity: 0.5,
    colorInversion: false,
    align: "canvas",
    placement: "right",
    passThresholdPercent: 0.1,
  };
}

/** Visual Delta settings for a Storybook story id from the capture matrix. */
export function visualDeltaForStory(storyId: string): TasksVisualDeltaParams {
  const entry = entryByStoryId.get(storyId);
  if (!entry) {
    throw new Error(`No capture-matrix entry for story ${storyId}`);
  }
  return visualDeltaForCaptureIds(entry.id);
}

export function getMatrixEntryForStory(storyId: string) {
  return entryByStoryId.get(storyId);
}

export const captureMatrixStoryIds = [...entryByStoryId.keys()] as const;
