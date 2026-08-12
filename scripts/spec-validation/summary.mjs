import { existsSync } from "node:fs";
import path from "node:path";

import {
  diagnostic,
  localMarkdownTargets,
  toPosix,
} from "./lib/spec-model.mjs";

export const name = "summary";

function withoutFragment(target) {
  return target.split("#", 1)[0];
}

export function validate(context) {
  const findings = [];
  const summary = context.model.files.find(
    (file) => file.chapterPath === "SUMMARY.md",
  );
  if (!summary) {
    return [
      diagnostic({
        code: "SPEC-SUMMARY-MISSING",
        rule: "DC-GOV-003",
        file: "spec/src/SUMMARY.md",
        message: "canonical chapter index is missing; restore SUMMARY.md",
      }),
    ];
  }
  const targets = localMarkdownTargets(summary.source)
    .map(withoutFragment)
    .filter((target) => target.endsWith(".md"))
    .map((target) =>
      toPosix(path.normalize(path.join(path.dirname("SUMMARY.md"), target))),
    );
  const counts = Map.groupBy(targets, (target) => target);
  const chapters = context.model.files
    .map((file) => file.chapterPath)
    .filter((chapter) => chapter !== "SUMMARY.md");
  for (const chapter of chapters) {
    const count = counts.get(chapter)?.length ?? 0;
    if (count !== 1)
      findings.push(
        diagnostic({
          code: "SPEC-SUMMARY-ENTRY",
          rule: "DC-GOV-003",
          file: `spec/src/${chapter}`,
          subject: chapter,
          message: `expected exactly one SUMMARY.md entry, found ${count}`,
        }),
      );
  }
  for (const target of counts.keys()) {
    if (!chapters.includes(target))
      findings.push(
        diagnostic({
          code: "SPEC-SUMMARY-STALE",
          rule: "DC-GOV-003",
          file: "spec/src/SUMMARY.md",
          subject: target,
          message:
            "indexed chapter does not exist; remove or correct the entry",
        }),
      );
  }
  for (const file of context.model.files) {
    const lines = file.source.split(/\r?\n/);
    for (let index = 0; index < lines.length; index += 1) {
      for (const target of localMarkdownTargets(lines[index])) {
        const local = withoutFragment(target);
        if (!local) continue;
        if (existsSync(path.resolve(path.dirname(file.absolutePath), local)))
          continue;
        findings.push(
          diagnostic({
            code: "SPEC-LINK-BROKEN",
            rule: "DC-GOV-003",
            file: file.relativePath,
            line: index + 1,
            subject: target,
            message:
              "local Markdown target does not exist; fix the link or restore the file",
          }),
        );
      }
    }
  }
  return findings;
}
