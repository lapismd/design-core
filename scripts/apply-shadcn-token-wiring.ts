/**
 * Apply curated --ui-* token bindings + paint rewrites to converted shadcn families.
 * Usage: pnpm tsx scripts/apply-shadcn-token-wiring.ts [family…]
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import {
  FAMILY_TOKEN_SPECS,
  TOKEN_SCHEMA_VERSION,
  buildTokensCss,
  buildTokensTs,
  rewritePaintToTokens,
} from "./ui-generator/transform/token-wiring.js";

const shadcnRoot = path.resolve("src/shared/shadcn");
const stylesCssPath = path.resolve("src/styles.css");
const requested = process.argv.slice(2);

function families(): string[] {
  if (requested.length) return requested;
  return Object.keys(FAMILY_TOKEN_SPECS).sort();
}

function svelteFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return svelteFiles(full);
    return entry.isFile() && entry.name.endsWith(".svelte") ? [full] : [];
  });
}

function updateProvenance(familyDir: string, family: string): void {
  const provenancePath = path.join(familyDir, `${family}.provenance.json`);
  if (!existsSync(provenancePath)) return;
  const json = JSON.parse(readFileSync(provenancePath, "utf8")) as {
    converter?: { tokenSchemaVersion?: number };
  };
  json.converter = {
    ...(json.converter ?? {}),
    tokenSchemaVersion: TOKEN_SCHEMA_VERSION,
  };
  writeFileSync(provenancePath, `${JSON.stringify(json, null, 2)}\n`);
}

function ensureIndexExports(familyDir: string, family: string): void {
  const indexPath = path.join(familyDir, "index.ts");
  if (!existsSync(indexPath)) return;
  const tokensImport = `./${family}.tokens.js`;
  let source = readFileSync(indexPath, "utf8");
  if (source.includes(tokensImport) || source.includes(`./${family}.tokens`)) {
    return;
  }
  const exportName = `${family.replace(/-/g, "_")}TokenNames`;
  const typeBase = family
    .split("-")
    .map((p) => p[0]!.toUpperCase() + p.slice(1))
    .join("");
  source += `\nexport { ${exportName}, type ${typeBase}Token } from "${tokensImport}";\n`;
  writeFileSync(indexPath, source);
}

function ensureStylesImport(family: string): void {
  const importLine = `@import "./shared/shadcn/${family}/${family}.tokens.css";`;
  let styles = readFileSync(stylesCssPath, "utf8");
  if (styles.includes(importLine)) return;
  // Insert after theme.css import (keep form/beancount after shadcn tokens or before)
  if (styles.includes('@import "./theme.css";')) {
    styles = styles.replace(
      '@import "./theme.css";',
      `@import "./theme.css";\n${importLine}`,
    );
  } else {
    styles = `${importLine}\n${styles}`;
  }
  writeFileSync(stylesCssPath, styles);
}

let changed = 0;
for (const family of families()) {
  const spec = FAMILY_TOKEN_SPECS[family];
  if (!spec) {
    console.warn(`No token spec for ${family}; skip`);
    continue;
  }
  const familyDir = path.join(shadcnRoot, family);
  if (!existsSync(familyDir)) {
    console.warn(`Missing family dir ${family}; skip`);
    continue;
  }

  writeFileSync(
    path.join(familyDir, `${family}.tokens.ts`),
    buildTokensTs(family, spec),
  );
  writeFileSync(
    path.join(familyDir, `${family}.tokens.css`),
    buildTokensCss(family, spec),
  );
  ensureStylesImport(family);
  ensureIndexExports(familyDir, family);
  updateProvenance(familyDir, family);

  for (const file of svelteFiles(familyDir)) {
    // Skip stories
    if (file.includes(".stories.") || file.includes(".variations.")) continue;
    const before = readFileSync(file, "utf8");
    const after = rewritePaintToTokens(family, before, spec);
    if (after !== before) {
      writeFileSync(file, after);
      changed += 1;
      console.log(`rewrote paint: ${path.relative(process.cwd(), file)}`);
    }
  }
  console.log(`wired tokens: ${family}`);
}

console.log(`Done. Paint files changed: ${changed}`);
