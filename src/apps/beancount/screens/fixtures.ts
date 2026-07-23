/** Shared display fixtures for Apps/Beancount/Screens stories. */

export const journalGroups = [
  {
    id: "2026-07-23",
    date: "JULY 23, 2026",
    balance: "1755.89 GBP",
    summary: {
      start: "1767.05 GBP",
      change: "−11.16 GBP",
      final: "1755.89 GBP",
    },
    records: [
      {
        id: "nhs",
        description: "NHS",
        detail: "NHS · NHSBSA Prescription",
        amount: "−11.16 GBP",
        avatar: { fallback: "N" },
        postings: [
          { account: "Assets:Checking:Starling", amount: "−11.16 GBP" },
          { account: "Expenses:Health:Prescription", amount: "11.16 GBP" },
        ],
      },
    ],
  },
  {
    id: "2026-07-21",
    date: "JULY 21, 2026",
    balance: "1767.05 GBP",
    records: [
      {
        id: "pure-gym",
        description: "Pure Gym",
        detail: "Pure Gym · Gym",
        amount: "−12.99 GBP",
        avatar: { fallback: "P" },
        postings: [
          { account: "Assets:Checking:Monzo", amount: "−12.99 GBP" },
          { account: "Expenses:Home:Lifestyle", amount: "12.99 GBP" },
        ],
      },
    ],
  },
  {
    id: "2026-07-15",
    date: "JULY 15, 2026",
    balance: "1780.04 GBP",
    records: [
      {
        id: "ee-limited",
        description: "EE LIMITED",
        detail: "EE LIMITED · Phone contract",
        amount: "−72.66 GBP",
        avatar: { fallback: "E" },
        postings: [
          { account: "Assets:Checking:Starling", amount: "−72.66 GBP" },
          { account: "Expenses:Home:Phone", amount: "72.66 GBP" },
        ],
      },
    ],
  },
  {
    id: "2026-07-13",
    date: "JULY 13, 2026",
    balance: "1852.70 GBP",
    records: [
      {
        id: "joint-transfer",
        description: "Joint account transfer",
        detail: "Joint account · household contribution",
        amount: "−23.86 GBP",
        avatar: { fallback: "J" },
        postings: [
          { account: "Assets:Checking:Starling", amount: "−23.86 GBP" },
          { account: "Assets:Checking:Joint", amount: "23.86 GBP" },
        ],
      },
    ],
  },
];

/** Account-detail activity remains an intentionally small account-scoped fixture. */
export const accountActivityGroups = [
  {
    id: "2026-07-18",
    date: "18 July 2026",
    balance: "£1,510.00",
    summary: {
      start: "£1,552.17",
      change: "−£42.17",
      final: "£1,510.00",
    },
    records: [
      {
        id: "groceries",
        description: "Groceries",
        account: "Expenses:Groceries",
        detail: "Weekly household shopping",
        amount: "−£42.17",
        avatar: { fallback: "G" },
      },
      {
        id: "salary",
        description: "Salary",
        account: "Income:Salary",
        amount: "+£3,200.00",
        avatar: { fallback: "S" },
      },
    ],
  },
];

export const statementColumns = [
  { id: "gbp", label: "GBP", title: "Pounds sterling" },
];

export const statementNodes = [
  {
    id: "expenses",
    label: "Expenses",
    href: "/accounts/Expenses",
    values: { gbp: "£2,040.00" },
    weight: "100.0%",
    color: "oklch(60% 0.16 25)",
    children: [
      {
        id: "expenses-food",
        label: "Food",
        href: "/accounts/Expenses:Food",
        values: { gbp: "£420.00" },
        weight: "20.6%",
        color: "oklch(62% 0.14 45)",
      },
      {
        id: "expenses-housing",
        label: "Housing",
        href: "/accounts/Expenses:Housing",
        values: { gbp: "£1,620.00" },
        weight: "79.4%",
        color: "oklch(62% 0.16 275)",
      },
    ],
  },
];

export const queryColumns = [
  { id: "date", label: "Date", sortable: true },
  { id: "description", label: "Description", sortable: true },
  { id: "account", label: "Account" },
  { id: "amount", label: "Amount", sortable: true, align: "right" as const },
];

export const queryRows = [
  {
    id: "groceries",
    values: {
      date: "18 Jul 2026",
      description: "Groceries",
      account: "Expenses:Groceries",
      amount: "-42.17",
    },
  },
  {
    id: "salary",
    values: {
      date: "01 Jul 2026",
      description: "Salary",
      account: "Income:Salary",
      amount: "3200.00",
    },
  },
];

export const validationErrors = [
  {
    id: "duplicate-open",
    line: 3,
    message: "Duplicate open directive for Assets:Cash",
    entity: "2026-01-02 open Assets:Cash",
    href: "/editor?line=3",
  },
];

export const emptyReviewGroups: readonly {
  id: string;
  label: string;
  rows: readonly never[];
}[] = [];
