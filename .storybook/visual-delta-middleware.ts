import { spawn, type ChildProcess } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import type { Plugin } from "vite";
import {
  VISUAL_DELTA_CANCEL_PATH,
  VISUAL_DELTA_RUN_PATH,
  VISUAL_DELTA_UPDATE_PATH,
} from "../packages/storybook-addon-visual-delta/src/constants.js";
import type { VisualDiffSidecar } from "../packages/storybook-addon-visual-delta/src/visual-diff-sidecar.js";
import { loadSidecarForStoryId } from "../scripts/ui-generator/visual/diff-result.js";
import type { StoryIndexEntry } from "../scripts/ui-generator/visual/snapshot-paths.js";

type UpdateBody = {
  storyId?: string;
  component?: string;
};

type RunBody = {
  /** Limit Playwright `-g` to these story ids (or their shared prefix). */
  storyIds?: string[];
  /** Rebuild storybook-static before running (slow but picks up live edits). */
  rebuild?: boolean;
};

export type VisualRunResultItem = {
  storyId: string;
  status: "passed" | "failed" | "skipped" | "timedOut";
  title: string;
  error?: string;
  /** Ephemeral metrics written next to the baseline PNG during the run. */
  sidecar?: VisualDiffSidecar;
};

export type VisualRunResponse = {
  ok: boolean;
  exitCode: number;
  crashed?: boolean;
  error?: string;
  rebuild: boolean;
  grep?: string;
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };
  results: VisualRunResultItem[];
  logTail: string;
};

/** NDJSON events streamed while `/__visual-delta/run-tests` is in progress. */
export type VisualRunStreamEvent =
  | { type: "start"; total: number }
  | {
      type: "progress";
      completed: number;
      total: number;
      passed: number;
      failed: number;
      storyId: string;
      status: "passed" | "failed";
    }
  | ({ type: "done" } & VisualRunResponse)
  | { type: "error"; error: string; crashed?: boolean };

let activeRun: ChildProcess | null = null;

function readJsonBody<T>(req: IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
      if (chunks.reduce((n, c) => n + c.length, 0) > 64_000) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8") || "{}";
        resolve(JSON.parse(raw) as T);
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
    req.on("error", reject);
  });
}

function writeJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Build a Playwright `-g` filter from selected story ids. */
export function grepFromStoryIds(storyIds?: string[]): string | undefined {
  if (!storyIds?.length) return undefined;
  if (storyIds.length === 1) return storyIds[0];

  const heads = storyIds.map((id) => id.split("--")[0] ?? id);
  if (new Set(heads).size === 1) {
    return `${heads[0]}--`;
  }

  return `^(${storyIds.map(escapeRegExp).join("|")})$`;
}

type PlaywrightJsonSpec = {
  title?: string;
  ok?: boolean;
  tests?: Array<{
    status?: string;
    results?: Array<{ status?: string; error?: { message?: string } }>;
  }>;
  suites?: PlaywrightJsonSuite[];
};

type PlaywrightJsonSuite = {
  title?: string;
  specs?: PlaywrightJsonSpec[];
  suites?: PlaywrightJsonSuite[];
};

function walkSpecs(
  suite: PlaywrightJsonSuite,
  out: VisualRunResultItem[],
): void {
  for (const spec of suite.specs ?? []) {
    const storyId = spec.title?.trim();
    if (!storyId) continue;
    const test = spec.tests?.[0];
    const result = test?.results?.[0];
    const raw =
      result?.status ?? test?.status ?? (spec.ok ? "passed" : "failed");
    let status: VisualRunResultItem["status"] = "failed";
    if (raw === "passed" || raw === "expected" || spec.ok === true) {
      status = "passed";
    } else if (raw === "skipped" || raw === "pending") {
      status = "skipped";
    } else if (raw === "timedOut") {
      status = "timedOut";
    }
    out.push({
      storyId,
      status,
      title: storyId,
      error: result?.error?.message,
    });
  }
  for (const child of suite.suites ?? []) {
    walkSpecs(child, out);
  }
}

function parsePlaywrightJson(raw: string): VisualRunResultItem[] {
  const report = JSON.parse(raw) as { suites?: PlaywrightJsonSuite[] };
  const results: VisualRunResultItem[] = [];
  for (const suite of report.suites ?? []) {
    walkSpecs(suite, results);
  }
  return results;
}

/** Attach on-disk JSON sidecars produced by the visual suite. */
export function attachSidecars(
  results: VisualRunResultItem[],
  packageRoot: string,
): VisualRunResultItem[] {
  return results.map((item) => {
    const sidecar = loadSidecarForStoryId(item.storyId, packageRoot);
    return sidecar ? { ...item, sidecar } : item;
  });
}

function extractJsonDocument(log: string): string | null {
  const start = log.indexOf("{");
  const end = log.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  return log.slice(start, end + 1);
}

function summarize(results: VisualRunResultItem[]) {
  const summary = { total: results.length, passed: 0, failed: 0, skipped: 0 };
  for (const item of results) {
    if (item.status === "passed") summary.passed++;
    else if (item.status === "skipped") summary.skipped++;
    else summary.failed++;
  }
  return summary;
}

/** Count visual stories in storybook-static, optionally filtered by grep/storyIds. */
export function countVisualStories(
  root: string,
  storyIds?: string[],
): number {
  const indexPath = path.join(root, "storybook-static", "index.json");
  if (!existsSync(indexPath)) return 0;
  try {
    const index = JSON.parse(readFileSync(indexPath, "utf8")) as {
      entries?: Record<string, StoryIndexEntry>;
    };
    let stories = Object.values(index.entries ?? {}).filter(
      (e) => e.type === "story" && !(e.tags ?? []).includes("skip-visual"),
    );
    if (storyIds?.length) {
      const grep = grepFromStoryIds(storyIds);
      if (grep) {
        const re = new RegExp(grep);
        stories = stories.filter((e) => re.test(e.id));
      }
    }
    return stories.length;
  } catch {
    return 0;
  }
}

/** Strip ANSI color codes so list-reporter lines parse reliably. */
export function stripAnsi(value: string): string {
  return value.replace(/\u001B\[[0-9;]*[mK]/g, "");
}

/**
 * Playwright list-reporter line, e.g.
 * `  ✓   1 [chromium] › … › shadcn-button--default (823ms)`
 */
export function parseListReporterProgress(
  chunk: string,
): Array<{ index: number; storyId: string; status: "passed" | "failed" }> {
  const out: Array<{
    index: number;
    storyId: string;
    status: "passed" | "failed";
  }> = [];
  const text = stripAnsi(chunk);
  const re =
    /([✓✔✘×xX])\s+(\d+)\s+.*?›\s+(\S+--\S+?)(?:\s+\([\d.]+\s*[mun]?s\))?\s*$/gm;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    const mark = match[1] ?? "";
    const index = Number(match[2]);
    const storyId = match[3]?.trim();
    if (!storyId || !Number.isFinite(index)) continue;
    const failed = mark === "✘" || mark === "×" || mark === "x" || mark === "X";
    out.push({
      index,
      storyId,
      status: failed ? "failed" : "passed",
    });
  }
  return out;
}

function writeNdjson(res: ServerResponse, event: VisualRunStreamEvent) {
  res.write(`${JSON.stringify(event)}\n`);
}

function runCommand(
  command: string,
  args: string[],
  cwd: string,
  env?: NodeJS.ProcessEnv,
  onChunk?: (text: string) => void,
): Promise<{ code: number; log: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, ...env },
      stdio: ["ignore", "pipe", "pipe"],
    });
    activeRun = child;
    let log = "";
    const append = (chunk: Buffer) => {
      const text = chunk.toString("utf8");
      log += text;
      if (log.length > 200_000) {
        log = log.slice(-160_000);
      }
      onChunk?.(text);
    };
    child.stdout?.on("data", append);
    child.stderr?.on("data", append);
    child.on("error", (error) => {
      if (activeRun === child) activeRun = null;
      reject(error);
    });
    child.on("close", (code) => {
      if (activeRun === child) activeRun = null;
      resolve({ code: code ?? 1, log });
    });
  });
}

async function handleUpdate(
  req: IncomingMessage,
  res: ServerResponse,
  root: string,
) {
  let body: UpdateBody;
  try {
    body = await readJsonBody<UpdateBody>(req);
  } catch (error) {
    res.statusCode = 400;
    res.end(error instanceof Error ? error.message : "Invalid JSON");
    return;
  }

  const storyId = body.storyId?.trim();
  const component = body.component?.trim();
  if (!storyId && !component) {
    res.statusCode = 400;
    res.end("Provide storyId or component");
    return;
  }

  const args = [
    "exec",
    "tsx",
    "scripts/ui-generator/cli.ts",
    "visual-update",
    "--allow-dirty",
    "--approved",
    ...(component ? ["--component", component] : ["--story-id", storyId!]),
  ];

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.write(
    `Updating baselines${component ? ` for ${component}` : ` for ${storyId}`}…\n`,
  );

  try {
    const { code, log } = await runCommand("pnpm", args, root, {
      VISUAL_UPDATE_APPROVED: "1",
    });
    res.write(log);
    res.write(`\n[exit ${code}]\n`);
  } catch (error) {
    res.write(
      `\n[spawn error] ${error instanceof Error ? error.message : String(error)}\n`,
    );
  }
  res.end();
}

function beginNdjson(res: ServerResponse) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
}

async function handleRun(
  req: IncomingMessage,
  res: ServerResponse,
  root: string,
) {
  if (activeRun) {
    writeJson(res, 409, {
      ok: false,
      crashed: true,
      error: "A visual test run is already in progress",
      exitCode: 1,
      rebuild: false,
      summary: { total: 0, passed: 0, failed: 0, skipped: 0 },
      results: [],
      logTail: "",
    } satisfies VisualRunResponse);
    return;
  }

  let body: RunBody;
  try {
    body = await readJsonBody<RunBody>(req);
  } catch (error) {
    writeJson(res, 400, {
      ok: false,
      crashed: true,
      error: error instanceof Error ? error.message : "Invalid JSON",
      exitCode: 1,
      rebuild: false,
      summary: { total: 0, passed: 0, failed: 0, skipped: 0 },
      results: [],
      logTail: "",
    } satisfies VisualRunResponse);
    return;
  }

  const staticIndex = path.join(root, "storybook-static", "index.json");
  const rebuild = Boolean(body.rebuild) || !existsSync(staticIndex);
  const grep = grepFromStoryIds(body.storyIds);
  let log = "";

  beginNdjson(res);

  try {
    if (rebuild) {
      const built = await runCommand("pnpm", ["build-storybook"], root);
      log += built.log;
      if (built.code !== 0) {
        writeNdjson(res, {
          type: "error",
          error: "build-storybook failed",
          crashed: true,
        });
        writeNdjson(res, {
          type: "done",
          ok: false,
          crashed: true,
          error: "build-storybook failed",
          exitCode: built.code,
          rebuild,
          grep,
          summary: { total: 0, passed: 0, failed: 0, skipped: 0 },
          results: [],
          logTail: log.slice(-4000),
        });
        res.end();
        return;
      }
    }

    const total = countVisualStories(root, body.storyIds);
    writeNdjson(res, { type: "start", total });

    const seenIndexes = new Set<number>();
    let completed = 0;
    let passed = 0;
    let failed = 0;
    let lineBuf = "";

    const args = [
      "exec",
      "playwright",
      "test",
      "--reporter=list",
      "--reporter=json",
      ...(grep ? ["-g", grep] : []),
    ];
    const { code, log: runLog } = await runCommand(
      "pnpm",
      args,
      root,
      { PLAYWRIGHT_UPDATE_SNAPSHOTS: "0" },
      (chunk) => {
        lineBuf += chunk;
        const lines = lineBuf.split("\n");
        lineBuf = lines.pop() ?? "";
        for (const line of lines) {
          for (const item of parseListReporterProgress(`${line}\n`)) {
            if (seenIndexes.has(item.index)) continue;
            seenIndexes.add(item.index);
            completed = seenIndexes.size;
            if (item.status === "passed") passed += 1;
            else failed += 1;
            writeNdjson(res, {
              type: "progress",
              completed,
              total: total || completed,
              passed,
              failed,
              storyId: item.storyId,
              status: item.status,
            });
          }
        }
      },
    );
    log += runLog;

    let results: VisualRunResultItem[] = [];
    const json = extractJsonDocument(runLog);
    if (json) {
      try {
        results = attachSidecars(parsePlaywrightJson(json), root);
      } catch {
        /* leave empty — UI still shows crash/fail via exit code */
      }
    }

    const summary = summarize(results);
    writeNdjson(res, {
      type: "done",
      ok: code === 0 && summary.failed === 0,
      exitCode: code,
      rebuild,
      grep,
      summary,
      results,
      logTail: log.slice(-6000),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    writeNdjson(res, { type: "error", error: message, crashed: true });
    writeNdjson(res, {
      type: "done",
      ok: false,
      crashed: true,
      error: message,
      exitCode: 1,
      rebuild,
      grep,
      summary: { total: 0, passed: 0, failed: 0, skipped: 0 },
      results: [],
      logTail: log.slice(-4000),
    });
  }
  res.end();
}

function handleCancel(res: ServerResponse) {
  if (!activeRun) {
    writeJson(res, 200, { ok: true, cancelled: false });
    return;
  }
  activeRun.kill("SIGTERM");
  activeRun = null;
  writeJson(res, 200, { ok: true, cancelled: true });
}

/**
 * Dev-only Visual Delta endpoints:
 * - POST /__visual-delta/update-baseline — regenerate baselines
 * - POST /__visual-delta/run-tests — run Playwright visual suite (no updates)
 * - POST /__visual-delta/cancel-tests — stop an in-flight run
 */
export function visualDeltaMiddlewarePlugin(): Plugin {
  return {
    name: "visual-delta-middleware",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split("?")[0] ?? "";
        const root = server.config.root;

        if (url === VISUAL_DELTA_UPDATE_PATH) {
          if (req.method !== "POST") {
            res.statusCode = 405;
            res.setHeader("Allow", "POST");
            res.end("Method Not Allowed");
            return;
          }
          await handleUpdate(req, res, root);
          return;
        }

        if (url === VISUAL_DELTA_RUN_PATH) {
          if (req.method !== "POST") {
            res.statusCode = 405;
            res.setHeader("Allow", "POST");
            res.end("Method Not Allowed");
            return;
          }
          await handleRun(req, res, root);
          return;
        }

        if (url === VISUAL_DELTA_CANCEL_PATH) {
          if (req.method !== "POST") {
            res.statusCode = 405;
            res.setHeader("Allow", "POST");
            res.end("Method Not Allowed");
            return;
          }
          handleCancel(res);
          return;
        }

        next();
      });
    },
  };
}
