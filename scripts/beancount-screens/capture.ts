/**
 * Start local Fava and capture screen baselines into Storybook snapshot paths.
 *
 * Requires FAVA_SCREEN_CAPTURE=1. Writes PNGs only to matrix outputPath entries
 * under tests/visual/storybook.spec.ts-snapshots/ (no staging tree).
 */
import { execFileSync, spawn, type ChildProcess } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, type Page } from "playwright";
import matrix from "./capture-matrix.json" with { type: "json" };

const here = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(here, "../..");
const snapshotRoot = path.join(packageRoot, matrix.snapshotRoot);
const preferredPort = Number(process.env.FAVA_CAPTURE_PORT ?? 5174);

type MatrixEntry = (typeof matrix.entries)[number];

type ReferenceSource = {
  studioRevision: string;
  entryFile: string;
  entryFileSha256: string;
};

type CapturedEntry = {
  id: string;
  storyId: string;
  viewPath: string;
  outputPath: string;
  bytes: number;
  sha256: string;
};

type ReferenceManifest = {
  schemaVersion: 1;
  capturedAt: string;
  source: ReferenceSource;
  viewport: typeof matrix.viewport;
  deviceScaleFactor: typeof matrix.deviceScaleFactor;
  colorScheme: "light";
  entries: CapturedEntry[];
};

const referenceManifestPath = path.join(
  snapshotRoot,
  "apps/beancount/screens/manifest.json",
);

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

function commandText(command: string, args: string[], cwd: string): string {
  try {
    return execFileSync(command, args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch (error) {
    const detail =
      error && typeof error === "object" && "stderr" in error
        ? String(error.stderr).trim()
        : "";
    throw new Error(
      `Could not inspect the Fava reference checkout with ${command}: ${detail || String(error)}`,
    );
  }
}

function sha256(value: Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

/**
 * A reference capture must be reproducible from a committed Studio tree. This
 * intentionally rejects unrelated working-copy changes too: any Studio
 * package can change the rendered Fava screen.
 */
function referenceSource(root: string): ReferenceSource {
  const summary = commandText(
    "jj",
    ["--no-pager", "diff", "--summary", "-r", "@"],
    root,
  );
  if (summary) {
    throw new Error(
      "Refusing to capture Fava references from a dirty beancount-js-studio checkout. Commit, move, or restore the working-copy changes first.",
    );
  }

  const entryFile =
    process.env.BEANCOUNT_STUDIO_ENTRY_FILE ?? "sample.beancount";
  const entryPath = path.resolve(root, entryFile);
  if (!existsSync(entryPath)) {
    throw new Error(`Fava capture entry file not found: ${entryPath}`);
  }

  return {
    studioRevision: commandText(
      "jj",
      [
        "--no-pager",
        "--color",
        "never",
        "log",
        "-r",
        "@-",
        "--no-graph",
        "-T",
        'commit_id ++ "\\n"',
      ],
      root,
    ),
    entryFile,
    entryFileSha256: sha256(readFileSync(entryPath)),
  };
}

function parseIds(argv: string[]): Set<string> | null {
  const idx = argv.indexOf("--ids");
  const inline = argv.find((argument) => argument.startsWith("--ids="));
  if (idx === -1 && !inline) return null;
  const raw = inline ? inline.slice("--ids=".length) : argv[idx + 1];
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

async function gotoStudio(page: Page, projectId: string, entry: MatrixEntry) {
  const url = studioUrl(projectId, entry.viewPath);
  await page.goto(url);
  await page.waitForSelector(matrix.readySelector, { timeout: 30_000 });
  if (entry.readyTextAny?.length) {
    await page.waitForFunction(
      (texts) => texts.some((text) => document.body.innerText.includes(text)),
      entry.readyTextAny,
      { timeout: 30_000 },
    );
  }
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
  const source = referenceSource(root);

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
    const capturedEntries: CapturedEntry[] = [];

    for (const entry of entries) {
      const outAbs = path.join(snapshotRoot, entry.outputPath);
      mkdirSync(path.dirname(outAbs), { recursive: true });
      console.log(`Capture ${entry.id} ← ${entry.viewPath}`);
      await gotoStudio(page, projectId, entry);
      const buffer = await page.screenshot({
        type: "png",
        fullPage: false,
        scale: "device",
      });
      writeFileSync(outAbs, buffer);
      capturedEntries.push({
        id: entry.id,
        storyId: entry.storyId,
        viewPath: entry.viewPath,
        outputPath: entry.outputPath,
        bytes: buffer.byteLength,
        sha256: sha256(buffer),
      });
      console.log(`  → ${entry.outputPath} (${buffer.byteLength} bytes)`);
    }

    const existingEntries = existsSync(referenceManifestPath)
      ? (
          JSON.parse(
            readFileSync(referenceManifestPath, "utf8"),
          ) as ReferenceManifest
        ).entries.filter(
          (existing) => !entries.some((entry) => entry.id === existing.id),
        )
      : [];
    const manifest: ReferenceManifest = {
      schemaVersion: 1,
      capturedAt: new Date().toISOString(),
      source,
      viewport: matrix.viewport,
      deviceScaleFactor: matrix.deviceScaleFactor,
      colorScheme: "light",
      entries: [...existingEntries, ...capturedEntries].sort((a, b) =>
        a.id.localeCompare(b.id),
      ),
    };
    mkdirSync(path.dirname(referenceManifestPath), { recursive: true });
    writeFileSync(
      referenceManifestPath,
      `${JSON.stringify(manifest, null, 2)}\n`,
    );

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
