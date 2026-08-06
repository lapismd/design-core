import { readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { EXIT, GeneratorError } from "../errors.js";

export type GuideTopicMeta = {
  id: string;
  title: string;
  summary: string;
  sources: string[];
};

export type GuideTopic = GuideTopicMeta & {
  body: string;
  path: string;
};

export type GuideIndex = {
  title: string;
  summary: string;
  readingOrder: string[];
  topics: GuideTopicMeta[];
  related: string[];
};

const TOPIC_ORDER = [
  "layers",
  "shadcn",
  "forms",
  "shell",
  "testing",
  "vcs",
] as const;

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;

export function resolveDocsRoot(packageRoot: string): string {
  return path.join(packageRoot, "docs");
}

export function resolveAgentDocsRoot(packageRoot: string): string {
  return path.join(resolveDocsRoot(packageRoot), "agent");
}

function parseFrontmatter(raw: string): {
  meta: Record<string, string | string[]>;
  body: string;
} {
  const match = FRONTMATTER_RE.exec(raw);
  if (!match) return { meta: {}, body: raw.trim() };

  const meta: Record<string, string | string[]> = {};
  for (const line of match[1]!.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const colon = trimmed.indexOf(":");
    if (colon === -1) continue;
    const key = trimmed.slice(0, colon).trim();
    let value = trimmed.slice(colon + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key === "sources") {
      // Inline YAML list: [a, b] or leave for following - items (not used)
      if (value.startsWith("[") && value.endsWith("]")) {
        meta[key] = value
          .slice(1, -1)
          .split(",")
          .map((part) => part.trim().replace(/^["']|["']$/g, ""))
          .filter(Boolean);
      } else if (value) {
        meta[key] = [value];
      } else {
        meta[key] = [];
      }
    } else {
      meta[key] = value;
    }
  }

  // Collect multiline sources: - item under sources:
  const sourceLines: string[] = [];
  let inSources = false;
  for (const line of match[1]!.split(/\r?\n/)) {
    if (
      /^sources:\s*$/.test(line.trim()) ||
      /^sources:\s*\[/.test(line.trim())
    ) {
      inSources = true;
      continue;
    }
    if (inSources) {
      const item = /^\s*-\s+(.+)$/.exec(line);
      if (item) {
        sourceLines.push(item[1]!.trim().replace(/^["']|["']$/g, ""));
        continue;
      }
      if (/^\S/.test(line) && !line.trim().startsWith("-")) {
        inSources = false;
      }
    }
  }
  if (sourceLines.length > 0) meta.sources = sourceLines;

  return { meta, body: match[2]!.trim() };
}

function loadTopicFile(filePath: string, id: string): GuideTopic {
  const raw = readFileSync(filePath, "utf8");
  const { meta, body } = parseFrontmatter(raw);
  const sources = Array.isArray(meta.sources)
    ? meta.sources
    : typeof meta.sources === "string"
      ? [meta.sources]
      : [];

  return {
    id: typeof meta.id === "string" && meta.id ? meta.id : id,
    title:
      typeof meta.title === "string" && meta.title
        ? meta.title
        : id.charAt(0).toUpperCase() + id.slice(1),
    summary:
      typeof meta.summary === "string" ? meta.summary : "Agent guidance topic",
    sources,
    body,
    path: filePath,
  };
}

export function listGuideTopics(packageRoot: string): GuideTopicMeta[] {
  const root = resolveAgentDocsRoot(packageRoot);
  if (!existsSync(root)) {
    throw new GeneratorError(
      `Agent docs not found at ${root}`,
      EXIT.invalidRequest,
    );
  }

  const files = readdirSync(root)
    .filter((name) => name.endsWith(".md") && name !== "README.md")
    .map((name) => name.replace(/\.md$/, ""));

  const ordered = [
    ...TOPIC_ORDER.filter((id) => files.includes(id)),
    ...files
      .filter((id) => !(TOPIC_ORDER as readonly string[]).includes(id))
      .sort(),
  ];

  return ordered.map((id) => {
    const topic = loadTopicFile(path.join(root, `${id}.md`), id);
    return {
      id: topic.id,
      title: topic.title,
      summary: topic.summary,
      sources: topic.sources,
    };
  });
}

export function getGuideTopic(
  packageRoot: string,
  topicId: string,
): GuideTopic {
  const root = resolveAgentDocsRoot(packageRoot);
  const filePath = path.join(root, `${topicId}.md`);
  if (!existsSync(filePath)) {
    const available = listGuideTopics(packageRoot)
      .map((t) => t.id)
      .join(", ");
    throw new GeneratorError(
      `Unknown guide topic "${topicId}". Available: ${available || "(none)"}`,
      EXIT.invalidRequest,
    );
  }
  return loadTopicFile(filePath, topicId);
}

export function getGuideIndex(packageRoot: string): GuideIndex {
  const topics = listGuideTopics(packageRoot);
  return {
    title: "@lapismd/design-core agent guide",
    summary:
      "Offline conventions for agents and humans. Prefer these topics before inventing workflows. When Storybook is running, use the Storybook MCP for interactive catalog work.",
    readingOrder: [
      "pnpm ui guide layers — choose shadcn vs forms vs filter vs AI",
      "pnpm ui guide shadcn — add/convert components via ui:add (never raw shadcn CLI)",
      "pnpm ui guide forms — structured forms vs shadcn controls",
      "pnpm ui guide shell — canonical AppShell topology, toggles, headers, and collapsed rails",
      "pnpm ui guide testing — stories, checks, and visual baselines after a change",
      "pnpm ui guide vcs — commit after each verified change (prefer jj when available)",
    ],
    topics,
    related: [
      "AGENTS.md — primary agent contract (Storybook + visuals)",
      "pnpm ui components — list/show local usage across shadcn/forms/filter/AI",
      "Storybook MCP — get-storybook-story-instructions / preview-stories / run-story-tests",
      "UI Forms/Guidance, Shadcn/Guidance, and Shell/Guidance — in-catalog decision pages",
      "docs/agent/llms-extraction.md — deferred catalog extraction notes",
    ],
  };
}

export type GuideResult =
  | { kind: "index"; index: GuideIndex }
  | { kind: "topic"; topic: GuideTopic };

export function runGuide(packageRoot: string, topicId?: string): GuideResult {
  if (!topicId) {
    return { kind: "index", index: getGuideIndex(packageRoot) };
  }
  return { kind: "topic", topic: getGuideTopic(packageRoot, topicId) };
}
