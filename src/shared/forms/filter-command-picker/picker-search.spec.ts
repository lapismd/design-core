import { describe, expect, it } from "vitest";
import {
  autocompleteSuggestions,
  filterCommandOptions,
  hasExactFilterCommandOption,
} from "./picker-search";

const options = [
  {
    value: "Assets:Cash",
    label: "Assets:Cash",
    description: "Cash on hand",
    keywords: ["liquid"],
  },
  {
    value: "Expenses:Groceries",
    label: "Expenses:Groceries",
    description: "Food shopping",
  },
];

describe("filterCommandOptions", () => {
  it("returns all options for an empty query", () => {
    expect(filterCommandOptions(options, "  ")).toEqual(options);
  });

  it("ranks label matches ahead of weaker fields", () => {
    const ranked = filterCommandOptions(options, "cash");
    expect(ranked[0]?.value).toBe("Assets:Cash");
  });

  it("matches keywords", () => {
    const ranked = filterCommandOptions(options, "liquid");
    expect(ranked.map((option) => option.value)).toEqual(["Assets:Cash"]);
  });
});

describe("hasExactFilterCommandOption", () => {
  it("detects exact value and label matches", () => {
    expect(hasExactFilterCommandOption(options, "Assets:Cash")).toBe(true);
    expect(hasExactFilterCommandOption(options, "expenses:groceries")).toBe(
      true,
    );
    expect(hasExactFilterCommandOption(options, "missing")).toBe(false);
  });
});

describe("autocompleteSuggestions", () => {
  it("dedupes and ranks string suggestions", () => {
    expect(
      autocompleteSuggestions(["Alpha", "alpha", "Beta", "Alpine"], "alp"),
    ).toEqual(["Alpha", "Alpine"]);
  });
});
