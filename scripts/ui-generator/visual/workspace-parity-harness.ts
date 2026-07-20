import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium, type Browser, type Page } from "@playwright/test";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { EXIT, GeneratorError } from "../errors.js";

export type WorkspaceParityPage = {
  html: string;
  css?: string;
  screenshotSelector?: string;
  beforeCapture?: (page: Page) => Promise<void>;
};

export type WorkspaceParityScenario = {
  id: string;
  viewport: { width: number; height: number };
  reference: WorkspaceParityPage;
  candidate: WorkspaceParityPage;
  maxDiffPixels: number;
  pixelmatchThreshold?: number;
};

export type WorkspaceParityScenarioResult = {
  id: string;
  width: number;
  height: number;
  diffPixels: number;
  maxDiffPixels: number;
};

export type WorkspaceParityHarnessResult = {
  ok: true;
  scenarios: WorkspaceParityScenarioResult[];
};

function htmlPage(page: WorkspaceParityPage) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
html,body{margin:0;padding:0;background:white;color:black}
*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}
${page.css ?? ""}
</style>
</head>
<body>${page.html}</body>
</html>`;
}

async function screenshotPage(
  browser: Browser,
  filePath: string,
  scenario: WorkspaceParityScenario,
  pageSpec: WorkspaceParityPage,
  side: "reference" | "candidate",
) {
  const page = await browser.newPage({
    viewport: scenario.viewport,
    deviceScaleFactor: 1,
    colorScheme: "light",
    reducedMotion: "reduce",
    locale: "en-GB",
    timezoneId: "Europe/London",
  });
  page.setDefaultTimeout(5_000);
  await page.goto(`file://${filePath}`, { waitUntil: "load" });
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });
  await pageSpec.beforeCapture?.(page);
  const target = page.locator(
    pageSpec.screenshotSelector ?? "[data-parity-root]",
  );
  await target.first().waitFor({ state: "attached" });
  const box = await target.first().boundingBox();
  if (!box || box.width === 0 || box.height === 0) {
    await page.close();
    throw new GeneratorError(
      `Workspace parity target is not visible for ${scenario.id} ${side}`,
      EXIT.parity,
      `path=${filePath} box=${box ? `${box.width}x${box.height}` : "null"}`,
    );
  }

  try {
    return await target.first().screenshot({
      animations: "disabled",
      timeout: 5_000,
    });
  } catch (error) {
    throw new GeneratorError(
      `Workspace parity screenshot failed for ${scenario.id} ${side}`,
      EXIT.parity,
      `path=${filePath} box=${box.width}x${box.height} cause=${String(error)}`,
    );
  } finally {
    await page.close();
  }
}

function ensureArtifactDirs(reportDir: string) {
  for (const name of ["pages", "reference", "candidate", "diff"]) {
    mkdirSync(path.join(reportDir, "workspace-parity", name), {
      recursive: true,
    });
  }
}

export async function runWorkspaceParityHarness(options: {
  reportDir: string;
  scenarios: WorkspaceParityScenario[];
}): Promise<WorkspaceParityHarnessResult> {
  ensureArtifactDirs(options.reportDir);
  const pagesDir = path.join(options.reportDir, "workspace-parity", "pages");
  const referenceDir = path.join(
    options.reportDir,
    "workspace-parity",
    "reference",
  );
  const candidateDir = path.join(
    options.reportDir,
    "workspace-parity",
    "candidate",
  );
  const diffDir = path.join(options.reportDir, "workspace-parity", "diff");
  const browser = await chromium.launch({ headless: true });
  const results: WorkspaceParityScenarioResult[] = [];

  try {
    for (const scenario of options.scenarios) {
      const referencePath = path.join(
        pagesDir,
        `${scenario.id}.reference.html`,
      );
      const candidatePath = path.join(
        pagesDir,
        `${scenario.id}.candidate.html`,
      );
      writeFileSync(referencePath, htmlPage(scenario.reference));
      writeFileSync(candidatePath, htmlPage(scenario.candidate));

      const referenceBuffer = await screenshotPage(
        browser,
        referencePath,
        scenario,
        scenario.reference,
        "reference",
      );
      const candidateBuffer = await screenshotPage(
        browser,
        candidatePath,
        scenario,
        scenario.candidate,
        "candidate",
      );
      const referencePng = PNG.sync.read(referenceBuffer);
      const candidatePng = PNG.sync.read(candidateBuffer);

      writeFileSync(
        path.join(referenceDir, `${scenario.id}.png`),
        referenceBuffer,
      );
      writeFileSync(
        path.join(candidateDir, `${scenario.id}.png`),
        candidateBuffer,
      );

      if (
        referencePng.width !== candidatePng.width ||
        referencePng.height !== candidatePng.height
      ) {
        throw new GeneratorError(
          `Workspace parity geometry mismatch for ${scenario.id}`,
          EXIT.parity,
          `reference ${referencePng.width}x${referencePng.height} vs candidate ${candidatePng.width}x${candidatePng.height}`,
        );
      }

      const diff = new PNG({
        width: referencePng.width,
        height: referencePng.height,
      });
      const diffPixels = pixelmatch(
        referencePng.data,
        candidatePng.data,
        diff.data,
        referencePng.width,
        referencePng.height,
        { threshold: scenario.pixelmatchThreshold ?? 0.1 },
      );
      writeFileSync(
        path.join(diffDir, `${scenario.id}.png`),
        PNG.sync.write(diff),
      );

      results.push({
        id: scenario.id,
        width: referencePng.width,
        height: referencePng.height,
        diffPixels,
        maxDiffPixels: scenario.maxDiffPixels,
      });

      if (diffPixels > scenario.maxDiffPixels) {
        throw new GeneratorError(
          `Workspace parity failed for ${scenario.id}`,
          EXIT.parity,
          `diffPixels=${diffPixels} max=${scenario.maxDiffPixels}`,
        );
      }
    }
  } finally {
    await browser.close();
  }

  return { ok: true, scenarios: results };
}
