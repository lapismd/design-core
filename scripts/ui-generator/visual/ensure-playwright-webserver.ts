import { spawn, type ChildProcess } from "node:child_process";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { log } from "../logger.js";

/** Same port as `playwright.config.ts` webServer. */
export const PLAYWRIGHT_STATIC_PORT = 6007;

let warmServer: ChildProcess | null = null;

async function isStaticServerHealthy(port: number): Promise<boolean> {
  const urls = [
    `http://127.0.0.1:${port}/index.json`,
    `http://127.0.0.1:${port}/iframe.html`,
  ];
  try {
    for (const url of urls) {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(2_000),
      });
      if (!res.ok) return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Playwright serves `storybook-static` on this port. A stale listener that does
 * not answer `/index.json` blocks startup with EADDRINUSE (reuseExistingServer
 * only helps when the existing server is healthy).
 */
export async function ensurePlaywrightWebServerPort(
  port = PLAYWRIGHT_STATIC_PORT,
): Promise<void> {
  if (await isStaticServerHealthy(port)) return;

  try {
    const pids = execFileSync("lsof", [`-tiTCP:${port}`, "-sTCP:LISTEN"], {
      encoding: "utf8",
    })
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

/**
 * Start or reuse a long-lived static server so Playwright can
 * `reuseExistingServer` across visual-update / Testing Module runs.
 */
export async function ensureWarmStaticStorybookServer(
  packageRoot: string,
  port = PLAYWRIGHT_STATIC_PORT,
): Promise<void> {
  const indexPath = path.join(packageRoot, "storybook-static", "index.json");
  const iframePath = path.join(packageRoot, "storybook-static", "iframe.html");
  if (!existsSync(indexPath) || !existsSync(iframePath)) {
    log.info(
      !existsSync(indexPath)
        ? "storybook-static missing — static server not started"
        : "storybook-static incomplete (missing iframe.html) — static server not started",
    );
    await ensurePlaywrightWebServerPort(port);
    return;
  }

  if (await isStaticServerHealthy(port)) {
    log.info(`Reusing static Storybook on :${port}`);
    return;
  }

  await ensurePlaywrightWebServerPort(port);

  if (warmServer && !warmServer.killed) {
    try {
      warmServer.kill("SIGKILL");
    } catch {
      /* ignore */
    }
    warmServer = null;
  }

  const child = spawn(
    "python3",
    [
      "-m",
      "http.server",
      String(port),
      "--directory",
      "storybook-static",
      "--bind",
      "127.0.0.1",
    ],
    {
      cwd: packageRoot,
      detached: true,
      stdio: "ignore",
    },
  );
  child.unref();
  warmServer = child;

  for (let attempt = 0; attempt < 50; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    if (await isStaticServerHealthy(port)) {
      log.info(`Started static Storybook on :${port}`);
      return;
    }
    if (child.exitCode != null) break;
  }

  log.warn(`Failed to start static Storybook on :${port}`);
}
