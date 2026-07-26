#!/usr/bin/env tsx
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  auditWorkspaceVisualCoverage,
  type StorybookIndex,
} from "./ui-generator/visual/workspace-visual-audit.js";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const args = new Set(process.argv.slice(2));

function readWorkspacePort(): string {
  return process.env.STORYBOOK_PORT ?? "9009";
}

async function loadIndex(): Promise<StorybookIndex> {
  const explicitIndex = process.argv
    .slice(2)
    .find((arg) => arg.startsWith("--index="))
    ?.slice("--index=".length);
  if (explicitIndex) {
    return JSON.parse(
      readFileSync(path.resolve(repoRoot, explicitIndex), "utf8"),
    ) as StorybookIndex;
  }

  const port = readWorkspacePort();
  try {
    const response = await fetch(`http://localhost:${port}/index.json`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return (await response.json()) as StorybookIndex;
  } catch (error) {
    const builtIndex = path.join(repoRoot, "storybook-static/index.json");
    if (!existsSync(builtIndex)) {
      throw new Error(
        `Could not load Storybook index from port ${port} and no built index exists: ${String(error)}`,
      );
    }
    return JSON.parse(readFileSync(builtIndex, "utf8")) as StorybookIndex;
  }
}

async function main(): Promise<void> {
  const result = auditWorkspaceVisualCoverage({
    index: await loadIndex(),
    snapshotRoot: path.join(
      repoRoot,
      "tests/visual/storybook.spec.ts-snapshots",
    ),
    requireBaselines: args.has("--require-baselines"),
  });

  if (args.has("--json")) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log("Workspace visual coverage");
    console.log(`  stories: ${result.summary.stories}`);
    console.log(`  visual-pending: ${result.summary.pending}`);
    console.log(`  visual-approved: ${result.summary.approved}`);
    console.log(`  visual-failed: ${result.summary.failed}`);
    console.log(`  skip-visual: ${result.summary.skipped}`);
    console.log(
      `  candidate baselines: ${result.summary.baselines}/${result.summary.candidateStories}`,
    );
    console.log(
      `  pending without baseline: ${result.summary.pendingWithoutBaseline}`,
    );
    console.log(`  orphan baselines: ${result.orphanBaselines.length}`);
    console.log(`  contract errors: ${result.errors.length}`);
    if (result.orphanBaselines.length) {
      console.log("\nOrphan baselines:");
      for (const file of result.orphanBaselines) console.log(`  - ${file}`);
    }
    if (result.errors.length) {
      console.log("\nContract errors:");
      for (const error of result.errors) console.log(`  - ${error}`);
    }
  }

  if (result.errors.length || result.orphanBaselines.length) {
    process.exitCode = 1;
  }
}

await main();
