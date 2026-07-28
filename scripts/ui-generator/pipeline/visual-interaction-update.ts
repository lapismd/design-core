import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { loadConfig } from "../config.js";
import { EXIT, GeneratorError } from "../errors.js";
import { log } from "../logger.js";
import { assertCleanGit } from "../adapters/git.js";
import { ensureWarmStaticStorybookServer } from "../visual/ensure-playwright-webserver.js";
import {
  interactionBaselinePngPath,
  interactionBaselineUrl,
  visualDeltaInteractionEntry,
} from "../visual/interaction-baselines.js";
import { patchStoryVisualDeltaInteraction } from "../visual/patch-story-visual-delta.js";
import { isStorybookStaticComplete } from "../visual/storybook-static-build.js";
import {
  interactionSnapshotUpdateMode,
  slugifyStepLabel,
} from "../../../packages/storybook-addon-visual-delta/src/shared/interaction-capture.js";
import type { StoryIndexEntry } from "../visual/snapshot-paths.js";

function loadStoryEntry(packageRoot: string, storyId: string): StoryIndexEntry {
  const indexPath = path.join(packageRoot, "storybook-static", "index.json");
  if (!existsSync(indexPath)) {
    throw new GeneratorError(
      "storybook-static/index.json missing — build Storybook first",
      EXIT.invalidRequest,
    );
  }
  const index = JSON.parse(readFileSync(indexPath, "utf8")) as {
    entries?: Record<string, StoryIndexEntry>;
  };
  const entry = Object.values(index.entries ?? {}).find(
    (e) => e.id === storyId,
  );
  if (!entry) {
    throw new GeneratorError(
      `Story not found in index: ${storyId}`,
      EXIT.invalidRequest,
    );
  }
  return entry;
}

/**
 * Create or overwrite one mid-play interaction baseline. Named steps park at
 * `?visualCaptureUntil=<stepId>`; ordinary Storybook Interactions rows replay
 * through the exact deterministic instrumenter call selected by the user.
 */
export async function runVisualInteractionUpdate(options: {
  storyId: string;
  /** Step label as written in `step("…")` (or already-slugified id). */
  stepLabel: string;
  stepId?: string;
  captureCallId?: string;
  approved?: boolean;
  allowDirty?: boolean;
  skipBuild?: boolean;
  /** When true, refuse to overwrite an existing interaction PNG. */
  createOnly?: boolean;
}) {
  const storyId = options.storyId.trim();
  const stepLabel = options.stepLabel.trim();
  const stepId = (options.stepId ?? slugifyStepLabel(stepLabel)).trim();
  if (!storyId || !stepLabel || !stepId) {
    throw new GeneratorError(
      "visual-interaction-update requires --story-id and --step-label",
      EXIT.invalidRequest,
    );
  }

  const approved =
    options.approved || process.env.VISUAL_UPDATE_APPROVED === "1";
  if (!approved) {
    throw new GeneratorError(
      "Set VISUAL_UPDATE_APPROVED=1 to write interaction baselines",
      EXIT.invalidRequest,
    );
  }

  const config = loadConfig();
  if (!options.allowDirty) {
    assertCleanGit(config.packageRoot);
  }

  // Prefer an existing static build while Storybook is running — a full
  // `build-storybook` cleans storybook-static and can drop the streamed panel
  // response. Rebuild only when missing/incomplete or explicitly requested.
  const staticComplete = isStorybookStaticComplete(config.packageRoot);
  const shouldBuild = !options.skipBuild && !staticComplete;
  if (shouldBuild) {
    log.info("Building storybook-static for interaction capture…");
    execFileSync("pnpm", ["build-storybook"], {
      cwd: config.packageRoot,
      stdio: "inherit",
    });
  } else if (!staticComplete) {
    throw new GeneratorError(
      "storybook-static incomplete (need index.json + iframe.html) — run `pnpm build-storybook` once",
      EXIT.invalidRequest,
    );
  } else if (!options.skipBuild) {
    log.info(
      "Using existing storybook-static (pass without --skip-build only rebuilds when missing)",
    );
  }

  const entry = loadStoryEntry(config.packageRoot, storyId);
  if ((entry.tags ?? []).includes("skip-visual")) {
    throw new GeneratorError(`${storyId} is skip-visual`, EXIT.invalidRequest);
  }

  const pngPath = interactionBaselinePngPath(entry, stepId, config.packageRoot);
  if (options.createOnly && existsSync(pngPath)) {
    log.info(`Interaction baseline already exists: ${pngPath}`);
    const patch = patchStoryVisualDeltaInteraction({
      packageRoot: config.packageRoot,
      storyId,
      interaction: visualDeltaInteractionEntry(entry, stepId, stepLabel),
    });
    if (!patch.ok) {
      throw new GeneratorError(
        patch.error ?? "Failed to patch visualDelta.interactions",
        EXIT.invalidRequest,
      );
    }
    return;
  }

  await ensureWarmStaticStorybookServer(config.packageRoot);

  const capturePayload = JSON.stringify({
    storyId,
    stepId,
    stepLabel,
    captureCallId: options.captureCallId?.trim() || undefined,
  });

  log.info(`Capturing interaction "${stepLabel}" (${stepId}) for ${storyId}…`);
  // PLAYWRIGHT_INTERACTION_CAPTURE registers only this one test in storybook.spec.ts.
  // Do not use `-g`: Playwright titles include the describe prefix and the
  // anchored pattern matched nothing ("No tests found").
  const updateMode = interactionSnapshotUpdateMode(options.createOnly);
  execFileSync(
    "pnpm",
    [
      "exec",
      "playwright",
      "test",
      "tests/visual/storybook.spec.ts",
      `--update-snapshots=${updateMode}`,
    ],
    {
      cwd: config.packageRoot,
      stdio: "inherit",
      env: {
        ...process.env,
        VISUAL_UPDATE_APPROVED: "1",
        PLAYWRIGHT_UPDATE_SNAPSHOTS: "1",
        PLAYWRIGHT_UPDATE_MODE: updateMode,
        PLAYWRIGHT_INTERACTION_CAPTURE: capturePayload,
      },
    },
  );

  if (!existsSync(pngPath)) {
    throw new GeneratorError(
      `Expected interaction PNG missing after capture: ${pngPath}`,
      EXIT.invalidRequest,
    );
  }

  const src = interactionBaselineUrl(entry, stepId);
  const patch = patchStoryVisualDeltaInteraction({
    packageRoot: config.packageRoot,
    storyId,
    interaction: { id: stepId, label: stepLabel, src },
  });
  if (!patch.ok) {
    throw new GeneratorError(
      patch.error ?? "Failed to patch visualDelta.interactions",
      EXIT.invalidRequest,
    );
  }
  log.info(`Wired ${src}`);
}
