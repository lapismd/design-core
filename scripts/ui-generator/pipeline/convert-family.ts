import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import type { UiGeneratorConfig } from "../config.js";
import { EXIT, GeneratorError } from "../errors.js";
import { log } from "../logger.js";
import {
  fetchShadcnComponent,
  prepareIntakeProject,
} from "../adapters/shadcn-cli.js";
import { compileCandidates } from "../adapters/tailwind-cli.js";
import {
  extractFamilyFromFiles,
  looksLikeTailwindSource,
  type FamilyExtraction,
  type StyleExtraction,
} from "../analysis/style-extractor.js";
import { buildPartOwnership, remapCompiledCss } from "../transform/selector-remapper.js";
import {
  emitFamily,
  emitPassthroughFamily,
} from "../transform/family-emitter.js";
import { runParityHarness } from "../visual/parity-harness.js";
import { requireRecipe, type ComponentRecipe } from "../recipes/index.js";
import { writeJson } from "../reports/report.js";

export type ConvertFamilyResult = {
  component: string;
  recipe: ComponentRecipe;
  family: FamilyExtraction;
  remappedCss: string;
  compiledCss: string;
  written: string[];
  parityExtraction: StyleExtraction;
};

function listLocalSvelteParts(
  familyDir: string,
): Array<{ fileName: string; source: string }> {
  if (!existsSync(familyDir)) return [];
  return readdirSync(familyDir)
    .filter((f) => f.endsWith(".svelte") && !f.includes(".stories."))
    .sort()
    .map((fileName) => ({
      fileName,
      source: readFileSync(path.join(familyDir, fileName), "utf8"),
    }));
}

/** Map intake `$lib/...` imports onto this package's relative `src/lib` paths. */
function normalizeIntakeSource(source: string): string {
  return source
    .replaceAll('from "$lib/utils.js"', 'from "../../../lib/utils.js"')
    .replaceAll("from '$lib/utils.js'", "from '../../../lib/utils.js'")
    .replaceAll('from "$lib/', 'from "../../../lib/')
    .replaceAll("from '$lib/", "from '../../../lib/");
}

function pickParityExtraction(
  family: FamilyExtraction,
  recipe: ComponentRecipe,
): StyleExtraction {
  const partFromSelector =
    recipe.parity.shotSelector?.match(/data-ui-part="([^"]+)"/)?.[1] ?? null;
  if (partFromSelector) {
    const part = family.parts.find((p) => p.part === partFromSelector);
    if (part) return part.extraction;
  }
  const root =
    family.parts.find((p) => p.part === family.component) ?? family.parts[0]!;
  return root.extraction;
}

/**
 * Convert one family inside an already-prepared worktree.
 * Mutates files under worktree sharedRoot/<component>.
 */
export async function convertFamilyInWorktree(args: {
  config: UiGeneratorConfig;
  worktreePath: string;
  component: string;
  runId: string;
  reportDir: string;
  skipParity?: boolean;
}): Promise<ConvertFamilyResult> {
  const { config, worktreePath, component, runId, reportDir } = args;
  const recipe = requireRecipe(component);
  if (!recipe.convertAllowed) {
    throw new GeneratorError(
      `Component "${component}" is deferred (tier=${recipe.tier})`,
      EXIT.invalidRequest,
      "Add a portal/compound recipe with convertAllowed before converting.",
    );
  }

  const targetRel = path.join(config.sharedRoot, component);
  const targetAbs = path.join(worktreePath, targetRel);

  const intakeDir = await prepareIntakeProject(config, worktreePath, runId);
  const intake = await fetchShadcnComponent(config, intakeDir, component);
  log.ok(`Fetched shadcn-svelte "${component}"`);

  const localParts = listLocalSvelteParts(targetAbs);
  const intakeByName = new Map(
    intake.files
      .filter((f) => f.path.endsWith(".svelte"))
      .map((f) => [path.basename(f.path), f.content] as const),
  );

  // Prefer local Tailwind sources (catalog under test); fall back to intake.
  const files: Array<{ fileName: string; source: string }> = [];
  const names = new Set([
    ...localParts.map((p) => p.fileName),
    ...intakeByName.keys(),
  ]);

  for (const fileName of [...names].sort()) {
    const local = localParts.find((p) => p.fileName === fileName);
    if (local && looksLikeTailwindSource(local.source)) {
      files.push(local);
      continue;
    }
    const fromIntake = intakeByName.get(fileName);
    if (fromIntake && looksLikeTailwindSource(fromIntake)) {
      // Prefer intake Tailwind when local is already native (re-convert / missed parts).
      files.push({ fileName, source: normalizeIntakeSource(fromIntake) });
      continue;
    }
    if (local) {
      // Already native with no intake Tailwind counterpart — leave as-is (not rewritten).
      continue;
    }
  }

  const convertible = files.filter((f) => looksLikeTailwindSource(f.source));
  if (!convertible.length) {
    // Styleless Bits pass-through (e.g. collapsible): stamp ownership + provenance.
    const passthroughParts =
      localParts.length > 0
        ? localParts
        : [...intakeByName.entries()].map(([fileName, source]) => ({
            fileName,
            source: normalizeIntakeSource(source),
          }));
    if (!passthroughParts.length) {
      throw new GeneratorError(
        `No sources found for "${component}"`,
        EXIT.intake,
      );
    }
    log.warn(
      `No Tailwind utilities for "${component}" — emitting passthrough ownership`,
    );
    const provenance = {
      schemaVersion: 1,
      component,
      scope: "shared",
      kind: "passthrough",
      upstream: {
        project: "shadcn-svelte",
        registry: config.shadcn.registry,
        cliVersion: intake.cliVersion,
        item: component,
        fetchedAt: new Date().toISOString(),
        sourceFiles: intake.files.map((f) => ({
          path: f.path,
          sha256: f.sha256,
        })),
      },
      converter: {
        version: "2.0.0",
        irSchemaVersion: 1,
        tokenSchemaVersion: 1,
      },
      recipe: {
        name: recipe.component,
        version: recipe.supportVersion,
        tier: recipe.tier,
      },
    };
    const written = emitPassthroughFamily({
      targetDir: targetAbs,
      component,
      parts: passthroughParts,
      provenance,
    });
    writeJson(path.join(reportDir, `${component}.ir.json`), {
      schemaVersion: 1,
      name: component,
      kind: "passthrough",
      parts: passthroughParts.map((p) => p.fileName),
      candidates: [],
    });
    return {
      component,
      recipe,
      family: {
        component,
        parts: [],
        allCandidates: [],
        primaryAxes: [],
        primaryClassMaps: {},
        primaryBaseClasses: [],
      },
      remappedCss: "",
      compiledCss: "",
      written,
      parityExtraction: {
        kind: "empty",
        baseClasses: [],
        axes: [],
        classMaps: {},
        allCandidates: [],
        sourceSnippet: "",
      },
    };
  }

  const family = extractFamilyFromFiles(component, convertible);
  if (!family.allCandidates.length) {
    throw new GeneratorError(
      `No Tailwind candidates extracted for "${component}"`,
      EXIT.unsupported,
    );
  }

  log.ok(
    `Extracted ${family.parts.length} parts, ${family.allCandidates.length} candidates`,
  );
  writeJson(path.join(reportDir, `${component}.ir.json`), {
    schemaVersion: 1,
    name: component,
    parts: family.parts.map((p) => ({
      part: p.part,
      kind: p.extraction.kind,
      axes: p.extraction.axes,
      candidateCount: p.extraction.allCandidates.length,
    })),
    candidates: family.allCandidates,
  });

  const compileDir = path.join(
    worktreePath,
    ".ui-generator",
    "run",
    runId,
    "tailwind",
    component,
  );
  const themePath = path.join(worktreePath, "src/theme.css");
  const compiled = await compileCandidates(
    { ...config, packageRoot: worktreePath },
    compileDir,
    family.allCandidates,
    themePath,
  );

  const ownership = family.parts.flatMap((p) =>
    buildPartOwnership(
      component,
      p.part,
      p.extraction.baseClasses,
      p.extraction.classMaps,
    ),
  );
  const remappedCss = remapCompiledCss(compiled.css, ownership);
  if (!remappedCss.trim()) {
    throw new GeneratorError(
      "Selector remapping produced empty CSS",
      EXIT.generation,
    );
  }
  log.ok(`Generated scoped native CSS for ${component}`);

  const provenance = {
    schemaVersion: 1,
    component,
    scope: "shared",
    upstream: {
      project: "shadcn-svelte",
      registry: config.shadcn.registry,
      cliVersion: intake.cliVersion,
      item: component,
      fetchedAt: new Date().toISOString(),
      sourceFiles: intake.files.map((f) => ({
        path: f.path,
        sha256: f.sha256,
      })),
    },
    converter: {
      version: "2.0.0",
      irSchemaVersion: 1,
      tokenSchemaVersion: 1,
    },
    recipe: {
      name: recipe.component,
      version: recipe.supportVersion,
      tier: recipe.tier,
    },
  };

  const written = emitFamily({
    targetDir: targetAbs,
    family,
    remappedCss,
    provenance,
  });

  // Forbidden style engines in rewritten parts
  for (const file of written.filter((f) => f.endsWith(".svelte"))) {
    const text = readFileSync(file, "utf8");
    if (
      text.includes("tailwind-variants") ||
      /\btv\s*\(/.test(text) ||
      looksLikeTailwindSource(text)
    ) {
      // looksLikeTailwindSource may still match data-[attrs] in script comments —
      // only fail on tv / remaining utility-heavy cn strings
      if (text.includes("tailwind-variants") || /\btv\s*\(/.test(text)) {
        throw new GeneratorError(
          `Generated ${path.basename(file)} still references tailwind-variants/tv()`,
          EXIT.generation,
        );
      }
      if (/class=\{cn\(\s*["'`]/.test(text)) {
        throw new GeneratorError(
          `Generated ${path.basename(file)} still has Tailwind cn() string literals`,
          EXIT.generation,
        );
      }
    }
  }

  const parityExtraction = pickParityExtraction(family, recipe);
  if (!args.skipParity && parityExtraction.allCandidates.length) {
    log.step(`Running reference/candidate parity for ${component}`);
    await runParityHarness({
      reportDir: path.join(reportDir, component),
      extraction: parityExtraction,
      remappedCss,
      themeAndUtilityCss: compiled.css,
      recipe,
    });
  } else if (args.skipParity) {
    log.warn(`Skipping parity for ${component}`);
  }

  return {
    component,
    recipe,
    family,
    remappedCss,
    compiledCss: compiled.css,
    written,
    parityExtraction,
  };
}
