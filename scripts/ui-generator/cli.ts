#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { EXIT, GeneratorError } from "./errors.js";
import { log } from "./logger.js";
import { runDoctor } from "./pipeline/doctor.js";
import { runVisualUpdate } from "./pipeline/visual-update.js";
import { runInspect } from "./pipeline/inspect.js";
import { runAdd } from "./pipeline/add.js";
import { runBatch } from "./pipeline/batch.js";
import { runRefresh } from "./pipeline/refresh.js";
import { runDocsSync } from "./pipeline/docs.js";
import { runGuide } from "./pipeline/guide.js";
import {
  colorEnabled,
  createColors,
  parseColorChoice,
  type ColorChoice,
} from "./cli/color.js";
import { jsonErr, jsonOk, printJson } from "./cli/json.js";
import { renderGuideIndex, renderGuideTopic } from "./cli/render.js";

const BOOLEAN_FLAGS = new Set([
  "json",
  "help",
  "require-clean",
  "overwrite",
  "dry-run",
  "keep-worktree",
  "skip-parity",
  "skip-visual",
  "skip-build",
  "approved",
  "allow-dirty",
  "fixture",
]);

const GLOBAL_VALUE_FLAGS = new Set(["color"]);

type ParsedArgs = {
  command: string | undefined;
  positionals: string[];
  flags: Map<string, string | boolean>;
  json: boolean;
  color: ColorChoice;
  help: boolean;
};

function asBooleanFlag(flags: Map<string, string | boolean>, key: string): boolean {
  const value = flags.get(key);
  return value === true || value === "true";
}

function parseArgs(argv: string[]): ParsedArgs {
  const flags = new Map<string, string | boolean>();
  const tokens: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i]!;
    if (token === "-h") {
      flags.set("help", true);
      continue;
    }
    if (!token.startsWith("--")) {
      tokens.push(token);
      continue;
    }

    const eq = token.indexOf("=");
    const key = (eq === -1 ? token.slice(2) : token.slice(2, eq)).trim();
    if (!key) continue;

    if (eq !== -1) {
      flags.set(key, token.slice(eq + 1));
      continue;
    }

    if (BOOLEAN_FLAGS.has(key)) {
      flags.set(key, true);
      continue;
    }

    const next = argv[i + 1];
    if (next && !next.startsWith("--") && !next.startsWith("-")) {
      flags.set(key, next);
      i++;
    } else {
      flags.set(key, true);
    }
  }

  // Flags are stripped above, so global `--json` / `--color` before the
  // command still leave tokens as [command, ...positionals].
  const command = tokens[0];
  const positionals = tokens.slice(1);

  let color: ColorChoice = "auto";
  const colorFlag = flags.get("color");
  if (typeof colorFlag === "string") {
    color = parseColorChoice(colorFlag);
  } else if (GLOBAL_VALUE_FLAGS.has("color") && colorFlag === true) {
    throw new GeneratorError(
      "Missing value for --color (always|never|auto)",
      EXIT.invalidRequest,
    );
  }

  return {
    command,
    positionals,
    flags,
    json: asBooleanFlag(flags, "json"),
    color,
    help: asBooleanFlag(flags, "help"),
  };
}

function usage(): string {
  return `Usage:
  pnpm ui guide [topic] [--json] [--color always|never|auto]
  pnpm ui:doctor
  pnpm ui:inspect <component>
  pnpm ui:add <component> [--overwrite] [--dry-run] [--keep-worktree] [--skip-visual] [--skip-parity]
  pnpm ui:add:batch <a|b|c|d> [--overwrite] [--dry-run] [--keep-worktree]
  pnpm ui:docs --component <name> [--fixture]
  pnpm ui:docs --batch <a|b|c|d|all>
  pnpm ui:refresh <component>
  pnpm test:visual:update --component <name>   # requires VISUAL_UPDATE_APPROVED=1

Agent conventions: pnpm ui guide
CLI help:          pnpm ui guide --help
`;
}

function loadCliHelp(packageRoot: string, name: string): string | undefined {
  const filePath = path.join(packageRoot, "docs", "cli", `${name}.md`);
  if (!existsSync(filePath)) return undefined;
  const raw = readFileSync(filePath, "utf8");
  return raw.replace(/^---[\s\S]*?---\r?\n/, "").trim();
}

function printGuideHelp(packageRoot: string): void {
  const help = loadCliHelp(packageRoot, "guide");
  console.log(help ?? usage());
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const packageRoot = process.cwd();
  const { command, positionals, flags, json, color, help } = args;

  if (help && (command === undefined || command === "help")) {
    if (json) {
      printJson(jsonOk("help", { usage: usage() }));
    } else {
      console.log(usage());
    }
    return;
  }

  switch (command) {
    case "guide": {
      if (help) {
        if (json) {
          printJson(
            jsonOk("guide", {
              help: loadCliHelp(packageRoot, "guide") ?? usage(),
            }),
          );
        } else {
          printGuideHelp(packageRoot);
        }
        return;
      }

      const topicId = positionals[0];
      const result = runGuide(packageRoot, topicId);
      if (json) {
        if (result.kind === "index") {
          printJson(jsonOk("guide", result.index));
        } else {
          printJson(
            jsonOk("guide", {
              id: result.topic.id,
              title: result.topic.title,
              summary: result.topic.summary,
              sources: result.topic.sources,
              body: result.topic.body,
              path: result.topic.path,
            }),
          );
        }
        return;
      }

      const colors = createColors(
        colorEnabled({ choice: color, stream: process.stdout }),
      );
      if (result.kind === "index") {
        console.log(renderGuideIndex(result.index, colors));
      } else {
        console.log(renderGuideTopic(result.topic, colors));
      }
      break;
    }
    case "doctor":
      await runDoctor({ requireClean: asBooleanFlag(flags, "require-clean") });
      break;
    case "visual-update":
      await runVisualUpdate({
        component:
          typeof flags.get("component") === "string"
            ? String(flags.get("component"))
            : positionals[0],
        storyId:
          typeof flags.get("story-id") === "string"
            ? String(flags.get("story-id"))
            : undefined,
        approved: asBooleanFlag(flags, "approved"),
        allowDirty: asBooleanFlag(flags, "allow-dirty"),
        skipBuild: asBooleanFlag(flags, "skip-build"),
      });
      break;
    case "inspect":
      await runInspect({
        component: positionals[0],
      });
      break;
    case "add":
      await runAdd({
        component: positionals[0],
        overwrite: asBooleanFlag(flags, "overwrite"),
        dryRun: asBooleanFlag(flags, "dry-run"),
        keepWorktree: asBooleanFlag(flags, "keep-worktree"),
        skipParity: asBooleanFlag(flags, "skip-parity"),
        skipVisual: asBooleanFlag(flags, "skip-visual"),
      });
      break;
    case "add:batch":
    case "batch":
      await runBatch({
        batch: positionals[0],
        dryRun: asBooleanFlag(flags, "dry-run"),
        keepWorktree: asBooleanFlag(flags, "keep-worktree"),
        skipParity: asBooleanFlag(flags, "skip-parity"),
      });
      break;
    case "refresh":
      await runRefresh();
      break;
    case "docs":
      await runDocsSync({
        component:
          typeof flags.get("component") === "string"
            ? String(flags.get("component"))
            : positionals[0],
        batch:
          typeof flags.get("batch") === "string"
            ? String(flags.get("batch"))
            : undefined,
        fixture: asBooleanFlag(flags, "fixture"),
      });
      break;
    case undefined:
    case "help":
      if (json) {
        printJson(jsonOk("help", { usage: usage() }));
      } else {
        console.log(usage());
      }
      break;
    default:
      throw new GeneratorError(
        `Unknown command: ${command}`,
        EXIT.invalidRequest,
      );
  }
}

main().catch((error) => {
  const json = process.argv.includes("--json");
  if (error instanceof GeneratorError) {
    if (json) {
      printJson(
        jsonErr(
          `exit_${error.exitCode}`,
          error.message,
          error.details,
        ),
      );
    } else {
      log.fail(error.message);
      if (error.details) console.error(error.details);
    }
    process.exit(error.exitCode);
  }
  const message = error instanceof Error ? error.message : String(error);
  if (json) {
    printJson(jsonErr("unexpected", message));
  } else {
    log.fail(message);
  }
  process.exit(EXIT.unexpected);
});
