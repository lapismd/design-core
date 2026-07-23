/**
 * Start local Fava and capture screen baselines into Storybook snapshot paths.
 *
 * Requires FAVA_SCREEN_CAPTURE=1. Writes PNGs only to matrix outputPath entries
 * under tests/visual/storybook.spec.ts-snapshots/ (no staging tree).
 */
import { spawn, type ChildProcess } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, type Page } from "playwright";
import matrix from "./capture-matrix.json" with { type: "json" };

const here = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(here, "../..");
const snapshotRoot = path.join(packageRoot, matrix.snapshotRoot);
const preferredPort = Number(process.env.FAVA_CAPTURE_PORT ?? 5174);

type MatrixEntry = (typeof matrix.entries)[number];

async function isHealthyFava(origin: string): Promise<boolean> {
  try {
    const res = await fetch(`${origin}/api/projects`, {
      signal: AbortSignal.timeout(2000),
    });
    if (!res.ok) return false;
    const body = await res.json();
    return Array.isArray(body);
  } catch {
    return false;
  }
}

async function findAvailablePort(start: number): Promise<number> {
  for (let port = start; port < start + 20; port++) {
    const origin = `http://127.0.0.1:${port}`;
    if (await isHealthyFava(origin)) return port;
    try {
      const res = await fetch(origin, { signal: AbortSignal.timeout(500) });
      // Something answered — skip this port unless it's healthy Fava (above).
      if (res) continue;
    } catch {
      return port; // connection refused → free
    }
  }
  throw new Error(`No free port near ${start}`);
}

function studioRoot(): string {
  const fromEnv = process.env.BEANCOUNT_JS_STUDIO_ROOT?.trim();
  if (fromEnv) return path.resolve(fromEnv);
  return path.resolve(packageRoot, "../code/beancount-js-studio");
}

function parseIds(argv: string[]): Set<string> | null {
  const idx = argv.indexOf("--ids");
  if (idx === -1) return null;
  const raw = argv[idx + 1];
  if (!raw) {
    throw new Error("--ids requires a comma-separated list");
  }
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

function viewSegmentFromPath(viewPath: string): string {
  const raw = viewPath.replace(/^#/, "");
  const [pathname = "/journal", search = ""] = raw.includes("?")
    ? (() => {
        const index = raw.indexOf("?");
        return [raw.slice(0, index), raw.slice(index)] as const;
      })()
    : ([raw, ""] as const);
  const clean = pathname.replace(/\/+$/, "") || "/journal";
  const map: Record<string, string> = {
    "/dashboard": "dashboard",
    "/editor": "editor",
    "/income_statement": "income-statement",
    "/balance_sheet": "balance-sheet",
    "/trial_balance": "trial-balance",
    "/journal": "journal",
    "/holdings": "holdings",
    "/statistics": "statistics",
    "/query": "query",
    "/errors": "errors",
    "/accounts": "accounts",
    "/records": "records",
    "/import/editor": "settings",
    "/import/accounts": "settings/accounts",
    "/import/merchants": "settings/merchants",
    "/import/manage-merchants": "settings/manage-merchants",
    "/settings/rules": "settings/rules",
  };
  let segment = map[clean];
  if (!segment && clean.startsWith("/account/")) {
    segment = `account/${encodeURIComponent(clean.slice("/account/".length))}`;
  }
  if (!segment) {
    segment = clean.replace(/^\//, "").replaceAll("_", "-");
  }
  return `${segment}${search}`;
}

function studioUrl(
  projectId: string,
  viewPath: string,
  ledgerStem = "sample",
): string {
  const view = viewSegmentFromPath(
    viewPath.startsWith("/") ? viewPath : `/${viewPath}`,
  );
  const [viewPathname, search = ""] = view.includes("?")
    ? (() => {
        const index = view.indexOf("?");
        return [view.slice(0, index), view.slice(index)] as const;
      })()
    : ([view, ""] as const);
  return `/${encodeURIComponent(projectId)}/ledger/${ledgerStem
    .split("/")
    .map(encodeURIComponent)
    .join("/")}/${viewPathname}/${search}`;
}

async function waitForServer(url: string, timeoutMs = 120_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
      if (res.ok || res.status === 404) return;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Fava did not become ready at ${url} within ${timeoutMs}ms`);
}

async function resolveProjectId(page: Page): Promise<string> {
  const response = await page.request.get("/api/projects");
  if (!response.ok()) {
    throw new Error(`GET /api/projects failed: ${response.status()}`);
  }
  const body = (await response.json()) as Array<{ id: string }>;
  const id = body[0]?.id;
  if (!id) throw new Error("expected at least one registered Fava project");
  return id;
}

async function gotoStudio(page: Page, projectId: string, viewPath: string) {
  const url = studioUrl(projectId, viewPath);
  await page.goto(url);
  await page.waitForSelector(matrix.readySelector, { timeout: 30_000 });
  // Allow charts / tables a beat to settle before capture.
  await page.waitForTimeout(500);
}

function startFava(root: string, port: number): ChildProcess {
  const favaPkg = path.join(root, "packages/fava");
  if (!existsSync(favaPkg)) {
    throw new Error(`Fava package not found at ${favaPkg}`);
  }
  const child = spawn(
    "pnpm",
    [
      "exec",
      "vite",
      "--port",
      String(port),
      "--strictPort",
      "--host",
      "127.0.0.1",
    ],
    {
      cwd: favaPkg,
      env: {
        ...process.env,
        BEANCOUNT_STUDIO_PROJECT_ROOT: root,
        BEANCOUNT_STUDIO_ENTRY_FILE:
          process.env.BEANCOUNT_STUDIO_ENTRY_FILE ?? "sample.beancount",
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  child.stdout?.on("data", (chunk) => {
    if (process.env.FAVA_CAPTURE_VERBOSE) {
      process.stdout.write(chunk);
    }
  });
  child.stderr?.on("data", (chunk) => {
    if (process.env.FAVA_CAPTURE_VERBOSE) {
      process.stderr.write(chunk);
    }
  });
  return child;
}

async function stopProcess(child: ChildProcess) {
  if (child.killed || child.exitCode != null) return;
  child.kill("SIGTERM");
  await new Promise<void>((resolve) => {
    const t = setTimeout(() => {
      child.kill("SIGKILL");
      resolve();
    }, 5_000);
    child.once("exit", () => {
      clearTimeout(t);
      resolve();
    });
  });
}

async function main() {
  if (process.env.FAVA_SCREEN_CAPTURE !== "1") {
    console.error(
      "Refusing to write screen baselines without FAVA_SCREEN_CAPTURE=1",
    );
    process.exit(1);
  }

  const ids = parseIds(process.argv.slice(2));
  const entries: MatrixEntry[] = ids
    ? matrix.entries.filter((e) => ids.has(e.id))
    : [...matrix.entries];
  if (!entries.length) {
    throw new Error("No matrix entries selected");
  }

  const root = studioRoot();
  if (!existsSync(root)) {
    throw new Error(
      `BEANCOUNT_JS_STUDIO_ROOT not found: ${root}\nSet BEANCOUNT_JS_STUDIO_ROOT to your beancount-js-studio checkout.`,
    );
  }

  const preferredOrigin = `http://127.0.0.1:${preferredPort}`;
  let favaPort = preferredPort;
  let favaOrigin = preferredOrigin;
  let child: ChildProcess | null = null;

  if (await isHealthyFava(preferredOrigin)) {
    console.log(`Reusing healthy Fava at ${preferredOrigin}`);
  } else if (process.env.FAVA_CAPTURE_REUSE_SERVER === "1") {
    throw new Error(
      `FAVA_CAPTURE_REUSE_SERVER=1 but ${preferredOrigin} is not a healthy Fava (/api/projects)`,
    );
  } else {
    favaPort = await findAvailablePort(preferredPort);
    favaOrigin = `http://127.0.0.1:${favaPort}`;
    console.log(`Starting Fava from ${root} on ${favaOrigin}`);
    child = startFava(root, favaPort);
  }

  try {
    await waitForServer(favaOrigin);
    const browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: matrix.viewport,
      deviceScaleFactor: matrix.deviceScaleFactor,
      colorScheme: "light",
      baseURL: favaOrigin,
    });
    const page = await context.newPage();
    const projectId = await resolveProjectId(page);
    console.log(`Project: ${projectId}`);

    for (const entry of entries) {
      const outAbs = path.join(snapshotRoot, entry.outputPath);
      mkdirSync(path.dirname(outAbs), { recursive: true });
      console.log(`Capture ${entry.id} ← ${entry.viewPath}`);
      await gotoStudio(page, projectId, entry.viewPath);
      const buffer = await page.screenshot({
        type: "png",
        fullPage: false,
        scale: "device",
      });
      writeFileSync(outAbs, buffer);
      console.log(`  → ${entry.outputPath} (${buffer.byteLength} bytes)`);
    }

    await browser.close();
    console.log(`Done: ${entries.length} screen(s)`);
  } finally {
    if (child) await stopProcess(child);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
