#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_REPO_ROOT = path.resolve(SCRIPT_DIRECTORY, "../..");
export const SPEC_COLLECTION = "design-core-spec";
export const DEFAULT_LIMIT = 10;
export const QMD_CONFIG_PATH = path.join(".qmd", "index.yml");

export class UsageError extends Error {}

export function usage() {
  return [
    "Usage:",
    '  pnpm spec:search -- [--semantic] [--limit <n>] [--json] "<query or DC-ID>"',
    "  pnpm spec:index -- [--semantic]",
  ].join("\n");
}

function parseLimit(value) {
  if (!/^\d+$/.test(value ?? "") || Number(value) < 1)
    throw new UsageError("--limit must be a positive integer");
  return Number(value);
}

export function parseCliArgs(argv) {
  const [command, ...args] = argv;
  if (command === "--help" || command === "-h") return { help: true };
  if (!["search", "index"].includes(command))
    throw new UsageError("expected the search or index command");
  let semantic = false;
  let json = false;
  let limit = DEFAULT_LIMIT;
  let help = false;
  const queryParts = [];
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--") continue;
    if (argument === "--semantic") semantic = true;
    else if (argument === "--json") json = true;
    else if (argument === "--limit" || argument === "-n") {
      limit = parseLimit(args[index + 1]);
      index += 1;
    } else if (argument === "--help" || argument === "-h") help = true;
    else if (argument.startsWith("-"))
      throw new UsageError(`unknown option: ${argument}`);
    else queryParts.push(argument);
  }
  if (help) return { help: true };
  if (
    command === "index" &&
    (json || limit !== DEFAULT_LIMIT || queryParts.length)
  )
    throw new UsageError("spec:index accepts only --semantic");
  const query = queryParts.join(" ").trim();
  if (command === "search" && !query)
    throw new UsageError("spec:search requires a query");
  return { command, semantic, json, limit, query };
}

export function resolveQmdBinary(
  repoRoot = DEFAULT_REPO_ROOT,
  platform = process.platform,
) {
  return path.join(
    repoRoot,
    "node_modules",
    ".bin",
    platform === "win32" ? "qmd.cmd" : "qmd",
  );
}

function resultStatus(result) {
  return Number.isInteger(result?.status) ? result.status : 1;
}

function outputOf(result) {
  return [result?.stdout, result?.stderr, result?.error?.message]
    .filter(Boolean)
    .join("\n");
}

export function looksLikeAbiMismatch(result) {
  return /NODE_MODULE_VERSION|different Node\.js version|ERR_DLOPEN_FAILED|Module did not self-register|compiled against.*Node/i.test(
    outputOf(result),
  );
}

function fallback(query) {
  const term = query ? query.replaceAll("'", "'\\''") : "<query>";
  return `Fallback: rg -n -i --glob '*.md' '${term}' spec/src`;
}

function reportFailure(label, result, options, stderr) {
  stderr.write(`${label}\n`);
  const output = outputOf(result);
  if (output) stderr.write(`${output.trim()}\n`);
  if (looksLikeAbiMismatch(result))
    stderr.write(
      `QMD native modules do not match the active Node ABI ${process.versions.modules}; run pnpm install --force under the active Node version.\n`,
    );
  stderr.write(`${fallback(options.query)}\n`);
}

export function runSpecCommand(
  options,
  {
    repoRoot = DEFAULT_REPO_ROOT,
    binaryPath = resolveQmdBinary(repoRoot),
    exists = existsSync,
    run = spawnSync,
    stdout = process.stdout,
    stderr = process.stderr,
    environment = process.env,
    platform = process.platform,
  } = {},
) {
  const configPath = path.join(repoRoot, QMD_CONFIG_PATH);
  if (!exists(configPath)) {
    stderr.write(
      `Missing ${QMD_CONFIG_PATH}; restore the tracked QMD specification configuration.\n${fallback(options.query)}\n`,
    );
    return 2;
  }
  if (!exists(binaryPath)) {
    stderr.write(
      `Missing the repository-local QMD binary; run pnpm install.\n${fallback(options.query)}\n`,
    );
    return 2;
  }
  const spawnOptions = (capture) => ({
    cwd: repoRoot,
    env: { ...environment, PWD: repoRoot },
    encoding: "utf8",
    shell: platform === "win32",
    stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
  });
  const execute = (args, capture = false) =>
    run(binaryPath, args, spawnOptions(capture));
  const refresh = execute(["update"], options.command === "search");
  if (resultStatus(refresh) !== 0) {
    reportFailure(
      "Specification index refresh failed.",
      refresh,
      options,
      stderr,
    );
    return resultStatus(refresh);
  }
  if (options.semantic) {
    const embed = execute(["embed", "-c", SPEC_COLLECTION]);
    if (resultStatus(embed) !== 0) {
      reportFailure(
        "Specification embedding or model initialization failed; retry or omit --semantic.",
        embed,
        options,
        stderr,
      );
      return resultStatus(embed);
    }
  }
  if (options.command === "index") return 0;
  const search = execute([
    options.semantic ? "vsearch" : "search",
    options.query,
    "-c",
    SPEC_COLLECTION,
    "-n",
    String(options.limit),
    "--format",
    options.json ? "json" : "md",
    "--full-path",
    "--line-numbers",
  ]);
  if (resultStatus(search) !== 0)
    reportFailure("Specification search failed.", search, options, stderr);
  return resultStatus(search);
}

export function main(
  argv = process.argv.slice(2),
  { stdout = process.stdout, stderr = process.stderr, ...dependencies } = {},
) {
  try {
    const options = parseCliArgs(argv);
    if (options.help) {
      stdout.write(`${usage()}\n`);
      return 0;
    }
    return runSpecCommand(options, { stdout, stderr, ...dependencies });
  } catch (error) {
    if (error instanceof UsageError)
      stderr.write(`${error.message}\n${usage()}\n`);
    else
      stderr.write(
        `${error instanceof Error ? error.message : String(error)}\n`,
      );
    return 2;
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
)
  process.exitCode = main();
