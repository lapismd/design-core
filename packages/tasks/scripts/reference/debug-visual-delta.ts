/**
 * Headed debug harness for a single capture-matrix entry.
 * Waits for login, saves auth, opens the scenario, captures,
 * then keeps the browser open for inspection.
 *
 *   pnpm --dir packages/tasks reference:debug:delta -- --id=comp-detail-open
 */
import path from "node:path";
import { chromium } from "playwright";
import { loadCaptureMatrix } from "./capture-matrix.js";
import { runCaptureNav, waitForLoggedInShell } from "./nav-steps.js";
import {
  artifactRoot,
  authStatePath,
  ensureDirectory,
  fileExists,
  openSource,
  sourceUrl,
} from "./runtime.js";

function parseId(): string {
  const arg = process.argv.find((value) => value.startsWith("--id="));
  return arg?.slice("--id=".length) || "comp-detail-open";
}

async function main(): Promise<void> {
  const id = parseId();
  const matrix = await loadCaptureMatrix();
  const entry = matrix.entries.find((item) => item.id === id);
  if (!entry) throw new Error(`Unknown matrix id: ${id}`);

  const viewport = matrix.viewports[entry.viewport];
  if (!viewport) throw new Error(`Unknown viewport ${entry.viewport}`);

  const hasAuth = await fileExists(authStatePath);
  process.stdout.write(
    `Debugging ${entry.id} (${entry.kind}) viewport=${entry.viewport} auth=${hasAuth}\n`,
  );
  process.stdout.write(`nav=${JSON.stringify(entry.nav)}\n`);
  process.stdout.write(`clip=${JSON.stringify(entry.clip)}\n`);

  await ensureDirectory(path.join(artifactRoot, "debug-delta"));

  const browser = await chromium.launch({
    headless: false,
    slowMo: 50,
  });
  const context = await browser.newContext({
    ...(hasAuth ? { storageState: authStatePath } : {}),
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: matrix.deviceScaleFactor,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();

  try {
    await page.goto(sourceUrl, { waitUntil: "domcontentloaded" });
    try {
      await waitForLoggedInShell(page);
    } catch {
      process.stdout.write(
        "Shell not ready — openSource + Flutter a11y, then wait again.\n",
      );
      await openSource(page);
      await waitForLoggedInShell(page);
    }

    await ensureDirectory(path.dirname(authStatePath));
    await context.storageState({ path: authStatePath });
    process.stdout.write(`Saved auth → ${authStatePath}\n`);

    await runCaptureNav(page, entry.nav);

    const debugFull = path.join(
      artifactRoot,
      "debug-delta",
      `${entry.id}-full.png`,
    );
    await page.screenshot({
      path: debugFull,
      animations: "disabled",
      fullPage: false,
    });
    process.stdout.write(`Wrote full viewport: ${debugFull}\n`);

    if (entry.kind === "component" && entry.clip) {
      const debugClip = path.join(
        artifactRoot,
        "debug-delta",
        `${entry.id}-clip.png`,
      );
      await page.screenshot({
        path: debugClip,
        animations: "disabled",
        clip: entry.clip,
      });
      process.stdout.write(
        `Wrote matrix clip ${JSON.stringify(entry.clip)} → ${debugClip}\n`,
      );
    }

    process.stdout.write(
      "Capture done — browser stays open 10 minutes for inspection (Ctrl+C to quit).\n",
    );
    await page.waitForTimeout(10 * 60 * 1000);
  } finally {
    await context.close();
    await browser.close();
  }
}

void main();
