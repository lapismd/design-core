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
  const entries = [
    ...catalog.components,
    ...catalog.documents,
    ...(catalog.artifacts ?? []),
  ];
  for (const entry of entries) {
    if (ids.has(entry.id)) {
      issues.push({
        level: "error",
        message: `Duplicate documentation id: ${entry.id}`,
      });
    }
    const sectionIds = new Set<string>();
    for (const section of entry.sections ?? []) {
      if (sectionIds.has(section.id)) {
        issues.push({
          level: "error",
          message: `Duplicate section id for ${entry.id}: ${section.id}`,
        });
      }
      sectionIds.add(section.id);
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
  for (const entry of entries) {
    for (const relatedId of entry.relatedIds ?? []) {
      if (!ids.has(relatedId)) {
        issues.push({
          level: "warning",
          message: `Unknown related documentation id for ${entry.id}: ${relatedId}`,
        });
      }
    }
  }
  for (const warning of catalog.warnings ?? []) {
    issues.push({ level: "warning", message: warning });
  }
  if (
    catalog.components.length === 0 &&
    catalog.documents.length === 0 &&
    (catalog.artifacts?.length ?? 0) === 0
  ) {
    issues.push({
      level: "error",
      message: "The provider returned no components or documents.",
    });
  }
  return issues;
}
