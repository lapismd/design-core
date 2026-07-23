/**
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";
import { createDemoLedgerFilterSyntax } from "../demo-ledger-filter-syntax.js";
import {
  commitContentSearchToken,
  createPowerSearchToken,
  matchPowerSearchFields,
  tokensToFilterQuery,
} from "./power-search.js";

describe("tokensToFilterQuery", () => {
  it("joins tokens with spaces using filter-query formatting", () => {
    expect(
      tokensToFilterQuery([
        createPowerSearchToken({
          field: "payee",
          operator: ":",
          value: "Whole Foods",
        }),
        createPowerSearchToken({
          field: "amount",
          operator: ">",
          value: "20",
        }),
      ]),
    ).toBe('payee:"Whole Foods" amount > 20');
  });

  it("returns empty string for no tokens", () => {
    expect(tokensToFilterQuery([])).toBe("");
  });
});

describe("commitContentSearchToken", () => {
  const syntax = createDemoLedgerFilterSyntax();

  it("commits free text onto the content search field", () => {
    expect(commitContentSearchToken(syntax, "payee", "groceries")).toEqual(
      expect.objectContaining({
        field: "payee",
        operator: ":",
        value: "groceries",
      }),
    );
  });

  it("returns null for empty text or missing key", () => {
    expect(commitContentSearchToken(syntax, "payee", "  ")).toBeNull();
    expect(commitContentSearchToken(syntax, undefined, "x")).toBeNull();
  });
});

describe("matchPowerSearchFields", () => {
  it("filters by name alias or description", () => {
    const syntax = createDemoLedgerFilterSyntax();
    expect(matchPowerSearchFields(syntax, "pay").map((f) => f.name)).toContain(
      "payee",
    );
    expect(
      matchPowerSearchFields(syntax, "units").map((f) => f.name),
    ).toContain("amount");
  });
});
