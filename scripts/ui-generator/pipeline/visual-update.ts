import { execFileSync } from "node:child_process";
import path from "node:path";
import { loadConfig } from "../config.js";
import { EXIT, GeneratorError } from "../errors.js";
import { log } from "../logger.js";
import { assertCleanGit } from "../adapters/git.js";
import {
  buildSnapshotManifest,
  listComponentSnapshotFiles,
  writeSnapshotManifest,
} from "../visual/snapshot-manifest.js";
import {
  createRunContext,
  writeJson,
  writeReportMarkdown,
} from "../reports/report.js";

export async function runVisualUpdate(options: {
  component?: string;
  approved?: boolean;
}) {
  const component = options.component?.trim();
  if (!component) {
    throw new GeneratorError(
      "test:visual:update requires --component <name>",
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
      "Set VISUAL_UPDATE_APPROVED=1 to update existing visual baselines",
      EXIT.invalidRequest,
      "Example: VISUAL_UPDATE_APPROVED=1 pnpm test:visual:update --component button",
    );
  }

  const config = loadConfig();
  assertCleanGit(config.packageRoot);
  const run = createRunContext(config, "visual-update", component);
  const snapshotDir = path.join(config.packageRoot, config.visual.snapshotDir);
  const before = buildSnapshotManifest(snapshotDir);
  writeSnapshotManifest(
    path.join(run.reportDir, "snapshot-manifest-before.json"),
    before,
  );

  const targets = listComponentSnapshotFiles(snapshotDir, component);
  if (!targets.length) {
    log.warn(
      `No existing snapshots matched component "${component}". Playwright may create first snapshots for new stories only.`,
    );
  } else {
    log.info(
      `Updating snapshots:\n${targets.map((t) => `  - ${t}`).join("\n")}`,
    );
  }

  // Build Storybook first so the visual suite has static assets.
  execFileSync("pnpm", ["build-storybook"], {
    cwd: config.packageRoot,
    stdio: "inherit",
  });

  execFileSync("pnpm", ["exec", "playwright", "test", "--update-snapshots"], {
    cwd: config.packageRoot,
    stdio: "inherit",
    env: {
      ...process.env,
      PLAYWRIGHT_UPDATE_SNAPSHOTS: "1",
    },
  });

  const after = buildSnapshotManifest(snapshotDir);
  writeSnapshotManifest(
    path.join(run.reportDir, "snapshot-manifest-after.json"),
    after,
  );
  writeJson(path.join(run.reportDir, "report.json"), {
    component,
    targets,
    beforeCount: Object.keys(before).length,
    afterCount: Object.keys(after).length,
  });
  writeReportMarkdown(run.reportDir, "Visual baseline update", [
    {
      heading: "Component",
      body: component,
    },
    {
      heading: "Matched existing files",
      body: targets.length ? targets.join("\n") : "(none)",
    },
  ]);

  log.ok(`Updated visual baselines for ${component}`);
  log.info(`Report: ${run.reportDir}`);
}
