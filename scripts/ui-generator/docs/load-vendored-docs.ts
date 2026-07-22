import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { EXIT, GeneratorError } from "../errors.js";
import type { UpstreamDocs, UpstreamExample, UpstreamUsage } from "./types.js";
import {
  readDocsVendorPin,
  vendorDocsRoot,
  type DocsVendorPin,
} from "./vendor-docs.js";

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function humanizePreviewName(previewName: string, component: string): string {
  let rest = previewName;
  if (rest.startsWith("demo-")) {
    rest = rest.slice("demo-".length);
  }
  if (rest.startsWith(`${component}-`)) {
    rest = rest.slice(component.length + 1);
  }
  if (rest.endsWith("-demo")) {
    rest = rest.slice(0, -"-demo".length);
  }
  if (!rest || rest === "demo") return "Preview";
  // Numeric block ids (e.g. sidebar-07 → "07") are hero layouts, not titles.
  if (/^\d+(\.\d+)?$/.test(rest)) return "Preview";
  return rest
    .split("-")
    .filter(Boolean)
    .map((p) => p[0]!.toUpperCase() + p.slice(1))
    .join(" ");
}

function parseFrontmatter(markdown: string): {
  frontmatter: Record<string, string>;
  body: string;
} {
  if (!markdown.startsWith("---\n")) {
    return { frontmatter: {}, body: markdown };
  }
  const end = markdown.indexOf("\n---\n", 4);
  if (end < 0) return { frontmatter: {}, body: markdown };
  const raw = markdown.slice(4, end);
  const body = markdown.slice(end + 5);
  const frontmatter: Record<string, string> = {};
  for (const line of raw.split("\n")) {
    const m = /^([a-zA-Z0-9_-]+):\s*(.*)$/.exec(line.trim());
    if (!m) continue;
    let value = m[2]!.trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    frontmatter[m[1]!] = value;
  }
  return { frontmatter, body };
}

function stripLeadingScript(body: string): string {
  return body.replace(/^\s*<script\b[^>]*>[\s\S]*?<\/script>\s*/i, "").trimStart();
}

/** Remove ComponentPreview blocks (and their placeholder children). */
export function stripComponentPreviews(markdown: string): string {
  return markdown
    .replace(
      /<ComponentPreview\b[^>]*>[\s\S]*?<\/ComponentPreview>/gi,
      "",
    )
    .replace(/<ComponentPreview\b[^>]*\/>/gi, "");
}

/** Remove a paired Svelte tag and its inner content (docs-site chrome). */
function removePairedTag(markdown: string, name: string): string {
  return markdown
    .replace(
      new RegExp(`<${name}\\b[^>]*>[\\s\\S]*?<\\/${name}>`, "gi"),
      "",
    )
    .replace(new RegExp(`<${name}\\b[^>]*\\/>`, "gi"), "");
}

/**
 * Remove opening/closing tags but keep inner markdown.
 * Used for tutorial chrome (`Steps`/`Step`) and callouts whose body is real docs.
 */
function unwrapPairedTag(markdown: string, name: string): string {
  return markdown
    .replace(new RegExp(`<${name}\\b[^>]*>`, "gi"), "")
    .replace(new RegExp(`</${name}>`, "gi"), "")
    .replace(new RegExp(`<${name}\\b[^>]*\\/>`, "gi"), "");
}

/** Apply `transform` only to regions outside fenced code blocks. */
export function mapOutsideFences(
  markdown: string,
  transform: (chunk: string) => string,
): string {
  const parts: string[] = [];
  const re = /(```[^\n]*\n[\s\S]*?```)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(markdown))) {
    if (match.index > last) {
      parts.push(transform(markdown.slice(last, match.index)));
    }
    parts.push(match[1]!);
    last = match.index + match[1]!.length;
  }
  if (last < markdown.length) {
    parts.push(transform(markdown.slice(last)));
  }
  return parts.join("");
}

/** Drop `{#snippet …}` / `{/snippet}` markers; keep the body. */
function unwrapSvelteSnippets(markdown: string): string {
  return markdown
    .replace(/\{#snippet\s+\w+\([^)]*\)\}/g, "")
    .replace(/\{\/snippet\}/g, "");
}

/**
 * Prefer the CLI install tab and rewrite package-manager widgets into fences.
 * Manual tabs are mostly `ComponentSource` chrome we cannot render.
 */
function rewriteInstallChrome(markdown: string): string {
  let md = markdown.replace(
    /<InstallTabs\b[^>]*>([\s\S]*?)<\/InstallTabs>/gi,
    (_m, inner: string) => {
      const cli = /\{#snippet\s+cli\(\)\}([\s\S]*?)\{\/snippet\}/i.exec(inner);
      if (cli) return `\n${cli[1]!.trim()}\n`;
      return `\n${unwrapSvelteSnippets(inner).trim()}\n`;
    },
  );
  md = md.replace(
    /<PMAddComp\b[^>]*\bname=["']([^"']+)["'][^>]*\/>/gi,
    (_m, name: string) => `\n\`\`\`bash\npnpm ui:add ${name}\n\`\`\`\n`,
  );
  md = md.replace(
    /<PMInstall\b[^>]*\bcommand=["']([^"']+)["'][^>]*\/>/gi,
    (_m, command: string) => `\n\`\`\`bash\npnpm add ${command}\n\`\`\`\n`,
  );
  md = removePairedTag(md, "PMAddComp");
  md = removePairedTag(md, "PMInstall");
  md = unwrapPairedTag(md, "InstallTabs");
  return md;
}

/**
 * Drop docs-site-only Svelte chrome from vendored markdown.
 *
 * Preview wrappers (`DocsFigure` / `ComponentSource`) are removed. Install tabs,
 * tutorial wrappers (`Steps` / `Step`), and `Callout` keep their inner markdown;
 * `{#snippet}` markers are unwrapped rather than deleting the body.
 *
 * Destructive Svelte syntax rewrites run only outside fences so example source
 * keeps `{#snippet}` / `{#if}` intact.
 */
export function stripDocsSiteComponents(markdown: string): string {
  let md = rewriteInstallChrome(markdown);
  md = mapOutsideFences(md, (chunk) => {
    let c = chunk;
    for (const name of ["ComponentSource", "DocsFigure"]) {
      c = removePairedTag(c, name);
    }
    for (const name of ["Steps", "Step", "Callout"]) {
      c = unwrapPairedTag(c, name);
    }
    c = unwrapSvelteSnippets(c);
    c = c.replace(/\{#if\s+[^}]+\}[\s\S]*?\{\/if\}/g, "");
    return c;
  });
  return md.replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

function extractFencedBlocks(section: string, lang?: string): string[] {
  const blocks: string[] = [];
  // Allow fence meta (`svelte showLineNumbers title="…"`).
  const re = /```([a-zA-Z0-9_-]*)[^\n]*\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(section))) {
    const fenceLang = (match[1] || "").toLowerCase();
    if (lang && fenceLang !== lang.toLowerCase()) continue;
    blocks.push(match[2]!.replace(/\n$/, ""));
  }
  return blocks;
}

function parseUsage(body: string): UpstreamUsage {
  const svelteBlocks = extractFencedBlocks(body, "svelte");
  let script: string | null = null;
  let markup: string | null = null;
  for (const block of svelteBlocks) {
    if (/^\s*<script\b/m.test(block)) {
      if (!script) script = block;
      else if (!markup) markup = block;
    } else if (!markup) {
      markup = block;
    }
  }
  if (svelteBlocks.length >= 2 && script && !markup) {
    markup = svelteBlocks[1]!;
  }
  return { script, markup };
}

function isH2(line: string): boolean {
  return /^##\s+/.test(line.trim());
}

function isH3(line: string): boolean {
  return /^###\s+/.test(line.trim());
}

function parseHeadingTitle(line: string): string | null {
  const linked = /^#{2,3}\s+\[([^\]]+)\]\([^)]+\)\s*$/.exec(line.trim());
  if (linked) return linked[1]!.trim();
  const plain = /^#{2,3}\s+(.+?)\s*$/.exec(line.trim());
  if (plain) return plain[1]!.trim();
  return null;
}

function parseHeadingSlug(line: string, fallbackName: string): string {
  const linked = /^#{2,3}\s+\[[^\]]+\]\(#([^)]+)\)\s*$/.exec(line.trim());
  if (linked?.[1]) return linked[1].trim();
  return slugify(fallbackName);
}

const PREVIEW_RE =
  /<ComponentPreview\b[^>]*\bname=["']([^"']+)["'][^>]*(?:\/>|>)/gi;

const META_H2 =
  /^(installation|usage|examples|changelog|api reference|anatomy|accessibility|components|structure)$/i;

export type ComponentPreviewRef = {
  name: string;
  /** Character offset of the match in the body (after frontmatter strip). */
  index: number;
  headingName: string | null;
  headingSlug: string | null;
  /** Prose between the heading (or previous preview) and this preview. */
  description: string | null;
  /** Upstream `type="block"` previews live under registry/blocks, not examples. */
  isBlock: boolean;
};

/**
 * Walk content MD and collect ComponentPreview names with nearest H2/H3 context.
 */
export function collectComponentPreviews(body: string): ComponentPreviewRef[] {
  const lines = body.split("\n");
  // Map line start offsets for heading association
  const lineStarts: number[] = [];
  let offset = 0;
  for (const line of lines) {
    lineStarts.push(offset);
    offset += line.length + 1;
  }

  let currentH2Name: string | null = null;
  let currentH2Slug: string | null = null;
  let currentH3Name: string | null = null;
  let currentH3Slug: string | null = null;
  let seenH2 = false;
  const headingByOffset: Array<{
    start: number;
    h2Name: string | null;
    h2Slug: string | null;
    h3Name: string | null;
    h3Slug: string | null;
    seenH2: boolean;
  }> = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const start = lineStarts[i]!;
    if (isH2(line)) {
      seenH2 = true;
      currentH2Name = parseHeadingTitle(line);
      currentH2Slug = currentH2Name
        ? parseHeadingSlug(line, currentH2Name)
        : null;
      currentH3Name = null;
      currentH3Slug = null;
    } else if (isH3(line)) {
      currentH3Name = parseHeadingTitle(line);
      currentH3Slug = currentH3Name
        ? parseHeadingSlug(line, currentH3Name)
        : null;
    }
    headingByOffset.push({
      start,
      h2Name: currentH2Name,
      h2Slug: currentH2Slug,
      h3Name: currentH3Name,
      h3Slug: currentH3Slug,
      seenH2,
    });
  }

  const refs: ComponentPreviewRef[] = [];
  let match: RegExpExecArray | null;
  PREVIEW_RE.lastIndex = 0;
  while ((match = PREVIEW_RE.exec(body))) {
    const index = match.index;
    const tag = match[0]!;
    const isBlock = /\btype=["']block["']/i.test(tag);
    let ctx = headingByOffset[0]!;
    for (const h of headingByOffset) {
      if (h.start <= index) ctx = h;
      else break;
    }
    const isHero = !ctx.seenH2;
    let headingName: string | null = null;
    let headingSlug: string | null = null;
    if (!isHero) {
      if (ctx.h3Name) {
        headingName = ctx.h3Name;
        headingSlug = ctx.h3Slug;
      } else if (ctx.h2Name && !META_H2.test(ctx.h2Name)) {
        headingName = ctx.h2Name;
        headingSlug = ctx.h2Slug;
      }
    }

    // Description: prose after the nearest preceding H2/H3 until this preview.
    // Do not span across section boundaries (e.g. hero → Installation → Examples).
    let descStart = 0;
    for (let i = 0; i < lines.length; i++) {
      const start = lineStarts[i]!;
      if (start >= index) break;
      if (isH2(lines[i]!) || isH3(lines[i]!)) {
        descStart = start + lines[i]!.length + 1;
      }
    }
    const prev = refs[refs.length - 1];
    if (prev && prev.index >= descStart && prev.index < index) {
      descStart = prev.index + 1;
    }
    let prose = body.slice(descStart, index);
    prose = stripComponentPreviews(prose)
      .replace(/\{#snippet\s+\w+\([^)]*\)\}/g, "")
      .replace(/\{\/snippet\}/g, "")
      .replace(/\{#if\s+[^}]+\}[\s\S]*?\{\/if\}/g, "")
      .replace(/```[\s\S]*?```/g, "")
      // Keep `` `<DropdownMenu>` `` as `DropdownMenu` before HTML tag stripping.
      .replace(/`<([A-Za-z][\w.]*)>`/g, "`$1`")
      .replace(/<[^>]+>/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    refs.push({
      name: match[1]!,
      index,
      headingName,
      headingSlug,
      description: prose || null,
      isBlock,
    });
  }
  return refs;
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

function contentGithubUrl(pin: DocsVendorPin, component: string): string {
  return `${pin.repo}/blob/${pin.commit}/docs/content/components/${component}.md`;
}

function sha256(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

export type LoadVendoredDocsResult = {
  docs: UpstreamDocs;
  pin: DocsVendorPin;
  /** Hash over content MD + included example/block SFC bodies. */
  contentSha256: string;
  /**
   * Previews that could not be loaded as a single SFC (e.g. multi-file
   * `blocks/sidebar-07/` trees). Single-file blocks are included in `docs.examples`.
   */
  skippedBlocks: string[];
};

/**
 * Resolve a ComponentPreview to a runnable SFC path under the vendor tree.
 * Prefers `examples/<name>.svelte`, then `blocks/<name>.svelte`.
 * Multi-file block dirs (`blocks/<name>/+page.svelte`) are not flattened yet.
 */
export function resolvePreviewSourcePath(
  vendorRoot: string,
  previewName: string,
  isBlock: boolean,
): { path: string; kind: "example" | "block" } | { skip: "multi-file-block" } {
  const examplePath = path.join(
    vendorRoot,
    "examples",
    `${previewName}.svelte`,
  );
  const blockFile = path.join(vendorRoot, "blocks", `${previewName}.svelte`);
  const blockPage = path.join(
    vendorRoot,
    "blocks",
    previewName,
    "+page.svelte",
  );

  if (!isBlock && existsSync(examplePath)) {
    return { path: examplePath, kind: "example" };
  }
  if (existsSync(blockFile)) {
    return { path: blockFile, kind: "block" };
  }
  if (existsSync(blockPage)) {
    return { skip: "multi-file-block" };
  }
  if (existsSync(examplePath)) {
    return { path: examplePath, kind: "example" };
  }
  throw new GeneratorError(
    `Missing ${isBlock ? "block" : "example"} SFC for ComponentPreview "${previewName}"`,
    EXIT.intake,
    isBlock ? blockFile : examplePath,
  );
}

/**
 * Load UpstreamDocs IR from the vendored shadcn-svelte docs tree.
 * Examples come from `<ComponentPreview name>` → `examples/<name>.svelte`
 * or `blocks/<name>.svelte` when `type="block"`.
 */
export function loadVendoredDocs(args: {
  packageRoot: string;
  component: string;
  /** Override vendor root (tests). */
  vendorRoot?: string;
}): LoadVendoredDocsResult {
  const { packageRoot, component } = args;
  const root = args.vendorRoot ?? vendorDocsRoot(packageRoot);
  const pin = args.vendorRoot
    ? ({
        repo: "fixture",
        ref: "fixture",
        commit: "fixture",
        fetchedAt: new Date().toISOString(),
        paths: [],
      } satisfies DocsVendorPin)
    : readDocsVendorPin(packageRoot);

  const contentPath = path.join(root, "content", "components", `${component}.md`);
  if (!existsSync(contentPath)) {
    throw new GeneratorError(
      `Vendored content missing for ${component}`,
      EXIT.intake,
      contentPath,
    );
  }

  const rawFile = readFileSync(contentPath, "utf8");
  const { frontmatter, body: afterFm } = parseFrontmatter(rawFile);
  const body = stripLeadingScript(afterFm);
  const previews = collectComponentPreviews(body);

  const examples: UpstreamExample[] = [];
  const exampleBodies: string[] = [];
  const usedSlugs = new Set<string>();
  const skippedBlocks: string[] = [];

  for (const preview of previews) {
    const resolved = resolvePreviewSourcePath(
      root,
      preview.name,
      preview.isBlock,
    );
    if ("skip" in resolved) {
      skippedBlocks.push(preview.name);
      continue;
    }
    const code = readFileSync(resolved.path, "utf8");
    exampleBodies.push(code);

    const name =
      preview.headingName ?? humanizePreviewName(preview.name, component);
    let slug = preview.headingSlug ?? slugify(name);
    if (name === "Preview") slug = "preview";
    // Keep slugs unique if two previews share a heading (unlikely).
    let unique = slug;
    let n = 2;
    while (usedSlugs.has(unique)) {
      unique = `${slug}-${n++}`;
    }
    usedSlugs.add(unique);

    examples.push({
      name,
      slug: unique,
      description: preview.description,
      code,
      previewName: preview.name,
    });
  }

  const cleanedBody = stripDocsSiteComponents(stripComponentPreviews(body));
  const title = frontmatter.title?.trim() || component;
  const description =
    frontmatter.description?.trim() ||
    `shadcn-svelte ${title} examples adapted for the native-CSS catalog.`;

  const normalizedMarkdown = `# ${title}\n\n${description}\n\n${cleanedBody}`.replace(
    /\n{3,}/g,
    "\n\n",
  );

  const sections = splitByH2(normalizedMarkdown);
  const usageSection = sections.find((s) => /^usage$/i.test(s.title));

  const docsUrl =
    pin.repo === "fixture"
      ? `fixture:content/components/${component}.md`
      : contentGithubUrl(pin, component);

  const docs: UpstreamDocs = {
    component,
    title,
    description,
    docsUrl,
    rawMarkdown: normalizedMarkdown,
    usage: usageSection
      ? parseUsage(usageSection.body)
      : { script: null, markup: null },
    examples,
  };

  return {
    docs,
    pin,
    contentSha256: sha256(rawFile + "\n" + exampleBodies.join("\n")),
    skippedBlocks,
  };
}
