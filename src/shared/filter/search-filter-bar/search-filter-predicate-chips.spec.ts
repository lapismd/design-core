/**
 * @vitest-environment jsdom
 */
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { describe, expect, it, vi } from "vitest";
import { filterQuery, filterQueryLanguage } from "../filter-query/index.js";
import {
  collectTermExprRanges,
  formatTermExpr,
  parseTermExprParts,
  predicateChipEditHandler,
  rangeToDelete,
  searchFilterPredicateChips,
  shouldChipTerm,
  termExprHasValue,
  unwrapPredicateValue,
} from "./search-filter-predicate-chips.js";

function parseRanges(doc: string) {
  return collectTermExprRanges(filterQueryLanguage.parser.parse(doc));
}

function createChipEditor(
  doc: string,
  onEdit?: (session: {
    field: string;
    operator: string;
    value: string;
  }) => void,
) {
  const parent = document.createElement("div");
  document.body.append(parent);
  const view = new EditorView({
    state: EditorState.create({
      doc,
      extensions: [
        filterQuery(),
        searchFilterPredicateChips(),
        ...(onEdit
          ? [predicateChipEditHandler.of((session) => onEdit(session))]
          : []),
      ],
    }),
    parent,
  });
  return {
    view,
    destroy() {
      view.destroy();
      parent.remove();
    },
  };
}

describe("rangeToDelete", () => {
  it("leaves a single space when the span sits between neighbors", () => {
    const doc = "amount = 1 payee:x";
    expect(rangeToDelete(doc, 0, 10)).toEqual({ from: 0, to: 11 });
    expect(doc.slice(0, 10)).toBe("amount = 1");
  });

  it("eats a trailing space when deleting the first predicate", () => {
    const doc = "a = 1 b = 2";
    const range = rangeToDelete(doc, 0, 5);
    expect(doc.slice(range.from, range.to)).toBe("a = 1 ");
    expect(`${doc.slice(0, range.from)}${doc.slice(range.to)}`).toBe("b = 2");
  });

  it("eats a leading space when deleting the last predicate", () => {
    const doc = "a = 1 b = 2";
    const range = rangeToDelete(doc, 6, 11);
    expect(doc.slice(range.from, range.to)).toBe(" b = 2");
    expect(`${doc.slice(0, range.from)}${doc.slice(range.to)}`).toBe("a = 1");
  });

  it("does not expand when there is no surrounding whitespace", () => {
    expect(rangeToDelete("amount=1", 0, 8)).toEqual({ from: 0, to: 8 });
  });
});

describe("parseTermExprParts / formatTermExpr / value helpers", () => {
  it("parses field, operator, and value", () => {
    const doc = 'payee:"Whole Foods"';
    const tree = filterQueryLanguage.parser.parse(doc);
    expect(parseTermExprParts(doc, tree, 0, doc.length)).toEqual({
      field: "payee",
      operator: ":",
      value: '"Whole Foods"',
    });
  });

  it("formats colon terms tightly and others with spaces", () => {
    expect(formatTermExpr("payee", ":", "Whole Foods")).toBe(
      'payee:"Whole Foods"',
    );
    expect(formatTermExpr("amount", ">", "20")).toBe("amount > 20");
  });

  it("treats empty and quoted-empty values as missing", () => {
    expect(unwrapPredicateValue('""')).toBe("");
    expect(
      termExprHasValue({ field: "payee", operator: ":", value: '""' }),
    ).toBe(false);
    expect(
      termExprHasValue({
        field: "payee",
        operator: ":",
        value: '"Whole Foods"',
      }),
    ).toBe(true);
  });
});

describe("collectTermExprRanges", () => {
  it("finds complete TermExpr nodes", () => {
    const doc = 'payee:"Whole Foods" amount > 20';
    const ranges = parseRanges(doc);
    expect(ranges).toHaveLength(2);
    expect(doc.slice(ranges[0]!.from, ranges[0]!.to)).toBe(
      'payee:"Whole Foods"',
    );
    expect(doc.slice(ranges[1]!.from, ranges[1]!.to)).toBe("amount > 20");
  });

  it("does not chip incomplete field fragments", () => {
    expect(parseRanges("amount ")).toEqual([]);
  });

  it("does not chip bare tags or free text", () => {
    expect(parseRanges("#tag groceries")).toEqual([]);
  });
});

describe("searchFilterPredicateChips", () => {
  it("renders chips when the editor is unfocused", () => {
    const { view, destroy } = createChipEditor("amount = 23");
    try {
      const chips = view.dom.querySelectorAll(
        ".cv-search-filter-bar__predicate-chip",
      );
      expect(chips).toHaveLength(1);
      expect(
        chips[0]?.querySelector(".cv-search-filter-bar__tok-key")?.textContent,
      ).toBe("amount");
      expect(
        chips[0]?.querySelector(".cv-search-filter-bar__tok-op")?.textContent,
      ).toBe("=");
    } finally {
      destroy();
    }
  });

  it("does not chip a term while the caret is inside it", () => {
    const { view, destroy } = createChipEditor("amount = 23");
    try {
      view.focus();
      view.dispatch({ selection: { anchor: 4 } });
      expect(
        view.dom.querySelectorAll(".cv-search-filter-bar__predicate-chip"),
      ).toHaveLength(0);
      const tree = filterQueryLanguage.parser.parse("amount = 23");
      const parts = parseTermExprParts("amount = 23", tree, 0, 11);
      expect(shouldChipTerm(view, { from: 0, to: 11 }, parts)).toBe(false);
    } finally {
      destroy();
    }
  });

  it("removes the predicate when the delete control is clicked", () => {
    const { view, destroy } = createChipEditor(
      'payee:"Whole Foods" amount > 20',
    );
    try {
      const deletes = view.dom.querySelectorAll(
        ".cv-search-filter-bar__predicate-chip-delete",
      );
      expect(deletes).toHaveLength(2);
      (deletes[1] as HTMLButtonElement).click();
      expect(view.state.doc.toString()).toBe('payee:"Whole Foods"');
    } finally {
      destroy();
    }
  });

  it("opens the edit handler when the chip body is clicked", () => {
    const onEdit = vi.fn();
    const { view, destroy } = createChipEditor('payee:"Whole Foods"', onEdit);
    try {
      const chip = view.dom.querySelector(
        ".cv-search-filter-bar__predicate-chip",
      ) as HTMLElement;
      chip.click();
      expect(onEdit).toHaveBeenCalledWith(
        expect.objectContaining({
          field: "payee",
          operator: ":",
          value: '"Whole Foods"',
        }),
      );
    } finally {
      destroy();
    }
  });
});
