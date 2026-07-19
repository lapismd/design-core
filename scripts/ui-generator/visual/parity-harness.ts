import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium, type Browser } from "@playwright/test";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import type { TvExtraction } from "../analysis/variant-extractor.js";
import { EXIT, GeneratorError } from "../errors.js";
import { log } from "../logger.js";

export type ParityCase = {
  id: string;
  variant: string;
  size: string;
  theme: "light" | "dark";
  label: string;
};

export type ParityResult = {
  ok: boolean;
  cases: Array<{
    id: string;
    diffPixels: number;
    maxDiffPixels: number;
  }>;
};

function pickCases(extraction: TvExtraction): ParityCase[] {
  const variants =
    extraction.axes.find((a) => a.prop === "variant")?.values ?? [];
  const sizes = extraction.axes.find((a) => a.prop === "size")?.values ?? [];
  const cases: ParityCase[] = [];
  const defaultVariant =
    extraction.axes.find((a) => a.prop === "variant")?.defaultValue ??
    variants[0]!;
  const defaultSize =
    extraction.axes.find((a) => a.prop === "size")?.defaultValue ?? sizes[0]!;

  for (const theme of ["light", "dark"] as const) {
    cases.push({
      id: `${theme}-default`,
      variant: defaultVariant,
      size: defaultSize,
      theme,
      label: "Default",
    });
    for (const variant of variants) {
      cases.push({
        id: `${theme}-variant-${variant}`,
        variant,
        size: defaultSize,
        theme,
        label: variant,
      });
    }
    for (const size of sizes) {
      cases.push({
        id: `${theme}-size-${size}`,
        variant: defaultVariant,
        size,
        theme,
        label: size,
      });
    }
  }
  return cases;
}

function classFor(
  extraction: TvExtraction,
  variant: string,
  size: string,
): string {
  const base = extraction.baseClasses.join(" ");
  const v = extraction.classMaps.variant?.[variant] ?? "";
  const s = extraction.classMaps.size?.[size] ?? "";
  return [base, v, s].filter(Boolean).join(" ");
}

function buildPages(args: {
  outDir: string;
  extraction: TvExtraction;
  remappedCss: string;
  tailwindCss: string;
  cases: ParityCase[];
}) {
  mkdirSync(args.outDir, { recursive: true });
  for (const testCase of args.cases) {
    const refClasses = classFor(
      args.extraction,
      testCase.variant,
      testCase.size,
    );
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
<button type="button" data-slot="button" class="${refClasses}">${testCase.label}</button>
</body>
</html>`;

    const candidateHtml = `<!doctype html>
<html class="${darkClass}">
<head>
<meta charset="utf-8" />
<style>
${args.tailwindCss.replace(/@import[^;]+;/g, "/* imports inlined separately */")}
/* foundation tokens from theme already in remapped context */
:root, .dark { /* theme vars expected from remapped/theme bundle */ }
${args.remappedCss}
body{margin:0;padding:24px;background:var(--background);color:var(--foreground);font-family:system-ui,sans-serif}
</style>
<link rel="stylesheet" href="./theme-bundle.css" />
</head>
<body>
<button type="button" data-ui-component="button" data-slot="button" data-variant="${testCase.variant}" data-size="${testCase.size}">${testCase.label}</button>
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
): Promise<Buffer> {
  const page = await browser.newPage({
    viewport: { width: 480, height: 160 },
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
  const button = page.locator("button");
  await button.waitFor({ state: "visible" });
  const buffer = await button.screenshot({ animations: "disabled" });
  await page.close();
  return buffer;
}

export async function runParityHarness(options: {
  reportDir: string;
  extraction: TvExtraction;
  remappedCss: string;
  /** Full compiled CSS including theme variables (from Tailwind probe with theme). */
  themeAndUtilityCss: string;
  maxDiffPixels: number;
}): Promise<ParityResult> {
  const cases = pickCases(options.extraction);
  const outDir = path.join(options.reportDir, "visual", "parity-pages");
  buildPages({
    outDir,
    extraction: options.extraction,
    remappedCss: options.remappedCss,
    tailwindCss: options.themeAndUtilityCss,
    cases,
  });

  const browser = await chromium.launch({ headless: true });
  const results: ParityResult["cases"] = [];
  try {
    for (const testCase of cases) {
      const refPath = path.join(outDir, `${testCase.id}.reference.html`);
      const candPath = path.join(outDir, `${testCase.id}.candidate.html`);
      const refBuf = await shot(browser, refPath);
      const candBuf = await shot(browser, candPath);
      const refPng = PNG.sync.read(refBuf);
      const candPng = PNG.sync.read(candBuf);

      if (
        refPng.width !== candPng.width ||
        refPng.height !== candPng.height
      ) {
        writeFileSync(
          path.join(options.reportDir, "visual", "reference", `${testCase.id}.png`),
          refBuf,
        );
        writeFileSync(
          path.join(options.reportDir, "visual", "candidate", `${testCase.id}.png`),
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
        path.join(options.reportDir, "visual", "reference", `${testCase.id}.png`),
        PNG.sync.write(refPng),
      );
      writeFileSync(
        path.join(options.reportDir, "visual", "candidate", `${testCase.id}.png`),
        PNG.sync.write(candPng),
      );
      writeFileSync(
        path.join(options.reportDir, "visual", "diff", `${testCase.id}.png`),
        PNG.sync.write(diff),
      );

      results.push({
        id: testCase.id,
        diffPixels,
        maxDiffPixels: options.maxDiffPixels,
      });

      if (diffPixels > options.maxDiffPixels) {
        throw new GeneratorError(
          `Reference/candidate parity failed for ${testCase.id}`,
          EXIT.parity,
          `diffPixels=${diffPixels} max=${options.maxDiffPixels}`,
        );
      }
    }
  } finally {
    await browser.close();
  }

  log.ok(
    `Reference/candidate parity passed (${results.length} cases, light+dark)`,
  );
  return { ok: true, cases: results };
}
