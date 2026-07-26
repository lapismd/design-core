import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { applyEdits, modify, parse, type ParseError } from "jsonc-parser";
import { DEFAULT_CONFIG_PATH } from "../config.js";

export type ClientTransport = "stdio" | "http";

export type InitOptions = {
  root: string;
  configPath?: string;
  clientName?: string;
  transport?: ClientTransport;
  port?: number;
  packageManager?: string;
};

export type InitResult = {
  configPath: string;
  clientFiles: string[];
  clientName: string;
  storybookChanged: boolean;
  scriptChanged: boolean;
};

type JsonObject = Record<string, unknown>;

function readJsonc(filePath: string): {
  text: string;
  value: JsonObject;
} {
  const text = readFileSync(filePath, "utf8");
  const errors: ParseError[] = [];
  const value = parse(text, errors, {
    allowTrailingComma: true,
    disallowComments: false,
  }) as JsonObject | undefined;
  if (errors.length > 0 || !value || typeof value !== "object") {
    throw new Error(`Cannot safely update invalid JSONC file ${filePath}.`);
  }
  return { text, value };
}

function writeJsoncProperty(
  filePath: string,
  propertyPath: (string | number)[],
  value: unknown,
): boolean {
  const { text, value: document } = readJsonc(filePath);
  let existing: unknown = document;
  for (const segment of propertyPath) {
    if (
      !existing ||
      typeof existing !== "object" ||
      !(String(segment) in existing)
    ) {
      existing = undefined;
      break;
    }
    existing = (existing as JsonObject)[String(segment)];
  }
  if (
    existing !== undefined &&
    JSON.stringify(existing) === JSON.stringify(value)
  ) {
    return false;
  }
  const next = applyEdits(
    text,
    modify(text, propertyPath, value, {
      formattingOptions: {
        insertSpaces: true,
        tabSize: 2,
        eol: text.includes("\r\n") ? "\r\n" : "\n",
      },
    }),
  );
  writeFileSync(filePath, next, "utf8");
  return true;
}

function readPackageName(root: string): string {
  const filePath = path.join(root, "package.json");
  if (!existsSync(filePath)) return path.basename(root);
  const parsed = JSON.parse(readFileSync(filePath, "utf8")) as {
    name?: string;
  };
  return parsed.name ?? path.basename(root);
}

export function defaultClientName(root: string): string {
  return `${readPackageName(root)
    .replace(/^@/, "")
    .replace(/[^\w-]+/g, "-")}-docs`;
}

function clientEntry(
  kind: "mcpServers" | "servers",
  options: Required<
    Pick<
      InitOptions,
      "root" | "clientName" | "transport" | "port" | "packageManager"
    >
  > & { configPath: string },
): JsonObject {
  if (options.transport === "http") {
    return kind === "servers"
      ? {
          type: "http",
          url: `http://localhost:${options.port}/docs-mcp`,
        }
      : { url: `http://localhost:${options.port}/docs-mcp` };
  }
  const command = options.packageManager ?? "pnpm";
  const args = [
    "--dir",
    options.root,
    "exec",
    "docs-mcp",
    "stdio",
    "--config",
    options.configPath,
  ];
  return kind === "servers"
    ? { type: "stdio", command, args }
    : { command, args };
}

function mergeClientFile(
  filePath: string,
  rootKey: "mcpServers" | "servers",
  name: string,
  entry: JsonObject,
): boolean {
  const { value } = readJsonc(filePath);
  const servers = value[rootKey];
  const existing =
    servers && typeof servers === "object"
      ? (servers as JsonObject)[name]
      : undefined;
  if (
    existing !== undefined &&
    JSON.stringify(existing) !== JSON.stringify(entry)
  ) {
    throw new Error(
      `MCP client entry "${name}" already exists with a different definition in ${filePath}. Choose another --client-name or update it explicitly.`,
    );
  }
  return writeJsoncProperty(filePath, [rootKey, name], entry);
}

function ensureConfig(configPath: string): void {
  if (existsSync(configPath)) return;
  mkdirSync(path.dirname(configPath), { recursive: true });
  writeFileSync(
    configPath,
    [
      'import { createSvelteDocsProvider, defineDocsMcpConfig } from "storybook-addon-docs-mcp";',
      "",
      "export default defineDocsMcpConfig({",
      "  provider: createSvelteDocsProvider(),",
      '  mcpPath: "/docs-mcp",',
      "});",
      "",
    ].join("\n"),
    "utf8",
  );
}

function ensureScript(root: string, configPath: string): boolean {
  const packagePath = path.join(root, "package.json");
  if (!existsSync(packagePath)) return false;
  const relative = path.relative(root, configPath).replaceAll("\\", "/");
  return writeJsoncProperty(
    packagePath,
    ["scripts", "docs:mcp"],
    `docs-mcp stdio --config ${relative}`,
  );
}

function ensureStorybookAddon(root: string, packageManager: string): boolean {
  const candidates = [
    ".storybook/main.ts",
    ".storybook/main.js",
    ".storybook/main.mjs",
    ".storybook/main.cjs",
  ].map((entry) => path.join(root, entry));
  const mainPath = candidates.find(existsSync);
  if (!mainPath) return false;
  if (readFileSync(mainPath, "utf8").includes("storybook-addon-docs-mcp")) {
    return false;
  }
  const result = spawnSync(
    packageManager,
    [
      "exec",
      "storybook",
      "add",
      "storybook-addon-docs-mcp",
      "--skip-install",
      "--skip-postinstall",
      "--skip-doctor",
      "--yes",
    ],
    { cwd: root, encoding: "utf8" },
  );
  if (result.status !== 0) {
    throw new Error(
      `Storybook could not add the addon: ${result.stderr || result.stdout}`,
    );
  }
  return true;
}

export function initializeDocsMcp(options: InitOptions): InitResult {
  const root = path.resolve(options.root);
  const configPath = path.resolve(
    root,
    options.configPath ?? DEFAULT_CONFIG_PATH,
  );
  const clientName = options.clientName ?? defaultClientName(root);
  const transport = options.transport ?? "stdio";
  const port = options.port ?? 9011;
  const packageManager = options.packageManager ?? "pnpm";
  ensureConfig(configPath);
  const scriptChanged = ensureScript(root, configPath);
  const storybookChanged = ensureStorybookAddon(root, packageManager);

  const candidates: Array<{
    filePath: string;
    key: "mcpServers" | "servers";
  }> = [
    { filePath: path.join(root, ".cursor/mcp.json"), key: "mcpServers" },
    { filePath: path.join(root, ".mcp.json"), key: "mcpServers" },
    { filePath: path.join(root, ".vscode/mcp.json"), key: "servers" },
  ];
  let detected = candidates.filter(({ filePath }) => existsSync(filePath));
  if (detected.length === 0) {
    const filePath = path.join(root, ".mcp.json");
    writeFileSync(filePath, "{}\n", "utf8");
    detected = [{ filePath, key: "mcpServers" }];
  }
  const clientFiles: string[] = [];
  for (const candidate of detected) {
    const entry = clientEntry(candidate.key, {
      root,
      configPath,
      clientName,
      transport,
      port,
      packageManager,
    });
    mergeClientFile(candidate.filePath, candidate.key, clientName, entry);
    clientFiles.push(candidate.filePath);
  }
  return {
    configPath,
    clientFiles,
    clientName,
    storybookChanged,
    scriptChanged,
  };
}
