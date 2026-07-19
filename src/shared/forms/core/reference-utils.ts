export type ReferenceKind = "cv_marker" | "story" | "cv_story" | "task";

export type ParsedReference = {
  ref: string;
  target: string;
  kind: ReferenceKind;
  segments: string[];
};

export type ReferenceTarget = {
  id: string;
  ref: string;
  marker: string;
  path: string;
  type: string;
  label: string;
  excerpt: string;
  duplicate: boolean;
  kind?: string;
  selectable?: boolean;
  href?: string;
  optionNotes?: string;
  optionStatus?: "todo" | "waiting";
  preview?: ReferencePreview;
};

export type ReferenceIndex<T extends ReferenceTarget = ReferenceTarget> = {
  references: T[];
  duplicates: Record<string, T[]>;
};

export type ReferenceSelectedSlotProps = {
  ref: string;
  reference: ReferenceTarget | null;
  duplicates: number;
  expanded: boolean;
  onToggleExpand: () => void;
};

export type ReferencePreviewItem =
  | {
      kind: "row";
      label: string;
      value?: string;
      highlighted?: boolean;
    }
  | {
      kind: "list";
      label: string;
      items?: string[];
      highlightedIndexes?: number[];
    };

export type ReferencePreview = {
  title?: string;
  meta?: string;
  items: ReferencePreviewItem[];
};

const REFERENCE_SEGMENT = /^[A-Za-z0-9_-]+$/;
const REFERENCE_MARKER = /^\[\^([A-Za-z0-9_/-]+)\]$/;

function validSegments(segments: string[]) {
  return (
    segments.length > 0 &&
    segments.every((segment) => REFERENCE_SEGMENT.test(segment))
  );
}

export function parseReferenceRef(value: unknown): ParsedReference | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  const match = REFERENCE_MARKER.exec(trimmed);
  if (!match) return null;
  const target = match[1];
  const segments = target.split("/");
  if (!validSegments(segments)) return null;

  if (segments.length === 1) {
    return { ref: trimmed, target, kind: "cv_marker", segments };
  }
  if (segments.length === 2 && segments[0] === "stories") {
    return { ref: trimmed, target, kind: "story", segments };
  }
  if (
    segments.length === 4 &&
    segments[0] === "cv" &&
    segments[2] === "stories"
  ) {
    return { ref: trimmed, target, kind: "cv_story", segments };
  }
  if (segments.length === 3 && segments[0] === "tasks") {
    return { ref: trimmed, target, kind: "task", segments };
  }
  return null;
}

export function normalizeReferenceRef(value: unknown) {
  return parseReferenceRef(value)?.ref ?? null;
}

export function normalizeReferenceList(value: unknown) {
  const rawValues = Array.isArray(value)
    ? value
    : value && typeof value === "object"
      ? Object.values(value).flatMap((item) =>
          Array.isArray(item) ? item : [],
        )
      : [];
  const refs = rawValues
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
  return Array.from(new Set(refs));
}

export function formatCvMarkerReference(id: string) {
  return `[^${id}]`;
}

export function formatStoryReference(storyId: string, cvId?: string) {
  return cvId ? `[^cv/${cvId}/stories/${storyId}]` : `[^stories/${storyId}]`;
}

export function formatTaskReference(jobId: string, taskId: string) {
  return `[^tasks/${jobId}/${taskId}]`;
}

export function referenceAnchorId(value: string) {
  const parsed = parseReferenceRef(value);
  const target = parsed?.target ?? value;
  const slug =
    target
      .trim()
      .replace(/[^A-Za-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "reference";
  return `cvstudio-reference-${slug}`;
}

export function markDuplicateReferenceTargets<T extends ReferenceTarget>(
  references: T[],
): ReferenceIndex<T> {
  const byRef = new Map<string, T[]>();
  for (const reference of references) {
    byRef.set(reference.ref, [...(byRef.get(reference.ref) ?? []), reference]);
  }
  const duplicates = Object.fromEntries(
    [...byRef.entries()].filter(([, items]) => items.length > 1),
  ) as Record<string, T[]>;
  for (const reference of references) {
    reference.duplicate = Boolean(duplicates[reference.ref]);
  }
  return { references, duplicates };
}

export function duplicateReferenceCount(index: ReferenceIndex, value: string) {
  const ref = normalizeReferenceRef(value);
  return ref ? (index.duplicates[ref]?.length ?? 0) : 0;
}

export function resolveReferenceTarget<T extends ReferenceTarget>(
  index: ReferenceIndex<T>,
  value: string,
) {
  const ref = normalizeReferenceRef(value);
  if (!ref) return null;
  const matches = index.references.filter((reference) => reference.ref === ref);
  return matches.length === 1 ? matches[0] : null;
}
