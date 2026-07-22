import type { UpstreamDocs, UpstreamExample, UpstreamUsage } from "./types.js";
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

/** Prefer markdown anchor for stable unique slugs (`### [Link](#link-1)` → `link-1`). */
function parseHeadingSlug(line: string, fallbackName: string): string {
  const linked = /^#{2,3}\s+\[[^\]]+\]\(#([^)]+)\)\s*$/.exec(line.trim());
  if (linked?.[1]) return linked[1].trim();
  return slugify(fallbackName);
}

function isH2(line: string): boolean {
  return /^##\s+/.test(line.trim());
}

function isH3(line: string): boolean {
  return /^###\s+/.test(line.trim());
}

function extractFencedBlocks(section: string, lang?: string): string[] {
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

/**
 * Some upstream example sections ship a truncated markup fence first (e.g.
 * Dropdown Menu → Dialog shows only the trigger), then the full SFC. Prefer a
 * complete `<script>` demo over a shorter stub.
 */
export function pickExampleCode(blocks: string[]): string {
  if (blocks.length === 0) return "";
  if (blocks.length === 1) return blocks[0]!;
  const withScript = blocks.filter((b) => /^\s*<script\b/m.test(b));
  const pool = withScript.length ? withScript : blocks;
  return pool.reduce((best, block) =>
    block.length > best.length ? block : best,
  );
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
      currentTitle =
        parseHeadingTitle(line) ?? line.replace(/^##\s+/, "").trim();
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

const META_H2 =
  /^(installation|usage|examples|changelog|api reference|anatomy|accessibility)$/i;

function isSkippableExampleName(name: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}/.test(name) ||
    /^epicenter$/i.test(name) ||
    /^special sponsor$/i.test(name)
  );
}

/**
 * Upstream LLM pages inject an Epicenter "Special Sponsor" block in the hero
 * (H3 + marketing links) before the first demo fence. That must not become
 * Preview story / MDX prose.
 */
export function stripSponsorCopy(text: string): string {
  const lines = text.split("\n");
  const out: string[] = [];
  let skippingSponsor = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (
      /^#{2,3}\s+(\[)?Epicenter\b/i.test(trimmed) ||
      /^\[Special Sponsor\]/i.test(trimmed)
    ) {
      skippingSponsor = true;
      continue;
    }
    if (skippingSponsor) {
      if (!trimmed) continue;
      if (
        /EpicenterHQ\/epicenter|Special Sponsor|Local-first, open source/i.test(
          trimmed,
        )
      ) {
        continue;
      }
      skippingSponsor = false;
    }
    if (/EpicenterHQ\/epicenter|Special Sponsor/i.test(trimmed)) continue;
    out.push(line);
  }

  return out
    .join("\n")
    .replace(/\n*View Code\n*/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function exampleFromSection(
  name: string,
  slug: string,
  section: string,
): UpstreamExample | null {
  if (isSkippableExampleName(name)) return null;
  const fenceIdx = section.search(/```svelte\b/);
  const prose = fenceIdx >= 0 ? section.slice(0, fenceIdx) : section;
  const description = stripSponsorCopy(prose);
  const blocks = extractFencedBlocks(section, "svelte");
  const code = pickExampleCode(blocks);
  if (!code.trim()) return null;
  return {
    name,
    slug,
    description: description || null,
    code,
  };
}

function parseExamples(body: string): UpstreamExample[] {
  const lines = body.split("\n");
  const examples: UpstreamExample[] = [];
  let name: string | null = null;
  let slug: string | null = null;
  let chunk: string[] = [];

  const flush = () => {
    if (!name || !slug) return;
    const example = exampleFromSection(name, slug, chunk.join("\n"));
    if (example) examples.push(example);
    name = null;
    slug = null;
    chunk = [];
  };

  for (const line of lines) {
    if (isH3(line)) {
      flush();
      name = parseHeadingTitle(line);
      slug = name ? parseHeadingSlug(line, name) : null;
      continue;
    }
    if (!name) continue;
    chunk.push(line);
  }
  flush();
  return examples;
}

/** First svelte fence before Installation — the page hero demo. */
function parseHeroExample(markdown: string): UpstreamExample | null {
  const lines = markdown.split("\n");
  const heroLines: string[] = [];
  let seenTitle = false;
  for (const line of lines) {
    if (line.startsWith("# ")) {
      seenTitle = true;
      continue;
    }
    if (!seenTitle) continue;
    if (isH2(line)) break;
    heroLines.push(line);
  }
  const example = exampleFromSection(
    "Preview",
    "preview",
    heroLines.join("\n"),
  );
  return example;
}

/**
 * Some pages (e.g. Skeleton) put demos in sibling H2 sections instead of
 * under ## Examples.
 */
function parseSiblingH2Examples(
  sections: Array<{ title: string; body: string; rawHeading?: string }>,
): UpstreamExample[] {
  const out: UpstreamExample[] = [];
  for (const section of sections) {
    if (!section.title || META_H2.test(section.title)) continue;
    if (isSkippableExampleName(section.title)) continue;
    const slug = slugify(section.title);
    const example = exampleFromSection(section.title, slug, section.body);
    if (example) out.push(example);
  }
  return out;
}

function mergeExamples(...groups: UpstreamExample[][]): UpstreamExample[] {
  const seen = new Set<string>();
  const out: UpstreamExample[] = [];
  for (const group of groups) {
    for (const example of group) {
      if (seen.has(example.slug)) continue;
      seen.add(example.slug);
      out.push(example);
    }
  }
  return out;
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

  const hero = parseHeroExample(markdown);
  const fromExamples = examplesSection
    ? parseExamples(examplesSection.body)
    : [];
  const fromUsage = usageSection ? parseExamples(usageSection.body) : [];
  const fromSiblingH2 = parseSiblingH2Examples(sections);

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
    examples: mergeExamples(
      hero ? [hero] : [],
      fromExamples,
      fromUsage,
      fromSiblingH2,
    ),
  };
}
