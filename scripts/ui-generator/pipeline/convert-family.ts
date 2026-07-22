import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
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
import { isMarkerCandidate } from "../analysis/style-sites.js";
import {
  buildPartOwnership,
  remapCompiledCss,
  remapMarkerSelectors,
  type MarkerOwnership,
} from "../transform/selector-remapper.js";
import {
  emitFamily,
  emitPassthroughFamily,
  rewritePartSource,
} from "../transform/family-emitter.js";
import { runParityHarness } from "../visual/parity-harness.js";
import { requireRecipe, type ComponentRecipe } from "../recipes/index.js";
import {
  emitLockedDataUiAttrOrder,
  findComposedHostParentComponents,
} from "../transform/data-ui-host-gate.js";
import { writeJson } from "../reports/report.js";
import { syncUpstreamDocs } from "../docs/sync-upstream-docs.js";

export type ConvertFamilyResult = {
  component: string;
  recipe: ComponentRecipe;
  family: FamilyExtraction;
  remappedCss: string;
  compiledCss: string;
  written: string[];
  parityExtraction: StyleExtraction;
};

/** Ensure family barrel exists — package exports require shadcn/<family>/index.ts. */
function ensureBarrelIndex(args: {
  targetDir: string;
  intakeFiles: Array<{ path: string; content: string }>;
  written: string[];
  /** When true, replace an existing partial barrel with the intake barrel. */
  overwrite?: boolean;
}): void {
  const indexPath = path.join(args.targetDir, "index.ts");
  if (existsSync(indexPath) && !args.overwrite) return;
  const fromIntake = args.intakeFiles.find(
    (f) => path.basename(f.path) === "index.ts",
  );
  if (!fromIntake) {
    throw new GeneratorError(
      `Missing index.ts for ${path.basename(args.targetDir)} (not in intake, not local)`,
      EXIT.generation,
    );
  }
  writeFileSync(indexPath, normalizeIntakeSource(fromIntake.content));
  args.written.push(indexPath);
  log.ok(
    args.overwrite
      ? "Wrote index.ts from intake barrel (overwrite)"
      : "Wrote index.ts from intake barrel",
  );
}

/**
 * Write non-Svelte intake siblings (constants.ts, context.svelte.ts, …) and
 * any `$lib/hooks/*` modules the family needs (e.g. is-mobile for sidebar).
 * Hooks live outside the component dir (shadcn add --no-deps still materializes
 * them under intake `src/lib/hooks/`), so we copy from `intakeDir` when present.
 */
function writeIntakeSupportFiles(args: {
  targetDir: string;
  worktreePath: string;
  intakeDir: string;
  intakeFiles: Array<{ path: string; content: string }>;
  written: string[];
}): void {
  for (const file of args.intakeFiles) {
    const base = path.basename(file.path);
    // Skip Svelte parts (handled by emit) and the barrel (ensureBarrelIndex).
    if (base.endsWith(".svelte") || base === "index.ts") continue;
    // Family-local support: constants.ts, context.svelte.ts, *.ts modules.
    if (base.endsWith(".ts") || base.endsWith(".js")) {
      const dest = path.join(args.targetDir, base);
      writeFileSync(dest, normalizeIntakeSource(file.content));
      args.written.push(dest);
      log.ok(`Wrote support ${base} from intake`);
    }
  }

  const hooksSrc = path.join(args.intakeDir, "src", "lib", "hooks");
  if (existsSync(hooksSrc)) {
    const hooksDest = path.join(args.worktreePath, "src", "lib", "hooks");
    mkdirSync(hooksDest, { recursive: true });
    for (const name of readdirSync(hooksSrc)) {
      if (!name.endsWith(".ts") && !name.endsWith(".js")) continue;
      const content = readFileSync(path.join(hooksSrc, name), "utf8");
      const dest = path.join(hooksDest, name);
      writeFileSync(dest, normalizeIntakeSource(content));
      args.written.push(dest);
      log.ok(`Wrote hook ${name} from intake`);
    }
  }
}

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

/** Map intake `$lib/...` imports onto this package's shared shadcn / utils paths. */
function normalizeIntakeSource(source: string): string {
  return (
    source
      .replaceAll('from "$lib/utils.js"', 'from "../../../lib/utils.js"')
      .replaceAll("from '$lib/utils.js'", "from '../../../lib/utils.js'")
      // Cross-family shadcn imports: $lib/components/ui/separator → ../separator
      .replace(
        /from\s+["']\$lib\/components\/ui\/([^"']+)["']/g,
        (_m, rest: string) => `from "../${rest}"`,
      )
      // Fallback for other $lib paths
      .replaceAll('from "$lib/', 'from "../../../lib/')
      .replaceAll("from '$lib/", "from '../../../lib/")
      // Repair prior bad rewrites of ui components into src/lib/components/ui
      .replace(
        /from\s+["']\.\.\/\.\.\/\.\.\/lib\/components\/ui\/([^"']+)["']/g,
        (_m, rest: string) => `from "../${rest}"`,
      )
  );
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
  /**
   * When true, convert every intake `.svelte` part even if a smaller local
   * family already exists (registry supersets like full sidebar).
   */
  forceFullIntake?: boolean;
}): Promise<ConvertFamilyResult> {
  const { config, worktreePath, component, runId, reportDir } = args;
  const forceFullIntake = Boolean(args.forceFullIntake);
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

  // Prefer local Tailwind sources (catalog under test). When a local family
  // already exists, do not import intake-only sibling parts (registry supersets
  // like full sidebar would otherwise expand the catalog) — unless forceFullIntake.
  const files: Array<{ fileName: string; source: string }> = [];
  /** Intake parts without Tailwind utilities (e.g. marker-only Button wrappers). */
  const intakePassthrough: Array<{ fileName: string; source: string }> = [];
  const names =
    forceFullIntake || localParts.length === 0
      ? [...intakeByName.keys()]
      : localParts.map((p) => p.fileName);
  if (forceFullIntake) {
    log.info(
      `forceFullIntake: using ${names.length} intake part(s) for "${component}"`,
    );
  }

  for (const fileName of [...names].sort()) {
    const local = localParts.find((p) => p.fileName === fileName);
    const fromIntake = intakeByName.get(fileName);
    // Prior native conversions may still "look like Tailwind" due to leftover
    // static utility classes on nested nodes — always prefer fresh intake then.
    const localAlreadyNative = Boolean(
      local && /data-ui-component\s*=/.test(local.source),
    );
    if (
      !forceFullIntake &&
      local &&
      !localAlreadyNative &&
      looksLikeTailwindSource(local.source)
    ) {
      files.push(local);
      continue;
    }
    if (fromIntake && looksLikeTailwindSource(fromIntake)) {
      files.push({ fileName, source: normalizeIntakeSource(fromIntake) });
      continue;
    }
    if (fromIntake && (forceFullIntake || !local)) {
      // Marker-only / Bits passthrough parts (e.g. sheet root, sidebar trigger).
      intakePassthrough.push({
        fileName,
        source: normalizeIntakeSource(fromIntake),
      });
      continue;
    }
    // Already native / empty — skip rewrite for this part.
  }

  const convertible = files.filter((f) => looksLikeTailwindSource(f.source));
  if (!convertible.length) {
    // Styleless Bits pass-through (e.g. collapsible): stamp ownership + provenance.
    const passthroughParts =
      forceFullIntake || localParts.length === 0
        ? [...intakeByName.entries()].map(([fileName, source]) => ({
            fileName,
            source: normalizeIntakeSource(source),
          }))
        : localParts;
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
    ensureBarrelIndex({
      targetDir: targetAbs,
      intakeFiles: intake.files,
      written,
      overwrite: forceFullIntake,
    });
    if (forceFullIntake) {
      writeIntakeSupportFiles({
        targetDir: targetAbs,
        worktreePath,
        intakeDir: intake.intakeDir,
        intakeFiles: intake.files,
        written,
      });
    }
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

  const ownership = family.parts.flatMap((p) => {
    if (p.sites?.length) {
      return p.sites.flatMap((site) =>
        buildPartOwnership(
          component,
          site.part,
          site.baseClasses.filter((c) => !isMarkerCandidate(c)),
          p.extraction.kind === "tv" ? p.extraction.classMaps : {},
          {
            composed: Boolean(site.composedFrom),
            dataSlot: site.dataSlot,
          },
        ),
      );
    }
    return buildPartOwnership(
      component,
      p.part,
      p.extraction.baseClasses.filter((c) => !isMarkerCandidate(c)),
      p.extraction.classMaps,
    );
  });
  const markerOwnership: MarkerOwnership[] = family.parts.flatMap((p) =>
    (p.sites ?? []).flatMap((site) =>
      site.markers.map((marker) => ({
        marker,
        selector: site.composedFrom
          ? site.dataSlot
            ? `[data-ui-part="${site.part}"][data-slot="${site.dataSlot}"]`
            : `[data-ui-part="${site.part}"]`
          : `[data-ui-component="${component}"][data-ui-part="${site.part}"]`,
      })),
    ),
  );
  let remappedCss = remapCompiledCss(compiled.css, ownership);
  remappedCss = remapMarkerSelectors(remappedCss, markerOwnership);
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
  ensureBarrelIndex({
    targetDir: targetAbs,
    intakeFiles: intake.files,
    written,
    overwrite: forceFullIntake,
  });
  if (forceFullIntake) {
    writeIntakeSupportFiles({
      targetDir: targetAbs,
      worktreePath,
      intakeDir: intake.intakeDir,
      intakeFiles: intake.files,
      written,
    });
  }

  // forceFullIntake: write marker-only / non-Tailwind intake parts (e.g. trigger).
  for (const part of intakePassthrough) {
    const partName = part.fileName.replace(/\.svelte$/, "");
    let next = rewritePartSource({
      part: {
        part: partName,
        fileName: part.fileName,
        source: part.source,
        extraction: {
          kind: "empty",
          baseClasses: [],
          axes: [],
          classMaps: {},
          allCandidates: [],
          sourceSnippet: "",
        },
        sites: [],
      },
      component,
    });
    if (next.endsWith(".svelte") || part.fileName.endsWith(".svelte")) {
      next = emitLockedDataUiAttrOrder(next);
    }
    const full = path.join(targetAbs, part.fileName);
    writeFileSync(full, next);
    written.push(full);
    log.ok(`Wrote intake passthrough ${part.fileName}`);
  }

  // Stamp ownership on local sibling parts that weren't convertible (e.g.
  // buttonVariants wrappers). Do NOT pull intake supersets — catalogs may be
  // intentionally smaller than the registry (sidebar) unless forceFullIntake.
  const writtenBasenames = new Set(
    written.map((f) => path.basename(f)).filter((n) => n.endsWith(".svelte")),
  );
  for (const local of localParts) {
    if (!local.fileName.endsWith(".svelte")) continue;
    if (writtenBasenames.has(local.fileName)) continue;
    if (forceFullIntake && !intakeByName.has(local.fileName)) continue;
    if (/data-ui-component\s*=/.test(local.source)) continue;
    const partName = local.fileName.replace(/\.svelte$/, "");
    let stamped = rewritePartSource({
      part: {
        part: partName,
        fileName: local.fileName,
        source: local.source,
        extraction: {
          kind: "empty",
          baseClasses: [],
          axes: [],
          classMaps: {},
          allCandidates: [],
          sourceSnippet: "",
        },
        sites: [],
      },
      component,
    });
    stamped = stamped
      .replace(
        /class=\{cn\(\s*buttonVariants\((\{[^}]*\})\s*\)\s*,\s*["']cn-[^"']+["']\s*,\s*className\s*\)\}/g,
        "class={cn(buttonVariants($1), className)}",
      )
      .replace(
        /class=\{cn\(\s*["']cn-[^"']+["']\s*,\s*className\s*\)\}/g,
        "class={className}",
      )
      .replace(
        /class=\{cn\(\s*["']{2}\s*,\s*className\s*\)\}/g,
        "class={className}",
      )
      .replace(/class=\{cn\(\s*className\s*\)\}/g, "class={className}");
    // Drop unused cn import if no longer referenced
    if (!/\bcn\s*\(/.test(stamped)) {
      stamped = stamped.replace(
        /import\s*\{([^}]*)\}\s*from\s*(["'][^"']*utils\.js["']);?\n?/,
        (full, inner: string, from: string) => {
          const parts = inner
            .split(",")
            .map((p: string) => p.trim())
            .filter(Boolean)
            .filter((p: string) => p !== "cn");
          if (!parts.length) return "";
          return `import { ${parts.join(", ")} } from ${from};\n`;
        },
      );
    }
    const full = path.join(targetAbs, local.fileName);
    let stampedOut = stamped;
    if (full.endsWith(".svelte")) {
      stampedOut = emitLockedDataUiAttrOrder(stampedOut);
    }
    writeFileSync(full, stampedOut);
    written.push(full);
  }

  // Refuse parent data-ui-component on composed foreign hosts (Input, Button, …)
  for (const file of written.filter((f) => f.endsWith(".svelte"))) {
    const text = readFileSync(file, "utf8");
    const overrides = findComposedHostParentComponents(text, component);
    if (overrides.length) {
      const detail = overrides
        .map(
          (o) =>
            `<${o.tag}> from "${o.composedFrom}" stamped data-ui-component="${o.parentComponent}"`,
        )
        .join("; ");
      throw new GeneratorError(
        `Generated ${path.basename(file)} stamps parent data-ui-component on composed host(s): ${detail}. Use part/slot only.`,
        EXIT.generation,
      );
    }
  }

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
      // Static utility classes should have been extracted (allow cn-* markers only).
      const staticClass = /class="([^"]*)"/g;
      let sm: RegExpExecArray | null;
      while ((sm = staticClass.exec(text))) {
        const tokens = sm[1]!.split(/\s+/).filter(Boolean);
        const leftover = tokens.filter(
          (t) =>
            !/^cn-[a-z0-9-]+$/i.test(t) &&
            /\b(flex|bg-|text-|size-|rounded-|absolute|relative|translate|gap-|p-|m-|w-|h-|items-|justify-|shadow-|ring-|border-|overflow-|pointer-events-|shrink-|min-w-|max-w-|whitespace-|dark:|data-|group-)/.test(
              t,
            ),
        );
        if (leftover.length) {
          throw new GeneratorError(
            `Generated ${path.basename(file)} still has static Tailwind utilities: ${leftover.join(", ")}`,
            EXIT.generation,
          );
        }
      }
    }
  }

  // Pull vendored shadcn-svelte docs/examples into Storybook artifacts.
  try {
    const docsResult = await syncUpstreamDocs({
      component,
      targetDir: targetAbs,
      storyTitle: recipe.storyTitle,
      sharedRoot: path.join(worktreePath, config.sharedRoot),
      packageRoot: worktreePath,
    });
    written.push(...docsResult.written);
    writeJson(path.join(reportDir, `${component}.docs-sync.json`), docsResult);
  } catch (error) {
    log.warn(
      `Upstream docs sync skipped for ${component}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
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
