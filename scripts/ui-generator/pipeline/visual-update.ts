import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { loadConfig } from "../config.js";
import { EXIT, GeneratorError } from "../errors.js";
import { log } from "../logger.js";
import { assertCleanGit } from "../adapters/git.js";
import { requireRecipe } from "../recipes/index.js";
import {
  buildSnapshotManifest,
  listComponentSnapshotFiles,
  writeSnapshotManifest,
} from "../visual/snapshot-manifest.js";
import {
  nestedSnapshotFileName,
  storyIdPrefixFromTitle,
  type StoryIndexEntry,
} from "../visual/snapshot-paths.js";
import { ensureWarmStaticStorybookServer } from "../visual/ensure-playwright-webserver.js";
import {
  listSkipVisualStoryIdsForPrefix,
  patchStoriesVisualDeltaImages,
  removeSkipVisualFromStories,
} from "../visual/patch-story-visual-delta.js";
import {
  listStoryIdsForPrefix,
  markCreatedStoriesPending,
} from "../visual/patch-story-visual-review.js";
import { decideStorybookStaticBuild } from "../visual/storybook-static-build.js";
import {
  createRunContext,
  writeJson,
  writeReportMarkdown,
} from "../reports/report.js";

export async function runVisualUpdate(options: {
  component?: string;
  /** Exact story ids; repeated CLI flags are captured in one Playwright run. */
  storyIds?: string[];
  approved?: boolean;
  /** Skip clean-tree gate (Storybook Visual Delta panel). */
  allowDirty?: boolean;
  /**
   * Prefer reusing `storybook-static` (interaction-update semantics).
   * Still rebuilds when the index is missing (unless set), sources are stale,
   * skip-visual was removed, or `--rebuild` is passed.
   */
  skipBuild?: boolean;
  /** Always run `build-storybook` before Playwright. */
  rebuild?: boolean;
  /**
   * Create missing baseline PNGs only (`updateSnapshots: "missing"`).
   * Does not overwrite existing files. Patches story visualDelta.images after.
   */
  createOnly?: boolean;
}) {
  const storyIds = [
    ...new Set(
      (options.storyIds ?? []).map((storyId) => storyId.trim()).filter(Boolean),
    ),
  ];
  const component = options.component?.trim();
  const createOnly = Boolean(options.createOnly);

  if (!component && !storyIds.length) {
    throw new GeneratorError(
      "test:visual:update requires --component <name> or --story-id <id>",
      EXIT.invalidRequest,
    );
  }
  if (component && storyIds.length) {
    throw new GeneratorError(
      "Choose exact --story-id values or one explicit --component, not both",
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

  const config = loadConfig();
  if (!options.allowDirty) {
    assertCleanGit(config.packageRoot);
  }

  const recipe = component ? requireRecipe(component) : undefined;
  const label =
    component ??
    (storyIds.length === 1 ? storyIds[0]! : `${storyIds.length}-stories`);
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

  const targetStoryIds = new Set(storyIds);
  const indexPath = path.join(
    config.packageRoot,
    "storybook-static/index.json",
  );
  const indexEntries = existsSync(indexPath)
    ? Object.values(
        (
          JSON.parse(readFileSync(indexPath, "utf8")) as {
            entries?: Record<string, StoryIndexEntry>;
          }
        ).entries ?? {},
      ).filter((entry) => entry.type === "story")
    : [];
  const targets = component
    ? listComponentSnapshotFiles(
        snapshotDir,
        component,
        recipe!.snapshotKeyIncludes,
      )
    : indexEntries
        .filter((entry) => targetStoryIds.has(entry.id))
        .map((entry) => nestedSnapshotFileName(entry))
        .filter((relative) => existsSync(path.join(snapshotDir, relative)));
  if (component && !targets.length) {
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

  const grep = storyIds.length
    ? exactStoryIdGrep(storyIds)
    : storyIdPrefixFromTitle(recipe!.storyTitle);
  log.info(`Playwright filter: -g ${JSON.stringify(grep)}`);

  let forceRebuild = Boolean(options.rebuild);
  let forceReason: "unskip" | "explicit-rebuild" | undefined = options.rebuild
    ? "explicit-rebuild"
    : undefined;
  if (createOnly) {
    const unskipIds = storyIds.length
      ? storyIds
      : listSkipVisualStoryIdsForPrefix({
          packageRoot: config.packageRoot,
          storyIdPrefix: grep,
        });
    const unskipped = removeSkipVisualFromStories({
      packageRoot: config.packageRoot,
      storyIds: unskipIds,
    });
    if (unskipped.length) {
      log.info(
        `Removed skip-visual from ${unskipped.length} stor${unskipped.length === 1 ? "y" : "ies"} before create:\n${unskipped.map((id) => `  - ${id}`).join("\n")}`,
      );
      // Index must refresh so Playwright no longer filters the stories out.
      forceRebuild = true;
      forceReason = "unskip";
    }
  }

  const buildDecision = decideStorybookStaticBuild({
    packageRoot: config.packageRoot,
    skipBuild: Boolean(options.skipBuild),
    forceRebuild,
    forceReason,
    storyIdPrefix: grep,
    storyIds: storyIds.length ? storyIds : undefined,
  });
  if (buildDecision.reason === "skip-build-missing") {
    throw new GeneratorError(buildDecision.message, EXIT.invalidRequest);
  }
  log.info(buildDecision.message);
  if (buildDecision.shouldBuild) {
    execFileSync("pnpm", ["build-storybook"], {
      cwd: config.packageRoot,
      stdio: "inherit",
    });
  }

  await ensureWarmStaticStorybookServer(config.packageRoot);

  // CLI `--update-snapshots` defaults to "all" and overrides config — always
  // pass an explicit mode so create-only cannot rewrite existing PNGs.
  // Create-only may still exit non-zero when *existing* baselines mismatch;
  // continue so newly written PNGs still get CSF wiring.
  try {
    execFileSync(
      "pnpm",
      [
        "exec",
        "playwright",
        "test",
        `--update-snapshots=${createOnly ? "missing" : "all"}`,
        "-g",
        grep,
      ],
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
  } catch (error) {
    if (!createOnly) throw error;
    log.warn(
      "Playwright exited non-zero during create-only (often existing baseline diffs). Continuing CSF wiring for any new PNGs.",
    );
  }

  let patchResult: {
    patched: string[];
    alreadyWired: string[];
    skipped: string[];
  } | null = null;
  let reviewReset: { marked: string[]; skipped: string[] } | null = null;
  if (createOnly) {
    patchResult = patchStoriesVisualDeltaImages({
      packageRoot: config.packageRoot,
      ...(storyIds.length ? { storyIds } : { storyIdPrefix: grep }),
    });
    log.info(
      `Story visualDelta patch: ${patchResult.patched.length} updated, ${patchResult.alreadyWired.length} already wired, ${patchResult.skipped.length} skipped`,
    );
    // Only newly wired stories — do not reset review tags on already-wired ones.
    if (patchResult.patched.length) {
      const pending = markCreatedStoriesPending({
        packageRoot: config.packageRoot,
        storyIds: patchResult.patched,
      });
      reviewReset = pending;
      log.info(
        `Story review pending: ${pending.marked.length} marked, ${pending.skipped.length} skipped`,
      );
    }
  } else {
    // Overwrite: drop approved badges so rewritten baselines need re-review.
    const toReset = storyIds.length
      ? storyIds
      : listStoryIdsForPrefix(config.packageRoot, grep);
    if (toReset.length) {
      const pending = markCreatedStoriesPending({
        packageRoot: config.packageRoot,
        storyIds: toReset,
        resetApproved: true,
      });
      reviewReset = pending;
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
    storyId: storyIds.length === 1 ? storyIds[0] : null,
    storyIds,
    createOnly,
    targets,
    grep,
    beforeCount: Object.keys(before).length,
    afterCount: Object.keys(after).length,
    patchedStories: patchResult?.patched ?? [],
    alreadyWiredStories: patchResult?.alreadyWired ?? [],
    reviewResetStoryIds: reviewReset?.marked ?? [],
    reviewResetSkippedStoryIds: reviewReset?.skipped ?? [],
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
        body: storyIds.length ? storyIds.join("\n") : "(none)",
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
      ...(reviewReset
        ? [
            {
              heading: "Review tags reset",
              body: reviewReset.marked.length
                ? reviewReset.marked.join("\n")
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
        : `Created missing visual baselines for ${storyIds.length} ${storyIds.length === 1 ? "story" : "stories"}`
      : component
        ? `Updated visual baselines for ${component}`
        : `Updated visual baselines for ${storyIds.length} ${storyIds.length === 1 ? "story" : "stories"}`,
  );
  log.info(`Report: ${run.reportDir}`);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** One escaped Playwright selector that matches only the supplied story IDs. */
export function exactStoryIdGrep(storyIds: readonly string[]): string {
  const exact = [...new Set(storyIds.map((storyId) => storyId.trim()))]
    .filter(Boolean)
    .map(escapeRegExp);
  if (!exact.length) {
    throw new Error("At least one exact story id is required");
  }
  const leaf = exact.length === 1 ? exact[0] : `(?:${exact.join("|")})`;
  return `(?:^| › )${leaf}$`;
}
