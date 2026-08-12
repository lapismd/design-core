import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { diagnostic } from "./lib/spec-model.mjs";

export const name = "book";

export function validate(context) {
  const findings = [];
  const configPath = path.join(context.model.repoRoot, "spec", "book.toml");
  if (!existsSync(configPath))
    findings.push(
      diagnostic({
        code: "SPEC-BOOK-MISSING",
        rule: "DC-GOV-003",
        file: "spec/book.toml",
        message: "mdBook configuration is missing",
      }),
    );
  else {
    const config = readFileSync(configPath, "utf8");
    if (!/^\s*src\s*=\s*"src"\s*$/m.test(config))
      findings.push(
        diagnostic({
          code: "SPEC-BOOK-CONFIG",
          rule: "DC-GOV-003",
          file: "spec/book.toml",
          message: '[book] src must be "src"',
        }),
      );
    if (!/^\s*build-dir\s*=\s*"book"\s*$/m.test(config))
      findings.push(
        diagnostic({
          code: "SPEC-BOOK-CONFIG",
          rule: "DC-GOV-003",
          file: "spec/book.toml",
          message: 'build-dir must be "book"',
        }),
      );
  }
  const ignorePath = path.join(context.model.repoRoot, ".gitignore");
  const ignore = existsSync(ignorePath) ? readFileSync(ignorePath, "utf8") : "";
  if (!/^\/?spec\/book\/?\s*$/m.test(ignore))
    findings.push(
      diagnostic({
        code: "SPEC-BOOK-IGNORE",
        rule: "DC-GOV-008",
        file: ".gitignore",
        message: "add spec/book/ to .gitignore",
      }),
    );
  for (const tracked of context.trackedFiles) {
    if (tracked === "spec/book" || tracked.startsWith("spec/book/"))
      findings.push(
        diagnostic({
          code: "SPEC-BOOK-TRACKED",
          rule: "DC-GOV-008",
          file: tracked,
          message:
            "generated mdBook output must remain untracked; untrack the path",
        }),
      );
  }
  return findings;
}
