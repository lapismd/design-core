import { chromium } from "playwright";
import path from "node:path";
import { authStatePath, ensureDirectory, sourceUrl } from "./runtime.js";

/**
 * Opens an ordinary visible browser. A human performs any sign-in; this script
 * only saves the resulting storage state into the ignored package-local folder.
 */
async function main(): Promise<void> {
  await ensureDirectory(path.dirname(authStatePath));
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  await page.goto(sourceUrl, { waitUntil: "domcontentloaded" });

  process.stdout.write(
    "Sign in in the opened browser if needed, then press Enter here to save the local reference session.\n",
  );
  await new Promise<void>((resolve) =>
    process.stdin.once("data", () => resolve()),
  );

  await context.storageState({ path: authStatePath });
  await browser.close();
  process.stdout.write(
    `Saved local reference auth state to ${authStatePath}.\n`,
  );
}

void main();
