import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { execa } from "execa";
import { loadConfig } from "../config.js";
import { EXIT, GeneratorError } from "../errors.js";
import { log } from "../logger.js";
import {
  assertCleanGit,
  assertHeadUnchanged,
  createBinaryPatch,
  createDetachedWorktree,
  applyBinaryPatch,
  validatePatchPaths,
} from "../adapters/git.js";
import {
  buildSnapshotManifest,
  writeSnapshotManifest,
} from "../visual/snapshot-manifest.js";
import {
  createRunContext,
  writeJson,
  writeReportMarkdown,
} from "../reports/report.js";
import {
  componentsForBatch,
  requireRecipe,
  type BatchName,
} from "../recipes/index.js";
import { runDoctor } from "./doctor.js";
import { convertFamilyInWorktree } from "./convert-family.js";

function isTargetSnapshotKey(key: string, includes: string[]): boolean {
  const lower = key.toLowerCase();
  return includes.some((token) => lower.includes(token.toLowerCase()));
}

export async function runBatch(options: {
  batch?: string;
  dryRun?: boolean;
  keepWorktree?: boolean;
  skipParity?: boolean;
}) {
  const batchName = options.batch?.trim().toLowerCase() as
    | BatchName
    | undefined;
  if (!batchName || !["a", "b", "c", "d"].includes(batchName)) {
    throw new GeneratorError(
      'ui:add:batch requires batch name "a", "b", "c", or "d"',
      EXIT.invalidRequest,
    );
  }

  const components = componentsForBatch(batchName);
  const recipes = components.map((c) => requireRecipe(c));
  const allSnapshotIncludes = recipes.flatMap((r) => r.snapshotKeyIncludes);

  const config = loadConfig();
  await runDoctor({ requireClean: true });
  const { head } = assertCleanGit(config.packageRoot);
  const run = createRunContext(config, "batch", `batch-${batchName}`);
  mkdirSync(path.join(run.reportDir, "logs"), { recursive: true });

  const snapshotDir = path.join(config.packageRoot, config.visual.snapshotDir);
  const beforeSnapshots = buildSnapshotManifest(snapshotDir);
  writeSnapshotManifest(
    path.join(run.reportDir, "snapshot-manifest-before.json"),
    beforeSnapshots,
  );

  const worktree = createDetachedWorktree(config, run.runId);
  log.ok(`Created isolated worktree for batch ${batchName}`);

  const convertedSummary: Array<{ component: string; files: number }> = [];

  try {
    log.step("Installing worktree dependencies");
    await execa("pnpm", ["install", "--frozen-lockfile", "--prefer-offline"], {
      cwd: worktree.path,
      stdio: "inherit",
    });

    for (const component of components) {
      log.step(`Converting ${component}`);
      const result = await convertFamilyInWorktree({
        config,
        worktreePath: worktree.path,
        component,
        runId: `${run.runId}-${component}`,
        reportDir: run.reportDir,
        skipParity: options.skipParity,
      });
      convertedSummary.push({
        component,
        files: result.written.length,
      });
    }

    log.step("Running static checks");
    await execa(
      "pnpm",
      ["exec", "svelte-check", "--tsconfig", "./tsconfig.json"],
      {
        cwd: worktree.path,
        stdio: "inherit",
      },
    );

    log.step("Running visual suite");
    await execa("pnpm", ["build-storybook"], {
      cwd: worktree.path,
      stdio: "inherit",
    });
    const visual = await execa("pnpm", ["exec", "playwright", "test"], {
      cwd: worktree.path,
      reject: false,
      env: { ...process.env, CI: "1" },
    });
    if (visual.exitCode !== 0) {
      throw new GeneratorError(
        "Visual suite failed after batch conversion. Review diffs, then update snapshots explicitly with `pnpm test:visual:update --component <name> --approved` (no auto-update).",
        EXIT.snapshotIntegrity,
        visual.stderr || visual.stdout || `exit ${visual.exitCode}`,
      );
    }

    const afterSnapshots = buildSnapshotManifest(
      path.join(worktree.path, config.visual.snapshotDir),
    );
    writeSnapshotManifest(
      path.join(run.reportDir, "snapshot-manifest-after.json"),
      afterSnapshots,
    );

    for (const [key, hash] of Object.entries(beforeSnapshots)) {
      if (isTargetSnapshotKey(key, allSnapshotIncludes)) continue;
      if (afterSnapshots[key] !== hash) {
        throw new GeneratorError(
          `Non-target snapshot changed during batch ${batchName}`,
          EXIT.snapshotIntegrity,
          key,
        );
      }
    }
    log.ok("Existing non-target snapshot hashes unchanged");

    log.step("Running Storybook Vitest");
    let storybookLog = "";
    let storybookOk = false;
    for (let attempt = 1; attempt <= 2; attempt++) {
      const storybookResult = await execa("pnpm", ["test:storybook"], {
        cwd: worktree.path,
        reject: false,
        all: true,
      });
      storybookLog += `\n--- attempt ${attempt} ---\n${storybookResult.all ?? ""}`;
      if (storybookResult.exitCode === 0) {
        storybookOk = true;
        break;
      }
      log.warn(
        `Storybook Vitest attempt ${attempt} failed; retrying once for flake`,
      );
    }
    writeFileSync(
      path.join(run.reportDir, "logs", "test-storybook.log"),
      storybookLog,
    );
    if (!storybookOk) {
      throw new GeneratorError(
        "Storybook Vitest failed in the generator worktree",
        EXIT.storybook,
        storybookLog.slice(-4000),
      );
    }
    log.ok("Storybook Vitest passed");

    writeReportMarkdown(run.reportDir, `Batch ${batchName}`, [
      {
        heading: "Components",
        body: convertedSummary
          .map((c) => `- ${c.component} (${c.files} files)`)
          .join("\n"),
      },
      {
        heading: "Result",
        body: options.dryRun
          ? "Dry run — patch not applied"
          : "Ready to apply patch",
      },
    ]);

    execFileSync("git", ["add", "-A"], { cwd: worktree.path });
    const patchPath = path.join(run.reportDir, "component.patch");
    createBinaryPatch(worktree.path, patchPath);
    const patchContent = readFileSync(patchPath, "utf8");
    if (!patchContent.trim()) {
      throw new GeneratorError(
        "No changes produced by batch conversion",
        EXIT.generation,
      );
    }
    const paths = validatePatchPaths(patchContent, config.pathAllowlist);
    writeJson(path.join(run.reportDir, "report.json"), {
      batch: batchName,
      components,
      dryRun: Boolean(options.dryRun),
      paths,
      head,
    });

    if (options.dryRun) {
      log.ok("Dry run complete — repository unchanged");
      log.info(`Report: ${run.reportDir}`);
      return;
    }

    assertHeadUnchanged(config.packageRoot, head);
    applyBinaryPatch(config.packageRoot, patchPath, config.pathAllowlist);
    log.ok(`Applied batch ${batchName} patch`);
    log.info(`Report: ${run.reportDir}`);
    console.log("\nAdded/updated:");
    for (const p of paths) console.log(`  ${p}`);
  } catch (error) {
    writeJson(path.join(run.reportDir, "failure.json"), {
      message: error instanceof Error ? error.message : String(error),
      details: error instanceof GeneratorError ? error.details : undefined,
    });
    log.fail(error instanceof Error ? error.message : String(error));
    log.info(`No repository files were changed.`);
    log.info(`Report: ${run.reportDir}`);
    throw error;
  } finally {
    worktree.dispose(options.keepWorktree);
  }
}
