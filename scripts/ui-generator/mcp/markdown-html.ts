import { marked } from "marked";
import hljs from "highlight.js/lib/core";
import typescript from "highlight.js/lib/languages/typescript";
import javascript from "highlight.js/lib/languages/javascript";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import bash from "highlight.js/lib/languages/bash";
import json from "highlight.js/lib/languages/json";
import markdown from "highlight.js/lib/languages/markdown";

hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("html", xml);
hljs.registerLanguage("svelte", xml);
hljs.registerLanguage("css", css);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("shell", bash);
hljs.registerLanguage("sh", bash);
hljs.registerLanguage("json", json);
hljs.registerLanguage("markdown", markdown);
hljs.registerLanguage("md", markdown);

const LANG_ALIASES: Record<string, string> = {
  ts: "typescript",
  tsx: "typescript",
  js: "javascript",
  jsx: "javascript",
  htm: "html",
};

function resolveLanguage(lang: string | undefined): string {
  if (!lang) return "plaintext";
  const normalized = lang.trim().toLowerCase();
  const aliased = LANG_ALIASES[normalized] ?? normalized;
  return hljs.getLanguage(aliased) ? aliased : "plaintext";
}

function highlightCode(
  code: string,
  lang: string | undefined,
): {
  html: string;
  language: string;
} {
  const language = resolveLanguage(lang);
  if (language === "plaintext") {
    try {
      const auto = hljs.highlightAuto(code, [
        "typescript",
        "javascript",
        "xml",
        "css",
        "bash",
        "json",
      ]);
      return {
        html: auto.value,
        language: auto.language ?? "plaintext",
      };
    } catch {
      return { html: escapeHtml(code), language: "plaintext" };
    }
  }
  try {
    return {
      html: hljs.highlight(code, { language }).value,
      language,
    };
  } catch {
    return { html: escapeHtml(code), language: "plaintext" };
  }
}

marked.use({
  gfm: true,
  breaks: false,
  renderer: {
    code({ text, lang }) {
      const { html, language } = highlightCode(text, lang);
      return `<pre><code class="hljs language-${escapeHtml(language)}">${html}</code></pre>\n`;
    },
  },
});

const PAGE_STYLES = `
:root {
  color-scheme: light dark;
  --fg: #1a1a1a;
  --muted: #5c5c5c;
  --bg: #fafafa;
  --border: #e5e5e5;
  --code-bg: #f0f0f0;
  --link: #0b57d0;
  --table-stripe: #f5f5f5;
  --hl-keyword: #0550ae;
  --hl-string: #0a3069;
  --hl-number: #0550ae;
  --hl-comment: #6e7781;
  --hl-title: #8250df;
  --hl-attr: #116329;
  --hl-literal: #0550ae;
  --hl-built: #953800;
  --hl-meta: #6e7781;
  --hl-tag: #116329;
  --hl-name: #0550ae;
}
@media (prefers-color-scheme: dark) {
  :root {
    --fg: #f2f2f2;
    --muted: #a8a8a8;
    --bg: #121212;
    --border: #2a2a2a;
    --code-bg: #1e1e1e;
    --link: #8ab4f8;
    --table-stripe: #1a1a1a;
    --hl-keyword: #ff7b72;
    --hl-string: #a5d6ff;
    --hl-number: #79c0ff;
    --hl-comment: #8b949e;
    --hl-title: #d2a8ff;
    --hl-attr: #7ee787;
    --hl-literal: #79c0ff;
    --hl-built: #ffa657;
    --hl-meta: #8b949e;
    --hl-tag: #7ee787;
    --hl-name: #79c0ff;
  }
}
* { box-sizing: border-box; }
body {
  margin: 0;
  padding: 1.5rem clamp(1rem, 4vw, 2.5rem) 3rem;
  max-width: 52rem;
  font: 16px/1.55 ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif;
  color: var(--fg);
  background: var(--bg);
}
h1, h2, h3 { line-height: 1.25; }
h1 { font-size: 1.75rem; margin: 0 0 0.75rem; }
h2 { font-size: 1.25rem; margin: 2rem 0 0.75rem; border-bottom: 1px solid var(--border); padding-bottom: 0.35rem; }
h3 { font-size: 1.05rem; margin: 1.5rem 0 0.5rem; }
p, ul, ol { margin: 0.75rem 0; }
blockquote {
  margin: 1rem 0;
  padding: 0.35rem 0 0.35rem 1rem;
  border-left: 3px solid var(--border);
  color: var(--muted);
}
a { color: var(--link); }
code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.9em;
  background: var(--code-bg);
  padding: 0.1em 0.35em;
  border-radius: 0.25rem;
}
pre {
  overflow: auto;
  padding: 0.9rem 1rem;
  background: var(--code-bg);
  border: 1px solid var(--border);
  border-radius: 0.4rem;
}
pre code,
pre code.hljs {
  display: block;
  padding: 0;
  background: transparent;
  color: var(--fg);
  overflow-x: auto;
}
.hljs-keyword,
.hljs-selector-tag,
.hljs-subst { color: var(--hl-keyword); }
.hljs-string,
.hljs-doctag { color: var(--hl-string); }
.hljs-number,
.hljs-literal,
.hljs-variable,
.hljs-template-variable { color: var(--hl-number); }
.hljs-comment,
.hljs-quote { color: var(--hl-comment); font-style: italic; }
.hljs-title,
.hljs-section,
.hljs-selector-id { color: var(--hl-title); }
.hljs-attr,
.hljs-attribute { color: var(--hl-attr); }
.hljs-built_in,
.hljs-type,
.hljs-class .hljs-title { color: var(--hl-built); }
.hljs-meta,
.hljs-meta .hljs-keyword { color: var(--hl-meta); }
.hljs-tag { color: var(--hl-tag); }
.hljs-name { color: var(--hl-name); }
.hljs-punctuation,
.hljs-symbol { color: var(--muted); }
table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
  font-size: 0.92rem;
}
th, td {
  border: 1px solid var(--border);
  padding: 0.45rem 0.6rem;
  text-align: left;
  vertical-align: top;
}
th { background: var(--table-stripe); }
tr:nth-child(even) td { background: color-mix(in srgb, var(--table-stripe) 70%, transparent); }
.meta {
  color: var(--muted);
  font-size: 0.875rem;
  margin-bottom: 1.25rem;
}
`.trim();

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Convert markdown source into a full HTML document for browser viewing. */
export function markdownToHtmlDocument(
  markdown: string,
  options: { title?: string } = {},
): string {
  const bodyHtml = marked.parse(markdown, { async: false }) as string;
  const titleMatch = /^#\s+(.+)$/m.exec(markdown);
  const title =
    options.title ?? titleMatch?.[1]?.trim() ?? "@stevejuma/ui docs";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>${PAGE_STYLES}</style>
</head>
<body>
${bodyHtml}
</body>
</html>
`;
}
