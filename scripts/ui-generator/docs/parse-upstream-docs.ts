import type {
  UpstreamDocs,
  UpstreamExample,
  UpstreamUsage,
} from "./types.js";
import { upstreamDocsUrl } from "./fetch-upstream-docs.js";

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** `### [Icon](#icon)` or `### Icon` → display name */
function parseHeadingTitle(line: string): string | null {
  const linked = /^#{2,3}\s+\[([^\]]+)\]\([^)]+\)\s*$/.exec(line.trim());
  if (linked) return linked[1]!.trim();
  const plain = /^#{2,3}\s+(.+?)\s*$/.exec(line.trim());
  if (plain) return plain[1]!.trim();
  return null;
}

function isH2(line: string): boolean {
  return /^##\s+/.test(line.trim());
}

function isH3(line: string): boolean {
  return /^###\s+/.test(line.trim());
}

function extractFencedBlocks(
  section: string,
  lang?: string,
): string[] {
  const blocks: string[] = [];
  const re = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(section))) {
    const fenceLang = (match[1] || "").toLowerCase();
    if (lang && fenceLang !== lang.toLowerCase()) continue;
    blocks.push(match[2]!.replace(/\n$/, ""));
  }
  return blocks;
}

function splitByH2(markdown: string): Array<{ title: string; body: string }> {
  const lines = markdown.split("\n");
  const sections: Array<{ title: string; body: string }> = [];
  let currentTitle = "";
  let currentBody: string[] = [];

  const flush = () => {
    if (!currentTitle && !currentBody.length) return;
    sections.push({
      title: currentTitle,
      body: currentBody.join("\n").trim(),
    });
  };

  for (const line of lines) {
    if (isH2(line)) {
      flush();
      currentTitle = parseHeadingTitle(line) ?? line.replace(/^##\s+/, "").trim();
      currentBody = [];
      continue;
    }
    currentBody.push(line);
  }
  flush();
  return sections;
}

function parseUsage(body: string): UpstreamUsage {
  const svelteBlocks = extractFencedBlocks(body, "svelte");
  let script: string | null = null;
  let markup: string | null = null;
  for (const block of svelteBlocks) {
    if (/^\s*<script\b/m.test(block) && !markup) {
      // Prefer the first script-only or script-leading block as usage script
      if (!script) script = block;
      else if (!markup) markup = block;
    } else if (!markup) {
      markup = block;
    }
  }
  // Usage often has script-only fence then markup-only fence
  if (svelteBlocks.length >= 2 && script && !markup) {
    markup = svelteBlocks[1]!;
  }
  if (svelteBlocks.length === 1 && script?.includes("<InputGroup")) {
    // Combined SFC
    markup = null;
  }
  return { script, markup };
}

function parseExamples(body: string): UpstreamExample[] {
  const lines = body.split("\n");
  const examples: UpstreamExample[] = [];
  let name: string | null = null;
  let chunk: string[] = [];

  const flush = () => {
    if (!name) return;
    const section = chunk.join("\n");
    const fenceIdx = section.search(/```svelte\b/);
    const prose =
      fenceIdx >= 0 ? section.slice(0, fenceIdx) : section;
    const description = prose
      .replace(/\n*View Code\n*/g, "\n")
      .trim();
    const blocks = extractFencedBlocks(section, "svelte");
    const code = blocks[0] ?? "";
    if (code.trim()) {
      examples.push({
        name,
        slug: slugify(name),
        description: description || null,
        code,
      });
    }
    name = null;
    chunk = [];
  };

  for (const line of lines) {
    if (isH3(line)) {
      flush();
      name = parseHeadingTitle(line);
      continue;
    }
    if (!name) continue;
    chunk.push(line);
  }
  flush();
  return examples;
}

/**
 * Parse published shadcn-svelte component LLM markdown into a structured IR.
 */
export function parseUpstreamDocs(
  component: string,
  markdown: string,
): UpstreamDocs {
  const lines = markdown.split("\n");
  const titleLine = lines.find((l) => l.startsWith("# "));
  const title = titleLine?.replace(/^#\s+/, "").trim() || component;

  // Description: first non-empty paragraph after H1, before sponsor/demo noise
  let description = "";
  let seenTitle = false;
  for (const line of lines) {
    if (line.startsWith("# ")) {
      seenTitle = true;
      continue;
    }
    if (!seenTitle) continue;
    if (isH2(line) || isH3(line) || line.trim().startsWith("```")) break;
    if (!line.trim()) {
      if (description) break;
      continue;
    }
    // Skip sponsor link blocks
    if (/^\[/.test(line.trim()) || /Epicenter|Special Sponsor/i.test(line)) {
      continue;
    }
    description += (description ? " " : "") + line.trim();
  }

  const sections = splitByH2(markdown);
  const usageSection = sections.find((s) => /^usage$/i.test(s.title));
  const examplesSection = sections.find((s) => /^examples$/i.test(s.title));

  return {
    component,
    title,
    description:
      description ||
      `shadcn-svelte ${title} examples adapted for the native-CSS catalog.`,
    docsUrl: upstreamDocsUrl(component),
    rawMarkdown: markdown,
    usage: usageSection
      ? parseUsage(usageSection.body)
      : { script: null, markup: null },
    examples: examplesSection ? parseExamples(examplesSection.body) : [],
  };
}
