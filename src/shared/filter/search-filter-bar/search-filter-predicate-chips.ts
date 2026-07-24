import { syntaxTree } from "@codemirror/language";
import {
  Facet,
  RangeSetBuilder,
  type Extension,
} from "@codemirror/state";
import {
  Decoration,
  EditorView,
  ViewPlugin,
  WidgetType,
  type DecorationSet,
  type ViewUpdate,
} from "@codemirror/view";
import type { Tree } from "@lezer/common";

export type PredicateRange = { from: number; to: number };

export type PredicateTermParts = {
  field: string;
  operator: string;
  value: string;
};

/** Editor session shared by CM chips and PowerSearch (anchor optional). */
export type PredicateEditSession = PredicateTermParts & {
  getAnchorRect?: () => DOMRect;
};

export type PredicateChipEditSession = PredicateEditSession & {
  from: number;
  to: number;
  getAnchorRect: () => DOMRect;
};

/** Host opens the chip editor when a chip (not its delete control) is clicked. */
export const predicateChipEditHandler = Facet.define<
  (session: PredicateChipEditSession) => void,
  ((session: PredicateChipEditSession) => void) | undefined
>({
  combine: (values) => values[0],
});

const HIGHLIGHT_LEAVES = new Set([
  "Key",
  "OP",
  "String",
  "Regex",
  "Integer",
  "Tag",
  "Link",
  "AccountName",
  "DATE",
  "Bool",
  "Year",
  "Quarter",
  "Week",
  "Month",
  "Day",
]);

const TOKEN_CLASS: Record<string, string> = {
  Key: "cv-search-filter-bar__tok-key",
  OP: "cv-search-filter-bar__tok-op",
  String: "cv-search-filter-bar__tok-string",
  Regex: "cv-search-filter-bar__tok-string",
  Integer: "cv-search-filter-bar__tok-number",
  Tag: "cv-search-filter-bar__tok-tag",
  Link: "cv-search-filter-bar__tok-link",
  AccountName: "cv-search-filter-bar__tok-account",
  DATE: "cv-search-filter-bar__tok-keyword",
  Bool: "cv-search-filter-bar__tok-number",
  Year: "cv-search-filter-bar__tok-keyword",
  Quarter: "cv-search-filter-bar__tok-keyword",
  Week: "cv-search-filter-bar__tok-keyword",
  Month: "cv-search-filter-bar__tok-keyword",
  Day: "cv-search-filter-bar__tok-keyword",
};

/**
 * Expand a TermExpr span to delete so adjacent whitespace does not leave a
 * double space or a leading/trailing gap. When the span sits between two
 * neighbors with spaces on both sides, keep a single separating space.
 * Does not eat boolean keywords (`and` / `or`).
 */
export function rangeToDelete(
  doc: string,
  from: number,
  to: number,
): PredicateRange {
  let start = from;
  let end = to;
  const hasBefore = start > 0 && /\s/.test(doc[start - 1]!);
  const hasAfter = end < doc.length && /\s/.test(doc[end]!);

  if (hasBefore && hasAfter) {
    end += 1;
  } else if (hasAfter) {
    end += 1;
  } else if (hasBefore) {
    start -= 1;
  }

  return { from: start, to: end };
}

/** Collect complete Lezer `TermExpr` ranges from a syntax tree. */
export function collectTermExprRanges(tree: Tree): PredicateRange[] {
  const ranges: PredicateRange[] = [];
  tree.iterate({
    enter(node) {
      if (node.name === "TermExpr" && node.from < node.to) {
        ranges.push({ from: node.from, to: node.to });
        return false;
      }
    },
  });
  return ranges;
}

/** Split a TermExpr into field / operator / value from the Lezer tree. */
export function parseTermExprParts(
  doc: string,
  tree: Tree,
  from: number,
  to: number,
): PredicateTermParts | null {
  let field = "";
  let operator = "";
  let valueFrom = -1;

  tree.iterate({
    from,
    to,
    enter(node) {
      if (node.from < from || node.to > to) return;
      if (node.name === "Key" && !field && !operator) {
        field = doc.slice(node.from, node.to);
        return false;
      }
      if (node.name === "OP") {
        operator = doc.slice(node.from, node.to);
        valueFrom = node.to;
        return false;
      }
    },
  });

  if (!field || !operator || valueFrom < 0) return null;

  let valueStart = valueFrom;
  while (valueStart < to && /\s/.test(doc[valueStart]!)) valueStart += 1;

  return {
    field,
    operator,
    value: doc.slice(valueStart, to),
  };
}

/** Strip surrounding quotes from a TermExpr value for display / emptiness checks. */
export function unwrapPredicateValue(raw: string): string {
  const trimmed = raw.trim();
  const quoted = trimmed.match(/^(['"])([\s\S]*)\1$/);
  return quoted ? quoted[2]! : trimmed;
}

/** True when the TermExpr value is non-empty after unwrapping quotes. */
export function termExprHasValue(parts: PredicateTermParts): boolean {
  return unwrapPredicateValue(parts.value).length > 0;
}

/**
 * Chip only when the value is nonempty and the caret is not editing the term.
 * Unfocused editors chip all complete terms; while focused, a caret at `to`
 * (still extending the value) keeps the term as plain text.
 */
export function shouldChipTerm(
  view: EditorView,
  range: PredicateRange,
  parts: PredicateTermParts | null,
): boolean {
  if (!parts || !termExprHasValue(parts)) return false;
  if (!view.hasFocus) return true;
  const sel = view.state.selection.main;
  return sel.to <= range.from || sel.from > range.to;
}

/** Rebuild a TermExpr string; keep `:` tight, space around other operators. */
export function formatTermExpr(
  field: string,
  operator: string,
  value: string,
): string {
  const trimmedField = field.trim();
  const trimmedOp = operator.trim();
  let trimmedValue = value.trim();
  if (
    trimmedValue &&
    !/^([`'"]).*\1$/.test(trimmedValue) &&
    !/^\/.*\/[a-z]*$/i.test(trimmedValue) &&
    /[\s,:]/.test(trimmedValue)
  ) {
    trimmedValue = `"${trimmedValue.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
  }
  if (trimmedOp === ":") return `${trimmedField}:${trimmedValue}`;
  return `${trimmedField} ${trimmedOp} ${trimmedValue}`;
}

function buildHighlightedLabel(
  doc: string,
  tree: Tree,
  from: number,
  to: number,
): HTMLSpanElement {
  const label = document.createElement("span");
  label.className = "cv-search-filter-bar__predicate-chip-label";

  const tokens: { from: number; to: number; className: string }[] = [];
  tree.iterate({
    from,
    to,
    enter(node) {
      if (node.from < from || node.to > to) return;
      if (!HIGHLIGHT_LEAVES.has(node.name)) return;
      const className = TOKEN_CLASS[node.name];
      if (!className) return;
      tokens.push({ from: node.from, to: node.to, className });
      return false;
    },
  });
  tokens.sort((a, b) => a.from - b.from || a.to - b.to);

  let pos = from;
  for (const token of tokens) {
    if (token.from < pos) continue;
    if (token.from > pos) {
      label.append(document.createTextNode(doc.slice(pos, token.from)));
    }
    const span = document.createElement("span");
    span.className = token.className;
    span.textContent = doc.slice(token.from, token.to);
    label.append(span);
    pos = token.to;
  }
  if (pos < to) {
    label.append(document.createTextNode(doc.slice(pos, to)));
  }
  if (!label.childNodes.length) {
    label.textContent = doc.slice(from, to);
  }
  return label;
}

/**
 * One inline chip (highlighted label + delete) replacing a complete TermExpr.
 */
class PredicateChipWidget extends WidgetType {
  constructor(
    readonly from: number,
    readonly to: number,
    readonly text: string,
    readonly tree: Tree,
  ) {
    super();
  }

  eq(other: PredicateChipWidget) {
    return (
      this.from === other.from &&
      this.to === other.to &&
      this.text === other.text
    );
  }

  toDOM(view: EditorView) {
    const chip = document.createElement("span");
    chip.className = "cv-search-filter-bar__predicate-chip";
    chip.setAttribute("contenteditable", "false");
    chip.setAttribute("aria-label", `Edit filter ${this.text}`);
    chip.title = `Edit filter ${this.text}`;

    chip.append(
      buildHighlightedLabel(
        view.state.doc.toString(),
        this.tree,
        this.from,
        this.to,
      ),
    );

    const button = document.createElement("button");
    button.type = "button";
    button.className = "cv-search-filter-bar__predicate-chip-delete";
    button.setAttribute("aria-label", "Remove filter");
    button.setAttribute("tabindex", "-1");
    button.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';

    button.addEventListener("mousedown", (event) => {
      event.preventDefault();
      event.stopPropagation();
    });
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const doc = view.state.doc.toString();
      const range = rangeToDelete(doc, this.from, this.to);
      view.dispatch({
        changes: { from: range.from, to: range.to, insert: "" },
      });
    });

    chip.addEventListener("mousedown", (event) => {
      if (
        event.target instanceof HTMLElement &&
        event.target.closest("button")
      ) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
    });
    chip.addEventListener("click", (event) => {
      if (
        event.target instanceof HTMLElement &&
        event.target.closest("button")
      ) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      const doc = view.state.doc.toString();
      const parts = parseTermExprParts(doc, this.tree, this.from, this.to);
      if (!parts) return;
      const open = view.state.facet(predicateChipEditHandler);
      open?.({
        ...parts,
        from: this.from,
        to: this.to,
        getAnchorRect: () => chip.getBoundingClientRect(),
      });
    });

    chip.append(button);
    return chip;
  }

  ignoreEvent(event: Event) {
    return true;
  }
}

function buildDecorations(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  const tree = syntaxTree(view.state);
  const { from: vpFrom, to: vpTo } = view.viewport;
  const doc = view.state.doc;
  const docText = doc.toString();
  const ranges = collectTermExprRanges(tree).filter(
    (range) => range.to >= vpFrom && range.from <= vpTo,
  );

  ranges.sort((a, b) => a.from - b.from || a.to - b.to);

  for (const range of ranges) {
    const parts = parseTermExprParts(docText, tree, range.from, range.to);
    if (!shouldChipTerm(view, range, parts)) continue;
    builder.add(
      range.from,
      range.to,
      Decoration.replace({
        widget: new PredicateChipWidget(
          range.from,
          range.to,
          doc.sliceString(range.from, range.to),
          tree,
        ),
      }),
    );
  }

  return builder.finish();
}

/**
 * CodeMirror extension: replace complete filter-query `TermExpr` predicates
 * with a single inline chip (highlighted label + delete).
 */
export function searchFilterPredicateChips(): Extension {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = buildDecorations(view);
      }

      update(update: ViewUpdate) {
        if (
          update.docChanged ||
          update.viewportChanged ||
          update.selectionSet ||
          update.focusChanged
        ) {
          this.decorations = buildDecorations(update.view);
        }
      }
    },
    {
      decorations: (value) => value.decorations,
    },
  );
}
