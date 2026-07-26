import { existsSync } from "node:fs";
import type { DocsService } from "../service.js";

export type DoctorIssue = {
  level: "error" | "warning";
  message: string;
};

export function inspectDocsService(service: DocsService): DoctorIssue[] {
  const catalog = service.getCatalog();
  const issues: DoctorIssue[] = [];
  const ids = new Set<string>();
  for (const entry of [...catalog.components, ...catalog.documents]) {
    if (ids.has(entry.id)) {
      issues.push({
        level: "error",
        message: `Duplicate documentation id: ${entry.id}`,
      });
    }
    ids.add(entry.id);
    for (const filePath of entry.sourceFiles) {
      if (!existsSync(filePath)) {
        issues.push({
          level: "error",
          message: `Missing source file for ${entry.id}: ${filePath}`,
        });
      }
    }
  }
  for (const warning of catalog.warnings ?? []) {
    issues.push({ level: "warning", message: warning });
  }
  if (catalog.components.length === 0 && catalog.documents.length === 0) {
    issues.push({
      level: "error",
      message: "The provider returned no components or documents.",
    });
  }
  return issues;
}
