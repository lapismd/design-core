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
      const next = patchStoryOpenTagWithBaselineUrl(openTag, url);
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

function resolveStoriesPath(
  packageRoot: string,
  importPath: string,
): string | null {
  const normalized = importPath.replace(/\\/g, "/").replace(/^\.\//, "");
  const abs = path.join(packageRoot, normalized);
  return existsSync(abs) ? abs : null;
}

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
}): { patched: string[]; skipped: string[] } {
  const indexPath = path.join(
    options.packageRoot,
    "storybook-static",
    "index.json",
  );
  const patched: string[] = [];
  const skipped: string[] = [];
  if (!existsSync(indexPath)) {
    log.warn("storybook-static/index.json missing; skip story visualDelta patch");
    return { patched, skipped };
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
    } else {
      skipped.push(entry.id);
    }
  }

  return { patched, skipped };
}
