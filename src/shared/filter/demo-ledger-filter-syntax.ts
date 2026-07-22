import type {
  SearchFilterSyntax,
  SearchFilterValue,
} from "./search-filter-bar/search-filter-syntax.js";

const TEXT_OPS = [":", "=", "!=", ">", ">=", "<", "<=", "~", "!~"] as const;
const DATE_OPS = [":", "=", ">", ">=", "<", "<="] as const;

function quoteFilterToken(value: string) {
  if (/^[\w.:/-]+$/.test(value)) return value;
  return `"${value.replaceAll('"', '\\"')}"`;
}

function filterSyntaxValues(values: readonly string[]): SearchFilterValue[] {
  const seen = new Set<string>();
  return values.flatMap((value) => {
    const normalized = value.trim();
    const key = normalized.toLocaleLowerCase();
    if (!normalized || seen.has(key)) return [];
    seen.add(key);
    return { value: normalized, apply: quoteFilterToken(normalized) };
  });
}

/** Fixture filterSyntax for Storybook ledger-search demos. */
export function createDemoLedgerFilterSyntax(values?: {
  types?: readonly string[];
  accounts?: readonly string[];
  payees?: readonly string[];
  tags?: readonly string[];
  years?: readonly string[];
}): SearchFilterSyntax {
  const types = values?.types ?? [
    "transaction",
    "balance",
    "open",
    "close",
    "note",
  ];
  const accounts = values?.accounts ?? [
    "Assets:Cash",
    "Assets:Checking",
    "Expenses:Food",
    "Expenses:Rent",
    "Income:Salary",
  ];
  const payees = values?.payees ?? ["Whole Foods", "Landlord", "Employer"];
  const tags = values?.tags ?? ["travel", "tax", "reimbursable"];
  const years = values?.years ?? ["2024", "2025", "2026"];

  return {
    title: "Ledger search syntax",
    description:
      "Use a field, comparison, and value to narrow results. Plain words search free text.",
    fields: [
      {
        name: "type",
        description: "Directive type.",
        operators: TEXT_OPS,
        values: filterSyntaxValues(types),
      },
      {
        name: "account",
        description: "Any account on the entry.",
        operators: TEXT_OPS,
        values: filterSyntaxValues(accounts),
      },
      {
        name: "payee",
        description: "Transaction payee.",
        operators: TEXT_OPS,
        values: filterSyntaxValues(payees),
      },
      {
        name: "tag",
        description: "Hashtag without the # prefix.",
        operators: [":", "=", "!="],
        aliases: ["tags"],
        values: filterSyntaxValues(tags),
      },
      {
        name: "date",
        description: "Entry date or relative interval.",
        operators: DATE_OPS,
        values: filterSyntaxValues(years),
      },
      {
        name: "amount",
        description: "Absolute units amount.",
        operators: TEXT_OPS,
        aliases: ["units"],
      },
    ],
    examples: [
      {
        query: 'payee:"Whole Foods"',
        description: "Match a payee string.",
      },
      {
        query: "account:Expenses:Food #travel",
        description: "Account component plus tag.",
      },
      {
        query: "amount > 100",
        description: "Numeric comparison.",
      },
      {
        query: "date:2025 -#tax",
        description: "Year filter excluding a tag.",
      },
    ],
    notes: [
      "Boolean: space/and/&& for AND; comma/or/|| for OR; -/not for NOT.",
      "Tags and links may also be written as #tag and ^link.",
      "any(...) / all(...) appear in Fava docs but are not in this JS grammar.",
    ],
  };
}
