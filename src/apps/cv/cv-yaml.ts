import { parseDocument } from "yaml";
import type { CvSource } from "./types";

export function serializeCvSource(source: CvSource): string {
  return [
    "cv:",
    `  name: ${json(source.cv.name)}`,
    `  headline: ${json(source.cv.headline)}`,
    `  location: ${json(source.cv.location)}`,
    `  email: ${json(source.cv.email)}`,
    `  phone: ${json(source.cv.phone)}`,
    `  website: ${json(source.cv.website ?? "")}`,
    "  social_networks:",
    ...(source.cv.social_networks ?? []).flatMap((item) => [
      `    - network: ${json(item.network)}`,
      `      username: ${json(item.username)}`,
    ]),
    "  target_roles:",
    ...(source.cv.target_roles ?? []).map((role) => `    - ${json(role)}`),
    "  sections:",
    ...source.cv.sections.flatMap((section) => [
      `    - id: ${json(section.id)}`,
      `      title: ${json(section.title)}`,
      `      entry_type: ${json(section.entry_type)}`,
      `      entries: ${json(section.entries)}`,
    ]),
    "",
  ].join("\n");
}

function json(value: unknown) {
  return JSON.stringify(value);
}

export function parseCvYaml(text: string):
  | {
      ok: true;
      value: CvSource;
    }
  | {
      ok: false;
      error: string;
    } {
  try {
    const document = parseDocument(text);
    if (document.errors.length > 0) {
      return {
        ok: false,
        error: document.errors.map((error) => error.message).join("; "),
      };
    }
    const data = document.toJS() as { cv?: CvSource["cv"] } | null;
    if (!data || typeof data !== "object" || !data.cv) {
      return { ok: false, error: "YAML must contain a top-level cv object." };
    }
    const cv = data.cv;
    if (typeof cv.name !== "string" || !Array.isArray(cv.sections)) {
      return {
        ok: false,
        error: "cv.name must be a string and cv.sections must be an array.",
      };
    }
    return {
      ok: true,
      value: {
        cv: {
          name: cv.name,
          headline: String(cv.headline ?? ""),
          location: String(cv.location ?? ""),
          email: String(cv.email ?? ""),
          phone: String(cv.phone ?? ""),
          website: cv.website ? String(cv.website) : "",
          social_networks: Array.isArray(cv.social_networks)
            ? cv.social_networks
            : [],
          target_roles: Array.isArray(cv.target_roles) ? cv.target_roles : [],
          sections: cv.sections,
        },
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Invalid YAML",
    };
  }
}
