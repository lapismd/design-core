import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { UiGeneratorConfig } from "../config.js";

export type RunContext = {
  runId: string;
  reportDir: string;
  startedAt: string;
  command: string;
  component?: string;
};

export function createRunContext(
  config: UiGeneratorConfig,
  command: string,
  component?: string,
): RunContext {
  const startedAt = new Date().toISOString();
  const stamp = startedAt.replace(/[:.]/g, "-");
  const runId = `${stamp}${component ? `-${component}` : ""}`;
  const reportDir = path.join(config.packageRoot, config.reportsRoot, runId);
  mkdirSync(reportDir, { recursive: true });
  mkdirSync(path.join(reportDir, "logs"), { recursive: true });
  mkdirSync(path.join(reportDir, "visual", "reference"), { recursive: true });
  mkdirSync(path.join(reportDir, "visual", "candidate"), { recursive: true });
  mkdirSync(path.join(reportDir, "visual", "diff"), { recursive: true });
  return { runId, reportDir, startedAt, command, component };
}

export function writeJson(filePath: string, data: unknown) {
  writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

export function writeReportMarkdown(
  reportDir: string,
  title: string,
  sections: Array<{ heading: string; body: string }>,
) {
  const lines = [`# ${title}`, ""];
  for (const section of sections) {
    lines.push(`## ${section.heading}`, "", section.body, "");
  }
  writeFileSync(path.join(reportDir, "report.md"), `${lines.join("\n")}\n`);
}
