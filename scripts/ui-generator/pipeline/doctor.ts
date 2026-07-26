import { existsSync } from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { loadConfig } from "../config.js";
import { EXIT, GeneratorError } from "../errors.js";
import { log } from "../logger.js";
import { assertCleanGit } from "../adapters/git.js";

export async function runDoctor(
  options: {
    requireClean?: boolean;
  } = {},
) {
  const config = loadConfig();
  const checks: string[] = [];

  const requiredPaths = [
    config.sharedRoot,
    config.storybook.configDir,
    config.visual.snapshotDir,
    config.shadcn.intakeFixture,
    "package.json",
    "pnpm-lock.yaml",
    "playwright.config.ts",
  ];

  for (const relative of requiredPaths) {
    const full = path.join(config.packageRoot, relative);
    if (!existsSync(full)) {
      throw new GeneratorError(
        `Missing required path: ${relative}`,
        EXIT.preflight,
      );
    }
    checks.push(`path ok: ${relative}`);
  }

  try {
    execFileSync("pnpm", ["exec", "shadcn-svelte", "--help"], {
      cwd: config.packageRoot,
      stdio: "ignore",
    });
    checks.push("shadcn-svelte executable available");
  } catch {
    throw new GeneratorError(
      "Pinned shadcn-svelte CLI is not available via pnpm exec",
      EXIT.preflight,
    );
  }

  try {
    execFileSync("pnpm", ["exec", "tailwindcss", "--help"], {
      cwd: config.packageRoot,
      stdio: "ignore",
    });
    checks.push("@tailwindcss/cli available");
  } catch {
    throw new GeneratorError(
      "Pinned @tailwindcss/cli is not available via pnpm exec",
      EXIT.preflight,
    );
  }

  if (options.requireClean) {
    const { head } = assertCleanGit(config.packageRoot);
    checks.push(`clean git HEAD ${head.slice(0, 12)}`);
  }

  for (const check of checks) log.ok(check);
  log.ok("Doctor checks passed");
  return { checks };
}
