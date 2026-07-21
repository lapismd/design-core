import { execFileSync } from "node:child_process";
import { log } from "../logger.js";

/** Same port as `playwright.config.ts` webServer. */
export const PLAYWRIGHT_STATIC_PORT = 6007;

/**
 * Playwright serves `storybook-static` on this port. A stale listener that does
 * not answer `/index.json` blocks startup with EADDRINUSE (reuseExistingServer
 * only helps when the existing server is healthy).
 */
export async function ensurePlaywrightWebServerPort(
  port = PLAYWRIGHT_STATIC_PORT,
): Promise<void> {
  const url = `http://127.0.0.1:${port}/index.json`;
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(2_000),
    });
    if (res.ok) return;
  } catch {
    /* unreachable or timed out — free the port if held */
  }

  try {
    const pids = execFileSync(
      "lsof",
      [`-tiTCP:${port}`, "-sTCP:LISTEN"],
      { encoding: "utf8" },
    )
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (!pids.length) return;
    log.warn(
      `Clearing stale process(es) on port ${port} before Playwright: ${pids.join(", ")}`,
    );
    for (const pid of pids) {
      try {
        process.kill(Number(pid), "SIGKILL");
      } catch {
        /* already gone */
      }
    }
  } catch {
    /* nothing listening */
  }
}
