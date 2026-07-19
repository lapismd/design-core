import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
} from "node:fs";
import path from "node:path";
import { loadConfig } from "../config.js";
import { EXIT, GeneratorError } from "../errors.js";
import { log } from "../logger.js";
import {
  fetchShadcnComponent,
  prepareIntakeProject,
} from "../adapters/shadcn-cli.js";
import {
  extractFamilyFromFiles,
  looksLikeTailwindSource,
} from "../analysis/style-extractor.js";
import {
  createRunContext,
  writeJson,
  writeReportMarkdown,
} from "../reports/report.js";
import { getRecipe } from "../recipes/index.js";

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
    const recipe = getRecipe(component);
    const localPath = path.join(
      config.packageRoot,
      config.sharedRoot,
      component,
    );

    const intakeDir = await prepareIntakeProject(config, scratch, run.runId);
    const intake = await fetchShadcnComponent(config, intakeDir, component);

    const localFiles = existsSync(localPath)
      ? readdirSync(localPath)
          .filter((f) => f.endsWith(".svelte") && !f.includes(".stories."))
          .map((fileName) => ({
            fileName,
            source: readFileSync(path.join(localPath, fileName), "utf8"),
          }))
      : [];

    const intakeFiles = intake.files
      .filter((f) => f.path.endsWith(".svelte"))
      .map((f) => ({
        fileName: path.basename(f.path),
        source: f.content,
      }));

    const sourceFiles = localFiles.some((f) => looksLikeTailwindSource(f.source))
      ? localFiles.filter((f) => looksLikeTailwindSource(f.source))
      : intakeFiles;

    let family = null;
    let unsupported: string[] = [];
    try {
      family = extractFamilyFromFiles(component, sourceFiles);
    } catch (error) {
      unsupported.push(error instanceof Error ? error.message : String(error));
    }

    const localConverted =
      localFiles.length > 0 &&
      localFiles.every((f) => !looksLikeTailwindSource(f.source));

    const supportTier = !recipe
      ? "unsupported"
      : !recipe.convertAllowed
        ? "deferred"
        : localConverted
          ? "converted"
          : recipe.tier;

    const report = {
      component,
      cliVersion: intake.cliVersion,
      files: intake.files.map((f) => ({ path: f.path, sha256: f.sha256 })),
      localExists: existsSync(localPath),
      recipeExists: Boolean(recipe),
      convertAllowed: recipe?.convertAllowed ?? false,
      supportTier,
      storyTitle: recipe?.storyTitle,
      parts: family?.parts.map((p) => ({
        part: p.part,
        kind: p.extraction.kind,
        axes: p.extraction.axes,
        candidateCount: p.extraction.allCandidates.length,
      })),
      candidateCount: family?.allCandidates.length ?? 0,
      candidates: family?.allCandidates ?? [],
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
        heading: "Parts",
        body: JSON.stringify(report.parts, null, 2),
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
