import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
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
  assertSnapshotManifestUnchanged,
  buildSnapshotManifest,
  writeSnapshotManifest,
} from "../visual/snapshot-manifest.js";
import {
  createRunContext,
  writeJson,
  writeReportMarkdown,
} from "../reports/report.js";
import { requireRecipe } from "../recipes/index.js";
import { runDoctor } from "./doctor.js";
import { convertFamilyInWorktree } from "./convert-family.js";

function isTargetSnapshotKey(key: string, includes: string[]): boolean {
  const lower = key.toLowerCase();
  return includes.some((token) => lower.includes(token.toLowerCase()));
}

async function runStorybookVitest(worktreePath: string, reportDir: string) {
  log.step("Running Storybook Vitest");
  let storybookLog = "";
  let storybookOk = false;
  for (let attempt = 1; attempt <= 2; attempt++) {
    const storybookResult = await execa("pnpm", ["test:storybook"], {
      cwd: worktreePath,
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
    path.join(reportDir, "logs", "test-storybook.log"),
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
}

export async function runAdd(options: {
  component?: string;
  overwrite?: boolean;
  dryRun?: boolean;
  keepWorktree?: boolean;
  skipParity?: boolean;
  /** Skip Storybook build + Playwright (use when regenerating, then visual-update separately). */
  skipVisual?: boolean;
}) {
  const component = options.component?.trim();
  if (!component) {
    throw new GeneratorError(
      "ui:add requires a component name",
      EXIT.invalidRequest,
    );
  }

  const recipe = requireRecipe(component);
  if (!recipe.convertAllowed) {
    throw new GeneratorError(
      `Component "${component}" is not convertible (tier=${recipe.tier})`,
      EXIT.invalidRequest,
      "Use ui:inspect and add a recipe with convertAllowed, or convert a supported batch family.",
    );
  }

  const config = loadConfig();
  await runDoctor({ requireClean: true });
  const { head } = assertCleanGit(config.packageRoot);
  const run = createRunContext(config, "add", component);
  mkdirSync(path.join(run.reportDir, "logs"), { recursive: true });

  const targetRel = path.join(config.sharedRoot, component);
  const targetAbs = path.join(config.packageRoot, targetRel);
  if (existsSync(targetAbs) && !options.overwrite) {
    throw new GeneratorError(
      `Component "${component}" already exists. Pass --overwrite to convert in place.`,
      EXIT.invalidRequest,
      targetRel,
    );
  }

  const snapshotDir = path.join(config.packageRoot, config.visual.snapshotDir);
  const beforeSnapshots = buildSnapshotManifest(snapshotDir);
  writeSnapshotManifest(
    path.join(run.reportDir, "snapshot-manifest-before.json"),
    beforeSnapshots,
  );

  const worktree = createDetachedWorktree(config, run.runId);
  log.ok("Created isolated worktree");

  try {
    log.step("Installing worktree dependencies");
    await execa("pnpm", ["install", "--frozen-lockfile", "--prefer-offline"], {
      cwd: worktree.path,
      stdio: "inherit",
    });

    const converted = await convertFamilyInWorktree({
      config,
      worktreePath: worktree.path,
      component,
      runId: run.runId,
      reportDir: run.reportDir,
      skipParity: options.skipParity,
    });

    log.step("Running static checks");
    await execa(
      "pnpm",
      ["exec", "svelte-check", "--tsconfig", "./tsconfig.json"],
      {
        cwd: worktree.path,
        stdio: "inherit",
      },
    );

    if (!options.skipVisual) {
      log.step("Running existing visual suite (immutable — no auto-update)");
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
          `Visual suite failed after converting ${component}. Review diffs, then update snapshots explicitly with \`pnpm test:visual:update --component ${component} --approved\` (no auto-update).`,
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
        if (isTargetSnapshotKey(key, recipe.snapshotKeyIncludes)) continue;
        if (afterSnapshots[key] !== hash) {
          throw new GeneratorError(
            `Non-target snapshot changed during ui:add (${component})`,
            EXIT.snapshotIntegrity,
            key,
          );
        }
      }
      log.ok("Existing non-target snapshot hashes unchanged");
    } else {
      log.warn(
        "Skipping visual suite (--skip-visual); update snapshots explicitly afterward",
      );
    }
    void assertSnapshotManifestUnchanged;

    await runStorybookVitest(worktree.path, run.reportDir);

    writeReportMarkdown(run.reportDir, `Add ${component}`, [
      {
        heading: "Result",
        body: options.dryRun
          ? "Dry run — patch not applied"
          : "Ready to apply patch",
      },
      {
        heading: "Tier",
        body: recipe.tier,
      },
      {
        heading: "Files",
        body: converted.written
          .map((f) => path.relative(worktree.path, f))
          .join("\n"),
      },
      {
        heading: "Candidates",
        body: String(converted.family.allCandidates.length),
      },
    ]);

    execFileSync("git", ["add", "-A"], { cwd: worktree.path });

    const patchPath = path.join(run.reportDir, "component.patch");
    createBinaryPatch(worktree.path, patchPath);
    const patchContent = readFileSync(patchPath, "utf8");
    if (!patchContent.trim()) {
      throw new GeneratorError(
        "No changes produced by conversion",
        EXIT.generation,
      );
    }
    const paths = validatePatchPaths(patchContent, config.pathAllowlist);
    writeJson(path.join(run.reportDir, "report.json"), {
      component,
      dryRun: Boolean(options.dryRun),
      paths,
      head,
    });

    if (options.dryRun) {
      log.ok(
        "Dry run complete — patch retained in report, repository unchanged",
      );
      log.info(`Report: ${run.reportDir}`);
      log.info(`Patch: ${patchPath}`);
      return;
    }

    assertHeadUnchanged(config.packageRoot, head);
    applyBinaryPatch(config.packageRoot, patchPath, config.pathAllowlist);
    log.ok("Applied patch to the current worktree");
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
