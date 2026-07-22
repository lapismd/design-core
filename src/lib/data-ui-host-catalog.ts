/**
 * Auto-discover shadcn host `data-ui-component` / `data-ui-part` identity
 * from part files + barrel exports.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

export type DataUiHostCatalog = {
  /** Public tag → default data-ui-component (e.g. Button → button). */
  components: Record<string, string>;
  /** Public tag → fixed data-ui-part when the host locks it. */
  parts: Record<string, string>;
};

/**
 * Intentional family restyles inside shadcn (must use `dataUiComponent`).
 * Paths are relative to `src/`.
 */
export const DATA_UI_SHADCN_ALLOWLIST = [
  {
    file: "shared/shadcn/field/field-label.svelte",
    tag: "Label",
    component: "field",
  },
  {
    file: "shared/shadcn/dialog/dialog-content.svelte",
    tag: "Button",
    component: "dialog",
  },
  {
    file: "shared/shadcn/select/select-separator.svelte",
    tag: "Separator",
    component: "select",
  },
  {
    file: "shared/shadcn/field/field-separator.svelte",
    tag: "Separator",
    component: "field",
  },
  {
    file: "shared/shadcn/command/command-dialog.svelte",
    tag: "Dialog.Content",
    component: "command",
  },
] as const;

export type DataUiAllowlistEntry = (typeof DATA_UI_SHADCN_ALLOWLIST)[number];

function kebabToPascal(kebab: string): string {
  return kebab
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function templateMarkup(source: string): string {
  return source
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
}

function extractHostIdentity(source: string): {
  component: string | null;
  part: string | null;
  locksPart: boolean;
} {
  const markup = templateMarkup(source);
  const resolveComponent = markup.match(
    /resolveDataUiComponent\(\s*["']([^"']+)["']/,
  );
  const resolvePart = markup.match(/resolveDataUiPart\(\s*["']([^"']+)["']/);
  const locksPart =
    source.includes("omitDataUiIdentity") || Boolean(resolvePart);

  let component: string | null = resolveComponent?.[1] ?? null;
  let part: string | null = resolvePart?.[1] ?? null;

  if (!component || (locksPart && !part)) {
    // Prefer the first element that stamps both identity attrs.
    const dual = markup.match(
      /<[^>]*\bdata-ui-component=(["'])([^"']+)\1[^>]*\bdata-ui-part=(["'])([^"']+)\3[^>]*>|<[^>]*\bdata-ui-part=(["'])([^"']+)\5[^>]*\bdata-ui-component=(["'])([^"']+)\7[^>]*>/,
    );
    if (dual) {
      component ??= dual[2] ?? dual[8] ?? null;
      if (locksPart) part ??= dual[4] ?? dual[6] ?? null;
    } else if (!component) {
      const componentOnly = markup.match(
        /\bdata-ui-component=(["'])([^"']+)\1/,
      );
      component = componentOnly?.[2] ?? null;
    }
  }

  return { component, part: locksPart ? part : null, locksPart };
}

type BarrelImport = {
  localName: string;
  fileName: string;
};

function parseBarrel(indexSource: string): {
  imports: BarrelImport[];
  /** localName → public export names (bare + aliases) */
  exportNames: Map<string, string[]>;
} {
  const imports: BarrelImport[] = [];
  const importRe =
    /import\s+(\w+)\s*(?:,\s*\{[^}]*\})?\s*from\s*["']\.\/([^"']+\.svelte)["']/g;
  let m: RegExpExecArray | null;
  while ((m = importRe.exec(indexSource))) {
    imports.push({ localName: m[1]!, fileName: m[2]! });
  }

  const exportNames = new Map<string, string[]>();
  const exportBlock = indexSource.match(/export\s*\{([^}]+)\}/s);
  if (exportBlock) {
    for (const raw of exportBlock[1]!.split(",")) {
      const part = raw.replace(/\/\/.*$/, "").trim();
      if (!part) continue;
      const asMatch = part.match(/^(\w+)\s+as\s+(\w+)$/);
      if (asMatch) {
        const local = asMatch[1]!;
        const alias = asMatch[2]!;
        const list = exportNames.get(local) ?? [];
        list.push(alias);
        exportNames.set(local, list);
        continue;
      }
      if (/^\w+$/.test(part)) {
        const list = exportNames.get(part) ?? [];
        list.push(part);
        exportNames.set(part, list);
      }
    }
  }

  return { imports, exportNames };
}

/**
 * Public tags for a part file. Avoid colliding bare names like Select's `Label`
 * or Command's `Input` with primary leaf hosts.
 */
function publicTagsForPart(opts: {
  family: string;
  familyPascal: string;
  localName: string;
  fileName: string;
  publics: string[];
}): string[] {
  const { family, familyPascal, localName, fileName, publics } = opts;
  const tags = new Set<string>();

  // Namespace usage: Sidebar.Root, Tooltip.Content, Dialog.Content
  tags.add(`${familyPascal}.${localName}`);

  const isPrimaryLeafFile =
    fileName === `${family}.svelte` || fileName === `${family}-root.svelte`;

  for (const pub of publics) {
    if (pub === localName) continue;
    // DialogContent → also Dialog.Content already covered via localName
    if (pub.startsWith(familyPascal) && pub !== familyPascal) {
      // Content as DialogContent — skip bare DialogContent for override scans
      continue;
    }
    // Root as Button / Root as Input / Root as ScrollArea
    if (isPrimaryLeafFile && localName === "Root") {
      tags.add(pub);
    }
    // Root as Sidebar (family alias)
    if (pub === familyPascal) {
      tags.add(pub);
    }
  }

  // Single-file leaf with only Root as Family (button, input, …)
  if (isPrimaryLeafFile && localName === "Root") {
    tags.add(familyPascal);
  }

  return [...tags];
}

/**
 * Scan `shadcnRoot` and build tag → host identity maps from barrels + part files.
 */
export function discoverDataUiHostCatalog(
  shadcnRoot: string,
): DataUiHostCatalog {
  const components: Record<string, string> = {};
  const parts: Record<string, string> = {};

  let families: string[] = [];
  try {
    families = readdirSync(shadcnRoot).filter((entry) => {
      try {
        return statSync(path.join(shadcnRoot, entry)).isDirectory();
      } catch {
        return false;
      }
    });
  } catch {
    return { components, parts };
  }

  for (const family of families) {
    const familyDir = path.join(shadcnRoot, family);
    const indexPath = path.join(familyDir, "index.ts");
    let indexSource: string;
    try {
      indexSource = readFileSync(indexPath, "utf8");
    } catch {
      continue;
    }

    const familyPascal = kebabToPascal(family);
    const { imports, exportNames } = parseBarrel(indexSource);

    for (const imp of imports) {
      const partPath = path.join(familyDir, imp.fileName);
      let source: string;
      try {
        source = readFileSync(partPath, "utf8");
      } catch {
        continue;
      }

      const identity = extractHostIdentity(source);
      // Only catalog files that define this family's own identity (not composed wrappers).
      if (!identity.component || identity.component !== family) continue;

      const publics = exportNames.get(imp.localName) ?? [];
      const tags = publicTagsForPart({
        family,
        familyPascal,
        localName: imp.localName,
        fileName: imp.fileName,
        publics,
      });

      for (const tag of tags) {
        components[tag] = identity.component;
        if (identity.part) {
          parts[tag] = identity.part;
        }
      }
    }
  }

  return { components, parts };
}

export function isAllowlistedOverride(
  file: string,
  tag: string,
  component: string,
  allowlist: ReadonlyArray<{
    file: string;
    tag: string;
    component: string;
  }> = DATA_UI_SHADCN_ALLOWLIST,
): boolean {
  const normalized = file.replace(/\\/g, "/");
  return allowlist.some(
    (entry) =>
      (normalized === entry.file || normalized.endsWith(entry.file)) &&
      entry.tag === tag &&
      entry.component === component,
  );
}
