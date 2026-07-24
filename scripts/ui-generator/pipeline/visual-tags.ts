import { EXIT, GeneratorError } from "../errors.js";
import { log } from "../logger.js";
import { getRecipe } from "../recipes/index.js";
import {
  isVisualReviewStatus,
  type VisualReviewStatus,
} from "../../../packages/storybook-addon-visual-delta/src/constants.js";
import { patchStorySkipVisual } from "../visual/patch-story-visual-delta.js";
import {
  listStoryIdsForPrefix,
  patchStoryVisualReviewStatus,
} from "../visual/patch-story-visual-review.js";
import {
  storyIdPrefixFromStoryId,
  storyIdPrefixFromTitle,
} from "../visual/snapshot-paths.js";

export type VisualTagAction = "skip" | "include" | "review";

export type VisualTagResult = {
  action: VisualTagAction;
  status?: VisualReviewStatus;
  storyIds: string[];
  updated: string[];
  errors: Array<{ storyId: string; error: string }>;
};

/** Normalize a story-id prefix so `listStoryIdsForPrefix` can match leaf ids. */
export function normalizeStoryIdPrefix(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (trimmed.includes("--")) {
    return storyIdPrefixFromStoryId(trimmed);
  }
  return trimmed.endsWith("-") ? trimmed : `${trimmed}--`;
}

/**
 * Resolve leaf story ids from `--story-id`, `--component`, or `--prefix`.
 * Requires `storybook-static/index.json` for component/prefix expansion.
 */
export function resolveVisualTagStoryIds(options: {
  packageRoot: string;
  storyId?: string;
  component?: string;
  prefix?: string;
  /** Include stories already tagged `skip-visual` (needed for include/skip). */
  includeSkipVisual?: boolean;
}): string[] {
  const storyId = options.storyId?.trim();
  if (storyId) return [storyId];

  const prefixRaw = options.prefix?.trim();
  const component = options.component?.trim();

  let prefix = "";
  if (prefixRaw) {
    prefix = normalizeStoryIdPrefix(prefixRaw);
  } else if (component) {
    if (component === "*" || component === "all") {
      throw new GeneratorError(
        "Refusing broad tag updates. Pass an explicit --component, --story-id, or --prefix.",
        EXIT.invalidRequest,
      );
    }
    const recipe = getRecipe(component);
    prefix = recipe
      ? storyIdPrefixFromTitle(recipe.storyTitle)
      : normalizeStoryIdPrefix(component);
  } else {
    throw new GeneratorError(
      "visual:tag requires --story-id <id>, --component <name>, or --prefix <story-id-prefix>",
      EXIT.invalidRequest,
    );
  }

  const ids = listStoryIdsForPrefix(options.packageRoot, prefix, {
    includeSkipVisual: options.includeSkipVisual,
  });
  if (!ids.length) {
    throw new GeneratorError(
      `No stories found for prefix "${prefix}". Build Storybook first (pnpm build-storybook) so storybook-static/index.json exists.`,
      EXIT.invalidRequest,
    );
  }
  return ids;
}

export function runVisualTags(options: {
  packageRoot: string;
  action: VisualTagAction;
  status?: string;
  storyId?: string;
  component?: string;
  prefix?: string;
}): VisualTagResult {
  const { packageRoot, action } = options;

  if (action === "review") {
    if (!isVisualReviewStatus(options.status)) {
      throw new GeneratorError(
        "visual:tag review requires --status pending|ready|approved|failed",
        EXIT.invalidRequest,
      );
    }
  }

  const includeSkipVisual = action === "skip" || action === "include";
  const storyIds = resolveVisualTagStoryIds({
    packageRoot,
    storyId: options.storyId,
    component: options.component,
    prefix: options.prefix,
    includeSkipVisual,
  });

  const updated: string[] = [];
  const errors: Array<{ storyId: string; error: string }> = [];

  if (action === "skip" || action === "include") {
    const skip = action === "skip";
    for (const id of storyIds) {
      const result = patchStorySkipVisual({
        packageRoot,
        storyId: id,
        skip,
      });
      if (!result.ok) {
        errors.push({ storyId: id, error: result.error ?? "patch failed" });
        continue;
      }
      updated.push(id);
    }
  } else {
    const status = options.status as VisualReviewStatus;
    for (const id of storyIds) {
      const result = patchStoryVisualReviewStatus({
        packageRoot,
        storyId: id,
        status,
      });
      if (!result.ok) {
        errors.push({ storyId: id, error: result.error ?? "patch failed" });
        continue;
      }
      updated.push(id);
    }
  }

  const status =
    action === "review" && isVisualReviewStatus(options.status)
      ? options.status
      : undefined;

  if (errors.length) {
    log.warn(
      `visual:tag ${action}: ${updated.length} updated, ${errors.length} failed`,
    );
    for (const err of errors.slice(0, 10)) {
      log.warn(`  ${err.storyId}: ${err.error}`);
    }
    if (errors.length > 10) {
      log.warn(`  …and ${errors.length - 10} more`);
    }
  } else {
    log.ok(
      `visual:tag ${action}${status ? ` (${status})` : ""}: ${updated.length} stor${updated.length === 1 ? "y" : "ies"}`,
    );
  }

  if (!updated.length && errors.length) {
    throw new GeneratorError(
      `visual:tag ${action} failed for all ${storyIds.length} target stor${storyIds.length === 1 ? "y" : "ies"}`,
      EXIT.unexpected,
      errors.map((e) => `${e.storyId}: ${e.error}`).join("\n"),
    );
  }

  return {
    action,
    status,
    storyIds,
    updated,
    errors,
  };
}
