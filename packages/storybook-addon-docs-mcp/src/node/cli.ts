#!/usr/bin/env node
import path from "node:path";
import { loadDocsMcpConfig } from "../config.js";
import { createDocsService } from "../service.js";
import { inspectDocsService } from "./doctor.js";
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
  }
  if (port !== undefined && (!Number.isInteger(port) || port < 0)) {
    throw new Error(`Invalid port: ${port}`);
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
  };
}

function help(): string {
  return `docs-mcp — Storybook documentation MCP

Usage:
  docs-mcp init [--root .] [--transport stdio|http] [--client-name name]
  docs-mcp stdio [--root .] [--config .storybook/docs-mcp.config.ts]
  docs-mcp serve [--host 127.0.0.1] [--port 9011] [--no-cache]
  docs-mcp doctor [--json] [--live]

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
    const result = initializeDocsMcp({
      root: args.root,
      configPath: args.config,
      clientName: args.clientName,
      transport: args.transport,
      port: args.port,
    });
    process.stdout.write(
      args.json
        ? `${JSON.stringify(result)}\n`
        : [
            `Docs MCP initialized as "${result.clientName}" (transport: ${args.transport ?? "stdio"}).`,
            `Config: ${result.configPath}`,
            ...result.clientFiles.map((file) => `Client: ${file}`),
            "",
          ].join("\n"),
    );
    return;
  }
  const loaded = await loadDocsMcpConfig(args.root, args.config);
  if (args.command === "stdio") {
    await startDocsMcpStdio({
      root: loaded.root,
      config: loaded.config,
      noCache: args.noCache,
    });
    return;
  }
  if (args.command === "serve") {
    const started = await startDocsMcpHttpServer({
      root: loaded.root,
      config: loaded.config,
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
      noCache: args.noCache,
    });
    const issues = inspectDocsService(service);
    if (args.live) {
      await service.manifestProvider(undefined, "components.json");
      await service.manifestProvider(undefined, "docs.json");
    }
    const result = {
      ok: !issues.some((issue) => issue.level === "error"),
      provider: loaded.config.provider.name,
      root: loaded.root,
      components: service.getCatalog().components.length,
      documents: service.getCatalog().documents.length,
      issues,
    };
    process.stdout.write(
      args.json
        ? `${JSON.stringify(result)}\n`
        : [
            result.ok ? "Docs MCP doctor passed." : "Docs MCP doctor failed.",
            `Provider: ${result.provider}`,
            `Catalog: ${result.components} components, ${result.documents} documents`,
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
