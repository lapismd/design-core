/**
 * Re-convert one or more families in the main package tree (no worktree / clean git).
 * Usage: pnpm exec tsx scripts/ui-generator/reconvert-local.ts switch select
 */
import path from "node:path";
import { mkdirSync } from "node:fs";
import { loadConfig } from "./config.js";
import { convertFamilyInWorktree } from "./pipeline/convert-family.js";
import { log } from "./logger.js";

async function main() {
  const components = process.argv.slice(2).filter((a) => !a.startsWith("-"));
  if (!components.length) {
    throw new Error("Usage: reconvert-local.ts <component> [component...]");
  }
  const skipParity = process.argv.includes("--skip-parity");
  const config = loadConfig();
  const reportDir = path.join(
    config.packageRoot,
    ".ui-generator",
    "run",
    `reconvert-${Date.now()}`,
  );
  mkdirSync(reportDir, { recursive: true });

  for (const component of components) {
    log.step(`Re-converting ${component} in package root`);
    const result = await convertFamilyInWorktree({
      config,
      worktreePath: config.packageRoot,
      component,
      runId: `reconvert-${component}`,
      reportDir,
      skipParity,
    });
    log.ok(
      `${component}: wrote ${result.written.length} files (${result.family.allCandidates.length} candidates)`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
