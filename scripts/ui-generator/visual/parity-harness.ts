import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium, type Browser } from "@playwright/test";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import type { StyleExtraction } from "../analysis/style-extractor.js";
import type { ComponentRecipe } from "../recipes/types.js";
import { EXIT, GeneratorError } from "../errors.js";
import { log } from "../logger.js";

export type ParityCase = {
  id: string;
  theme: "light" | "dark";
  label: string;
  axisValues: Record<string, string>;
};

export type ParityResult = {
  ok: boolean;
  cases: Array<{
    id: string;
    diffPixels: number;
    maxDiffPixels: number;
  }>;
};

function pickCases(
  extraction: StyleExtraction,
  themes: ReadonlyArray<"light" | "dark">,
): ParityCase[] {
  const cases: ParityCase[] = [];
  const defaults: Record<string, string> = {};
  for (const axis of extraction.axes) {
    defaults[axis.prop] = axis.defaultValue ?? axis.values[0]!;
  }

  for (const theme of themes) {
    cases.push({
      id: `${theme}-default`,
      theme,
      label: "Default",
      axisValues: { ...defaults },
    });

    for (const axis of extraction.axes) {
      for (const value of axis.values) {
        cases.push({
          id: `${theme}-${axis.prop}-${value}`,
          theme,
          label: value,
          axisValues: { ...defaults, [axis.prop]: value },
        });
      }
    }
  }

  // Deduplicate (default overlaps first axis default)
  const seen = new Set<string>();
  return cases.filter((c) => {
    const key = `${c.theme}:${JSON.stringify(c.axisValues)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function classFor(
  extraction: StyleExtraction,
  axisValues: Record<string, string>,
): string {
  const fromMaps: string[] = [];
  for (const [prop, value] of Object.entries(axisValues)) {
    const classString = extraction.classMaps[prop]?.[value];
    if (classString) fromMaps.push(classString);
  }
  return [extraction.baseClasses.join(" "), ...fromMaps]
    .filter(Boolean)
    .join(" ");
}

function attrsToHtml(attrs: Record<string, string> | undefined): string {
  if (!attrs) return "";
  return Object.entries(attrs)
    .map(([k, v]) => `${k}="${v.replaceAll('"', "&quot;")}"`)
    .join(" ");
}

function axisAttrsHtml(axisValues: Record<string, string>): string {
  return Object.entries(axisValues)
    .map(([k, v]) => `data-${k}="${v}"`)
    .join(" ");
}

function buildElement(
  recipe: ComponentRecipe,
  className: string | null,
  axisValues: Record<string, string>,
  label: string,
  semantic: boolean,
): string {
  const tag = recipe.parity.tag;
  const text = recipe.parity.text ?? label;
  const baseAttrs = attrsToHtml(recipe.parity.attrs);
  const axes = axisAttrsHtml(axisValues);
  const partFromSelector =
    recipe.parity.shotSelector?.match(/data-ui-part="([^"]+)"/)?.[1] ?? null;
  const semanticAttrs = semantic
    ? `data-ui-component="${recipe.component}" ${
        partFromSelector ? `data-ui-part="${partFromSelector}"` : ""
      } ${axes}`
    : "";
  const classAttr = className ? `class="${className}"` : "";
  const common = `data-parity-root ${baseAttrs} ${semanticAttrs} ${axes}`;
  const voidTags = new Set(["input", "hr", "img", "br"]);
  if (voidTags.has(tag)) {
    return `<${tag} ${common} ${classAttr} />`;
  }
  if (tag === "svg") {
    return `<${tag} ${common} ${classAttr}><circle cx="12" cy="12" r="10" fill="currentColor" /></${tag}>`;
  }
  return `<${tag} ${common} ${classAttr}>${text}</${tag}>`;
}

function buildPages(args: {
  outDir: string;
  extraction: StyleExtraction;
  remappedCss: string;
  tailwindCss: string;
  cases: ParityCase[];
  recipe: ComponentRecipe;
}) {
  mkdirSync(args.outDir, { recursive: true });
  for (const testCase of args.cases) {
    const refClasses = classFor(args.extraction, testCase.axisValues);
    const darkClass = testCase.theme === "dark" ? "dark" : "";
    const referenceHtml = `<!doctype html>
<html class="${darkClass}">
<head>
<meta charset="utf-8" />
<style>${args.tailwindCss}
body{margin:0;padding:24px;background:var(--background);color:var(--foreground);font-family:system-ui,sans-serif}
</style>
</head>
<body>
${buildElement(args.recipe, refClasses, testCase.axisValues, testCase.label, false)}
</body>
</html>`;

    const candidateHtml = `<!doctype html>
<html class="${darkClass}">
<head>
<meta charset="utf-8" />
<style>
${args.remappedCss}
body{margin:0;padding:24px;background:var(--background);color:var(--foreground);font-family:system-ui,sans-serif}
</style>
<link rel="stylesheet" href="./theme-bundle.css" />
</head>
<body>
${buildElement(args.recipe, null, testCase.axisValues, testCase.label, true)}
</body>
</html>`;

    writeFileSync(
      path.join(args.outDir, `${testCase.id}.reference.html`),
      referenceHtml,
    );
    writeFileSync(
      path.join(args.outDir, `${testCase.id}.candidate.html`),
      candidateHtml,
    );
  }
  writeFileSync(path.join(args.outDir, "theme-bundle.css"), args.tailwindCss);
}

async function shot(
  browser: Browser,
  filePath: string,
  recipe: ComponentRecipe,
): Promise<Buffer> {
  const viewport = recipe.parity.viewport ?? { width: 480, height: 160 };
  const page = await browser.newPage({
    viewport,
    deviceScaleFactor: 1,
    colorScheme: "light",
    reducedMotion: "reduce",
    locale: "en-GB",
    timezoneId: "Europe/London",
  });
  await page.goto(`file://${filePath}`, { waitUntil: "load" });
  await page.addStyleTag({
    content: `*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}`,
  });
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });
  const target = page.locator("[data-parity-root]").first();
  await target.waitFor({ state: "visible" });
  const buffer = await target.screenshot({ animations: "disabled" });
  await page.close();
  return buffer;
}

export async function runParityHarness(options: {
  reportDir: string;
  extraction: StyleExtraction;
  remappedCss: string;
  themeAndUtilityCss: string;
  recipe: ComponentRecipe;
}): Promise<ParityResult> {
  const cases = pickCases(options.extraction, options.recipe.themes);
  const outDir = path.join(options.reportDir, "visual", "parity-pages");
  buildPages({
    outDir,
    extraction: options.extraction,
    remappedCss: options.remappedCss,
    tailwindCss: options.themeAndUtilityCss,
    cases,
    recipe: options.recipe,
  });

  const browser = await chromium.launch({ headless: true });
  const results: ParityResult["cases"] = [];
  try {
    for (const testCase of cases) {
      const refPath = path.join(outDir, `${testCase.id}.reference.html`);
      const candPath = path.join(outDir, `${testCase.id}.candidate.html`);
      const refBuf = await shot(browser, refPath, options.recipe);
      const candBuf = await shot(browser, candPath, options.recipe);
      const refPng = PNG.sync.read(refBuf);
      const candPng = PNG.sync.read(candBuf);

      mkdirSync(path.join(options.reportDir, "visual", "reference"), {
        recursive: true,
      });
      mkdirSync(path.join(options.reportDir, "visual", "candidate"), {
        recursive: true,
      });
      mkdirSync(path.join(options.reportDir, "visual", "diff"), {
        recursive: true,
      });

      if (refPng.width !== candPng.width || refPng.height !== candPng.height) {
        writeFileSync(
          path.join(
            options.reportDir,
            "visual",
            "reference",
            `${testCase.id}.png`,
          ),
          refBuf,
        );
        writeFileSync(
          path.join(
            options.reportDir,
            "visual",
            "candidate",
            `${testCase.id}.png`,
          ),
          candBuf,
        );
        throw new GeneratorError(
          `Parity geometry mismatch for ${testCase.id}`,
          EXIT.parity,
          `reference ${refPng.width}x${refPng.height} vs candidate ${candPng.width}x${candPng.height}`,
        );
      }

      const diff = new PNG({ width: refPng.width, height: refPng.height });
      const diffPixels = pixelmatch(
        refPng.data,
        candPng.data,
        diff.data,
        refPng.width,
        refPng.height,
        { threshold: 0.1 },
      );

      writeFileSync(
        path.join(
          options.reportDir,
          "visual",
          "reference",
          `${testCase.id}.png`,
        ),
        PNG.sync.write(refPng),
      );
      writeFileSync(
        path.join(
          options.reportDir,
          "visual",
          "candidate",
          `${testCase.id}.png`,
        ),
        PNG.sync.write(candPng),
      );
      writeFileSync(
        path.join(options.reportDir, "visual", "diff", `${testCase.id}.png`),
        PNG.sync.write(diff),
      );

      results.push({
        id: testCase.id,
        diffPixels,
        maxDiffPixels: options.recipe.maxDiffPixels,
      });

      if (diffPixels > options.recipe.maxDiffPixels) {
        throw new GeneratorError(
          `Reference/candidate parity failed for ${testCase.id}`,
          EXIT.parity,
          `diffPixels=${diffPixels} max=${options.recipe.maxDiffPixels}`,
        );
      }
    }
  } finally {
    await browser.close();
  }

  log.ok(
    `Reference/candidate parity passed (${results.length} cases, ${options.recipe.themes.join("+")})`,
  );
  return { ok: true, cases: results };
}
