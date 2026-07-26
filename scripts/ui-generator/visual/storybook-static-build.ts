import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import type { StoryIndexEntry } from "./snapshot-paths.js";

export type StaticBuildReason =
  | "missing-index"
  | "incomplete-static"
  | "unskip"
  | "stale-source"
  | "explicit-rebuild"
  | "reuse"
  | "skip-build-missing";

export type StaticBuildDecision = {
  shouldBuild: boolean;
  reason: StaticBuildReason;
  /** Human-readable line for status logs. */
  message: string;
};

/**
 * Playwright loads `/iframe.html?id=…`. A partial `storybook build` can leave
 * `index.json` without iframe/assets — reuse would hang every visual test.
 */
export function isStorybookStaticComplete(packageRoot: string): boolean {
  const root = path.join(packageRoot, "storybook-static");
  return (
    existsSync(path.join(root, "index.json")) &&
    existsSync(path.join(root, "iframe.html"))
  );
}

function loadStoryEntries(packageRoot: string): StoryIndexEntry[] {
  const indexPath = path.join(packageRoot, "storybook-static", "index.json");
  if (!existsSync(indexPath)) return [];
  try {
    const index = JSON.parse(readFileSync(indexPath, "utf8")) as {
      entries?: Record<string, StoryIndexEntry>;
    };
    return Object.values(index.entries ?? {}).filter(
      (entry) => entry.type === "story" || !entry.type,
    );
  } catch {
    return [];
  }
}

function resolveImportPath(
  packageRoot: string,
  importPath: string,
): string | null {
  const normalized = importPath.replace(/\\/g, "/").replace(/^\.\//, "");
  const absolute = path.resolve(packageRoot, normalized);
  return existsSync(absolute) ? absolute : null;
}

/**
 * True when any story matching `storyIdPrefix` has a CSF/source file newer
 * than `storybook-static/index.json` (scoped staleness for agent loops).
 */
export function storySourcesNewerThanIndex(
  packageRoot: string,
  storyIdPrefix: string,
): boolean {
  const indexPath = path.join(packageRoot, "storybook-static", "index.json");
  if (!existsSync(indexPath)) return false;
  let indexMtime: number;
  try {
    indexMtime = statSync(indexPath).mtimeMs;
  } catch {
    return false;
  }

  const prefix = storyIdPrefix.trim();
  const entries = loadStoryEntries(packageRoot).filter((entry) => {
    if (!prefix) return true;
    return entry.id === prefix || entry.id.startsWith(prefix);
  });

  for (const entry of entries) {
    if (!entry.importPath) continue;
    const filePath = resolveImportPath(packageRoot, entry.importPath);
    if (!filePath) continue;
    try {
      if (statSync(filePath).mtimeMs > indexMtime) return true;
    } catch {
      /* ignore */
    }
  }
  return false;
}

/**
 * Decide whether `build-storybook` is required before Playwright.
 * Matches interaction-update reuse semantics, plus unskip / staleness / --rebuild.
 */
export function decideStorybookStaticBuild(options: {
  packageRoot: string;
  /** When true, refuse to build if the index is missing (caller should throw). */
  skipBuild: boolean;
  /** Always rebuild (unskip, CLI `--rebuild`, etc.). */
  forceRebuild?: boolean;
  forceReason?: Extract<StaticBuildReason, "unskip" | "explicit-rebuild">;
  /** Playwright `-g` prefix; scopes staleness checks. */
  storyIdPrefix: string;
}): StaticBuildDecision {
  const indexPath = path.join(
    options.packageRoot,
    "storybook-static",
    "index.json",
  );
  const indexExists = existsSync(indexPath);
  const complete = isStorybookStaticComplete(options.packageRoot);

  if (options.forceRebuild) {
    const reason = options.forceReason ?? "explicit-rebuild";
    return {
      shouldBuild: true,
      reason,
      message:
        reason === "unskip"
          ? "Rebuilding storybook-static — skip-visual removed (index must refresh)"
          : "Rebuilding storybook-static — explicit rebuild requested",
    };
  }

  if (!indexExists || !complete) {
    if (options.skipBuild) {
      return {
        shouldBuild: false,
        reason: "skip-build-missing",
        message: !indexExists
          ? "storybook-static/index.json missing — run `pnpm build-storybook` once"
          : "storybook-static incomplete (missing iframe.html) — run `pnpm build-storybook`",
      };
    }
    return {
      shouldBuild: true,
      reason: !indexExists ? "missing-index" : "incomplete-static",
      message: !indexExists
        ? "Building storybook-static — index.json missing"
        : "Rebuilding storybook-static — incomplete (missing iframe.html)",
    };
  }

  if (storySourcesNewerThanIndex(options.packageRoot, options.storyIdPrefix)) {
    return {
      shouldBuild: true,
      reason: "stale-source",
      message: "Rebuilding storybook-static — story source newer than index",
    };
  }

  return {
    shouldBuild: false,
    reason: "reuse",
    message: "Using existing storybook-static",
  };
}
