#!/usr/bin/env node
import path from "node:path";
import { loadDocsMcpConfig } from "../config.js";
import type { DocsMcpEntryKind, DocsMcpGetFormat } from "../discovery.js";
import { createDocsService } from "../service.js";
import {
  removeManagedAgentDocs,
  writeManagedAgentDocs,
  type DocsMcpAgentSelection,
} from "./agent-docs.js";
import { inspectDocsService } from "./doctor.js";
import { runAgentEval, type AgentEvalCondition } from "./eval-agent.js";
import { runDeterministicEval } from "./eval.js";
import { initializeDocsMcp, type ClientTransport } from "./init.js";
import { startDocsMcpHttpServer } from "./server.js";
import { startDocsMcpStdio } from "./stdio.js";

type Args = {
  command: string;
  root: string;
  config?: string;
  host?: string;
  port?: number;
  baseUrl?: string;
  clientName?: string;
  transport?: ClientTransport;
  noCache: boolean;
  json: boolean;
  live: boolean;
  positionals: string[];
  kinds: DocsMcpEntryKind[];
  limit?: number;
  section?: string;
  format?: DocsMcpGetFormat;
  agentDocs: boolean;
  removeAgentDocs: boolean;
  agent: DocsMcpAgentSelection;
  agentDocsPath?: string;
  casesPath?: string;
  k?: number;
  runner?: string;
  repetitions?: number;
  conditions: AgentEvalCondition[];
  outputDir?: string;
  timeoutMs?: number;
};

function envValue(primary: string, legacy: string): string | undefined {
  return process.env[primary] ?? process.env[legacy];
}

function parseArgs(argv: string[]): Args {
  const command = argv[0] ?? "stdio";
  let root = envValue("DOCS_MCP_ROOT", "UI_DOCS_ROOT") ?? process.cwd();
  let config = envValue("DOCS_MCP_CONFIG", "UI_DOCS_CONFIG");
  let host = envValue("DOCS_MCP_HOST", "UI_DOCS_HOST");
  const envPort = envValue("DOCS_MCP_PORT", "UI_DOCS_PORT");
  let port = envPort ? Number(envPort) : undefined;
  let baseUrl = envValue("DOCS_MCP_BASE_URL", "UI_DOCS_BASE_URL");
  let clientName: string | undefined;
  let transport: ClientTransport | undefined;
  let noCache = ["0", "false"].includes(
    envValue("DOCS_MCP_CACHE", "UI_DOCS_CACHE") ?? "",
  );
  let json = false;
  let live = false;
  const positionals: string[] = [];
  const kinds: DocsMcpEntryKind[] = [];
  let limit: number | undefined;
  let section: string | undefined;
  let format: DocsMcpGetFormat | undefined;
  let agentDocs = false;
  let removeAgentDocs = false;
  let agent: DocsMcpAgentSelection = "codex";
  let agentDocsPath: string | undefined;
  let casesPath: string | undefined;
  let k: number | undefined;
  let runner: string | undefined;
  let repetitions: number | undefined;
  const conditions: AgentEvalCondition[] = [];
  let outputDir: string | undefined;
  let timeoutMs: number | undefined;
  for (let index = 1; index < argv.length; index++) {
    const token = argv[index]!;
    const value = argv[index + 1];
    if (token === "--root" && value) root = argv[++index]!;
    else if (token === "--config" && value) config = argv[++index]!;
    else if (token === "--host" && value) host = argv[++index]!;
    else if (token === "--port" && value) port = Number(argv[++index]);
    else if (token === "--base-url" && value) baseUrl = argv[++index]!;
    else if (token === "--client-name" && value) {
      clientName = argv[++index]!;
    } else if (token === "--transport" && value) {
      if (value !== "stdio" && value !== "http") {
        throw new Error(`Unknown transport "${value}".`);
      }
      transport = value;
      index += 1;
    } else if (token === "--no-cache") noCache = true;
    else if (token === "--json") json = true;
    else if (token === "--live") live = true;
    else if (token === "--kind" && value) {
      const requested = value.split(",") as DocsMcpEntryKind[];
      for (const kind of requested) {
        if (!["component", "guide", "template", "block"].includes(kind)) {
          throw new Error(`Unknown documentation kind "${kind}".`);
        }
        kinds.push(kind);
      }
      index += 1;
    } else if (token === "--limit" && value) {
      limit = Number(argv[++index]);
    } else if (token === "--section" && value) {
      section = argv[++index]!;
    } else if (token === "--format" && value) {
      if (!["bounded", "full", "dense"].includes(value)) {
        throw new Error(`Unknown get format "${value}".`);
      }
      format = value as DocsMcpGetFormat;
      index += 1;
    } else if (token === "--agent-docs") {
      agentDocs = true;
    } else if (token === "--remove-agent-docs") {
      removeAgentDocs = true;
    } else if (token === "--agent" && value) {
      if (!["codex", "cursor", "claude", "all"].includes(value)) {
        throw new Error(`Unknown agent "${value}".`);
      }
      agent = value as DocsMcpAgentSelection;
      index += 1;
    } else if (token === "--agent-docs-path" && value) {
      agentDocsPath = argv[++index]!;
    } else if (token === "--cases" && value) {
      casesPath = argv[++index]!;
    } else if (token === "--k" && value) {
      k = Number(argv[++index]);
    } else if (token === "--runner" && value) {
      runner = argv[++index]!;
    } else if (token === "--repetitions" && value) {
      repetitions = Number(argv[++index]);
    } else if (token === "--condition" && value) {
      for (const condition of value.split(",") as AgentEvalCondition[]) {
        if (!["bare", "mcp", "mcp-agent-docs"].includes(condition)) {
          throw new Error(`Unknown eval-agent condition "${condition}".`);
        }
        conditions.push(condition);
      }
      index += 1;
    } else if (token === "--out" && value) {
      outputDir = argv[++index]!;
    } else if (token === "--timeout-ms" && value) {
      timeoutMs = Number(argv[++index]);
    } else if (token.startsWith("--")) {
      throw new Error(`Unknown option "${token}".`);
    } else {
      positionals.push(token);
    }
  }
  if (port !== undefined && (!Number.isInteger(port) || port < 0)) {
    throw new Error(`Invalid port: ${port}`);
  }
  if (limit !== undefined && (!Number.isInteger(limit) || limit < 1)) {
    throw new Error(`Invalid limit: ${limit}`);
  }
  if (k !== undefined && (!Number.isInteger(k) || k < 1 || k > 20)) {
    throw new Error(`Invalid evaluation k: ${k}`);
  }
  if (
    repetitions !== undefined &&
    (!Number.isInteger(repetitions) || repetitions < 1)
  ) {
    throw new Error(`Invalid repetitions: ${repetitions}`);
  }
  if (
    timeoutMs !== undefined &&
    (!Number.isInteger(timeoutMs) || timeoutMs < 1_000)
  ) {
    throw new Error(`Invalid timeout: ${timeoutMs}`);
  }
  return {
    command,
    root: path.resolve(root),
    config,
    host,
    port,
    baseUrl,
    clientName,
    transport,
    noCache,
    json,
    live,
    positionals,
    kinds,
    limit,
    section,
    format,
    agentDocs,
    removeAgentDocs,
    agent,
    agentDocsPath,
    casesPath,
    k,
    runner,
    repetitions,
    conditions,
    outputDir,
    timeoutMs,
  };
}

function help(): string {
  return `docs-mcp — Storybook documentation MCP

Usage:
  docs-mcp init [--root .] [--transport stdio|http] [--client-name name]
                [--agent-docs] [--agent codex|cursor|claude|all]
                [--agent-docs-path relative/path]
  docs-mcp init --remove-agent-docs [--agent codex|cursor|claude|all]
  docs-mcp stdio [--root .] [--config .storybook/docs-mcp.config.ts]
  docs-mcp serve [--host 127.0.0.1] [--port 9011] [--no-cache]
  docs-mcp doctor [--json] [--live]
  docs-mcp search "<query>" [--kind component|guide|template|block] [--limit 8] [--json]
  docs-mcp get <id> [--section id] [--format bounded|full|dense] [--json]
  docs-mcp eval --cases <file> [--k 5] [--json]
  docs-mcp eval-agent --cases <file> --runner "command {cwd} {promptFile}"
                      [--repetitions 5] [--condition bare|mcp|mcp-agent-docs]
                      [--out .cache/docs-mcp/evals/name] [--json]

stdio is the default command and the default generated client transport.
DOCS_MCP_* environment variables take precedence over legacy UI_DOCS_* aliases.
`;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (args.command === "--help" || args.command === "help") {
    process.stdout.write(help());
    return;
  }
  if (args.command === "init") {
    if (args.removeAgentDocs) {
      const agentDocs = removeManagedAgentDocs({
        root: args.root,
        agent: args.agent,
        agentDocsPath: args.agentDocsPath,
      });
      process.stdout.write(
        args.json
          ? `${JSON.stringify({ agentDocs })}\n`
          : [
              ...agentDocs.map(
                (entry) =>
                  `${entry.action === "removed" ? "Removed" : "No managed block in"}: ${entry.filePath}`,
              ),
              "",
            ].join("\n"),
      );
      return;
    }
    const result = initializeDocsMcp({
      root: args.root,
      configPath: args.config,
      clientName: args.clientName,
      transport: args.transport,
      port: args.port,
    });
    let agentDocs: ReturnType<typeof writeManagedAgentDocs> | undefined;
    if (args.agentDocs) {
      const loaded = await loadDocsMcpConfig(args.root, result.configPath);
      const service = createDocsService({
        root: loaded.root,
        config: loaded.config,
        configPath: loaded.configPath,
        noCache: args.noCache,
      });
      agentDocs = writeManagedAgentDocs({
        service,
        agent: args.agent,
        agentDocsPath: args.agentDocsPath,
      });
    }
    const output = { ...result, ...(agentDocs ? { agentDocs } : {}) };
    process.stdout.write(
      args.json
        ? `${JSON.stringify(output)}\n`
        : [
            `Docs MCP initialized as "${result.clientName}" (transport: ${args.transport ?? "stdio"}).`,
            `Config: ${result.configPath}`,
            ...result.clientFiles.map((file) => `Client: ${file}`),
            ...(agentDocs ?? []).map(
              (entry) =>
                `Agent docs: ${entry.filePath}${entry.changed ? "" : " (unchanged)"}`,
            ),
            "",
          ].join("\n"),
    );
    return;
  }
  const loaded = await loadDocsMcpConfig(args.root, args.config);
  if (args.command === "search") {
    const query = args.positionals.join(" ").trim();
    if (!query) throw new Error("search requires a query.");
    const service = createDocsService({
      root: loaded.root,
      config: loaded.config,
      configPath: loaded.configPath,
      noCache: args.noCache,
    });
    const result = service.search({
      query,
      ...(args.kinds.length ? { kinds: args.kinds } : {}),
      limit: args.limit,
    });
    process.stdout.write(
      args.json
        ? `${JSON.stringify(result)}\n`
        : result.results.length
          ? [
              `Matches for "${query}":`,
              ...result.results.map(
                (entry) =>
                  `${entry.id}\t${entry.kind}\t${entry.score}\t${entry.reason}\t${entry.importPath ?? entry.path}\n  ${entry.summary}`,
              ),
              "",
            ].join("\n")
          : `No confident documentation matches for "${query}".\n`,
    );
    return;
  }
  if (args.command === "get") {
    const id = args.positionals.join(" ").trim();
    if (!id) throw new Error("get requires an exact documentation ID.");
    const service = createDocsService({
      root: loaded.root,
      config: loaded.config,
      configPath: loaded.configPath,
      noCache: args.noCache,
    });
    const result = service.get({
      id,
      section: args.section,
      format: args.format,
    });
    process.stdout.write(
      args.json
        ? `${JSON.stringify(result)}\n`
        : result.status === "ok"
          ? (result.markdown ?? "")
          : [
              `${result.status === "ambiguous" ? "Ambiguous" : "Unknown"} documentation: ${id}`,
              ...(result.candidates ?? []).map(
                (candidate) =>
                  `- ${candidate.id} [${candidate.kind}] — ${candidate.name}`,
              ),
              result.hint ?? "",
              "",
            ].join("\n"),
    );
    if (result.status !== "ok") process.exitCode = 1;
    return;
  }
  if (args.command === "eval") {
    if (!args.casesPath) throw new Error("eval requires --cases <file>.");
    const service = createDocsService({
      root: loaded.root,
      config: loaded.config,
      configPath: loaded.configPath,
      noCache: args.noCache,
    });
    const report = runDeterministicEval({
      service,
      casesPath: args.casesPath,
      k: args.k,
    });
    process.stdout.write(
      args.json
        ? `${JSON.stringify(report)}\n`
        : [
            report.ok
              ? "Docs MCP relevance evaluation passed."
              : "Docs MCP relevance evaluation failed.",
            `Cases: ${report.caseCount}`,
            `Top-1: ${report.metrics.top1Accuracy}`,
            `Hit@${report.metrics.k}: ${report.metrics.hitAtK}`,
            `MRR: ${report.metrics.meanReciprocalRank}`,
            `No-result correctness: ${report.metrics.noResultCorrectness}`,
            ...report.cases
              .filter((entry) => !entry.passed)
              .map(
                (entry) =>
                  `FAIL ${entry.id}: expected ${entry.expectedIds.join(", ") || "no results"} within rank ${entry.maxRank}; got ${entry.topIds.join(", ") || "no results"}`,
              ),
            "",
          ].join("\n"),
    );
    if (!report.ok) process.exitCode = 1;
    return;
  }
  if (args.command === "eval-agent") {
    if (!args.casesPath) {
      throw new Error("eval-agent requires --cases <file>.");
    }
    if (!args.runner) {
      throw new Error(
        'eval-agent requires --runner "command {cwd} {promptFile}".',
      );
    }
    const service = createDocsService({
      root: loaded.root,
      config: loaded.config,
      configPath: loaded.configPath,
      noCache: true,
    });
    const report = runAgentEval({
      service,
      casesPath: args.casesPath,
      runner: args.runner,
      repetitions: args.repetitions,
      conditions: args.conditions.length ? args.conditions : undefined,
      outputDir: args.outputDir,
      timeoutMs: args.timeoutMs,
    });
    process.stdout.write(
      args.json
        ? `${JSON.stringify(report)}\n`
        : [
            report.ok
              ? "Docs MCP agent experiment completed."
              : "Docs MCP agent experiment completed with runner or validity failures.",
            `Report: ${path.join(report.reportRoot, "report.json")}`,
            `Trials: ${report.trials.length}`,
            ...report.conditions.map((condition) => {
              const metrics = report.metrics[condition];
              return `${condition}: MCP ${metrics.mcpDiscoveryRate}, search→get ${metrics.searchGetCompletionRate}, recall ${metrics.expectedIdRecall}, typecheck ${metrics.fixtureTypecheckRate}`;
            }),
            "",
          ].join("\n"),
    );
    if (!report.ok) process.exitCode = 1;
    return;
  }
  if (args.command === "stdio") {
    await startDocsMcpStdio({
      root: loaded.root,
      config: loaded.config,
      configPath: loaded.configPath,
      noCache: args.noCache,
    });
    return;
  }
  if (args.command === "serve") {
    const started = await startDocsMcpHttpServer({
      root: loaded.root,
      config: loaded.config,
      configPath: loaded.configPath,
      host: args.host,
      port: args.port,
      baseUrl: args.baseUrl,
      noCache: args.noCache,
    });
    process.stdout.write(
      [
        `Docs MCP listening on ${started.baseUrl}`,
        `  MCP:      ${started.baseUrl}${started.service.mcpPath}`,
        `  llms.txt: ${started.baseUrl}/llms.txt`,
        "",
      ].join("\n"),
    );
    return;
  }
  if (args.command === "doctor") {
    const service = createDocsService({
      root: loaded.root,
      config: loaded.config,
      configPath: loaded.configPath,
      noCache: args.noCache,
    });
    const issues = inspectDocsService(service);
    if (args.live) {
      await service.manifestProvider(undefined, "components.json");
      await service.manifestProvider(undefined, "docs.json");
      await service.manifestProvider(undefined, "artifacts.json");
    }
    const result = {
      ok: !issues.some((issue) => issue.level === "error"),
      provider: loaded.config.provider.name,
      root: loaded.root,
      components: service.getCatalog().components.length,
      documents: service.getCatalog().documents.length,
      artifacts: service.getCatalog().artifacts?.length ?? 0,
      issues,
    };
    process.stdout.write(
      args.json
        ? `${JSON.stringify(result)}\n`
        : [
            result.ok ? "Docs MCP doctor passed." : "Docs MCP doctor failed.",
            `Provider: ${result.provider}`,
            `Catalog: ${result.components} components, ${result.documents} documents, ${result.artifacts} artifacts`,
            ...issues.map(
              (issue) => `${issue.level.toUpperCase()}: ${issue.message}`,
            ),
            "",
          ].join("\n"),
    );
    if (!result.ok) process.exitCode = 1;
    return;
  }
  throw new Error(`Unknown command "${args.command}".\n\n${help()}`);
}

main().catch((error) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
});
