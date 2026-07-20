import { readFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

export type ReactDocgenProp = {
  required: boolean;
  description?: string;
  tsType: { name: string };
  type?: { name: string };
  defaultValue?: { value: string; computed: boolean };
};

export type ReactDocgenShape = {
  displayName: string;
  description?: string;
  props: Record<string, ReactDocgenProp>;
  extendsNote?: string;
};

export type SvelteProp = {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  defaultValue?: string;
};

const SCRIPT_RE =
  /<script(?:\s[^>]*)?\slang=["']ts["']([^>]*)>([\s\S]*?)<\/script>/gi;

function extractScripts(svelteSource: string): {
  module: string;
  instance: string;
} {
  let module = "";
  let instance = "";
  SCRIPT_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = SCRIPT_RE.exec(svelteSource)) !== null) {
    const attrs = match[1] ?? "";
    const body = match[2] ?? "";
    if (/\bmodule\b/.test(attrs)) module += `${body}\n`;
    else instance += `${body}\n`;
  }
  return { module, instance };
}

function jsDocText(node: ts.Node): string | undefined {
  const tags = ts.getJSDocCommentsAndTags(node);
  const parts: string[] = [];
  for (const tag of tags) {
    if (ts.isJSDoc(tag) && tag.comment) {
      parts.push(
        typeof tag.comment === "string"
          ? tag.comment
          : tag.comment.map((c) => ("text" in c ? c.text : "")).join(""),
      );
    }
  }
  const text = parts.join("\n").trim();
  return text || undefined;
}

function typeNodeText(type: ts.TypeNode | undefined, sf: ts.SourceFile): string {
  if (!type) return "unknown";
  return type.getText(sf).replace(/\s+/g, " ").trim();
}

function collectPropsFromTypeLiteral(
  literal: ts.TypeLiteralNode,
  sf: ts.SourceFile,
): SvelteProp[] {
  const props: SvelteProp[] = [];
  for (const member of literal.members) {
    if (!ts.isPropertySignature(member) || !member.name) continue;
    const name = member.name.getText(sf);
    if (name === "class" || name.startsWith("$$")) continue;
    props.push({
      name,
      type: typeNodeText(member.type, sf),
      required: !member.questionToken,
      description: jsDocText(member),
    });
  }
  return props;
}

function collectPropsFromTypeAlias(
  alias: ts.TypeAliasDeclaration,
  sf: ts.SourceFile,
): { props: SvelteProp[]; extendsNote?: string } {
  const props: SvelteProp[] = [];
  let extendsNote: string | undefined;
  const type = alias.type;

  const visitIntersection = (node: ts.TypeNode) => {
    if (ts.isIntersectionTypeNode(node)) {
      for (const part of node.types) visitIntersection(part);
      return;
    }
    if (ts.isTypeLiteralNode(node)) {
      props.push(...collectPropsFromTypeLiteral(node, sf));
      return;
    }
    // HTMLButtonAttributes & { ... } — record the extended base
    const text = typeNodeText(node, sf);
    if (/Attributes|HTMLAttributes|HTML\w+Attributes/.test(text)) {
      const short =
        text.match(/\bHTML\w+Attributes\b/)?.[0] ??
        text.replace(/^import\([^)]+\)\./, "");
      extendsNote = `Also accepts native \`${short}\` (DOM attributes omitted from this table).`;
    }
  };

  visitIntersection(type);
  return { props, extendsNote };
}

function findExportedPropsType(
  sf: ts.SourceFile,
): { props: SvelteProp[]; extendsNote?: string; typeName: string } | undefined {
  for (const stmt of sf.statements) {
    if (ts.isTypeAliasDeclaration(stmt) && stmt.name.text.endsWith("Props")) {
      if (
        stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ||
        true
      ) {
        // module scripts export types; accept any *Props alias in module scope
        const { props, extendsNote } = collectPropsFromTypeAlias(stmt, sf);
        if (props.length > 0 || extendsNote) {
          return { props, extendsNote, typeName: stmt.name.text };
        }
      }
    }
    if (ts.isInterfaceDeclaration(stmt) && stmt.name.text.endsWith("Props")) {
      const props: SvelteProp[] = [];
      for (const member of stmt.members) {
        if (!ts.isPropertySignature(member) || !member.name) continue;
        props.push({
          name: member.name.getText(sf),
          type: typeNodeText(member.type, sf),
          required: !member.questionToken,
          description: jsDocText(member),
        });
      }
      if (props.length > 0) {
        return { props, typeName: stmt.name.text };
      }
    }
  }
  return undefined;
}

function findInlinePropsType(
  sf: ts.SourceFile,
): { props: SvelteProp[] } | undefined {
  let found: SvelteProp[] | undefined;

  const visit = (node: ts.Node) => {
    if (found) return;
    // let { ... }: Type = $props()
    if (ts.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations) {
        if (!decl.initializer) continue;
        const initText = decl.initializer.getText(sf);
        if (!/\$props\s*\(/.test(initText)) continue;
        if (decl.type && ts.isTypeLiteralNode(decl.type)) {
          found = collectPropsFromTypeLiteral(decl.type, sf);
          return;
        }
        if (decl.type && ts.isTypeReferenceNode(decl.type)) {
          // Named type — resolved separately via module script
          return;
        }
      }
    }
    ts.forEachChild(node, visit);
  };

  visit(sf);
  return found ? { props: found } : undefined;
}

function extractDefaults(instanceSource: string): Map<string, string> {
  const defaults = new Map<string, string>();
  // Match `$props()` call region roughly
  const propsCall = /=\s*\$props\s*\(\s*\)/.exec(instanceSource);
  if (!propsCall) return defaults;

  // Look at preceding destructuring for `name = value` patterns
  const before = instanceSource.slice(0, propsCall.index);
  const block = before.slice(Math.max(0, before.lastIndexOf("let")));
  const re =
    /(?:^|[,{])\s*(?:(?:class|const|let)\s*)?([A-Za-z_$][\w$]*)\s*=\s*([^,}\n]+)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(block)) !== null) {
    const name = match[1]!;
    let value = match[2]!.trim();
    // Skip bindable wrappers for the default value display
    const bindable = /^\$bindable\s*\(\s*([^)]*)\s*\)/.exec(value);
    if (bindable) value = bindable[1]!.trim() || "null";
    if (name === "class") continue;
    defaults.set(name, value);
  }
  return defaults;
}

function toReactDocgen(
  displayName: string,
  props: SvelteProp[],
  extendsNote?: string,
): ReactDocgenShape {
  const out: Record<string, ReactDocgenProp> = {};
  for (const prop of props) {
    // Skip rest / children noise lightly documented
    const entry: ReactDocgenProp = {
      required: prop.required,
      tsType: { name: prop.type },
      type: { name: prop.type },
    };
    if (prop.description) entry.description = prop.description;
    else if (prop.name === "children") {
      entry.description = "Child content snippet.";
    }
    if (prop.defaultValue !== undefined) {
      entry.defaultValue = { value: prop.defaultValue, computed: false };
      entry.required = false;
    }
    out[prop.name] = entry;
  }
  const shape: ReactDocgenShape = {
    displayName,
    props: out,
  };
  if (extendsNote) shape.extendsNote = extendsNote;
  return shape;
}

/** Render a markdown props section for llms.txt pages. */
export function formatPropsMarkdown(
  docgen: ReactDocgenShape | undefined,
): string {
  if (!docgen || Object.keys(docgen.props).length === 0) {
    return "";
  }
  const lines: string[] = ["## Props", ""];
  if (docgen.extendsNote) {
    lines.push(docgen.extendsNote, "");
  }
  lines.push("| Name | Type | Required | Default | Description |");
  lines.push("| --- | --- | --- | --- | --- |");
  for (const [name, prop] of Object.entries(docgen.props)) {
    const type = (prop.tsType?.name ?? prop.type?.name ?? "unknown").replace(
      /\|/g,
      "\\|",
    );
    const req = prop.required ? "yes" : "no";
    const def = prop.defaultValue?.value?.replace(/\|/g, "\\|") ?? "";
    const desc = (prop.description ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
    lines.push(`| \`${name}\` | \`${type}\` | ${req} | ${def} | ${desc} |`);
  }
  lines.push("");
  return lines.join("\n");
}

export function extractPropsFromSvelteSource(
  svelteSource: string,
  displayName: string,
): ReactDocgenShape | undefined {
  const { module, instance } = extractScripts(svelteSource);
  const defaults = extractDefaults(instance);

  let props: SvelteProp[] = [];
  let extendsNote: string | undefined;

  if (module.trim()) {
    const moduleSf = ts.createSourceFile(
      "module.ts",
      module,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS,
    );
    const exported = findExportedPropsType(moduleSf);
    if (exported) {
      props = exported.props;
      extendsNote = exported.extendsNote;
    }
  }

  if (props.length === 0 && instance.trim()) {
    const instanceSf = ts.createSourceFile(
      "instance.ts",
      instance,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS,
    );
    const inline = findInlinePropsType(instanceSf);
    if (inline) props = inline.props;
  }

  if (props.length === 0 && !extendsNote) return undefined;

  for (const prop of props) {
    if (defaults.has(prop.name)) {
      prop.defaultValue = defaults.get(prop.name);
      prop.required = false;
    }
  }

  return toReactDocgen(displayName, props, extendsNote);
}

export function findPrimarySvelteFile(dir: string, id: string): string | undefined {
  if (!existsSync(dir)) return undefined;

  const candidates = [
    path.join(dir, `${id}.svelte`),
    // PascalCase from kebab
    path.join(
      dir,
      `${id
        .split("-")
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join("")}.svelte`,
    ),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }

  // Prefer a non-story .svelte whose name matches id loosely
  const files = readdirSync(dir).filter(
    (name) => name.endsWith(".svelte") && !name.includes(".stories."),
  );
  if (files.length === 1) return path.join(dir, files[0]!);

  const pascalish = id
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
  const match = files.find(
    (name) =>
      name.replace(/\.svelte$/, "").toLowerCase() === id.replace(/-/g, "") ||
      name.replace(/\.svelte$/, "") === pascalish,
  );
  if (match) return path.join(dir, match);

  // workspace-shell / nested: search one level
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    if (!name.isDirectory()) continue;
    const nested = findPrimarySvelteFile(path.join(dir, name.name), id);
    if (nested) return nested;
  }

  return files[0] ? path.join(dir, files[0]) : undefined;
}

export function extractPropsFromSvelteFile(
  filePath: string,
  displayName?: string,
): ReactDocgenShape | undefined {
  if (!existsSync(filePath)) return undefined;
  const base = path.basename(filePath, ".svelte");
  return extractPropsFromSvelteSource(
    readFileSync(filePath, "utf8"),
    displayName ?? base,
  );
}
