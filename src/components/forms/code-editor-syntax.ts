import { syntaxTree } from "@codemirror/language";
import type { EditorState } from "@codemirror/state";
import type { Diagnostic } from "@codemirror/lint";

/**
 * Turns parser error nodes into CodeMirror diagnostics without executing code.
 * The active language parser is supplied by the editor state.
 */
export function parserDiagnostics(state: EditorState): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  syntaxTree(state).iterate({
    enter: (node) => {
      if (!node.type.isError) return;
      diagnostics.push({
        from: node.from,
        to: Math.max(node.from + 1, node.to),
        severity: "error",
        message: "Syntax error",
      });
    },
  });

  return diagnostics;
}
