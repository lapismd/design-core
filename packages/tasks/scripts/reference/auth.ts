import { watch } from "node:fs/promises";
import path from "node:path";
import { chromium, type Page } from "playwright";
import { referenceViewports } from "../../src/lib/reference.js";
import {
  authStatePath,
  enableFlutterSemantics,
  ensureDirectory,
  sourceUrl,
} from "./runtime.js";

const saveNowPath = path.join(path.dirname(authStatePath), "save-now");

/**
 * Opens an ordinary visible browser. A human performs any sign-in; this script
 * only saves the resulting storage state into the ignored package-local folder.
 *
 * Saves when any of these happen first:
 * - Superlist shell nav is visible (Inbox / Today / Tasks)
 * - URL looks logged-in (not a sign-in route)
 * - `packages/tasks/.auth/save-now` is created (`touch` it)
 * - Enter is pressed in an interactive terminal
 */
async function waitForSession(page: Page): Promise<string> {
  process.stdout.write(
    "Sign in in the opened browser if needed.\n" +
      "Auth saves when the Superlist shell is visible, when you touch\n" +
      "packages/tasks/.auth/save-now, or when you press Enter here.\n",
  );

  const shellReady = (async () => {
    const deadline = Date.now() + 10 * 60 * 1000;
    while (Date.now() < deadline) {
      await enableFlutterSemantics(page);
      const shell = page
        .getByText(/^(Inbox|Today|Tasks)$/i)
        .or(page.getByRole("button", { name: /^(Inbox|Today|Tasks)/i }))
        .first();
      if (await shell.isVisible().catch(() => false)) return "shell";

      const url = page.url();
      if (
        /app\.superlist\.com/i.test(url) &&
        !/sign[- ]?in|login|auth/i.test(url)
      ) {
        // Flutter often hides nav text until semantics are on; URL is enough
        // once past the auth gate.
        await page.waitForTimeout(1500);
        await enableFlutterSemantics(page);
        if (await shell.isVisible().catch(() => false)) return "shell";
        return "url";
      }
      await page.waitForTimeout(750);
    }
    throw new Error("Timed out waiting for Superlist shell");
  })();

  const saveNow = (async () => {
    await ensureDirectory(path.dirname(saveNowPath));
    const watcher = watch(path.dirname(saveNowPath));
    try {
      for await (const event of watcher) {
        if (event.filename === "save-now") return "save-now";
      }
    } finally {
      await watcher.close().catch(() => undefined);
    }
    throw new Error("save-now watcher ended");
  })();

  const enterPressed =
    process.stdin.isTTY === true
      ? new Promise<string>((resolve) => {
          process.stdin.resume();
          process.stdin.once("data", () => resolve("enter"));
        })
      : new Promise<string>(() => {
          /* non-interactive: rely on shell / save-now */
        });

  return Promise.race([shellReady, saveNow, enterPressed]);
}

async function main(): Promise<void> {
  await ensureDirectory(path.dirname(authStatePath));
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: referenceViewports[0],
  });
  const page = await context.newPage();
  await page.goto(sourceUrl, { waitUntil: "domcontentloaded" });
  await enableFlutterSemantics(page);

  const how = await waitForSession(page);
  process.stdout.write(`Session ready (${how}) — saving auth.\n`);

  await context.storageState({ path: authStatePath });
  await browser.close();
  process.stdout.write(
    `Saved local reference auth state to ${authStatePath}.\n`,
  );
}

void main();
