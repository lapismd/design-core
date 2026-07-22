import { CompletionContext } from "@codemirror/autocomplete";
import { EditorState } from "@codemirror/state";
import { describe, expect, test } from "vitest";
import {
  searchFilterCompletion,
  searchFilterCompletionStage,
  type SearchFilterSyntax,
} from "./search-filter-syntax";

const syntax: SearchFilterSyntax = {
  fields: [
    {
      name: "confidence",
      description: "Best candidate score.",
      operators: [">", ">=", "<", "<=", "=", "!="],
    },
    {
      name: "status",
      description: "Resolution state.",
      operators: [":", "=", "!="],
      values: ["confirmed", "suggested", "unresolved", "Confirmed"],
    },
  ],
};

async function labelsFor(query: string, position = query.length) {
  const state = EditorState.create({ doc: query });
  const source = searchFilterCompletion(syntax);
  const result = await source(new CompletionContext(state, position, true));
  return result?.options.map((option) => option.label) ?? [];
}

describe("search filter syntax completion", () => {
  test("suggests canonical fields from a field prefix", async () => {
    await expect(labelsFor("conf")).resolves.toEqual(["confidence", "status"]);
  });

  test("keeps field descriptions distinct from their operators", async () => {
    const state = EditorState.create({ doc: "conf" });
    const result = await searchFilterCompletion(syntax)(
      new CompletionContext(state, 4, true),
    );

    expect(result?.options[0]).toMatchObject({
      label: "confidence",
      detail: "Best candidate score.",
    });
  });

  test("suggests only the selected field's operators", async () => {
    await expect(labelsFor("confidence ")).resolves.toEqual([
      ">",
      ">=",
      "<",
      "<=",
      "=",
      "!=",
    ]);
  });

  test("suggests deduplicated known values after an operator", async () => {
    await expect(labelsFor("status: con")).resolves.toEqual([
      "confirmed",
      "suggested",
      "unresolved",
    ]);
  });

  test("does not offer arbitrary value suggestions for unknown free text", async () => {
    await expect(labelsFor("groceries")).resolves.toEqual([]);
  });

  test("moves from field to operator to value stages", () => {
    expect(searchFilterCompletionStage(syntax, "stat")).toBe("field");
    expect(searchFilterCompletionStage(syntax, "status ")).toBe("operator");
    expect(searchFilterCompletionStage(syntax, "status: ")).toBe("value");
  });

  test("recognises a cursor on either side of an existing operator", async () => {
    const beforeOperator = "status".length;
    const afterOperator = "status =".length;

    expect(
      searchFilterCompletionStage(syntax, "status =", beforeOperator),
    ).toBe("operator");
    expect(searchFilterCompletionStage(syntax, "status =", afterOperator)).toBe(
      "value",
    );
    await expect(labelsFor("status =", beforeOperator)).resolves.toEqual([
      ":",
      "=",
      "!=",
    ]);
    await expect(labelsFor("status =", afterOperator)).resolves.toEqual([
      "confirmed",
      "suggested",
      "unresolved",
    ]);
  });
});
