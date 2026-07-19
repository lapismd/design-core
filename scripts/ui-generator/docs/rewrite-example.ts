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
  return family === component
    ? `"./index.js"`
    : `"../${family}/index.js"`;
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
  // Upstream LLM pages sometimes use site-relative `../ui/<family>` imports.
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
  return code;
}

/**
 * Rewrite catalog-relative (or upstream $lib) family imports to the published
 * package specifier consumers use: `@stevejuma/ui/shadcn/<family>`.
 */
export function rewritePackageImports(
  source: string,
  component: string,
): string {
  let code = rewriteCatalogImports(source, component);
  code = code.replace(
    /from\s+["']\.\/index\.js["']/g,
    `from "@stevejuma/ui/shadcn/${component}"`,
  );
  code = code.replace(
    /from\s+["']\.\.\/([a-z][a-z0-9-]*)\/index\.js["']/g,
    (_m, family: string) => `from "@stevejuma/ui/shadcn/${family}"`,
  );
  code = code.replace(
    /from\s+["']\$lib\/components\/ui\/([a-z][a-z0-9-]*)(?:\/index\.js)?["']/g,
    (_m, family: string) => `from "@stevejuma/ui/shadcn/${family}"`,
  );
  code = code.replace(
    /from\s+["']\.\.\/ui\/([a-z][a-z0-9-]*)(?:\/index\.js)?["']/g,
    (_m, family: string) => `from "@stevejuma/ui/shadcn/${family}"`,
  );
  return code;
}

const UNSUPPORTED_IMPORT_RE =
  /\$lib\/hooks\/|use-clipboard|@tabler\/icons-svelte/i;

function extractUiFamilies(code: string): string[] {
  const families = new Set<string>();
  const patterns = [
    /\$lib\/components\/ui\/([a-z][a-z0-9-]*)(?:\/index\.js)?/g,
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
  if (/^\s*\/\/\s*\.\.\.\s*$/m.test(code) || /\/\*\s*\.\.\.\s*\*\//.test(code)) {
    return {
      example,
      reason: "empty-code",
      detail: "Example is an incomplete snippet",
    };
  }

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
