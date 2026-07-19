#!/usr/bin/env node
import { EXIT, GeneratorError } from "./errors.js";
import { log } from "./logger.js";
import { runDoctor } from "./pipeline/doctor.js";
import { runVisualUpdate } from "./pipeline/visual-update.js";
import { runInspect } from "./pipeline/inspect.js";
import { runAdd } from "./pipeline/add.js";
import { runRefresh } from "./pipeline/refresh.js";

function parseArgs(argv: string[]) {
  const [command, ...rest] = argv;
  const flags = new Map<string, string | boolean>();
  const positionals: string[] = [];
  for (let i = 0; i < rest.length; i++) {
    const token = rest[i]!;
    if (token.startsWith("--")) {
      const key = token.slice(2);
      const next = rest[i + 1];
      if (next && !next.startsWith("--")) {
        flags.set(key, next);
        i++;
      } else {
        flags.set(key, true);
      }
    } else {
      positionals.push(token);
    }
  }
  return { command, positionals, flags };
}

async function main() {
  const { command, positionals, flags } = parseArgs(process.argv.slice(2));

  switch (command) {
    case "doctor":
      await runDoctor({ requireClean: Boolean(flags.get("require-clean")) });
      break;
    case "visual-update":
      await runVisualUpdate({
        component:
          typeof flags.get("component") === "string"
            ? String(flags.get("component"))
            : positionals[0],
        approved: Boolean(flags.get("approved")),
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
        overwrite: Boolean(flags.get("overwrite")),
        dryRun: Boolean(flags.get("dry-run")),
        keepWorktree: Boolean(flags.get("keep-worktree")),
        skipParity: Boolean(flags.get("skip-parity")),
      });
      break;
    case "refresh":
      await runRefresh();
      break;
    case undefined:
    case "help":
    case "--help":
      console.log(`Usage:
  pnpm ui:doctor
  pnpm ui:inspect <component>
  pnpm ui:add <component> [--overwrite] [--dry-run] [--keep-worktree]
  pnpm ui:refresh <component>
  pnpm test:visual:update --component <name>   # requires VISUAL_UPDATE_APPROVED=1
`);
      break;
    default:
      throw new GeneratorError(
        `Unknown command: ${command}`,
        EXIT.invalidRequest,
      );
  }
}

main().catch((error) => {
  if (error instanceof GeneratorError) {
    log.fail(error.message);
    if (error.details) console.error(error.details);
    process.exit(error.exitCode);
  }
  log.fail(error instanceof Error ? error.message : String(error));
  process.exit(EXIT.unexpected);
});
