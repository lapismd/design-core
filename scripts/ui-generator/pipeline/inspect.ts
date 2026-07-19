import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { loadConfig } from "../config.js";
import { EXIT, GeneratorError } from "../errors.js";
import { log } from "../logger.js";
import {
  fetchShadcnComponent,
  prepareIntakeProject,
} from "../adapters/shadcn-cli.js";
import { extractTvConfig } from "../analysis/variant-extractor.js";
import { createRunContext, writeJson, writeReportMarkdown } from "../reports/report.js";
import { mkdirSync, rmSync } from "node:fs";

export async function runInspect(options: { component?: string }) {
  const component = options.component?.trim();
  if (!component) {
    throw new GeneratorError(
      "ui:inspect requires a component name",
      EXIT.invalidRequest,
    );
  }

  const config = loadConfig();
  const run = createRunContext(config, "inspect", component);
  const scratch = path.join(
    config.packageRoot,
    ".ui-generator",
    "inspect",
    run.runId,
  );
  mkdirSync(scratch, { recursive: true });

  try {
    const intakeDir = await prepareIntakeProject(config, scratch, run.runId);
    const intake = await fetchShadcnComponent(config, intakeDir, component);
    const mainSource =
      intake.files.find((f) => f.path.endsWith(`${component}.svelte`)) ??
      intake.files.find((f) => f.path.endsWith(".svelte"));
    if (!mainSource) {
      throw new GeneratorError(
        "No .svelte source in intake",
        EXIT.intake,
      );
    }

    let extraction = null;
    let unsupported: string[] = [];
    try {
      extraction = extractTvConfig(mainSource.content);
    } catch (error) {
      unsupported.push(
        error instanceof Error ? error.message : String(error),
      );
    }

    const localPath = path.join(
      config.packageRoot,
      config.sharedRoot,
      component,
    );
    const recipePath = path.join(
      config.packageRoot,
      "scripts/ui-generator/recipes",
      `${component}.ts`,
    );
    const supportTier =
      unsupported.length > 0
        ? "unsupported"
        : existsSync(recipePath) || component === "button"
          ? "tier1-with-recipe"
          : "tier1-generic";

    const report = {
      component,
      cliVersion: intake.cliVersion,
      files: intake.files.map((f) => ({ path: f.path, sha256: f.sha256 })),
      localExists: existsSync(localPath),
      recipeExists: existsSync(recipePath) || component === "button",
      supportTier,
      variantAxes: extraction?.axes ?? [],
      candidateCount: extraction?.allCandidates.length ?? 0,
      candidates: extraction?.allCandidates ?? [],
      unsupported,
    };

    writeJson(path.join(run.reportDir, "report.json"), report);
    writeReportMarkdown(run.reportDir, `Inspect ${component}`, [
      { heading: "Support tier", body: supportTier },
      {
        heading: "Files",
        body: report.files.map((f) => `- ${f.path}`).join("\n"),
      },
      {
        heading: "Variant axes",
        body: JSON.stringify(report.variantAxes, null, 2),
      },
      {
        heading: "Tailwind candidates",
        body: `${report.candidateCount}\n\n${report.candidates.join("\n")}`,
      },
      {
        heading: "Unsupported",
        body: unsupported.length ? unsupported.join("\n") : "(none)",
      },
    ]);

    log.ok(`Inspected ${component}`);
    log.info(`Support tier: ${supportTier}`);
    log.info(`Candidates: ${report.candidateCount}`);
    log.info(`Report: ${run.reportDir}`);
    console.log(JSON.stringify(report, null, 2));
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}
