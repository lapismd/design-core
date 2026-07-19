import { mkdirSync } from "node:fs";
import path from "node:path";
import { loadConfig } from "../config.js";
import { EXIT, GeneratorError } from "../errors.js";
import { log } from "../logger.js";
import { requireRecipe } from "../recipes/index.js";
import { syncUpstreamDocs } from "../docs/sync-upstream-docs.js";
import { writeJson } from "../reports/report.js";

export async function runDocsSync(options: {
  component?: string;
  fixture?: boolean;
}) {
  const component = options.component?.trim();
  if (!component) {
    throw new GeneratorError(
      "ui:docs requires --component <name>",
      EXIT.invalidRequest,
    );
  }

  const config = loadConfig();
  const recipe = requireRecipe(component);
  const targetDir = path.join(config.sharedRoot, component);
  const fixturePath = options.fixture
    ? path.join(
        config.packageRoot,
        "scripts/ui-generator/fixtures/upstream-docs",
        `${component}.md`,
      )
    : undefined;

  const result = await syncUpstreamDocs({
    component,
    targetDir: path.resolve(config.packageRoot, targetDir),
    storyTitle: recipe.storyTitle,
    sharedRoot: path.resolve(config.packageRoot, config.sharedRoot),
    markdownFixture: fixturePath,
  });

  const reportDir = path.join(
    config.packageRoot,
    config.reportsRoot,
    `docs-${component}-${Date.now()}`,
  );
  mkdirSync(reportDir, { recursive: true });
  writeJson(path.join(reportDir, "docs-sync.json"), result);
  log.info(`Report: ${reportDir}`);
  return result;
}
