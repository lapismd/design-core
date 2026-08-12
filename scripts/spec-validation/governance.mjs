import path from "node:path";

import {
  diagnostic,
  NORMATIVE_PATTERN,
  REQUIREMENT_REFERENCE_PATTERN,
  withoutFencedCode,
} from "./lib/spec-model.mjs";

export const name = "governance";

function lineForOffset(source, offset) {
  return source.slice(0, offset).split(/\r?\n/).length;
}

function references(context) {
  const extras = ["AGENTS.md", "SPEC_MIGRATION.md", "README.md"]
    .map((relativePath) => ({
      relativePath,
      source: context.readOptional(
        path.join(context.model.repoRoot, relativePath),
      ),
    }))
    .filter((file) => file.source !== null);
  return [...context.model.files, ...extras];
}

export function validate(context) {
  const findings = [];
  for (const parsed of context.model.parsed) {
    for (const row of parsed.malformed)
      findings.push(
        diagnostic({
          code: "SPEC-REQ-HEADING",
          rule: "DC-GOV-001",
          file: parsed.file.relativePath,
          line: row.line,
          message: row.reason,
        }),
      );
  }
  for (const definition of context.model.definitions) {
    if (!definition.statement)
      findings.push(
        diagnostic({
          code: "SPEC-REQ-STATEMENT",
          rule: "DC-GOV-001",
          file: definition.file,
          line: definition.line,
          subject: definition.id,
          message:
            "add one “**Requirement.**” statement before acceptance details",
        }),
      );
    else {
      if (!NORMATIVE_PATTERN.test(definition.statement))
        findings.push(
          diagnostic({
            code: "SPEC-REQ-NORMATIVE",
            rule: "DC-GOV-001",
            file: definition.file,
            line: definition.line,
            subject: definition.id,
            message:
              "requirement statement needs MUST, MUST NOT, SHOULD, SHOULD NOT, or MAY",
          }),
        );
      if (definition.words > 80)
        findings.push(
          diagnostic({
            code: "SPEC-REQ-WORDS",
            rule: "DC-GOV-001",
            file: definition.file,
            line: definition.line,
            subject: definition.id,
            message: `${definition.words} prose words exceed the maximum of 80; split the behavior`,
          }),
        );
      if (definition.sentences > 4)
        findings.push(
          diagnostic({
            code: "SPEC-REQ-SENTENCES",
            rule: "DC-GOV-001",
            file: definition.file,
            line: definition.line,
            subject: definition.id,
            message: `${definition.sentences} sentences exceed the maximum of four; split the behavior`,
          }),
        );
    }
  }
  for (const [id, definitions] of context.model.definitionsById) {
    if (definitions.length === 1) continue;
    for (const definition of definitions)
      findings.push(
        diagnostic({
          code: "SPEC-REQ-DUPLICATE",
          rule: "DC-GOV-001",
          file: definition.file,
          line: definition.line,
          subject: id,
          message: `requirement ID is defined ${definitions.length} times; retain one canonical definition`,
        }),
      );
  }
  for (const section of context.model.acceptanceSections) {
    if (!section.present)
      findings.push(
        diagnostic({
          code: "SPEC-DETAILS-MISSING",
          rule: "DC-GOV-003",
          file: section.file,
          line: section.line,
          subject: section.id,
          message:
            "add an “Acceptance details” subsection with two to four atomic bullets",
        }),
      );
    if (section.nonBullet.length)
      findings.push(
        diagnostic({
          code: "SPEC-DETAILS-FORM",
          rule: "DC-GOV-003",
          file: section.file,
          line: section.line,
          subject: section.id,
          message:
            "acceptance details may contain only atomic bullet statements",
        }),
      );
    if (section.bullets.length < 2 || section.bullets.length > 4)
      findings.push(
        diagnostic({
          code: "SPEC-DETAILS-COUNT",
          rule: "DC-GOV-003",
          file: section.file,
          line: section.line,
          subject: section.id,
          message: `expected two to four acceptance bullets, found ${section.bullets.length}`,
        }),
      );
    for (const bullet of section.bullets) {
      if (bullet.sentences > 1)
        findings.push(
          diagnostic({
            code: "SPEC-DETAILS-ATOMIC",
            rule: "DC-GOV-003",
            file: section.file,
            line: bullet.line,
            subject: section.id,
            message:
              "acceptance bullet contains more than one sentence; split it",
          }),
        );
      if (bullet.words > 80)
        findings.push(
          diagnostic({
            code: "SPEC-DETAILS-WORDS",
            rule: "DC-GOV-003",
            file: section.file,
            line: bullet.line,
            subject: section.id,
            message: `${bullet.words} prose words exceed the maximum of 80`,
          }),
        );
    }
  }
  for (const file of references(context)) {
    const source = withoutFencedCode(file.source);
    for (const match of source.matchAll(REQUIREMENT_REFERENCE_PATTERN)) {
      if (context.model.definitionsById.has(match[0])) continue;
      findings.push(
        diagnostic({
          code: "SPEC-REQ-UNKNOWN",
          rule: "DC-GOV-003",
          file: file.relativePath,
          line: lineForOffset(source, match.index),
          subject: match[0],
          message: "requirement reference has no canonical definition",
        }),
      );
    }
  }
  return findings;
}
