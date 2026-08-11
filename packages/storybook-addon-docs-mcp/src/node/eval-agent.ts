import { spawnSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { DocsMcpEntryKind } from "../discovery.js";
import type { DocsMcpEvalCase } from "../evaluation.js";
import type { DocsService } from "../service.js";
import { buildManagedAgentDocs } from "./agent-docs.js";
import { loadEvalCases } from "./eval.js";

const resolveModule = createRequire(import.meta.url);
const svelteCheckPackagePath = resolveModule.resolve(
  "svelte-check/package.json",
);
const svelteCheckPackage = JSON.parse(
  readFileSync(svelteCheckPackagePath, "utf8"),
) as { bin: string };
const svelteCheckCli = path.resolve(
  path.dirname(svelteCheckPackagePath),
  svelteCheckPackage.bin,
);

export type AgentEvalCondition = "bare" | "mcp" | "mcp-agent-docs";

type AgentResult = {
  selectedIds?: string[];
  imports?: Array<{ id: string; importPath: string }>;
  propsUsed?: Array<{ id: string; props: string[] }>;
  fixture?: string;
};

type ToolLog = {
  kind?: string;
  method?: string;
  tool?: string;
  args?: unknown;
};

export type AgentEvalTrial = {
  condition: AgentEvalCondition;
  caseId: string;
  repetition: number;
  sandbox: string;
  runnerStatus: number | null;
  runnerTimedOut: boolean;
  resultFound: boolean;
  selectedIds: string[];
  expectedIdRecall: number;
  inventedIds: string[];
  inventedProps: Array<{ id: string; props: string[] }>;
  invalidImports: Array<{ id: string; importPath: string }>;
  mcpDiscovered: boolean;
  searchGetCompleted: boolean;
  fixtureTypecheck: "passed" | "failed" | "missing";
  logFile: string;
};

export type AgentEvalReport = {
  ok: boolean;
  generatedAt: string;
  runner: string;
  repetitions: number;
  conditions: AgentEvalCondition[];
  cases: number;
  reportRoot: string;
  metrics: Record<
    AgentEvalCondition,
    {
      trials: number;
      mcpDiscoveryRate: number;
      searchGetCompletionRate: number;
      expectedIdRecall: number;
      inventedIdRate: number;
      inventedPropRate: number;
      importValidityRate: number;
      fixtureTypecheckRate: number;
    }
  >;
  trials: AgentEvalTrial[];
};

function shellQuote(value: string): string {
  return `'${value.replaceAll("'", `'\\''`)}'`;
}

function safeSegment(value: string): string {
  return (
    value
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || "case"
  );
}

function parseAgentResult(filePath: string): AgentResult {
  if (!existsSync(filePath)) return {};
  try {
    const value = JSON.parse(readFileSync(filePath, "utf8")) as AgentResult;
    return value && typeof value === "object" ? value : {};
  } catch {
    return {};
  }
}

function parseToolLog(filePath: string): ToolLog[] {
  if (!existsSync(filePath)) return [];
  return readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .flatMap((line) => {
      try {
        return [JSON.parse(line) as ToolLog];
      } catch {
        return [];
      }
    });
}

function ratio(numerator: number, denominator: number): number {
  return denominator ? Number((numerator / denominator).toFixed(4)) : 0;
}

function packageIdentity(root: string): string {
  const packagePath = path.join(root, "package.json");
  if (!existsSync(packagePath)) return path.basename(root);
  const parsed = JSON.parse(readFileSync(packagePath, "utf8")) as {
    name?: string;
  };
  return parsed.name ?? path.basename(root);
}

function linkPackage(
  sandbox: string,
  packageName: string,
  target: string,
): void {
  const segments = packageName.split("/");
  const linkPath = path.join(sandbox, "node_modules", ...segments);
  mkdirSync(path.dirname(linkPath), { recursive: true });
  if (!existsSync(linkPath)) symlinkSync(target, linkPath, "dir");
}

function docsMcpPackageRoot(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
}

function realCliInvocation(): string[] {
  const packageRoot = docsMcpPackageRoot();
  const built = path.join(packageRoot, "dist/node/cli.js");
  if (existsSync(built)) return [built];
  return ["--import", "tsx", path.join(packageRoot, "src/node/cli.ts")];
}

function proxySource(): string {
  return `#!/usr/bin/env node
import { appendFileSync } from "node:fs";
import { spawn } from "node:child_process";
const log = process.env.DOCS_MCP_EVAL_LOG;
const invocation = ${JSON.stringify(realCliInvocation())};
const args = process.argv.slice(2);
const write = (value) => {
  if (log) appendFileSync(log, JSON.stringify(value) + "\\n");
};
write({ kind: "cli", args, at: new Date().toISOString() });
const child = spawn(process.execPath, [...invocation, ...args], {
  stdio: ["pipe", "pipe", "pipe"],
  env: process.env,
});
let inputBuffer = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  inputBuffer += chunk;
  const lines = inputBuffer.split("\\n");
  inputBuffer = lines.pop() ?? "";
  for (const line of lines) {
    try {
      const message = JSON.parse(line);
      if (message.method === "tools/call") {
        write({
          kind: "mcp-tool",
          method: message.method,
          tool: message.params?.name,
          args: message.params?.arguments ?? {},
          at: new Date().toISOString(),
        });
      }
    } catch {}
  }
  child.stdin.write(chunk);
});
process.stdin.on("end", () => child.stdin.end());
child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);
child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 1);
});
`;
}

function createSandbox(options: {
  service: DocsService;
  directory: string;
  condition: AgentEvalCondition;
  prompt: string;
}): {
  promptFile: string;
  resultFile: string;
  logFile: string;
} {
  const { service, directory, condition } = options;
  mkdirSync(path.join(directory, "src"), { recursive: true });
  mkdirSync(path.join(directory, "node_modules/.bin"), { recursive: true });
  const packageName = packageIdentity(service.root);
  writeFileSync(
    path.join(directory, "package.json"),
    `${JSON.stringify(
      {
        name: "docs-mcp-agent-eval-consumer",
        private: true,
        type: "module",
        dependencies: { [packageName]: "workspace:*" },
      },
      null,
      2,
    )}\n`,
  );
  linkPackage(directory, packageName, service.root);
  for (const dependency of ["svelte", "tsx"]) {
    const target = path.join(service.root, "node_modules", dependency);
    if (existsSync(target)) linkPackage(directory, dependency, target);
  }
  writeFileSync(
    path.join(directory, "tsconfig.json"),
    `${JSON.stringify(
      {
        compilerOptions: {
          allowJs: true,
          checkJs: true,
          esModuleInterop: true,
          module: "ESNext",
          moduleResolution: "Bundler",
          skipLibCheck: true,
          strict: true,
          target: "ES2022",
          types: ["svelte"],
        },
        include: ["src/**/*.svelte", "src/**/*.ts"],
      },
      null,
      2,
    )}\n`,
  );
  const proxyPath = path.join(directory, "docs-mcp-proxy.mjs");
  writeFileSync(proxyPath, proxySource());
  chmodSync(proxyPath, 0o755);
  const binPath = path.join(directory, "node_modules/.bin/docs-mcp");
  symlinkSync(proxyPath, binPath);

  const logFile = path.join(directory, "docs-mcp-calls.jsonl");
  const resultFile = path.join(directory, "result.json");
  const promptFile = path.join(directory, "prompt.md");
  writeFileSync(promptFile, options.prompt);

  if (condition !== "bare") {
    writeFileSync(
      path.join(directory, ".mcp.json"),
      `${JSON.stringify(
        {
          mcpServers: {
            "docs-mcp-eval": {
              command: process.execPath,
              args: [
                proxyPath,
                "stdio",
                "--root",
                service.root,
                "--config",
                service.configPath ??
                  path.join(service.root, ".storybook/docs-mcp.config.ts"),
                "--no-cache",
              ],
              env: { DOCS_MCP_EVAL_LOG: logFile },
            },
          },
        },
        null,
        2,
      )}\n`,
    );
  }
  if (condition === "mcp-agent-docs") {
    writeFileSync(
      path.join(directory, "AGENTS.md"),
      buildManagedAgentDocs(service),
    );
  }
  return { promptFile, resultFile, logFile };
}

function promptFor(testCase: DocsMcpEvalCase): string {
  return `You are evaluating a local UI package as a fresh consumer.

Task: ${testCase.query}

Use any locally available package documentation or documentation tools. Do not
guess IDs, props, or import paths. Create a minimal Svelte example at
\`src/Fixture.svelte\` when the task has a relevant implementation. Before
finishing, write \`result.json\` with this exact JSON shape:

\`\`\`json
{
  "selectedIds": ["exact documentation IDs used"],
  "imports": [{ "id": "documentation ID", "importPath": "package import path" }],
  "propsUsed": [{ "id": "component documentation ID", "props": ["propName"] }],
  "fixture": "src/Fixture.svelte"
}
\`\`\`

Use empty arrays and omit \`fixture\` when no confident match exists.
`;
}

function validEntryMaps(service: DocsService): {
  ids: Set<string>;
  imports: Map<string, string>;
  props: Map<string, Set<string>>;
  kinds: Map<string, DocsMcpEntryKind>;
} {
  const catalog = service.getCatalog();
  return {
    ids: new Set([
      ...catalog.components.map((entry) => entry.id),
      ...catalog.documents.map((entry) => entry.id),
      ...(catalog.artifacts ?? []).map((entry) => entry.id),
    ]),
    imports: new Map(
      catalog.components.flatMap((entry) =>
        entry.importPath ? [[entry.id, entry.importPath] as const] : [],
      ),
    ),
    props: new Map(
      catalog.components.map((entry) => [
        entry.id,
        new Set(Object.keys(entry.reactDocgen?.props ?? {})),
      ]),
    ),
    kinds: new Map([
      ...catalog.components.map((entry) => [entry.id, "component"] as const),
      ...catalog.documents.map((entry) => [entry.id, "guide"] as const),
      ...(catalog.artifacts ?? []).map(
        (entry) => [entry.id, entry.kind] as const,
      ),
    ]),
  };
}

function typecheckFixture(
  service: DocsService,
  sandbox: string,
  fixture: string | undefined,
): "passed" | "failed" | "missing" {
  if (!fixture) return "missing";
  const fixturePath = path.resolve(sandbox, fixture);
  if (
    !fixturePath.startsWith(`${path.resolve(sandbox)}${path.sep}`) ||
    !existsSync(fixturePath)
  ) {
    return "missing";
  }
  const result = spawnSync(
    process.execPath,
    [
      svelteCheckCli,
      "--workspace",
      sandbox,
      "--tsconfig",
      "tsconfig.json",
      "--fail-on-warnings",
      "--output",
      "machine",
    ],
    { cwd: service.root, encoding: "utf8", timeout: 120_000 },
  );
  writeFileSync(
    path.join(sandbox, "svelte-check.log"),
    `${result.stdout ?? ""}${result.stderr ?? ""}`,
  );
  return result.status === 0 ? "passed" : "failed";
}

function scoreTrial(options: {
  service: DocsService;
  condition: AgentEvalCondition;
  testCase: DocsMcpEvalCase;
  repetition: number;
  sandbox: string;
  resultFile: string;
  logFile: string;
  runnerStatus: number | null;
  runnerTimedOut: boolean;
}): AgentEvalTrial {
  const maps = validEntryMaps(options.service);
  const result = parseAgentResult(options.resultFile);
  const logs = parseToolLog(options.logFile);
  const selectedIds = Array.isArray(result.selectedIds)
    ? result.selectedIds.filter((id): id is string => typeof id === "string")
    : [];
  const getIds = logs.flatMap((entry) =>
    entry.tool === "get" &&
    entry.args &&
    typeof entry.args === "object" &&
    "id" in entry.args &&
    typeof entry.args.id === "string"
      ? [entry.args.id]
      : [],
  );
  const recalled = new Set([...selectedIds, ...getIds]);
  const expectedIdRecall = ratio(
    options.testCase.expectedIds.filter((id) => recalled.has(id)).length,
    options.testCase.expectedIds.length,
  );
  const inventedIds = [...new Set([...selectedIds, ...getIds])].filter(
    (id) => !maps.ids.has(id),
  );
  const inventedProps = (result.propsUsed ?? []).flatMap((usage) => {
    const known = maps.props.get(usage.id);
    const invalid = usage.props.filter((prop) => !known?.has(prop));
    return invalid.length ? [{ id: usage.id, props: invalid }] : [];
  });
  const invalidImports = (result.imports ?? []).filter(
    (entry) => maps.imports.get(entry.id) !== entry.importPath,
  );
  const searchIndex = logs.findIndex(
    (entry) =>
      entry.tool === "search" ||
      (entry.kind === "cli" &&
        Array.isArray(entry.args) &&
        entry.args.includes("search")),
  );
  const getIndex = logs.findIndex(
    (entry, index) =>
      index > searchIndex &&
      (entry.tool === "get" ||
        (entry.kind === "cli" &&
          Array.isArray(entry.args) &&
          entry.args.includes("get"))),
  );
  return {
    condition: options.condition,
    caseId: options.testCase.id ?? safeSegment(options.testCase.query),
    repetition: options.repetition,
    sandbox: options.sandbox,
    runnerStatus: options.runnerStatus,
    runnerTimedOut: options.runnerTimedOut,
    resultFound: existsSync(options.resultFile),
    selectedIds,
    expectedIdRecall,
    inventedIds,
    inventedProps,
    invalidImports,
    mcpDiscovered: logs.some((entry) => entry.kind === "mcp-tool"),
    searchGetCompleted: searchIndex !== -1 && getIndex !== -1,
    fixtureTypecheck: typecheckFixture(
      options.service,
      options.sandbox,
      result.fixture,
    ),
    logFile: options.logFile,
  };
}

function aggregate(
  trials: AgentEvalTrial[],
  condition: AgentEvalCondition,
): AgentEvalReport["metrics"][AgentEvalCondition] {
  const entries = trials.filter((trial) => trial.condition === condition);
  return {
    trials: entries.length,
    mcpDiscoveryRate: ratio(
      entries.filter((trial) => trial.mcpDiscovered).length,
      entries.length,
    ),
    searchGetCompletionRate: ratio(
      entries.filter((trial) => trial.searchGetCompleted).length,
      entries.length,
    ),
    expectedIdRecall: entries.length
      ? Number(
          (
            entries.reduce((sum, trial) => sum + trial.expectedIdRecall, 0) /
            entries.length
          ).toFixed(4),
        )
      : 0,
    inventedIdRate: ratio(
      entries.filter((trial) => trial.inventedIds.length > 0).length,
      entries.length,
    ),
    inventedPropRate: ratio(
      entries.filter((trial) => trial.inventedProps.length > 0).length,
      entries.length,
    ),
    importValidityRate: ratio(
      entries.filter((trial) => trial.invalidImports.length === 0).length,
      entries.length,
    ),
    fixtureTypecheckRate: ratio(
      entries.filter((trial) => trial.fixtureTypecheck === "passed").length,
      entries.length,
    ),
  };
}

export function runAgentEval(options: {
  service: DocsService;
  casesPath: string;
  runner: string;
  repetitions?: number;
  conditions?: AgentEvalCondition[];
  outputDir?: string;
  timeoutMs?: number;
}): AgentEvalReport {
  if (
    !options.runner.includes("{cwd}") ||
    !options.runner.includes("{promptFile}")
  ) {
    throw new Error(
      "Agent runner must contain both {cwd} and {promptFile} placeholders.",
    );
  }
  const repetitions = Math.max(1, options.repetitions ?? 5);
  const conditions = options.conditions ?? ["bare", "mcp", "mcp-agent-docs"];
  const cases = loadEvalCases(options.service.root, options.casesPath);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportRoot = path.resolve(
    options.service.root,
    options.outputDir ?? `.cache/docs-mcp/evals/${timestamp}`,
  );
  mkdirSync(reportRoot, { recursive: true });
  const trials: AgentEvalTrial[] = [];

  for (const condition of conditions) {
    for (const [caseIndex, testCase] of cases.entries()) {
      for (let repetition = 1; repetition <= repetitions; repetition++) {
        const caseId = safeSegment(testCase.id ?? `case-${caseIndex + 1}`);
        const sandbox = path.join(
          reportRoot,
          condition,
          caseId,
          `run-${repetition}`,
        );
        const files = createSandbox({
          service: options.service,
          directory: sandbox,
          condition,
          prompt: promptFor(testCase),
        });
        const command = options.runner
          .replaceAll("{cwd}", shellQuote(sandbox))
          .replaceAll("{promptFile}", shellQuote(files.promptFile));
        const runner = spawnSync(command, {
          cwd: sandbox,
          shell: true,
          encoding: "utf8",
          timeout: options.timeoutMs ?? 300_000,
          env: {
            ...process.env,
            PATH: `${path.join(sandbox, "node_modules/.bin")}${path.delimiter}${process.env.PATH ?? ""}`,
            DOCS_MCP_EVAL_LOG: files.logFile,
            DOCS_MCP_EVAL_RESULT: files.resultFile,
          },
        });
        writeFileSync(
          path.join(sandbox, "runner.log"),
          `${runner.stdout ?? ""}${runner.stderr ?? ""}`,
        );
        trials.push(
          scoreTrial({
            service: options.service,
            condition,
            testCase,
            repetition,
            sandbox,
            resultFile: files.resultFile,
            logFile: files.logFile,
            runnerStatus: runner.status,
            runnerTimedOut:
              (runner.error as NodeJS.ErrnoException | undefined)?.code ===
              "ETIMEDOUT",
          }),
        );
      }
    }
  }

  const metrics = Object.fromEntries(
    conditions.map((condition) => [condition, aggregate(trials, condition)]),
  ) as AgentEvalReport["metrics"];
  const report: AgentEvalReport = {
    ok: trials.every(
      (trial) =>
        trial.runnerStatus === 0 &&
        trial.inventedIds.length === 0 &&
        trial.inventedProps.length === 0 &&
        trial.invalidImports.length === 0,
    ),
    generatedAt: new Date().toISOString(),
    runner: options.runner,
    repetitions,
    conditions,
    cases: cases.length,
    reportRoot,
    metrics,
    trials,
  };
  writeFileSync(
    path.join(reportRoot, "report.json"),
    `${JSON.stringify(report, null, 2)}\n`,
  );
  return report;
}
