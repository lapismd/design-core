import { execFileSync } from "node:child_process";
import path from "node:path";
import { loadConfig } from "../config.js";
import { EXIT, GeneratorError } from "../errors.js";
import { log } from "../logger.js";
import { assertCleanGit } from "../adapters/git.js";
import { componentFromStoryId, requireRecipe } from "../recipes/index.js";
import {
  buildSnapshotManifest,
  listComponentSnapshotFiles,
  writeSnapshotManifest,
} from "../visual/snapshot-manifest.js";
import {
  storyIdPrefixFromStoryId,
  storyIdPrefixFromTitle,
} from "../visual/snapshot-paths.js";
import { ensurePlaywrightWebServerPort } from "../visual/ensure-playwright-webserver.js";
import {
  listSkipVisualStoryIdsForPrefix,
  patchStoriesVisualDeltaImages,
  removeSkipVisualFromStories,
} from "../visual/patch-story-visual-delta.js";
import {
  listStoryIdsForPrefix,
  markCreatedStoriesPending,
} from "../visual/patch-story-visual-review.js";
import {
  createRunContext,
  writeJson,
  writeReportMarkdown,
} from "../reports/report.js";

export async function runVisualUpdate(options: {
  component?: string;
  /** When set, derive the Playwright `-g` prefix from this story id. */
  storyId?: string;
  approved?: boolean;
  /** Skip clean-tree gate (Storybook Visual Delta panel). */
  allowDirty?: boolean;
  /** Skip `build-storybook` when static assets are already fresh. */
  skipBuild?: boolean;
  /**
   * Create missing baseline PNGs only (`updateSnapshots: "missing"`).
   * Does not overwrite existing files. Patches story visualDelta.images after.
   */
  createOnly?: boolean;
}) {
  const storyId = options.storyId?.trim();
  let component = options.component?.trim();
  const createOnly = Boolean(options.createOnly);

  if (storyId && !component) {
    component = componentFromStoryId(storyId);
  }

  if (!component && !storyId) {
    throw new GeneratorError(
      "test:visual:update requires --component <name> or --story-id <id>",
      EXIT.invalidRequest,
    );
  }
  if (component === "*" || component === "all") {
    throw new GeneratorError(
      "Refusing broad snapshot updates. Pass an explicit --component <name>.",
      EXIT.invalidRequest,
    );
  }

  const approved =
    options.approved || process.env.VISUAL_UPDATE_APPROVED === "1";
  if (!approved) {
    throw new GeneratorError(
      createOnly
        ? "Set VISUAL_UPDATE_APPROVED=1 to create missing visual baselines"
        : "Set VISUAL_UPDATE_APPROVED=1 to update existing visual baselines",
      EXIT.invalidRequest,
      "Example: VISUAL_UPDATE_APPROVED=1 pnpm test:visual:update --component button",
    );
  }

  const tasksShellTarget =
    (component?.toLowerCase().includes("tasks-shell") ?? false) ||
    (storyId?.includes("tasks-shell") ?? false);
  if (tasksShellTarget) {
    throw new GeneratorError(
      "Tasks Shell baselines are Superlist captures. Do not overwrite them with Playwright --update-snapshots.",
      EXIT.invalidRequest,
      "Re-sync with: pnpm --dir packages/tasks reference:sync-visual-baselines",
    );
  }

  const config = loadConfig();
  if (!options.allowDirty) {
    assertCleanGit(config.packageRoot);
  }

  const recipe = component ? requireRecipe(component) : undefined;
  const label = component ?? storyId ?? "unknown";
  const run = createRunContext(
    config,
    createOnly ? "visual-create" : "visual-update",
    label,
  );
  const snapshotDir = path.join(config.packageRoot, config.visual.snapshotDir);
  const before = buildSnapshotManifest(snapshotDir);
  writeSnapshotManifest(
    path.join(run.reportDir, "snapshot-manifest-before.json"),
    before,
  );

  const targets =
    component && recipe
      ? listComponentSnapshotFiles(
          snapshotDir,
          component,
          recipe.snapshotKeyIncludes,
        )
      : [];
  if (component && recipe && !targets.length) {
    log.warn(
      createOnly
        ? `No existing snapshots for "${component}". Playwright will create missing ones only.`
        : `No existing snapshots matched component "${component}". Playwright may create first snapshots for new stories only.`,
    );
  } else if (targets.length) {
    log.info(
      `${createOnly ? "Create-only (skip existing)" : "Updating"} snapshots:\n${targets.map((t) => `  - ${t}`).join("\n")}`,
    );
  }

  const grep = storyId
    ? storyIdPrefixFromStoryId(storyId)
    : storyIdPrefixFromTitle(recipe!.storyTitle);
  log.info(`Playwright filter: -g ${JSON.stringify(grep)}`);

  let skipBuild = Boolean(options.skipBuild);
  if (createOnly) {
    // Opt every skip-visual story under the component prefix into capture
    // (sidebar "create for component" only passes one leaf story id).
    const unskipIds = [
      ...new Set([
        ...(storyId ? [storyId] : []),
        ...listSkipVisualStoryIdsForPrefix({
          packageRoot: config.packageRoot,
          storyIdPrefix: grep,
        }),
      ]),
    ];
    const unskipped = removeSkipVisualFromStories({
      packageRoot: config.packageRoot,
      storyIds: unskipIds,
    });
    if (unskipped.length) {
      log.info(
        `Removed skip-visual from ${unskipped.length} stor${unskipped.length === 1 ? "y" : "ies"} before create:\n${unskipped.map((id) => `  - ${id}`).join("\n")}`,
      );
      // Index must refresh so Playwright no longer filters the stories out.
      skipBuild = false;
    }
  }

  if (!skipBuild) {
    // Build Storybook first so the visual suite has static assets.
    execFileSync("pnpm", ["build-storybook"], {
      cwd: config.packageRoot,
      stdio: "inherit",
    });
  }

  await ensurePlaywrightWebServerPort();

  execFileSync(
    "pnpm",
    ["exec", "playwright", "test", "--update-snapshots", "-g", grep],
    {
      cwd: config.packageRoot,
      stdio: "inherit",
      env: {
        ...process.env,
        PLAYWRIGHT_UPDATE_SNAPSHOTS: "1",
        ...(createOnly ? { PLAYWRIGHT_UPDATE_MODE: "missing" } : {}),
      },
    },
  );

  let patchResult: {
    patched: string[];
    alreadyWired: string[];
    skipped: string[];
  } | null = null;
  if (createOnly) {
    patchResult = patchStoriesVisualDeltaImages({
      packageRoot: config.packageRoot,
      storyIdPrefix: grep,
    });
    log.info(
      `Story visualDelta patch: ${patchResult.patched.length} updated, ${patchResult.alreadyWired.length} already wired, ${patchResult.skipped.length} skipped`,
    );
    const toMarkPending = [...patchResult.patched, ...patchResult.alreadyWired];
    if (toMarkPending.length) {
      const pending = markCreatedStoriesPending({
        packageRoot: config.packageRoot,
        storyIds: toMarkPending,
      });
      log.info(
        `Story review pending: ${pending.marked.length} marked, ${pending.skipped.length} skipped`,
      );
    }
  } else {
    // Overwrite: drop approved badges so rewritten baselines need re-review.
    const toReset = listStoryIdsForPrefix(config.packageRoot, grep);
    if (toReset.length) {
      const pending = markCreatedStoriesPending({
        packageRoot: config.packageRoot,
        storyIds: toReset,
        resetApproved: true,
      });
      log.info(
        `Story review pending (rewrite): ${pending.marked.length} marked, ${pending.skipped.length} skipped`,
      );
    }
  }

  const after = buildSnapshotManifest(snapshotDir);
  writeSnapshotManifest(
    path.join(run.reportDir, "snapshot-manifest-after.json"),
    after,
  );
  writeJson(path.join(run.reportDir, "report.json"), {
    component: component ?? null,
    storyId: storyId ?? null,
    createOnly,
    targets,
    grep,
    beforeCount: Object.keys(before).length,
    afterCount: Object.keys(after).length,
    patchedStories: patchResult?.patched ?? [],
    alreadyWiredStories: patchResult?.alreadyWired ?? [],
  });
  writeReportMarkdown(
    run.reportDir,
    createOnly ? "Visual baseline create" : "Visual baseline update",
    [
      {
        heading: "Component",
        body: component ?? "(from story id)",
      },
      {
        heading: "Story id",
        body: storyId ?? "(none)",
      },
      {
        heading: "Mode",
        body: createOnly ? "create-only (missing PNGs)" : "update (overwrite)",
      },
      {
        heading: "Matched existing files",
        body: targets.length ? targets.join("\n") : "(none)",
      },
      ...(patchResult
        ? [
            {
              heading: "Patched stories",
              body: patchResult.patched.length
                ? patchResult.patched.join("\n")
                : "(none)",
            },
            {
              heading: "Already wired stories",
              body: patchResult.alreadyWired.length
                ? patchResult.alreadyWired.join("\n")
                : "(none)",
            },
          ]
        : []),
    ],
  );

  log.ok(
    createOnly
      ? component
        ? `Created missing visual baselines for ${component}`
        : `Created missing visual baselines for ${grep}`
      : component
        ? `Updated visual baselines for ${component}`
        : `Updated visual baselines for ${grep}`,
  );
  log.info(`Report: ${run.reportDir}`);
}
