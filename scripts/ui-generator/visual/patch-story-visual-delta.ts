import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  baselineUrlForStory,
  visualBaselineVisualDeltaParameter,
  findStoryOpenTagEnd,
  sanitizeStoryName,
} from "storybook-addon-visual-delta/node";
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
 * Ensure `skip-visual` is present on a Story open tag (opts the story out of
 * Playwright visual suite / Visual Delta runs). Review metadata is independent:
 * it remains present while review controls are temporarily ineligible.
 */
export function addSkipVisualToStoryOpenTag(openTag: string): string {
  const tagsMatch = openTag.match(/\btags=\{\[([\s\S]*?)\]\}/);
  if (tagsMatch) {
    const full = tagsMatch[0];
    const inside = tagsMatch[1] ?? "";
    const tags = parseTagsArrayLiteral(inside);
    if (!tags.includes("skip-visual")) tags.push("skip-visual");
    const literal = tags.map((t) => JSON.stringify(t)).join(", ");
    return openTag.replace(full, `tags={[${literal}]}`);
  }

  const tagsAttr = `\n  tags={["skip-visual"]}`;
  if (openTag.endsWith("/>")) {
    return `${openTag.slice(0, -2)}${tagsAttr}\n/>`;
  }
  if (openTag.endsWith(">")) {
    return `${openTag.slice(0, -1)}${tagsAttr}\n>`;
  }
  return openTag;
}

/**
 * Persist `skip-visual` add/remove on the story's `.stories.svelte` CSF open tag.
 */
export function patchStorySkipVisual(options: {
  packageRoot: string;
  storyId: string;
  /** `true` = add skip-visual; `false` = remove it. */
  skip: boolean;
}): {
  ok: boolean;
  storyId: string;
  skip: boolean;
  error?: string;
} {
  const storyId = options.storyId.trim();
  if (!storyId) {
    return {
      ok: false,
      storyId,
      skip: options.skip,
      error: "storyId is required",
    };
  }

  const indexPath = path.join(
    options.packageRoot,
    "storybook-static",
    "index.json",
  );
  if (!existsSync(indexPath)) {
    return {
      ok: false,
      storyId,
      skip: options.skip,
      error: "storybook-static/index.json missing or empty",
    };
  }

  const index = JSON.parse(readFileSync(indexPath, "utf8")) as {
    entries?: Record<string, StoryIndexEntry>;
  };
  const entry = Object.values(index.entries ?? {}).find(
    (e) => e.id === storyId,
  );
  if (!entry || entry.type !== "story" || !entry.importPath) {
    return {
      ok: false,
      storyId,
      skip: options.skip,
      error: `Story not found in index: ${storyId}`,
    };
  }

  const alreadySkipped = (entry.tags ?? []).includes("skip-visual");
  if (options.skip === alreadySkipped) {
    return { ok: true, storyId, skip: options.skip };
  }

  const storiesPath = resolveStoriesPath(options.packageRoot, entry.importPath);
  if (!storiesPath) {
    return {
      ok: false,
      storyId,
      skip: options.skip,
      error: `Stories file not found: ${entry.importPath}`,
    };
  }

  const transform = options.skip
    ? addSkipVisualToStoryOpenTag
    : removeSkipVisualFromStoryOpenTag;
  const changed = patchStoriesFileWithOpenTagTransform(
    storiesPath,
    entry,
    transform,
  );
  if (!changed) {
    return {
      ok: false,
      storyId,
      skip: options.skip,
      error: `Could not locate <Story> open tag for ${storyId}`,
    };
  }

  log.info(`${options.skip ? "Added" : "Removed"} skip-visual on ${storyId}`);
  return { ok: true, storyId, skip: options.skip };
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
      openTag.slice(0, bracketStart + 1) + insertion + openTag.slice(bracketEnd)
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
    log.warn(
      "storybook-static/index.json missing; skip story visualDelta patch",
    );
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
    const storiesPath = resolveStoriesPath(
      options.packageRoot,
      entry.importPath,
    );
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

/**
 * Locate the `visualDelta: {…}` object literal inside a Story open tag.
 * Returns [start, endExclusive] of the object braces, or null.
 */
function findVisualDeltaObjectRange(
  openTag: string,
): { start: number; end: number } | null {
  const key = openTag.match(/\bvisualDelta\s*:\s*/);
  if (!key || key.index == null) return null;
  const start = key.index + key[0].length;
  if (openTag[start] !== "{") return null;
  const end = endOfDoubleBraceObject(openTag, start);
  if (end === -1) return null;
  return { start, end: end + 1 };
}

/**
 * Parse `visualDelta` whether it is compact JSON or a prettier JS object
 * literal (`images: [...]`, unquoted keys, trailing commas).
 */
export function parseVisualDeltaObjectLiteral(
  objectText: string,
): Record<string, unknown> | null {
  try {
    return JSON.parse(objectText) as Record<string, unknown>;
  } catch {
    /* fall through — prettier JS object */
  }
  try {
    const normalized = objectText
      .replace(/([{\[,]\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:/g, '$1"$2":')
      .replace(/,(\s*[}\]])/g, "$1");
    return JSON.parse(normalized) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function patchStoryOpenTagWithInteraction(
  openTag: string,
  interaction: { id: string; label: string; src: string },
): string {
  if (/skip-visual/.test(openTag)) return openTag;

  const range = findVisualDeltaObjectRange(openTag);
  if (!range) {
    return openTag;
  }

  const parsed = parseVisualDeltaObjectLiteral(
    openTag.slice(range.start, range.end),
  );
  if (!parsed) return openTag;

  const existing = Array.isArray(parsed.interactions)
    ? (parsed.interactions as Array<Record<string, unknown>>)
    : [];
  const without = existing.filter((item) => item?.id !== interaction.id);
  without.push({
    id: interaction.id,
    label: interaction.label,
    src: interaction.src,
  });
  parsed.interactions = without;

  const nextLiteral = JSON.stringify(parsed);
  return openTag.slice(0, range.start) + nextLiteral + openTag.slice(range.end);
}

/**
 * Wire `parameters.visualDelta.interactions` for one mid-play capture.
 */
export function patchStoryVisualDeltaInteraction(options: {
  packageRoot: string;
  storyId: string;
  interaction: { id: string; label: string; src: string };
}): { ok: boolean; changed: boolean; error?: string } {
  const indexPath = path.join(
    options.packageRoot,
    "storybook-static",
    "index.json",
  );
  if (!existsSync(indexPath)) {
    return {
      ok: false,
      changed: false,
      error: "storybook-static/index.json missing",
    };
  }
  const index = JSON.parse(readFileSync(indexPath, "utf8")) as {
    entries?: Record<string, StoryIndexEntry>;
  };
  const entry = Object.values(index.entries ?? {}).find(
    (e) => e.id === options.storyId,
  );
  if (!entry?.importPath) {
    return {
      ok: false,
      changed: false,
      error: `Story not found: ${options.storyId}`,
    };
  }
  if ((entry.tags ?? []).includes("skip-visual")) {
    return {
      ok: false,
      changed: false,
      error: "Cannot patch skip-visual stories",
    };
  }
  const storiesPath = resolveStoriesPath(options.packageRoot, entry.importPath);
  if (!storiesPath) {
    return {
      ok: false,
      changed: false,
      error: `Stories file not found: ${entry.importPath}`,
    };
  }

  const before = readFileSync(storiesPath, "utf8");
  const changed = patchStoriesFileWithOpenTagTransform(
    storiesPath,
    entry,
    (openTag) => patchStoryOpenTagWithInteraction(openTag, options.interaction),
  );
  if (!changed) {
    if (before.includes(options.interaction.src)) {
      return { ok: true, changed: false };
    }
    return {
      ok: false,
      changed: false,
      error: `Could not patch visualDelta.interactions for ${options.storyId}`,
    };
  }
  log.info(
    `Patched visualDelta.interactions[${options.interaction.id}] for ${options.storyId}`,
  );
  return { ok: true, changed: true };
}
