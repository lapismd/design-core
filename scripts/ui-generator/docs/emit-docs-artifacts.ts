import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { rewritePackageImports } from "./rewrite-example.js";
import type { UpstreamDocs } from "./types.js";
import type { RewrittenExample } from "./types.js";

function toPascalCase(kebab: string): string {
  return kebab
    .split("-")
    .map((p) => p[0]!.toUpperCase() + p.slice(1))
    .join("");
}

/** defineMeta `component` export — some families lack a Pascal alias / Root. */
function storyMetaComponentExpr(component: string, pascal: string): string {
  if (component === "resizable") return `${pascal}.PaneGroup`;
  if (component === "sidebar") return `${pascal}.Provider`;
  return `${pascal}.${pascal}`;
}

/**
 * Drop sponsor chrome and leading hero demo fences; keep intro prose.
 *
 * Previously this jumped from the first description paragraph straight to
 * `## Installation` / `## Usage`, which deleted real hero guidance (e.g.
 * Sidebar’s “Sidebars are one of the most complex…” copy).
 */
export function stripSponsorAndHero(markdown: string): string {
  const lines = markdown.split("\n");
  const out: string[] = [];
  let beforeFirstH2 = true;
  let inFence = false;
  let skippingSponsor = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      inFence = !inFence;
      // Hero demos before the first H2 are replaced by Storybook canvases.
      if (beforeFirstH2) continue;
      out.push(line);
      continue;
    }
    if (inFence) {
      if (!beforeFirstH2) out.push(line);
      continue;
    }

    if (/^##\s+/.test(trimmed)) {
      beforeFirstH2 = false;
      skippingSponsor = false;
      out.push(line);
      continue;
    }

    if (
      /Epicenter|Special Sponsor/i.test(trimmed) ||
      /^###?\s*\[Epicenter\]/i.test(trimmed)
    ) {
      skippingSponsor = true;
      continue;
    }
    // Keep skipping until the next H2 resets the flag above.
    if (skippingSponsor) continue;

    out.push(line);
  }

  return (
    out
      .join("\n")
      .replace(/\n*View Code\n*/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim() + "\n"
  );
}

/**
 * Strip example ```svelte fences (and optional View Code noise) so MDX can
 * render live Canvas blocks instead of static code.
 */
function stripExampleCodeFences(markdown: string): string {
  const examplesIdx = markdown.search(/^##\s+(\[)?Examples\b/im);
  if (examplesIdx < 0) return markdown;

  const before = markdown.slice(0, examplesIdx);
  let examples = markdown.slice(examplesIdx);
  examples = examples.replace(/```svelte\n[\s\S]*?```/g, "");
  examples = examples.replace(/\n*View Code\n*/g, "\n");
  examples = examples.replace(/\n{3,}/g, "\n\n");
  return (before + examples).trim() + "\n";
}

/** Drop leaked docs-site chrome from example prose before MDX emit. */
function sanitizeExampleProse(prose: string): string {
  let out = prose
    .replace(/\{#snippet\s+\w+\([^)]*\)\}/g, "")
    .replace(/\{\/snippet\}/g, "")
    .replace(/\{#if\s+[^}]+\}[\s\S]*?\{\/if\}/g, "");
  // Truncate at an embedded Installation (or other H2) if present
  const lines = out.split("\n");
  const kept: string[] = [];
  for (const line of lines) {
    if (/^##\s+(\[)?(Installation|Usage|Examples)\b/i.test(line.trim())) break;
    kept.push(line);
  }
  return kept
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function rewriteDocsMarkdown(
  docs: UpstreamDocs,
  component: string,
  examples: RewrittenExample[] = [],
): string {
  let md = rewritePackageImports(
    stripExampleCodeFences(stripSponsorAndHero(docs.rawMarkdown)),
    component,
  );
  md = expandSectionExampleSources(md, examples, component);
  md = alignComponentThemeDocs(md, component);
  md = normalizeDocsFenceLanguages(md);
  const banner = `<!-- Adapted from ${docs.docsUrl} for the @stevejuma/ui native-CSS catalog. -->\n\n`;
  return banner + md;
}

/**
 * Storybook's Markdown → SyntaxHighlighter only knows a fixed Prism set
 * (no `svelte`). Strip fence meta (`showLineNumbers title=…`) and map langs
 * so script/SFC blocks highlight instead of rendering as plain text.
 */
export function normalizeDocsFenceLanguages(markdown: string): string {
  return markdown.replace(/^```([^\n`]*)/gm, (_m, info: string) => {
    const raw = String(info).trim();
    if (!raw) return "```";
    const lang = raw.split(/\s+/)[0]!.toLowerCase();
    const mapped =
      lang === "svelte" || lang === "sv"
        ? "html"
        : lang === "ts" || lang === "typescript"
          ? "typescript"
          : lang === "js" || lang === "javascript"
            ? "jsx"
            : lang === "sh" || lang === "shell" || lang === "zsh"
              ? "bash"
              : lang;
    return `\`\`\`${mapped}`;
  });
}

/**
 * Replace upstream Installation/Theming color fences with this package's
 * `theme.css` values so docs match the tokens the sidebar CSS actually reads.
 */
export function alignComponentThemeDocs(
  markdown: string,
  component: string,
): string {
  if (component !== "sidebar") return markdown;
  const themePath = path.resolve(process.cwd(), "src/theme.css");
  if (!existsSync(themePath)) return markdown;
  const themeCss = readFileSync(themePath, "utf8");
  const snippet = extractThemeCustomProperties(themeCss, "--sidebar");
  if (!snippet) return markdown;

  return markdown.replace(
    /```css[^\n]*\n([\s\S]*?)```/g,
    (full, body: string) => {
      if (!/--sidebar\s*:/.test(body)) return full;
      // Keep width-only / non-theme fences alone.
      if (!/--sidebar-foreground\s*:/.test(body)) return full;
      return `\`\`\`css\n${snippet}\n\`\`\``;
    },
  );
}

/** Pull `:root` + `.dark` declarations whose names start with `prefix`. */
export function extractThemeCustomProperties(
  themeCss: string,
  prefix: string,
): string | null {
  const blocks: string[] = [];
  for (const selector of [":root", ".dark"]) {
    const re = new RegExp(
      `${selector.replace(".", "\\.")}\\s*\\{([\\s\\S]*?)\\n\\}`,
      "m",
    );
    const m = re.exec(themeCss);
    if (!m) continue;
    const decls = m[1]!
      .split("\n")
      .map((l) => l.trimEnd())
      .filter((l) => {
        const t = l.trim();
        return t.startsWith(prefix);
      });
    if (decls.length === 0) continue;
    blocks.push(`${selector} {\n${decls.join("\n")}\n}`);
  }
  return blocks.length > 0 ? blocks.join("\n\n") : null;
}

/**
 * Upstream docs often show abbreviated fences (`<Sidebar.Header />`, markup
 * without `<script>`, etc.). When we have a runnable example for that section,
 * prefer the full consumer-facing SFC.
 */
export function expandSectionExampleSources(
  markdown: string,
  examples: RewrittenExample[],
  component: string,
): string {
  if (examples.length === 0) return markdown;

  const byName = new Map(
    examples.map((ex) => [
      ex.example.name.toLowerCase(),
      buildExampleDocsSource(component, ex.code),
    ]),
  );

  const lines = markdown.split("\n");
  const sections: Array<{ start: number; end: number; title: string | null }> =
    [];
  let current = { start: 0, end: 0, title: null as string | null };

  for (let i = 0; i < lines.length; i++) {
    const heading = /^(#{1,3})\s+(?:\[)?([^\]\n#(]+)/.exec(lines[i]!);
    if (heading && heading[1]!.length >= 2) {
      current.end = i;
      sections.push(current);
      current = {
        start: i,
        end: lines.length,
        title: heading[2]!.trim(),
      };
    }
  }
  current.end = lines.length;
  sections.push(current);

  const out = [...lines];
  // Process bottom-up so line splices don't shift earlier sections.
  for (let s = sections.length - 1; s >= 0; s--) {
    const section = sections[s]!;
    if (!section.title) continue;
    const full = byName.get(section.title.toLowerCase());
    if (!full) continue;

    const body = out.slice(section.start + 1, section.end).join("\n");
    const fenceRe = /```(svelte[^\n]*)\n([\s\S]*?)```/g;
    const fences: Array<{
      start: number;
      end: number;
      info: string;
      code: string;
    }> = [];
    let m: RegExpExecArray | null;
    while ((m = fenceRe.exec(body))) {
      fences.push({
        start: m.index,
        end: m.index + m[0].length,
        info: m[1]!,
        code: m[2]!,
      });
    }

    let nextBody = body;
    if (fences.length === 0) {
      nextBody = `${body.trimEnd()}\n\n\`\`\`svelte\n${full}\n\`\`\`\n`;
    } else {
      for (let i = fences.length - 1; i >= 0; i--) {
        const fence = fences[i]!;
        if (!shouldReplaceFenceWithFullExample(fence.code, full)) continue;
        nextBody =
          nextBody.slice(0, fence.start) +
          `\`\`\`${fence.info}\n${full}\n\`\`\`` +
          nextBody.slice(fence.end);
      }
    }

    const headingLine = out[section.start]!;
    const replacement = [headingLine, ...nextBody.split("\n")];
    out.splice(section.start, section.end - section.start, ...replacement);
  }

  return out.join("\n");
}

/** True when a fence is a stub / partial demo rather than the full example. */
export function shouldReplaceFenceWithFullExample(
  fenceCode: string,
  fullExample: string,
): boolean {
  const fence = fenceCode.trim();
  const full = fullExample.trim();
  if (!fence) return true;
  // Tiny API one-liners (e.g. `<Sidebar.Root collapsible="…" />`) stay as-is.
  const nonEmptyLines = fence.split("\n").filter((l) => l.trim()).length;
  if (nonEmptyLines <= 2) return false;
  // Markup-only demos should expand even when they're nearly as long as the
  // full SFC (common for upstream fences that omit `<script>` imports).
  if (!/<script\b/i.test(fence)) return true;
  if (fence.length >= full.length * 0.85) return false;
  // Script present but still mostly placeholder self-closing hosts.
  const selfClosing = (fence.match(/<[A-Za-z][\w.]*[^>]*\/>/g) || []).length;
  if (selfClosing >= 1 && fence.length < full.length * 0.6) return true;
  return fence.length < full.length * 0.5;
}

/** Combined Usage SFC with published package import paths. */
function buildPackageUsageSource(
  docs: UpstreamDocs,
  component: string,
): string {
  const script = docs.usage.script
    ? rewritePackageImports(docs.usage.script, component).trim()
    : "";
  const markup = docs.usage.markup
    ? rewritePackageImports(docs.usage.markup, component).trim()
    : "";
  if (script && markup) return `${script}\n\n${markup}`;
  return script || markup;
}

/** Family-root relative imports → examples/ subdirectory relative imports. */
function adjustImportsForExamplesDir(code: string): string {
  return code
    .replaceAll('from "./index.js"', 'from "../index.js"')
    .replace(
      /from\s+["']\.\.\/([a-z][a-z0-9-]*)\/index\.js["']/g,
      (_m, family: string) => `from "../../${family}/index.js"`,
    );
}

function ensureTooltipProvider(code: string): string {
  if (!/\bTooltip\.Root\b/.test(code)) return code;
  if (/\bTooltip\.Provider\b/.test(code)) return code;
  const scriptMatch = /^([\s\S]*?<\/script>\s*)([\s\S]*)$/m.exec(code);
  if (!scriptMatch) return code;
  const [, script, markup] = scriptMatch;
  return `${script}<Tooltip.Provider delayDuration={0}>\n${markup.trim()}\n</Tooltip.Provider>\n`;
}

function emitExampleComponent(code: string): string {
  const adjusted = ensureTooltipProvider(
    adjustImportsForExamplesDir(code),
  ).trim();
  // Prefer a JS banner inside <script> — leading HTML comments are scraped into
  // Storybook autodocs story descriptions.
  if (adjusted.startsWith("<script")) {
    return (
      adjusted.replace(
        /(<script\b[^>]*>)/,
        "$1\n  // @generated by ui-generator — do not edit\n",
      ) + "\n"
    );
  }
  return `${adjusted}\n`;
}

/** Consumer-facing SFC source for Canvas "Show code" (not the Story wrapper). */
function buildExampleDocsSource(component: string, code: string): string {
  return rewritePackageImports(
    ensureTooltipProvider(code.trim()),
    component,
  ).trim();
}

/**
 * Keep example SFCs out of Story `parameters={{...}}` literals — `{#each}` / `{tag}`
 * inside those strings breaks the Svelte / svelte-csf indexer.
 */
function emitExampleSourcesModule(args: {
  component: string;
  examples: RewrittenExample[];
}): string {
  const entries = args.examples
    .map((ex) => {
      const exportName = toPascalCase(ex.example.slug);
      const source = buildExampleDocsSource(args.component, ex.code);
      return `export const ${exportName} = ${JSON.stringify(source)};`;
    })
    .join("\n");
  return `// @generated by ui-generator — do not edit
${entries}
`;
}

function emitExamplesStories(args: {
  component: string;
  storyTitle: string;
  examples: RewrittenExample[];
}): string {
  const { storyTitle, examples } = args;
  const pascal = toPascalCase(args.component);
  const imports = examples
    .map(
      (ex) =>
        `  import ${toPascalCase(ex.example.slug)}Example from "./examples/${ex.example.slug}.svelte";`,
    )
    .join("\n");

  // Sidebar demos need a tall host: Provider is height:100%, so plain p-4 collapses them.
  const wrapperClass = args.component === "sidebar" ? "h-[480px] p-0" : "p-4";
  // Closed overlay triggers are not useful visual subjects. Open-state coverage
  // lives in hand-written `${pascal}.stories.svelte` (survives ui:docs regen).
  const overlaySkipVisualExamples = new Set([
    "alert-dialog",
    "dialog",
    "dropdown-menu",
    "popover",
    "sheet",
    "tooltip",
  ]);
  const exampleTags = overlaySkipVisualExamples.has(args.component)
    ? '["upstream-example", "skip-visual"]'
    : '["upstream-example"]';

  const stories = examples
    .map((ex) => {
      const comp = `${toPascalCase(ex.example.slug)}Example`;
      const exportName = toPascalCase(ex.example.slug);
      const storyDescription = ex.example.description
        ? sanitizeExampleProse(ex.example.description)
        : "";
      const descriptionEntry = storyDescription
        ? `
      description: {
        story: ${JSON.stringify(storyDescription)},
      },`
        : "";
      // Visual baselines cover these demos so style extraction regressions surface
      // in Playwright. a11y stays todo — curated hand stories own a11y gates.
      // Explicit exportName keeps MDX <Canvas of={...}> references stable.
      // docs.source comes from *.example-sources.ts (avoids embedding Svelte markup
      // in this file's mustache expressions).
      return `<Story
  name=${JSON.stringify(ex.example.name)}
  exportName=${JSON.stringify(exportName)}
  tags={${exampleTags}}
  parameters={{
    a11y: { test: "todo" },
    docs: {${descriptionEntry}
      source: {
        code: exampleSources.${exportName},
        language: "html",
        type: "code",
      },
    },
  }}
>
  {#snippet template()}
    <div class="${wrapperClass}">
      <${comp} />
    </div>
  {/snippet}
</Story>`;
    })
    .join("\n\n");

  return `<script module lang="ts">
  // @generated by ui-generator — do not edit
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import * as ${pascal} from "./index.js";
  import * as exampleSources from "./${pascal}.example-sources.js";
${imports}

  const { Story } = defineMeta({
    title: ${JSON.stringify(storyTitle)},
    component: ${storyMetaComponentExpr(args.component, pascal)},
  });
</script>

${stories}
`;
}

function emitMdx(args: {
  component: string;
  docs: UpstreamDocs;
  examples: RewrittenExample[];
  /** Final rewritten `*.docs.md` body (includes Installation, Structure, …). */
  docsMarkdown: string;
  /** Relative path to the stripped guide markdown imported via `?raw`. */
  docsBodyImport: string;
}): string {
  const pascal = toPascalCase(args.component);
  const usage = buildPackageUsageSource(args.docs, args.component);
  const hasExamples = args.examples.length > 0;
  const exampleSections = args.examples
    .map((ex) => {
      const exportName = toPascalCase(ex.example.slug);
      const cleaned = ex.example.description
        ? sanitizeExampleProse(ex.example.description)
        : "";
      const prose = cleaned ? `\n${cleaned}\n` : "\n";
      return `### ${ex.example.name}
${prose}
<Canvas of={${pascal}Variations.${exportName}} meta={${pascal}Variations} />
`;
    })
    .join("\n");

  // Source uses Storybook's highlighter. `html` is the closest supported lang
  // for Svelte SFCs (svelte is not in the built-in language list).
  const usageSource = usage
    ? `\n<Source language="html" code={${JSON.stringify(usage)}} />\n`
    : "\n";

  const variationsImport = hasExamples
    ? `import * as ${pascal}Variations from "./${pascal}.variations.stories.svelte";\n`
    : "";

  const examplesSection = hasExamples
    ? `\n## Examples\n\n${exampleSections}\n`
    : "";

  // Storybook MDX treats `{` as JSX — render the guide via <Markdown> from a
  // `?raw` file so Installation / Structure / `{#snippet}` fences survive and
  // HMR picks up docs edits. Headings stay top-level for the Docs TOC.
  const guideBody = docsMarkdownForMdxGuide(args.docsMarkdown);
  const guideImport = guideBody
    ? `import docsBody from ${JSON.stringify(args.docsBodyImport)};\n`
    : "";
  const guideSection = guideBody ? `\n<Markdown>{docsBody}</Markdown>\n` : "";

  return `import { Meta, Canvas, Controls, Primary, Source, Markdown } from "@storybook/addon-docs/blocks";
import * as ${pascal}Stories from "./${pascal}.stories.svelte";
${variationsImport}${guideImport}
{/* @generated by ui-generator — do not edit */}

<Meta of={${pascal}Stories} />

# ${args.docs.title}

${args.docs.description}

Adapted from the upstream [shadcn-svelte docs](${args.docs.docsUrl}).
${guideSection}
## Usage
${usageSource}
<Primary />

<Controls />
${examplesSection}`;
}

/**
 * Strip the generator banner + duplicate H1/description so MDX can render the
 * rest of `*.docs.md` (Installation, Structure, API, …) as top-level headings.
 */
export function docsMarkdownForMdxGuide(docsMarkdown: string): string {
  let md = docsMarkdown.replace(/^<!--[\s\S]*?-->\s*/u, "").trimStart();
  if (md.startsWith("# ")) {
    const nl = md.indexOf("\n");
    md = nl >= 0 ? md.slice(nl + 1).trimStart() : "";
  }
  // Drop the leading description paragraph(s) before the first H2.
  const h2 = md.search(/^##\s+/m);
  if (h2 > 0) md = md.slice(h2);
  return md.trim() + (md.trim() ? "\n" : "");
}

export function emitDocsArtifacts(args: {
  targetDir: string;
  component: string;
  storyTitle: string;
  docs: UpstreamDocs;
  examples: RewrittenExample[];
}): string[] {
  const { targetDir, component, storyTitle, docs, examples } = args;
  const pascal = toPascalCase(component);
  const written: string[] = [];

  mkdirSync(targetDir, { recursive: true });
  const examplesDir = path.join(targetDir, "examples");
  mkdirSync(examplesDir, { recursive: true });

  const docsMdPath = path.join(targetDir, `${component}.docs.md`);
  const docsMarkdown = rewriteDocsMarkdown(docs, component, examples);
  writeFileSync(docsMdPath, docsMarkdown);
  written.push(docsMdPath);

  const guideBody = docsMarkdownForMdxGuide(docsMarkdown);
  const docsBodyPath = path.join(targetDir, `${component}.docs-body.md`);
  const docsBodyImport = `./${component}.docs-body.md?raw`;
  if (guideBody) {
    writeFileSync(docsBodyPath, guideBody);
    written.push(docsBodyPath);
  } else if (existsSync(docsBodyPath)) {
    unlinkSync(docsBodyPath);
    written.push(docsBodyPath);
  }

  // Older emit used `*.examples.stories.svelte`, which sorts before the hand
  // `*.stories.svelte` file and steals the primary Docs canvas.
  const legacyExamplesStories = path.join(
    targetDir,
    `${pascal}.examples.stories.svelte`,
  );
  if (existsSync(legacyExamplesStories)) {
    unlinkSync(legacyExamplesStories);
    written.push(legacyExamplesStories);
  }

  const keepSlugs = new Set(examples.map((ex) => `${ex.example.slug}.svelte`));
  for (const ex of examples) {
    const filePath = path.join(examplesDir, `${ex.example.slug}.svelte`);
    writeFileSync(filePath, emitExampleComponent(ex.code));
    written.push(filePath);
  }

  // Name sorts after `${pascal}.stories.svelte` so curated stories stay primary.
  const storiesPath = path.join(
    targetDir,
    `${pascal}.variations.stories.svelte`,
  );
  const sourcesPath = path.join(targetDir, `${pascal}.example-sources.ts`);

  if (examples.length > 0) {
    // Drop demos that are no longer included (skipped or removed upstream).
    if (existsSync(examplesDir)) {
      for (const name of readdirSync(examplesDir)) {
        if (!name.endsWith(".svelte") || keepSlugs.has(name)) continue;
        const stale = path.join(examplesDir, name);
        unlinkSync(stale);
        written.push(stale);
      }
    }
    writeFileSync(
      sourcesPath,
      emitExampleSourcesModule({ component, examples }),
    );
    written.push(sourcesPath);
    writeFileSync(
      storiesPath,
      emitExamplesStories({ component, storyTitle, examples }),
    );
    written.push(storiesPath);
  }
  // When there are no example SFCs (e.g. sidebar is all type="block"), leave
  // existing examples/variations alone — only refresh prose docs + MDX.

  const mdxPath = path.join(targetDir, `${pascal}.mdx`);
  writeFileSync(
    mdxPath,
    emitMdx({
      component,
      docs,
      examples,
      docsMarkdown,
      docsBodyImport,
    }),
  );
  written.push(mdxPath);

  return written;
}

export { toPascalCase };
