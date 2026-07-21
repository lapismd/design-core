import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  VISUAL_REVIEW_APPROVED_TAG,
  VISUAL_REVIEW_PENDING_TAG,
  VISUAL_REVIEW_TAGS,
  visualReviewTagFor,
  type VisualReviewStatus,
} from "../../../packages/storybook-addon-visual-delta/src/constants.js";
import {
  findStoryOpenTagEnd,
  sanitizeStoryName,
} from "../../../.storybook/visual-baseline-vite-plugin.js";
import { log } from "../logger.js";
import type { StoryIndexEntry } from "./snapshot-paths.js";

function extractStoryName(attrs: string): string | undefined {
  const exportName = attrs.match(/\bexportName=["']([^"']+)["']/);
  if (exportName) return exportName[1];
  const name = attrs.match(/\bname=["']([^"']+)["']/);
  return name?.[1];
}

function storyMatchesSlug(openTag: string, slug: string): boolean {
  const storyName = extractStoryName(openTag);
  if (!storyName) return false;
  return sanitizeStoryName(storyName) === slug;
}

function parseTagsArrayLiteral(inside: string): string[] {
  return [...inside.matchAll(/["']([^"']+)["']/g)].map((m) => m[1]!);
}

/**
 * Set a visual review tag on a Story open tag (mutually exclusive with the others).
 */
export function patchStoryOpenTagWithReviewStatus(
  openTag: string,
  status: VisualReviewStatus,
): string {
  const nextTag = visualReviewTagFor(status);
  const reviewTagSet = new Set<string>(VISUAL_REVIEW_TAGS);

  const tagsMatch = openTag.match(/\btags=\{\[([\s\S]*?)\]\}/);
  if (tagsMatch) {
    const full = tagsMatch[0];
    const inside = tagsMatch[1] ?? "";
    const tags = parseTagsArrayLiteral(inside).filter(
      (t) => !reviewTagSet.has(t),
    );
    tags.push(nextTag);
    const literal = tags.map((t) => JSON.stringify(t)).join(", ");
    return openTag.replace(full, `tags={[${literal}]}`);
  }

  const tagsAttr = `\n  tags={[${JSON.stringify(nextTag)}]}`;
  if (openTag.endsWith("/>")) {
    return `${openTag.slice(0, -2)}${tagsAttr}\n/>`;
  }
  if (openTag.endsWith(">")) {
    return `${openTag.slice(0, -1)}${tagsAttr}\n>`;
  }
  return openTag;
}

function resolveStoriesPath(
  packageRoot: string,
  importPath: string,
): string | null {
  const normalized = importPath.replace(/\\/g, "/").replace(/^\.\//, "");
  const abs = path.join(packageRoot, normalized);
  return existsSync(abs) ? abs : null;
}

function patchStoriesFileForEntry(
  filePath: string,
  entry: StoryIndexEntry,
  status: VisualReviewStatus,
): boolean {
  const slug = entry.id.includes("--")
    ? entry.id.slice(entry.id.indexOf("--") + 2)
    : sanitizeStoryName(entry.name ?? "");
  if (!slug) return false;

  const original = readFileSync(filePath, "utf8");
  let result = "";
  let cursor = 0;
  let changed = false;

  while (cursor < original.length) {
    const start = original.indexOf("<Story", cursor);
    if (start === -1) {
      result += original.slice(cursor);
      break;
    }
    result += original.slice(cursor, start);
    const end = findStoryOpenTagEnd(original, start);
    if (end === -1) {
      result += original.slice(start);
      break;
    }
    const openTag = original.slice(start, end + 1);
    if (storyMatchesSlug(openTag, slug)) {
      const next = patchStoryOpenTagWithReviewStatus(openTag, status);
      result += next;
      if (next !== openTag) changed = true;
    } else {
      result += openTag;
    }
    cursor = end + 1;
  }

  if (changed) {
    writeFileSync(filePath, result, "utf8");
  }
  return changed;
}

function loadStoryIndex(packageRoot: string): StoryIndexEntry[] {
  const indexPath = path.join(packageRoot, "storybook-static", "index.json");
  if (!existsSync(indexPath)) return [];
  const index = JSON.parse(readFileSync(indexPath, "utf8")) as {
    entries?: Record<string, StoryIndexEntry>;
  };
  return Object.values(index.entries ?? {}).filter((e) => e.type === "story");
}

/**
 * Persist a visual review tag on the story's `.stories.svelte` CSF open tag.
 */
export function patchStoryVisualReviewStatus(options: {
  packageRoot: string;
  storyId: string;
  status: VisualReviewStatus;
}): { ok: boolean; storyId: string; status: VisualReviewStatus; error?: string } {
  const storyId = options.storyId.trim();
  if (!storyId) {
    return {
      ok: false,
      storyId,
      status: options.status,
      error: "storyId is required",
    };
  }

  const entries = loadStoryIndex(options.packageRoot);
  if (!entries.length) {
    return {
      ok: false,
      storyId,
      status: options.status,
      error: "storybook-static/index.json missing or empty",
    };
  }

  const entry = entries.find((e) => e.id === storyId);
  if (!entry?.importPath) {
    return {
      ok: false,
      storyId,
      status: options.status,
      error: `Story not found in index: ${storyId}`,
    };
  }

  if ((entry.tags ?? []).includes("skip-visual")) {
    return {
      ok: false,
      storyId,
      status: options.status,
      error: "Cannot set review status on skip-visual stories",
    };
  }

  const storiesPath = resolveStoriesPath(
    options.packageRoot,
    entry.importPath,
  );
  if (!storiesPath) {
    return {
      ok: false,
      storyId,
      status: options.status,
      error: `Stories file not found: ${entry.importPath}`,
    };
  }

  const changed = patchStoriesFileForEntry(
    storiesPath,
    entry,
    options.status,
  );
  if (!changed) {
    // Idempotent: already had the tag (or open tag not matched).
    const already = (entry.tags ?? []).includes(visualReviewTagFor(options.status));
    if (already) {
      return { ok: true, storyId, status: options.status };
    }
    return {
      ok: false,
      storyId,
      status: options.status,
      error: `Could not locate <Story> open tag for ${storyId}`,
    };
  }

  log.info(
    `Patched ${visualReviewTagFor(options.status)} on ${storyId}`,
  );
  return { ok: true, storyId, status: options.status };
}

/**
 * After create-baseline, mark patched stories as pending unless already approved.
 * Failed reviews are reset to pending so the new baseline can be re-reviewed.
 */
export function markCreatedStoriesPending(options: {
  packageRoot: string;
  storyIds: string[];
}): { marked: string[]; skipped: string[] } {
  const marked: string[] = [];
  const skipped: string[] = [];
  const entries = loadStoryIndex(options.packageRoot);
  const byId = new Map(entries.map((e) => [e.id, e]));

  for (const storyId of options.storyIds) {
    const entry = byId.get(storyId);
    if (!entry) {
      skipped.push(storyId);
      continue;
    }
    if ((entry.tags ?? []).includes(VISUAL_REVIEW_APPROVED_TAG)) {
      skipped.push(storyId);
      continue;
    }
    if ((entry.tags ?? []).includes(VISUAL_REVIEW_PENDING_TAG)) {
      skipped.push(storyId);
      continue;
    }
    const result = patchStoryVisualReviewStatus({
      packageRoot: options.packageRoot,
      storyId,
      status: "pending",
    });
    if (result.ok) marked.push(storyId);
    else skipped.push(storyId);
  }

  return { marked, skipped };
}
