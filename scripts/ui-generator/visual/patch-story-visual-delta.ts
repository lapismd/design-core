import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  baselineUrlForStory,
  visualBaselineVisualDeltaParameter,
} from "../../../.storybook/visual-baseline-design.js";
import {
  findStoryOpenTagEnd,
  sanitizeStoryName,
} from "../../../.storybook/visual-baseline-vite-plugin.js";
import { log } from "../logger.js";
import type { StoryIndexEntry } from "./snapshot-paths.js";

function endOfDoubleBraceObject(source: string, start: number): number {
  let depth = 0;
  for (let i = start; i < source.length; i++) {
    const ch = source[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/**
 * Candidate titles for matching a Storybook `--slug`.
 * Prefer human `name` — story ids use it (`Default row` → `default-row`).
 * `exportName` alone (`DefaultRow` → `defaultrow`) must not win or create /
 * review patches miss skip-visual stories that set both.
 */
function storyNameCandidates(attrs: string): string[] {
  const names: string[] = [];
  const name = attrs.match(/\bname=["']([^"']+)["']/)?.[1];
  const exportName = attrs.match(/\bexportName=["']([^"']+)["']/)?.[1];
  if (name) names.push(name);
  if (exportName) names.push(exportName);
  return names;
}

function storyMatchesSlug(openTag: string, slug: string): boolean {
  return storyNameCandidates(openTag).some(
    (storyName) => sanitizeStoryName(storyName) === slug,
  );
}

/** Test/helper: does this `<Story …>` open tag match a story id or `--slug`? */
export function storyOpenTagMatchesIdSlug(
  openTag: string,
  storyIdOrSlug: string,
): boolean {
  const slug = storyIdOrSlug.includes("--")
    ? storyIdOrSlug.slice(storyIdOrSlug.indexOf("--") + 2)
    : storyIdOrSlug;
  return storyMatchesSlug(openTag, slug);
}

function parseTagsArrayLiteral(inside: string): string[] {
  return [...inside.matchAll(/["']([^"']+)["']/g)].map((m) => m[1]!);
}

/**
 * Drop `skip-visual` from a Story open tag (create-baseline opts the story in).
 */
export function removeSkipVisualFromStoryOpenTag(openTag: string): string {
  const tagsMatch = openTag.match(/\btags=\{\[([\s\S]*?)\]\}/);
  if (!tagsMatch) return openTag;
  const full = tagsMatch[0];
  const inside = tagsMatch[1] ?? "";
  const before = parseTagsArrayLiteral(inside);
  const tags = before.filter((t) => t !== "skip-visual");
  if (tags.length === before.length) return openTag;
  if (tags.length === 0) {
    return openTag.replace(/\s*tags=\{\[[\s\S]*?\]\}/, "");
  }
  const literal = tags.map((t) => JSON.stringify(t)).join(", ");
  return openTag.replace(full, `tags={[${literal}]}`);
}

/**
 * Ensure `parameters.visualDelta.images` includes `url` in a Story open tag.
 * Inserts a full visualDelta block when missing; appends to images when present.
 */
export function patchStoryOpenTagWithBaselineUrl(
  openTag: string,
  url: string,
): string {
  if (/skip-visual/.test(openTag)) return openTag;

  const visualDelta = visualBaselineVisualDeltaParameter(url);
  const literal = JSON.stringify(visualDelta);

  if (/\bvisualDelta\s*:/.test(openTag)) {
    if (openTag.includes(url) || openTag.includes(JSON.stringify(url))) {
      return openTag;
    }
    // Append URL into an existing images: [...] array when we can find it.
    const imagesIdx = openTag.search(/\bimages\s*:\s*\[/);
    if (imagesIdx === -1) return openTag;
    const bracketStart = openTag.indexOf("[", imagesIdx);
    if (bracketStart === -1) return openTag;
    let depth = 0;
    let bracketEnd = -1;
    for (let i = bracketStart; i < openTag.length; i++) {
      const ch = openTag[i];
      if (ch === "[") depth++;
      else if (ch === "]") {
        depth--;
        if (depth === 0) {
          bracketEnd = i;
          break;
        }
      }
    }
    if (bracketEnd === -1) return openTag;
    const inside = openTag.slice(bracketStart + 1, bracketEnd).trim();
    const insertion = inside.length
      ? `${inside.replace(/,\s*$/, "")}, ${JSON.stringify(url)}`
      : JSON.stringify(url);
    return (
      openTag.slice(0, bracketStart + 1) +
      insertion +
      openTag.slice(bracketEnd)
    );
  }

  const paramsKey = "parameters={{";
  const paramsIdx = openTag.indexOf(paramsKey);
  if (paramsIdx !== -1) {
    const braceStart = paramsIdx + "parameters=".length;
    const braceEnd = endOfDoubleBraceObject(openTag, braceStart);
    if (braceEnd === -1) return openTag;
    const insertAt = paramsIdx + paramsKey.length;
    return (
      openTag.slice(0, insertAt) +
      `\n    visualDelta: ${literal},` +
      openTag.slice(insertAt)
    );
  }

  const parametersAttr = `\n  parameters={{\n    visualDelta: ${literal},\n  }}`;
  if (openTag.endsWith("/>")) {
    return `${openTag.slice(0, -2)}${parametersAttr}\n/>`;
  }
  if (openTag.endsWith(">")) {
    return `${openTag.slice(0, -1)}${parametersAttr}\n>`;
  }
  return openTag;
}

function patchStoriesFileForEntry(
  filePath: string,
  entry: StoryIndexEntry,
  url: string,
): boolean {
  return patchStoriesFileWithOpenTagTransform(filePath, entry, (openTag) =>
    patchStoryOpenTagWithBaselineUrl(openTag, url),
  );
}

function resolveStoriesPath(
  packageRoot: string,
  importPath: string,
): string | null {
  const normalized = importPath.replace(/\\/g, "/").replace(/^\.\//, "");
  const abs = path.join(packageRoot, normalized);
  return existsSync(abs) ? abs : null;
}

function patchStoriesFileWithOpenTagTransform(
  filePath: string,
  entry: StoryIndexEntry,
  transform: (openTag: string) => string,
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
      const next = transform(openTag);
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

/**
 * Story ids under a prefix (e.g. `ui-forms-form-field--`) that still carry
 * `skip-visual` in the static index — used for component-scoped create.
 */
export function listSkipVisualStoryIdsForPrefix(options: {
  packageRoot: string;
  storyIdPrefix: string;
}): string[] {
  const indexPath = path.join(
    options.packageRoot,
    "storybook-static",
    "index.json",
  );
  if (!existsSync(indexPath) || !options.storyIdPrefix) return [];
  const index = JSON.parse(readFileSync(indexPath, "utf8")) as {
    entries?: Record<string, StoryIndexEntry>;
  };
  return Object.values(index.entries ?? {})
    .filter(
      (e) =>
        e.type === "story" &&
        e.id.startsWith(options.storyIdPrefix) &&
        (e.tags ?? []).includes("skip-visual"),
    )
    .map((e) => e.id);
}

/**
 * Remove `skip-visual` from the given stories so create-baseline can capture
 * and wire them. Returns story ids that were changed on disk.
 */
export function removeSkipVisualFromStories(options: {
  packageRoot: string;
  storyIds: string[];
}): string[] {
  const indexPath = path.join(
    options.packageRoot,
    "storybook-static",
    "index.json",
  );
  const removed: string[] = [];
  if (!existsSync(indexPath) || options.storyIds.length === 0) return removed;

  const index = JSON.parse(readFileSync(indexPath, "utf8")) as {
    entries?: Record<string, StoryIndexEntry>;
  };
  const idSet = new Set(options.storyIds);

  for (const entry of Object.values(index.entries ?? {})) {
    if (entry.type !== "story" || !idSet.has(entry.id)) continue;
    if (!(entry.tags ?? []).includes("skip-visual")) continue;
    if (!entry.importPath) continue;
    const storiesPath = resolveStoriesPath(
      options.packageRoot,
      entry.importPath,
    );
    if (!storiesPath) continue;
    if (
      patchStoriesFileWithOpenTagTransform(
        storiesPath,
        entry,
        removeSkipVisualFromStoryOpenTag,
      )
    ) {
      removed.push(entry.id);
      log.info(`Removed skip-visual from ${entry.id}`);
    }
  }

  return removed;
}

export type VisualDeltaPatchResult = {
  /** CSF newly wrote `visualDelta.images`. */
  patched: string[];
  /** PNG + CSF already had the URL (still success for the UI). */
  alreadyWired: string[];
  /** skip-visual, missing PNG, or unresolved path. */
  skipped: string[];
};

/**
 * After create-only Playwright writes, wire each matching story's CSF to the
 * baseline URL when the PNG exists and the story is not skip-visual.
 */
export function patchStoriesVisualDeltaImages(options: {
  packageRoot: string;
  /** Story ids to consider (exact). */
  storyIds?: string[];
  /** Or filter index entries whose id starts with this prefix (e.g. `shadcn-button--`). */
  storyIdPrefix?: string;
}): VisualDeltaPatchResult {
  const indexPath = path.join(
    options.packageRoot,
    "storybook-static",
    "index.json",
  );
  const patched: string[] = [];
  const alreadyWired: string[] = [];
  const skipped: string[] = [];
  if (!existsSync(indexPath)) {
    log.warn("storybook-static/index.json missing; skip story visualDelta patch");
    return { patched, alreadyWired, skipped };
  }

  const index = JSON.parse(readFileSync(indexPath, "utf8")) as {
    entries?: Record<string, StoryIndexEntry>;
  };
  const entries = Object.values(index.entries ?? {}).filter(
    (e) => e.type === "story",
  );

  const idSet = options.storyIds?.length
    ? new Set(options.storyIds)
    : undefined;
  const prefix = options.storyIdPrefix;

  for (const entry of entries) {
    if (idSet && !idSet.has(entry.id)) continue;
    if (prefix && !entry.id.startsWith(prefix)) continue;
    if ((entry.tags ?? []).includes("skip-visual")) {
      skipped.push(entry.id);
      continue;
    }
    const url = baselineUrlForStory(entry);
    if (!url || !entry.importPath) {
      skipped.push(entry.id);
      continue;
    }
    const relative = url.replace(/^\/visual-baselines\//, "");
    const pngPath = path.join(
      options.packageRoot,
      "tests/visual/storybook.spec.ts-snapshots",
      relative,
    );
    if (!existsSync(pngPath)) {
      skipped.push(entry.id);
      continue;
    }
    const storiesPath = resolveStoriesPath(options.packageRoot, entry.importPath);
    if (!storiesPath) {
      skipped.push(entry.id);
      continue;
    }
    if (patchStoriesFileForEntry(storiesPath, entry, url)) {
      patched.push(entry.id);
      log.info(`Patched visualDelta.images for ${entry.id}`);
    } else if (readFileSync(storiesPath, "utf8").includes(url)) {
      // Open tag already contains the URL — treat as success, not a failure.
      alreadyWired.push(entry.id);
    } else {
      skipped.push(entry.id);
    }
  }

  return { patched, alreadyWired, skipped };
}
