import { mkdirSync } from "node:fs";
import path from "node:path";
import { loadConfig } from "../config.js";
import { EXIT, GeneratorError } from "../errors.js";
import { log } from "../logger.js";
import {
  BATCH_A,
  BATCH_B,
  BATCH_C,
  BATCH_D,
  componentsForBatch,
  requireRecipe,
  type BatchName,
} from "../recipes/index.js";
import { syncUpstreamDocs } from "../docs/sync-upstream-docs.js";
import type { SyncUpstreamDocsResult } from "../docs/types.js";
import { writeJson } from "../reports/report.js";

function resolveBatchComponents(batch: string): string[] {
  const name = batch.trim().toLowerCase();
  if (name === "all") {
    return ["button", ...BATCH_A, ...BATCH_B, ...BATCH_C, ...BATCH_D];
  }
  if (name === "a") {
    return ["button", ...componentsForBatch("a")];
  }
  if (name === "b" || name === "c" || name === "d") {
    return componentsForBatch(name as BatchName);
  }
  throw new GeneratorError(
    'ui:docs --batch requires "a", "b", "c", "d", or "all"',
    EXIT.invalidRequest,
  );
}

async function syncOne(args: {
  component: string;
  fixture?: boolean;
  packageRoot: string;
  sharedRoot: string;
}): Promise<SyncUpstreamDocsResult> {
  const { component, fixture, packageRoot, sharedRoot } = args;
  const recipe = requireRecipe(component);
  const targetDir = path.join(sharedRoot, component);
  const fixturePath = fixture
    ? path.join(
        packageRoot,
        "scripts/ui-generator/fixtures/upstream-docs",
        `${component}.md`,
      )
    : undefined;

  return syncUpstreamDocs({
    component,
    targetDir: path.resolve(packageRoot, targetDir),
    storyTitle: recipe.storyTitle,
    sharedRoot: path.resolve(packageRoot, sharedRoot),
    markdownFixture: fixturePath,
  });
}

export async function runDocsSync(options: {
  component?: string;
  batch?: string;
  fixture?: boolean;
}) {
  const batch =
    typeof options.batch === "string" ? options.batch.trim() : undefined;
  const component = options.component?.trim();

  if (batch && component) {
    throw new GeneratorError(
      "ui:docs accepts either --component or --batch, not both",
      EXIT.invalidRequest,
    );
  }
  if (!batch && !component) {
    throw new GeneratorError(
      "ui:docs requires --component <name> or --batch <a|b|c|d|all>",
      EXIT.invalidRequest,
    );
  }

  const config = loadConfig();
  const components = batch
    ? resolveBatchComponents(batch)
    : [component!];

  const reportDir = path.join(
    config.packageRoot,
    config.reportsRoot,
    `docs-${batch ?? component}-${Date.now()}`,
  );
  mkdirSync(reportDir, { recursive: true });

  const results: SyncUpstreamDocsResult[] = [];
  const failures: Array<{ component: string; error: string }> = [];

  for (const name of components) {
    try {
      const result = await syncOne({
        component: name,
        fixture: options.fixture,
        packageRoot: config.packageRoot,
        sharedRoot: config.sharedRoot,
      });
      results.push(result);
      if (result.examplesSkipped.length) {
        log.warn(
          `${name}: skipped ${result.examplesSkipped.length} example(s): ${result.examplesSkipped
            .map((s) => s.name)
            .join(", ")}`,
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push({ component: name, error: message });
      log.fail(`${name}: ${message}`);
    }
  }

  writeJson(path.join(reportDir, "docs-sync.json"), { results, failures });
  log.info(`Report: ${reportDir}`);

  console.log("\nDocs sync summary");
  console.log(`  ok: ${results.length}`);
  console.log(`  failed: ${failures.length}`);
  for (const f of failures) {
    console.log(`    - ${f.component}: ${f.error}`);
  }
  const skippedTotal = results.reduce(
    (n, r) => n + r.examplesSkipped.length,
    0,
  );
  console.log(`  examples skipped (total): ${skippedTotal}`);

  if (failures.length) {
    throw new GeneratorError(
      `Docs sync failed for ${failures.length} component(s)`,
      EXIT.intake,
      failures.map((f) => `${f.component}: ${f.error}`).join("\n"),
    );
  }

  return { results, failures, reportDir };
}
