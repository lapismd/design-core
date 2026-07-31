import {
  ensurePlaywrightWebServerPort as ensurePort,
  ensureWarmStaticStorybookServer as ensureWarm,
  type WarmStaticServerResult,
} from "storybook-addon-visual-delta/node";
import { resolveVisualServerPort } from "storybook-addon-visual-delta/src/node/options.js";

/** Same resolved port as `playwright.config.ts` webServer. */
export function playwrightStaticPort(): number {
  return resolveVisualServerPort();
}

export async function ensurePlaywrightWebServerPort(
  port = playwrightStaticPort(),
): Promise<void> {
  await ensurePort(port);
}

/**
 * Start or reuse a long-lived static server so Playwright can
 * `reuseExistingServer` across visual-update / Testing Module runs.
 */
export async function ensureWarmStaticStorybookServer(
  packageRoot: string,
  port = playwrightStaticPort(),
): Promise<WarmStaticServerResult> {
  return ensureWarm(packageRoot, port);
}
