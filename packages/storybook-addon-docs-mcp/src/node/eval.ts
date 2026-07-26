import { readFileSync } from "node:fs";
import path from "node:path";
import {
  evaluateCatalog,
  type DocsMcpEvalCase,
  type DocsMcpEvalReport,
} from "../evaluation.js";
import type { DocsService } from "../service.js";

export function loadEvalCases(
  root: string,
  filePath: string,
): DocsMcpEvalCase[] {
  const resolved = path.resolve(root, filePath);
  const parsed = JSON.parse(readFileSync(resolved, "utf8")) as
    | DocsMcpEvalCase[]
    | { cases?: DocsMcpEvalCase[] };
  const cases = Array.isArray(parsed) ? parsed : parsed.cases;
  if (!Array.isArray(cases) || cases.length === 0) {
    throw new Error(
      `Evaluation case file must contain a non-empty cases array: ${resolved}`,
    );
  }
  for (const [index, testCase] of cases.entries()) {
    if (
      !testCase ||
      typeof testCase.query !== "string" ||
      !Array.isArray(testCase.expectedIds)
    ) {
      throw new Error(
        `Invalid evaluation case at index ${index} in ${resolved}`,
      );
    }
  }
  return cases;
}

export function runDeterministicEval(options: {
  service: DocsService;
  casesPath: string;
  k?: number;
}): DocsMcpEvalReport {
  return evaluateCatalog(
    options.service.getCatalog(),
    options.service.config,
    loadEvalCases(options.service.root, options.casesPath),
    { k: options.k },
  );
}
