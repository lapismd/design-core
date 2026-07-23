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

export const incomeStatementNodes = [
  {
    id: "income",
    label: "Income",
    href: "/accounts/Income",
    values: { gbp: "−213145.48" },
    weight: "96.4%",
    color: "var(--chart-4)",
    children: [
      {
        id: "income-starling",
        label: "Starling",
        href: "/accounts/Income:Starling",
        values: { gbp: "−213145.48" },
        weight: "96.4%",
        color: "var(--chart-4)",
        children: [
          {
            id: "income-starling-pension",
            label: "Pension",
            values: { gbp: "4036.12" },
            weight: "1.8%",
            color: "var(--chart-3)",
          },
          {
            id: "income-starling-salary",
            label: "Salary",
            values: { gbp: "−217181.60" },
            weight: "98.2%",
            color: "var(--chart-4)",
          },
        ],
      },
    ],
  },
];

export const incomeStatementContributions = [
  {
    id: "income-starling",
    label: "Income:Starling",
    percentage: 100,
    amount: "−213145.48 GBP",
    color: "var(--chart-4)",
  },
];

const incomeStatementMonths = [
  "Oct 2024",
  "",
  "Dec 2024",
  "",
  "Feb 2025",
  "",
  "Apr 2025",
  "",
  "Jun 2025",
  "",
  "Aug 2025",
  "",
  "Oct 2025",
  "",
  "Dec 2025",
  "",
  "Feb 2026",
  "",
  "Apr 2026",
  "",
  "Jun 2026",
  "Aug 2026",
];

export const incomeStatementChartGroups = incomeStatementMonths.map(
  (label, index) => ({
    id: `income-month-${index}`,
    label,
    values: [
      {
        id: "net-profit",
        label: "Net profit",
        value: -6250,
        valueLabel: "−6250.00 GBP",
        color: "var(--chart-1)",
      },
    ],
    stacks: [
      {
        id: "salary",
        label: "Income:Starling:Salary",
        value: 3500,
        valueLabel: "3500.00 GBP",
        color: "var(--chart-4)",
      },
      {
        id: "pension",
        label: "Income:Starling:Pension",
        value: 3600,
        valueLabel: "3600.00 GBP",
        color: "var(--chart-3)",
      },
      {
        id: "expenses",
        label: "Expenses",
        value: -10000,
        valueLabel: "−10000.00 GBP",
        color: "var(--chart-2)",
      },
    ],
  }),
);

export const balanceSheetNodes = [
  {
    id: "assets",
    label: "Assets",
    href: "/accounts/Assets",
    values: { gbp: "24921.78" },
    weight: "100.0%",
    color: "var(--ui-beancount-accepted)",
    children: [
      {
        id: "assets-cash",
        label: "Cash",
        values: { gbp: "70.00" },
        weight: "0.3%",
        color: "var(--ui-beancount-positive)",
      },
      {
        id: "assets-checking",
        label: "Checking",
        href: "/accounts/Assets:Checking",
        values: { gbp: "24851.78" },
        weight: "99.7%",
        color: "var(--ui-beancount-accepted)",
        children: [
          {
            id: "assets-checking-monzo",
            label: "Monzo",
            values: { gbp: "7637.59" },
            weight: "30.6%",
            color: "var(--ui-beancount-accepted)",
          },
          {
            id: "assets-checking-starling",
            label: "Starling",
            values: { gbp: "17214.19" },
            weight: "69.1%",
            color: "var(--ui-beancount-accepted)",
          },
        ],
      },
    ],
  },
];

export const balanceSheetContributions = [
  {
    id: "assets-cash",
    label: "Assets:Cash",
    percentage: 0.3,
    amount: "70.00 GBP",
    color: "var(--ui-beancount-positive)",
  },
  {
    id: "assets-checking",
    label: "Assets:Checking",
    percentage: 99.7,
    amount: "24851.78 GBP",
    color: "var(--ui-beancount-accepted)",
  },
];

const balanceSheetValues = [
  -8500, -8500, -8500, -8500, -8500, -8500, -8500, -8500, -8500, -8500, -8500,
  -53500, -51000, -48000, -45000, -42000, -39000, -36000, -33000, -30000,
  -27000, -24000, -21000, -18000, -15000, -12000, -9000, -6000, -3000, 0, 3500,
  5000,
];

export const balanceSheetLineSeries = [
  {
    id: "net-worth",
    label: "Net worth",
    color: "var(--ui-beancount-accepted)",
    points: balanceSheetValues.map((value, index) => {
      const date = new Date(Date.UTC(2024, 9 + index, 1));
      return {
        id: `net-worth-${index}`,
        date: date.toISOString(),
        label:
          index === 0 || index === 10 || index === 20 || index === 30
            ? date.toLocaleString("en-GB", { month: "long" })
            : "",
        value,
        valueLabel: `${value.toFixed(2)} GBP`,
      };
    }),
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
