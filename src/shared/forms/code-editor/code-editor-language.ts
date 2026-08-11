import { java } from "@codemirror/lang-java";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { python } from "@codemirror/lang-python";
import { StreamLanguage } from "@codemirror/language";
import { kotlin } from "@codemirror/legacy-modes/mode/clike";
import type { Extension } from "@codemirror/state";
import { mermaid } from "codemirror-lang-mermaid";

export const codeEditorLanguageAliases = {
  javascript: ["js", "javascript", "mjs", "cjs"],
  jsx: ["jsx"],
  typescript: ["ts", "typescript"],
  tsx: ["tsx"],
  json: ["json"],
  python: ["python", "py"],
  java: ["java"],
  kotlin: ["kotlin", "kt", "kts"],
  mermaid: ["mermaid"],
} as const;

export function normalizeCodeEditorLanguage(value: string): string {
  return value.trim().toLowerCase();
}

export function createCodeEditorLanguageExtension(language: string): Extension {
  const normalized = normalizeCodeEditorLanguage(language);
  if (codeEditorLanguageAliases.mermaid.includes(normalized as "mermaid"))
    return mermaid();
  if (codeEditorLanguageAliases.json.includes(normalized as "json"))
    return json();
  if (
    codeEditorLanguageAliases.javascript.includes(
      normalized as (typeof codeEditorLanguageAliases.javascript)[number],
    )
  )
    return javascript();
  if (codeEditorLanguageAliases.jsx.includes(normalized as "jsx"))
    return javascript({ jsx: true });
  if (
    codeEditorLanguageAliases.typescript.includes(
      normalized as (typeof codeEditorLanguageAliases.typescript)[number],
    )
  )
    return javascript({ typescript: true });
  if (codeEditorLanguageAliases.tsx.includes(normalized as "tsx"))
    return javascript({ jsx: true, typescript: true });
  if (
    codeEditorLanguageAliases.python.includes(
      normalized as (typeof codeEditorLanguageAliases.python)[number],
    )
  )
    return python();
  if (codeEditorLanguageAliases.java.includes(normalized as "java"))
    return java();
  if (
    codeEditorLanguageAliases.kotlin.includes(
      normalized as (typeof codeEditorLanguageAliases.kotlin)[number],
    )
  )
    return StreamLanguage.define(kotlin);
  return [];
}
