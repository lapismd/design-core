import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { execa } from "execa";
import type { UiGeneratorConfig } from "../config.js";
import { EXIT, GeneratorError } from "../errors.js";
import { log } from "../logger.js";

export type TailwindCompileResult = {
  css: string;
  requested: string[];
  emittedSelectors: string[];
};

function escapeForSourceInline(candidate: string): string {
  return candidate.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/**
 * Compile exact Tailwind candidates using the pinned CLI and project theme.
 */
export async function compileCandidates(
  config: UiGeneratorConfig,
  workDir: string,
  candidates: string[],
  themeCssPath: string,
): Promise<TailwindCompileResult> {
  mkdirSync(workDir, { recursive: true });
  const inputPath = path.join(workDir, "probe.css");
  const outputPath = path.join(workDir, "probe.out.css");

  const theme = readFileSync(themeCssPath, "utf8");
  const inlineSources = candidates
    .map(
      (candidate) => `@source inline("${escapeForSourceInline(candidate)}");`,
    )
    .join("\n");

  const inputCss = `@import "tailwindcss" source(none);
@import "tw-animate-css";
@import "shadcn-svelte/tailwind.css";

${theme}

${inlineSources}
`;

  writeFileSync(inputPath, inputCss);

  const result = await execa(
    "pnpm",
    ["exec", "tailwindcss", "-i", inputPath, "-o", outputPath, "--minify"],
    {
      cwd: config.packageRoot,
      reject: false,
    },
  );

  if (result.exitCode !== 0 || !existsSync(outputPath)) {
    throw new GeneratorError(
      "Tailwind CLI failed to compile candidates",
      EXIT.tailwind,
      result.stderr || result.stdout,
    );
  }

  const css = readFileSync(outputPath, "utf8");
  const emittedSelectors = [...css.matchAll(/\.((?:\\.|[A-Za-z0-9_-])+)/g)].map(
    (m) => m[1]!.replace(/\\(.)/g, "$1"),
  );

  // Verify each requested candidate appears in output (escaped or unescaped).
  const missing: string[] = [];
  for (const candidate of candidates) {
    const needle = candidate.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const escapedNeedle = candidate
      .split("")
      .map((ch) => (/[^a-zA-Z0-9_-]/.test(ch) ? `\\${ch}` : ch))
      .join("");
    if (
      !new RegExp(needle).test(css) &&
      !css.includes(escapedNeedle) &&
      !css.includes(candidate)
    ) {
      // Also accept if a decoded class form appears in emittedSelectors
      if (
        !emittedSelectors.some(
          (sel) => sel === candidate || sel.includes(candidate),
        )
      ) {
        missing.push(candidate);
      }
    }
  }

  if (missing.length && config.tailwind.unknownCandidatePolicy === "error") {
    // Soften: Tailwind may omit marker-only classes like group/button that don't emit CSS.
    const markerOnly = new Set(
      missing.filter(
        (c) =>
          c === "group" ||
          c.startsWith("group/") ||
          c === "peer" ||
          c.startsWith("peer/") ||
          // shadcn semantic marker classes (no utility CSS of their own)
          /^cn-[a-z0-9-]+$/i.test(c) ||
          // tv()/buttonVariants axis values — not Tailwind utilities
          /^(default|outline|secondary|ghost|destructive|link|xs|sm|lg|icon|icon-xs|icon-sm|icon-lg)$/i.test(
            c,
          ),
      ),
    );
    const hardMissing = missing.filter((c) => !markerOnly.has(c));
    if (hardMissing.length) {
      throw new GeneratorError(
        "One or more Tailwind candidates were not emitted",
        EXIT.tailwind,
        hardMissing.join("\n"),
      );
    }
    log.warn(
      `Marker-only candidates omitted by Tailwind (expected): ${[...markerOnly].join(", ")}`,
    );
  }

  log.ok(`Expanded ${candidates.length} Tailwind candidates`);
  return { css, requested: candidates, emittedSelectors };
}
