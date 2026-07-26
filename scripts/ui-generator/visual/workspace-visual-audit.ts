import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import {
  nestedSnapshotFileName,
  type StoryIndexEntry,
} from "./snapshot-paths.js";

const REVIEW_TAGS = [
  "visual-pending",
  "visual-approved",
  "visual-failed",
] as const;

type ReviewTag = (typeof REVIEW_TAGS)[number];

export type StorybookIndex = {
  entries: Record<string, StoryIndexEntry>;
};

export type WorkspaceVisualRecord = {
  id: string;
  importPath: string;
  tags: string[];
  review: ReviewTag | "skip-visual" | "unclassified";
  expectedBaseline: string;
  baselineExists: boolean;
};

export type WorkspaceVisualAudit = {
  records: WorkspaceVisualRecord[];
  orphanBaselines: string[];
  errors: string[];
  summary: {
    stories: number;
    candidateStories: number;
    pending: number;
    approved: number;
    failed: number;
    skipped: number;
    baselines: number;
    pendingWithoutBaseline: number;
  };
};

function isWorkspaceStory(entry: StoryIndexEntry): boolean {
  return (
    entry.type === "story" &&
    Boolean(
      entry.importPath?.replace(/\\/g, "/").includes("/src/shared/workspace/"),
    )
  );
}

function filesBelow(root: string, base = root): string[] {
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(root, entry.name);
    return entry.isDirectory()
      ? filesBelow(absolute, base)
      : [path.relative(base, absolute).replace(/\\/g, "/")];
  });
}

function associatedWithExpected(
  file: string,
  expectedFiles: string[],
): boolean {
  return expectedFiles.some((expected) => {
    if (file === expected) return true;
    const suffix = "-chromium-darwin.png";
    if (!expected.endsWith(suffix)) return false;
    const prefix = expected.slice(0, -suffix.length);
    return file.startsWith(`${prefix}--`) && file.endsWith(suffix);
  });
}

export function auditWorkspaceVisualCoverage({
  index,
  snapshotRoot,
  requireBaselines = false,
}: {
  index: StorybookIndex;
  snapshotRoot: string;
  requireBaselines?: boolean;
}): WorkspaceVisualAudit {
  const errors: string[] = [];
  const entries = Object.values(index.entries)
    .filter(isWorkspaceStory)
    .sort((a, b) => a.id.localeCompare(b.id));

  const records = entries.map((entry): WorkspaceVisualRecord => {
    const tags = entry.tags ?? [];
    const reviewTags = REVIEW_TAGS.filter((tag) => tags.includes(tag));
    const skipped = tags.includes("skip-visual");
    if (skipped && reviewTags.length) {
      errors.push(
        `${entry.id} combines skip-visual with ${reviewTags.join(", ")}`,
      );
    } else if (!skipped && reviewTags.length !== 1) {
      errors.push(
        reviewTags.length
          ? `${entry.id} has multiple review tags: ${reviewTags.join(", ")}`
          : `${entry.id} has no visual review tag`,
      );
    }

    if (!entry.importPath) {
      errors.push(`${entry.id} has no importPath`);
    }
    const expectedBaseline = nestedSnapshotFileName(
      entry,
      "chromium",
      "darwin",
    );
    const baselineExists = existsSync(
      path.join(snapshotRoot, expectedBaseline),
    );
    const review: WorkspaceVisualRecord["review"] = skipped
      ? "skip-visual"
      : (reviewTags[0] ?? "unclassified");

    if (
      !skipped &&
      !baselineExists &&
      (requireBaselines || review !== "visual-pending")
    ) {
      errors.push(`${entry.id} is missing ${expectedBaseline}`);
    }

    return {
      id: entry.id,
      importPath: entry.importPath ?? "",
      tags,
      review,
      expectedBaseline,
      baselineExists,
    };
  });

  const expectedFiles = records
    .filter((record) => record.review !== "skip-visual")
    .map((record) => record.expectedBaseline);
  const orphanBaselines = filesBelow(path.join(snapshotRoot, "workspace"))
    .map((file) => `workspace/${file}`)
    .filter(
      (file) =>
        file.endsWith(".png") &&
        !file.endsWith(".actual.png") &&
        !file.endsWith(".diff.png") &&
        !associatedWithExpected(file, expectedFiles),
    )
    .sort();

  return {
    records,
    orphanBaselines,
    errors,
    summary: {
      stories: records.length,
      candidateStories: records.filter(
        (record) => record.review !== "skip-visual",
      ).length,
      pending: records.filter((record) => record.review === "visual-pending")
        .length,
      approved: records.filter((record) => record.review === "visual-approved")
        .length,
      failed: records.filter((record) => record.review === "visual-failed")
        .length,
      skipped: records.filter((record) => record.review === "skip-visual")
        .length,
      baselines: records.filter((record) => record.baselineExists).length,
      pendingWithoutBaseline: records.filter(
        (record) =>
          record.review === "visual-pending" && !record.baselineExists,
      ).length,
    },
  };
}
