import type {
  RewrittenExample,
  SkippedExample,
  UpstreamExample,
} from "./types.js";

/** Tabler icon path segment → lucide icon path segment */
export const TABLER_TO_LUCIDE: Record<string, string> = {
  check: "check",
  copy: "copy",
  "info-circle": "info",
  plus: "plus",
  star: "star",
  "brand-javascript": "file-code",
  "corner-down-left": "corner-down-left",
  refresh: "refresh-cw",
};

function familyImportSpec(component: string, family: string): string {
  return family === component ? `"./index.js"` : `"../${family}/index.js"`;
}

/**
 * Upstream demos set CSS vars via Tailwind arbitrary classes like
 * `[--card-spacing:--spacing(4)]`. Those only work when Tailwind compiles the
 * class; rewrite to plain `style` so native-CSS catalog demos respond.
 */
export function rewriteSpacingArbitraryProps(source: string): string {
  let code = source.replace(
    /className:\s*"\[--([a-z0-9-]+):--spacing\((\d+(?:\.\d+)?)\)\]"/g,
    'style: "--$1: calc(var(--spacing) * $2)"',
  );
  code = code.replace(
    /\bclass=\{([^}?]+)\?\.className\}/g,
    "style={$1?.style}",
  );
  code = code.replace(/\bclass=\{([^}]+)\.className\}/g, "style={$1.style}");
  return code;
}

/** Rewrite $lib UI imports + known tabler icons inside markdown/code. */
export function rewriteCatalogImports(
  source: string,
  component: string,
): string {
  let code = source.replace(
    /from\s+["']\$lib\/components\/ui\/([a-z][a-z0-9-]*)(?:\/index\.js)?["']/g,
    (_m, family: string) => `from ${familyImportSpec(component, family)}`,
  );
  // Vendored docs examples use `$lib/registry/ui/<family>`.
  code = code.replace(
    /from\s+["']\$lib\/registry\/ui\/([a-z][a-z0-9-]*)(?:\/index\.js)?["']/g,
    (_m, family: string) => `from ${familyImportSpec(component, family)}`,
  );
  // Upstream LLM pages / examples sometimes use site-relative `../ui/<family>`.
  code = code.replace(
    /from\s+["']\.\.\/ui\/([a-z][a-z0-9-]*)(?:\/index\.js)?["']/g,
    (_m, family: string) => `from ${familyImportSpec(component, family)}`,
  );
  // examples/*.svelte → src/lib/utils (four levels up from family/examples)
  code = code.replace(
    /from\s+["']\$lib\/utils\.js["']/g,
    'from "../../../../lib/utils.js"',
  );
  code = code.replace(
    /from\s+["']@tabler\/icons-svelte\/icons\/([a-z0-9-]+)["']/g,
    (_m, icon: string) => {
      const lucide = TABLER_TO_LUCIDE[icon] ?? icon;
      return `from "@lucide/svelte/icons/${lucide}"`;
    },
  );
  code = rewriteSpacingArbitraryProps(code);
  return code;
}

/**
 * Rewrite catalog-relative (or upstream $lib) family imports to the published
 * package specifier consumers use: `@lapismd/design-core/shadcn/<family>`.
 */
export function rewritePackageImports(
  source: string,
  component: string,
): string {
  let code = rewriteCatalogImports(source, component);
  code = code.replace(
    /from\s+["']\.\/index\.js["']/g,
    `from "@lapismd/design-core/shadcn/${component}"`,
  );
  code = code.replace(
    /from\s+["']\.\.\/([a-z][a-z0-9-]*)\/index\.js["']/g,
    (_m, family: string) => `from "@lapismd/design-core/shadcn/${family}"`,
  );
  code = code.replace(
    /from\s+["']\$lib\/components\/ui\/([a-z][a-z0-9-]*)(?:\/index\.js)?["']/g,
    (_m, family: string) => `from "@lapismd/design-core/shadcn/${family}"`,
  );
  code = code.replace(
    /from\s+["']\$lib\/registry\/ui\/([a-z][a-z0-9-]*)(?:\/index\.js)?["']/g,
    (_m, family: string) => `from "@lapismd/design-core/shadcn/${family}"`,
  );
  code = code.replace(
    /from\s+["']\.\.\/ui\/([a-z][a-z0-9-]*)(?:\/index\.js)?["']/g,
    (_m, family: string) => `from "@lapismd/design-core/shadcn/${family}"`,
  );
  return code;
}

const UNSUPPORTED_IMPORT_RE =
  /\$lib\/hooks\/|use-clipboard|@tabler\/icons-svelte/i;

/** True when the fence is a single empty element (no children, no script). */
export function isEmptyElementShell(code: string): boolean {
  const trimmed = code.trim();
  if (!trimmed || /^\s*<script\b/m.test(trimmed)) return false;
  return /^<([A-Za-z][\w.]*)\b[^>]*>\s*<\/\1>\s*$/.test(trimmed);
}

/** Remove sonner Toaster / toast usage when the catalog has no sonner family. */
export function stripSonnerToast(source: string): string {
  let code = source.replace(
    /^\s*import\s*\{[^}]*Toaster[^}]*\}\s*from\s*["'][^"']*sonner[^"']*["'];?\s*$/gm,
    "",
  );
  code = code.replace(
    /^\s*import\s*\{[^}]*toast[^}]*\}\s*from\s*["']svelte-sonner["'];?\s*$/gm,
    "",
  );
  code = code.replace(/<Toaster\b[^>]*\/>/g, "");
  code = code.replace(/<Toaster\b[^>]*>[\s\S]*?<\/Toaster>/g, "");
  code = code.replace(/\btoast\s*\(/g, "void (");
  return code;
}

function extractUiFamilies(code: string): string[] {
  const families = new Set<string>();
  const patterns = [
    /\$lib\/components\/ui\/([a-z][a-z0-9-]*)(?:\/index\.js)?/g,
    /\$lib\/registry\/ui\/([a-z][a-z0-9-]*)(?:\/index\.js)?/g,
    /\.\.\/ui\/([a-z][a-z0-9-]*)(?:\/index\.js)?/g,
  ];
  for (const re of patterns) {
    let match: RegExpExecArray | null;
    while ((match = re.exec(code))) {
      families.add(match[1]!);
    }
  }
  return [...families].sort();
}

function extractTablerIcons(code: string): string[] {
  const icons: string[] = [];
  const re = /@tabler\/icons-svelte\/icons\/([a-z0-9-]+)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(code))) {
    icons.push(match[1]!);
  }
  return icons;
}

/**
 * Rewrite an upstream example SFC for this catalog.
 * Returns null skip metadata when the example cannot be adapted.
 */
export function rewriteExample(args: {
  component: string;
  example: UpstreamExample;
  availableFamilies: Set<string>;
}): RewrittenExample | SkippedExample {
  const { component, example, availableFamilies } = args;
  let code = example.code.trim();
  if (!code) {
    return {
      example,
      reason: "empty-code",
      detail: "No svelte fence in example",
    };
  }

  if (
    /\$lib\/hooks\//.test(code) ||
    /use-clipboard/i.test(code) ||
    /\buseSidebar\b/.test(code)
  ) {
    return {
      example,
      reason: "unsupported-hook",
      detail: "Example depends on a catalog-unsupported hook",
    };
  }

  // Upstream sometimes shows invalid bare binds (e.g. `<X bind:open>`) as contrast.
  // Do not treat `bind:value={…}` as bare — only attribute form with no value.
  if (/\bbind:[A-Za-z][\w-]*(?=\s*\/?>|\s+[A-Za-z_:@.#\[])/.test(code)) {
    return {
      example,
      reason: "unsupported-hook",
      detail: "Example contains a bare bind: that is not valid Svelte",
    };
  }

  // Incomplete snippet fences (docs ellipsis) are not runnable demos.
  if (
    /^\s*\/\/\s*\.\.\.\s*$/m.test(code) ||
    /\/\*\s*\.\.\.\s*\*\//.test(code)
  ) {
    return {
      example,
      reason: "empty-code",
      detail: "Example is an incomplete snippet",
    };
  }

  // Fence-only stubs (no ComponentPreview SFC) are not runnable demos.
  if (isEmptyElementShell(code)) {
    return {
      example,
      reason: "empty-code",
      detail: "Example is an empty element shell",
    };
  }

  // Catalog has no sonner family — drop Toaster/toast so block demos still run.
  code = stripSonnerToast(code);

  const tablerIcons = extractTablerIcons(code);
  for (const icon of tablerIcons) {
    // Prefer explicit remaps; otherwise keep the tabler slug (often matches lucide).
    const lucide = TABLER_TO_LUCIDE[icon] ?? icon;
    if (!/^[a-z0-9-]+$/.test(lucide)) {
      return {
        example,
        reason: "unmapped-icon",
        detail: `No lucide mapping for @tabler/icons-svelte/icons/${icon}`,
      };
    }
  }

  const requiredFamilies = extractUiFamilies(code);
  for (const family of requiredFamilies) {
    if (!availableFamilies.has(family)) {
      return {
        example,
        reason: "missing-family",
        detail: `Catalog is missing family "${family}"`,
      };
    }
  }

  code = rewriteCatalogImports(code, component);

  if (/\$lib\//.test(code)) {
    return {
      example,
      reason: "unsupported-hook",
      detail: "Example depends on a catalog-unsupported $lib import",
    };
  }

  // Drop leftover unsupported import lines if any slipped through
  if (UNSUPPORTED_IMPORT_RE.test(code) && /@tabler/.test(code)) {
    return {
      example,
      reason: "unmapped-icon",
      detail: "Residual @tabler import after rewrite",
    };
  }

  return {
    example,
    code: code.trim() + "\n",
    requiredFamilies,
  };
}

export function isRewrittenExample(
  value: RewrittenExample | SkippedExample,
): value is RewrittenExample {
  return "code" in value && !("reason" in value);
}
