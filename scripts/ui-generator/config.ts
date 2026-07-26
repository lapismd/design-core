import { readFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { GeneratorError, EXIT } from "./errors.js";

const configSchema = z.object({
  packageRoot: z.string(),
  sharedRoot: z.string(),
  componentPrefix: z.string(),
  componentAttribute: z.string(),
  partAttribute: z.string(),
  preserveDataSlot: z.boolean(),
  packageManager: z.literal("pnpm"),
  shadcn: z.object({
    executable: z.string(),
    registry: z.string(),
    intakeFixture: z.string(),
  }),
  tailwind: z.object({
    entryCss: z.string(),
    executable: z.string(),
    unknownCandidatePolicy: z.literal("error"),
  }),
  tokens: z.object({
    prefix: z.string(),
    emitMetadata: z.boolean(),
  }),
  storybook: z.object({
    configDir: z.string(),
    storyExtension: z.string(),
  }),
  visual: z.object({
    snapshotDir: z.string(),
    viewport: z.object({ width: z.number(), height: z.number() }),
    locale: z.string(),
    timezoneId: z.string(),
    themes: z.array(z.string()),
    defaultMaxDiffPixels: z.number(),
  }),
  reportsRoot: z.string(),
  worktreesRoot: z.string(),
  pathAllowlist: z.array(z.string()),
});

export type UiGeneratorConfig = z.infer<typeof configSchema>;

export function loadConfig(packageRoot = process.cwd()): UiGeneratorConfig {
  const configPath = path.join(packageRoot, "ui-generator.config.ts");
  // Config is authored as TS but we load the sibling JSON-compatible defaults
  // from the committed JS-evaluable module via dynamic import fallback file.
  const jsonPath = path.join(packageRoot, "ui-generator.config.json");
  try {
    const raw = JSON.parse(readFileSync(jsonPath, "utf8")) as unknown;
    const parsed = configSchema.parse(raw);
    return {
      ...parsed,
      packageRoot: path.resolve(packageRoot, parsed.packageRoot),
    };
  } catch (error) {
    throw new GeneratorError(
      `Failed to load ui-generator config from ${jsonPath}`,
      EXIT.invalidRequest,
      error instanceof Error ? error.message : String(error),
    );
  }
}

export function resolveFromPackage(
  config: UiGeneratorConfig,
  relativePath: string,
): string {
  return path.resolve(config.packageRoot, relativePath);
}
