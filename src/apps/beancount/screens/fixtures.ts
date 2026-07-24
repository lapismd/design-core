/** Shared display fixtures for Apps/Beancount/Screens stories. */

import type { LedgerEditorLine } from "./LedgerEditorSurface.svelte";

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

/** A deterministic future-dated lane for the Journal Upcoming composition. */
export const journalUpcomingGroups = [
  {
    id: "2026-07-25",
    date: "JULY 25, 2026",
    balance: "1755.89 GBP",
    records: [
      {
        id: "scheduled-rent",
        description: "Scheduled rent",
        detail: "Monthly rent due",
        amount: "−1300.00 GBP",
        avatar: { fallback: "R" },
        postings: [
          { account: "Assets:Checking:Starling", amount: "−1300.00 GBP" },
          { account: "Expenses:Home:Rent", amount: "1300.00 GBP" },
        ],
      },
    ],
  },
  {
    id: "2026-08-01",
    date: "AUGUST 1, 2026",
    balance: "455.89 GBP",
    records: [
      {
        id: "scheduled-salary",
        description: "Scheduled salary",
        detail: "Monthly salary payment",
        amount: "3400.00 GBP",
        avatar: { fallback: "S" },
        postings: [
          { account: "Assets:Checking:Starling", amount: "3400.00 GBP" },
          { account: "Income:Salary", amount: "−3400.00 GBP" },
        ],
      },
    ],
  },
];

/** Synthetic formatted rows for the Query executed-state Storybook contract. */
export const queryResultColumns = [
  { id: "date", label: "Date", sortable: true },
  { id: "description", label: "Description", sortable: true },
  { id: "account", label: "Account" },
  { id: "amount", label: "Amount", sortable: true, align: "right" as const },
];

export const queryResultRows = [
  {
    id: "groceries",
    values: {
      date: "18 Jul 2026",
      description: "Groceries",
      account: "Expenses:Groceries",
      amount: "−42.17 GBP",
    },
  },
  {
    id: "salary",
    values: {
      date: "15 Jul 2026",
      description: "Salary",
      account: "Income:Salary",
      amount: "3200.00 GBP",
    },
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

export const trialBalanceHierarchy = {
  id: "trial-balance",
  label: "Trial Balance",
  color: "var(--ui-beancount-accepted)",
  children: [
    {
      id: "trial-balance-salary",
      label: "Salary",
      value: 217181.6,
      valueLabel: "217181.60 GBP",
      color: "var(--ui-beancount-accepted)",
    },
  ],
};

export const trialBalanceNodes = [
  {
    id: "trial-assets",
    label: "Assets",
    values: { gbp: "24921.78" },
    weight: "5.3%",
    color: "var(--ui-beancount-accepted)",
  },
  {
    id: "trial-equity",
    label: "Equity:Opening-Balances",
    values: { gbp: "55944.45" },
    weight: "12.0%",
    color: "var(--ui-beancount-review)",
  },
  {
    id: "trial-income",
    label: "Income:Starling",
    values: { gbp: "−213145.48" },
    weight: "45.5%",
    color: "var(--ui-beancount-positive)",
  },
];

export const trialBalanceContributions = [
  {
    id: "assets-cash",
    label: "Assets:Cash",
    percentage: 0.0,
    amount: "70.00 GBP",
    color: "var(--ui-beancount-positive)",
  },
  {
    id: "assets-checking",
    label: "Assets:Checking",
    percentage: 5.3,
    amount: "24851.78 GBP",
    color: "var(--ui-beancount-accepted)",
  },
  {
    id: "equity-opening-balances",
    label: "Equity:Opening-Balances",
    percentage: 12.0,
    amount: "55944.45 GBP",
    color: "var(--ui-beancount-review)",
  },
  {
    id: "expenses-food",
    label: "Expenses:Food",
    percentage: 0.0,
    amount: "7.39 GBP",
    color: "var(--ui-beancount-accepted)",
  },
  {
    id: "expenses-health",
    label: "Expenses:Health",
    percentage: 0.2,
    amount: "1047.04 GBP",
    color: "var(--ui-beancount-positive)",
  },
  {
    id: "expenses-home",
    label: "Expenses:Home",
    percentage: 0.4,
    amount: "1917.81 GBP",
    color: "var(--ui-beancount-positive)",
  },
  {
    id: "expenses-insurance",
    label: "Expenses:Insurance",
    percentage: 0.0,
    amount: "111.98 GBP",
    color: "var(--ui-beancount-review)",
  },
  {
    id: "expenses-interest",
    label: "Expenses:Interest",
    percentage: 0.2,
    amount: "1132.78 GBP",
    color: "var(--ui-beancount-review)",
  },
  {
    id: "expenses-joint",
    label: "Expenses:Joint",
    percentage: 15.3,
    amount: "71500.00 GBP",
    color: "var(--ui-beancount-review)",
  },
  {
    id: "expenses-subscriptions",
    label: "Expenses:Subscriptions",
    percentage: 0.1,
    amount: "272.79 GBP",
    color: "var(--ui-beancount-accepted)",
  },
  {
    id: "expenses-taxes",
    label: "Expenses:Taxes",
    percentage: 16.4,
    amount: "76527.22 GBP",
    color: "var(--ui-beancount-positive)",
  },
  {
    id: "expenses-tech",
    label: "Expenses:Tech",
    percentage: 0.0,
    amount: "62.79 GBP",
    color: "var(--ui-beancount-positive)",
  },
  {
    id: "income-starling",
    label: "Income:Starling",
    percentage: 45.5,
    amount: "−213145.48 GBP",
    color: "var(--ui-beancount-positive)",
  },
  {
    id: "liabilities-credit-card",
    label: "Liabilities:CreditCard",
    percentage: 0.1,
    amount: "567.68 GBP",
    color: "var(--ui-beancount-positive)",
  },
  {
    id: "liabilities-loan",
    label: "Liabilities:Loan",
    percentage: 4.5,
    amount: "−20868.23 GBP",
    color: "var(--ui-beancount-positive)",
  },
];

const accountDetailValues = [
  -1800, 1200, 200, 0, 0, 3000, 1100, 1000, 900, 4000, 2200, 2100, 1900, 5000,
  3400, 3200, 3100, 7000, 4600, 4500, 4400, 9000, 6500, 6200, 6000, 11000, 9000,
  8900, 8800, 13000, 11500, 11300, 11200, 15000, 13200, 13000, 12800, 17000,
  15300, 15100, 15000, 19000, 17600, 17400, 17200, 21000, 20000, 19800, 19600,
  23000, 22000, 21800, 21600, 25000, 24000, 23800, 23600, 26000, 24800, 24500,
  24300,
];

const accountDetailChartStart = Date.UTC(2024, 10, 1);
const accountDetailChartEnd = Date.UTC(2026, 7, 1);
const accountDetailAxisLabels = new Map([
  [6, "2025"],
  [14, "April"],
  [23, "July"],
  [32, "October"],
  [41, "2026"],
  [50, "April"],
  [59, "July"],
]);

export const accountDetailLineSeries = [
  {
    id: "account-balance",
    label: "Assets:Checking",
    color: "var(--ui-beancount-accepted)",
    points: accountDetailValues.map((value, index) => {
      const date = new Date(
        accountDetailChartStart +
          ((accountDetailChartEnd - accountDetailChartStart) * index) /
            (accountDetailValues.length - 1),
      );
      return {
        id: `account-balance-${index}`,
        date: date.toISOString(),
        label: accountDetailAxisLabels.get(index) ?? "",
        value,
        valueLabel: `${value.toFixed(2)} GBP`,
      };
    }),
  },
];

export const accountDetailGroups = [
  {
    id: "2026-07-23",
    date: "JULY 23, 2026",
    balance: "23405.35 GBP",
    summary: {
      start: "23416.51 GBP",
      change: "−11.16 GBP",
      final: "23405.35 GBP",
    },
    records: [
      {
        id: "account-nhs",
        description: "NHS",
        detail: "NHS · NHSBSA Prescription",
        amount: "−11.16 GBP",
        avatar: { fallback: "N" },
        postings: [
          {
            account: "Assets:Checking:Starling",
            amount: "−11.16 GBP",
          },
        ],
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

export const holdingColumns = [
  { id: "account", label: "account" },
  { id: "units", label: "units", align: "right" as const },
  { id: "cost", label: "cost", align: "right" as const },
  { id: "price", label: "price", align: "right" as const },
  { id: "book-value", label: "book_value", align: "right" as const },
  { id: "market-value", label: "market_value", align: "right" as const },
  {
    id: "acquisition-date",
    label: "acquisition_date",
    align: "right" as const,
  },
];

export const holdingRows = [
  {
    id: "cash",
    account: "Assets:Cash",
    values: {
      units: { label: "70.00", sortValue: 70 },
      "book-value": { label: "70.00", sortValue: 70 },
      "market-value": { label: "70.00", sortValue: 70 },
    },
  },
  {
    id: "monzo",
    account: "Assets:Checking:Monzo",
    values: {
      units: { label: "7637.59", sortValue: 7637.59 },
      "book-value": { label: "7637.59", sortValue: 7637.59 },
      "market-value": { label: "7637.59", sortValue: 7637.59 },
    },
  },
  {
    id: "starling",
    account: "Assets:Checking:Starling",
    values: {
      units: { label: "17214.19", sortValue: 17214.19 },
      "book-value": { label: "17214.19", sortValue: 17214.19 },
      "market-value": { label: "17214.19", sortValue: 17214.19 },
    },
  },
  {
    id: "credit-card-amex",
    account: "Liabilities:CreditCard:Amex",
    values: {
      units: { label: "3377.90", sortValue: 3377.9 },
      "book-value": { label: "3377.90", sortValue: 3377.9 },
      "market-value": { label: "3377.90", sortValue: 3377.9 },
    },
  },
  {
    id: "credit-card-barclays",
    account: "Liabilities:CreditCard:Barclays",
    values: {
      units: { label: "2365.62", sortValue: 2365.62 },
      "book-value": { label: "2365.62", sortValue: 2365.62 },
      "market-value": { label: "2365.62", sortValue: 2365.62 },
    },
  },
  {
    id: "credit-card-mbna",
    account: "Liabilities:CreditCard:MbNa",
    values: {
      units: { label: "976.61", sortValue: 976.61 },
      "book-value": { label: "976.61", sortValue: 976.61 },
      "market-value": { label: "976.61", sortValue: 976.61 },
    },
  },
  {
    id: "credit-card-natwest",
    account: "Liabilities:CreditCard:Natwest",
    values: {
      units: { label: "−4150.00", sortValue: -4150 },
      "book-value": { label: "−4150.00", sortValue: -4150 },
      "market-value": { label: "−4150.00", sortValue: -4150 },
    },
  },
  {
    id: "credit-card-paypal",
    account: "Liabilities:CreditCard:PayPal",
    values: {
      units: { label: "−2002.45", sortValue: -2002.45 },
      "book-value": { label: "−2002.45", sortValue: -2002.45 },
      "market-value": { label: "−2002.45", sortValue: -2002.45 },
    },
  },
  {
    id: "loan-miriam",
    account: "Liabilities:Loan:Miriam",
    values: {
      units: { label: "−1000.00", sortValue: -1000 },
      "book-value": { label: "−1000.00", sortValue: -1000 },
      "market-value": { label: "−1000.00", sortValue: -1000 },
    },
  },
  {
    id: "loan-novuna",
    account: "Liabilities:Loan:Novuna",
    values: {
      units: { label: "1896.40", sortValue: 1896.4 },
      "book-value": { label: "1896.40", sortValue: 1896.4 },
      "market-value": { label: "1896.40", sortValue: 1896.4 },
    },
  },
  {
    id: "pension-liability",
    account: "Liabilities:Pension",
    values: {
      units: { label: "−2400.00 GBP", sortValue: -2400 },
      "book-value": { label: "−2400.00 GBP", sortValue: -2400 },
      "market-value": { label: "−2400.00 GBP", sortValue: -2400 },
    },
  },
  {
    id: "mortgage",
    account: "Liabilities:Mortgage",
    values: {
      units: { label: "−180000.00 GBP", sortValue: -180000 },
      "book-value": { label: "−180000.00 GBP", sortValue: -180000 },
      "market-value": { label: "−180000.00 GBP", sortValue: -180000 },
    },
  },
];

export const statisticsColumns = [
  { id: "account", label: "account" },
  { id: "count", label: "count(account)", align: "right" as const },
];

export const statisticsRows = [
  {
    id: "credit-card-mbna",
    account: "Liabilities:CreditCard:MbNa",
    values: { count: { label: "23", sortValue: 23 } },
  },
  {
    id: "opening-balances",
    account: "Equity:Opening-Balances",
    values: { count: { label: "11", sortValue: 11 } },
  },
  {
    id: "credit-card-paypal",
    account: "Liabilities:CreditCard:PayPal",
    values: { count: { label: "1", sortValue: 1 } },
  },
  {
    id: "loan-plata-principal",
    account: "Liabilities:Loan:Plata:Principal",
    values: { count: { label: "22", sortValue: 22 } },
  },
  {
    id: "loan-plata-interest",
    account: "Liabilities:Loan:Plata:Interest",
    values: { count: { label: "22", sortValue: 22 } },
  },
  {
    id: "loan-miriam",
    account: "Liabilities:Loan:Miriam",
    values: { count: { label: "23", sortValue: 23 } },
  },
  {
    id: "cash",
    account: "Assets:Cash",
    values: { count: { label: "1", sortValue: 1 } },
  },
  {
    id: "starling",
    account: "Assets:Checking:Starling",
    values: { count: { label: "286", sortValue: 286 } },
  },
  {
    id: "monzo",
    account: "Assets:Checking:Monzo",
    values: { count: { label: "66", sortValue: 66 } },
  },
  {
    id: "credit-card-amex",
    account: "Liabilities:CreditCard:Amex",
    values: { count: { label: "23", sortValue: 23 } },
  },
  {
    id: "credit-card-barclays",
    account: "Liabilities:CreditCard:Barclays",
    values: { count: { label: "17", sortValue: 17 } },
  },
  {
    id: "credit-card-natwest",
    account: "Liabilities:CreditCard:Natwest",
    values: { count: { label: "9", sortValue: 9 } },
  },
  {
    id: "loan-novuna",
    account: "Liabilities:Loan:Novuna",
    values: { count: { label: "12", sortValue: 12 } },
  },
  {
    id: "loan-mortgage",
    account: "Liabilities:Loan:Mortgage",
    values: { count: { label: "48", sortValue: 48 } },
  },
  {
    id: "income-salary",
    account: "Income:Salary",
    values: { count: { label: "24", sortValue: 24 } },
  },
  {
    id: "expenses-food",
    account: "Expenses:Food",
    values: { count: { label: "98", sortValue: 98 } },
  },
  {
    id: "expenses-housing",
    account: "Expenses:Housing",
    values: { count: { label: "30", sortValue: 30 } },
  },
  {
    id: "expenses-health",
    account: "Expenses:Health",
    values: { count: { label: "13", sortValue: 13 } },
  },
  {
    id: "expenses-insurance",
    account: "Expenses:Insurance",
    values: { count: { label: "9", sortValue: 9 } },
  },
  {
    id: "expenses-interest",
    account: "Expenses:Interest",
    values: { count: { label: "16", sortValue: 16 } },
  },
  {
    id: "expenses-joint",
    account: "Expenses:Joint",
    values: { count: { label: "35", sortValue: 35 } },
  },
  {
    id: "expenses-subscriptions",
    account: "Expenses:Subscriptions",
    values: { count: { label: "19", sortValue: 19 } },
  },
  {
    id: "expenses-taxes",
    account: "Expenses:Taxes",
    values: { count: { label: "21", sortValue: 21 } },
  },
  {
    id: "expenses-tech",
    account: "Expenses:Tech",
    values: { count: { label: "8", sortValue: 8 } },
  },
  {
    id: "assets-savings",
    account: "Assets:Savings",
    values: { count: { label: "6", sortValue: 6 } },
  },
  {
    id: "assets-investments",
    account: "Assets:Investments",
    values: { count: { label: "15", sortValue: 15 } },
  },
  {
    id: "equity-retained-earnings",
    account: "Equity:Retained-Earnings",
    values: { count: { label: "4", sortValue: 4 } },
  },
];

export const connectedSources = [
  {
    id: "lunch-flow",
    name: "Lunch Flow",
    initials: "L",
    sourceCount: 0,
    syncLabel: "Not synced yet",
    statusLabel: "Needs setup",
    tone: "negative" as const,
  },
];

export const availableSources = [
  {
    id: "monzo",
    name: "Monzo Bank",
    initials: "MO",
    badgeLabel: "Beta",
    locationLabel: "United Kingdom · Bank",
    description:
      "Import settled transactions from your Monzo accounts using the Developer API.",
    tone: "negative" as const,
  },
  {
    id: "starling",
    name: "Starling Bank",
    initials: "ST",
    badgeLabel: "Beta",
    locationLabel: "United Kingdom · Bank",
    description:
      "Import settled transactions from your Starling accounts using the public API.",
    tone: "primary" as const,
  },
  {
    id: "example-bank",
    name: "Example bank",
    initials: "EX",
    badgeLabel: "Sample",
    locationLabel: "Global · Bank",
    description:
      "Sample JSON API bank feed with mapping, pagination, and a grocery rule.",
    tone: "positive" as const,
  },
];

export const sourceAccountSource = {
  id: "lunch-flow",
  name: "Lunch Flow",
  initials: "L",
  credentialLabel: "Credential available · Discovering accounts...",
  syncLabel: "Last sync: Not synced yet",
  tone: "negative" as const,
};

export const sourceAccountActions = [
  { id: "update-logo", label: "Update logo" },
  { id: "sync", label: "Sync" },
  { id: "remove", label: "Remove connection", destructive: true },
];

export const testRule = {
  id: "test-rule",
  name: "Test Rule",
  clauses: [
    { id: "condition", kind: "IF" as const, text: "amount > 20" },
    {
      id: "action",
      kind: "THEN" as const,
      text: "Set transaction category to Assets:Checking:Starling",
    },
    { id: "schedule", kind: "FOR" as const, text: "Starting from 2027-03-16" },
  ],
  active: true,
};

export const testRuleActions = [
  { id: "edit", label: "Edit" },
  { id: "run", label: "Run…" },
  { id: "delete", label: "Delete", destructive: true },
];

export const unassignedAccountGroup = {
  id: "other-accounts",
  label: "Other Accounts",
  description: "Ledger accounts not assigned to a sync configuration",
  count: 45,
};

export const validationErrors = [
  {
    id: "duplicate-open",
    line: 3,
    message: "Duplicate open directive for Assets:Cash",
    entity: "2026-01-02 open Assets:Cash",
    href: "/editor?line=3",
  },
];

/** Deterministic queue data for the Records populated-state composition. */
export const reviewSourceOptions = [
  { value: "all", label: "All connections" },
  { value: "lunch-flow", label: "Lunch Flow" },
];

export const reviewGroups = [
  {
    id: "2026-07-18",
    label: "July 18, 2026",
    rows: [
      {
        id: "northstar-cafe",
        title: "Northstar Cafe",
        detail: "Lunch near the office",
        status: "needs-review" as const,
        statusLabel: "Needs review",
        postings: [
          { account: "Liabilities:Northstar:Card", amount: "−£15.50" },
          { account: "Expenses:Dining", amount: "+£15.50" },
        ],
      },
      {
        id: "cash-withdrawal",
        title: "Cash withdrawal",
        detail: "Choose an account before approving this proposal",
        status: "held" as const,
        amount: "−£40.00",
        selectable: false,
      },
    ],
  },
];

export const readyReviewGroups = [
  {
    id: "2026-07-18-ready",
    label: "July 18, 2026",
    rows: [
      {
        id: "grocerly",
        title: "Grocerly",
        detail: "Food and household shopping",
        status: "ready" as const,
        postings: [
          { account: "Liabilities:Northstar:Card", amount: "−£42.17" },
          { account: "Expenses:Groceries", amount: "+£42.17" },
        ],
      },
      {
        id: "duplicate-coffee",
        title: "Duplicate coffee transaction",
        detail: "Matches a previously imported transaction",
        status: "duplicate" as const,
        amount: "−£3.20",
      },
    ],
  },
];

export const emptyReviewGroups: readonly {
  id: string;
  label: string;
  rows: readonly never[];
}[] = [];

/** Tokenized Fava sample-ledger excerpt for the display-only Editor surface. */
export const editorPreviewLines = [
  {
    id: "editor-line-1",
    number: 1,
    heading: true,
    section: "options",
    tokens: [{ value: "Options" }],
  },
  { id: "editor-line-2", number: 2, section: "options", tokens: [] },
  {
    id: "editor-line-3",
    number: 3,
    section: "options",
    tokens: [
      { value: "option", tone: "keyword" },
      { value: " " },
      { value: '"title"', tone: "string" },
      { value: " " },
      { value: '"Account Ledger"', tone: "string" },
    ],
  },
  {
    id: "editor-line-4",
    number: 4,
    section: "options",
    tokens: [
      { value: "option", tone: "keyword" },
      { value: " " },
      { value: '"operating_currency"', tone: "string" },
      { value: " " },
      { value: '"GBP"', tone: "string" },
    ],
  },
  {
    id: "editor-line-5",
    number: 5,
    section: "options",
    tokens: [
      { value: "option", tone: "keyword" },
      { value: " " },
      { value: '"inferred_tolerance_multiplier"', tone: "string" },
      { value: " " },
      { value: '"0.5"', tone: "string" },
    ],
  },
  { id: "editor-line-6", number: 6, section: "options", tokens: [] },
  {
    id: "editor-line-7",
    number: 7,
    section: "options",
    tokens: [
      { value: "2024-10-25", tone: "value" },
      { value: " " },
      { value: "custom", tone: "keyword" },
      { value: " " },
      { value: '"ledger-option"', tone: "string" },
      { value: " " },
      { value: '"dashboard_collapsed"', tone: "string" },
      { value: " " },
      { value: '"false"', tone: "string" },
    ],
  },
  {
    id: "editor-line-8",
    number: 8,
    section: "options",
    tokens: [
      { value: "2024-10-25", tone: "value" },
      { value: " " },
      { value: "custom", tone: "keyword" },
      { value: " " },
      { value: '"fava-option"', tone: "string" },
      { value: " " },
      { value: '"default-page"', tone: "string" },
      { value: " " },
      { value: '"/account/Assets:Checking:Starling"', tone: "string" },
    ],
  },
  {
    id: "editor-line-9",
    number: 9,
    section: "options",
    tokens: [
      { value: "2024-10-25", tone: "value" },
      { value: " " },
      { value: "custom", tone: "keyword" },
      { value: " " },
      { value: '"fava-option"', tone: "string" },
      { value: " " },
      { value: '"show-accounts-with-zero-transactions"', tone: "string" },
      { value: " " },
      { value: '"false"', tone: "string" },
    ],
  },
  {
    id: "editor-line-10",
    number: 10,
    section: "options",
    tokens: [
      { value: "2024-10-12", tone: "value" },
      { value: " " },
      { value: "custom", tone: "keyword" },
      { value: " " },
      { value: '"ledger-option"', tone: "string" },
      { value: " " },
      { value: '"plugins"', tone: "string" },
      { value: " " },
      { value: '"', tone: "string" },
    ],
  },
  {
    id: "editor-line-11",
    number: 11,
    section: "options",
    tokens: [{ value: "  beancount.plugins.forecast:" }],
  },
  {
    id: "editor-line-12",
    number: 12,
    section: "options",
    tokens: [
      { value: "    end", tone: "property" },
      { value: ": (month)-10", tone: "punctuation" },
    ],
  },
  {
    id: "editor-line-13",
    number: 13,
    section: "options",
    tokens: [{ value: '"', tone: "string" }],
  },
  { id: "editor-line-14", number: 14, section: "options", tokens: [] },
  {
    id: "editor-line-15",
    number: 15,
    section: "options",
    tokens: [
      { value: "plugin", tone: "keyword" },
      { value: " " },
      { value: '"beancount.plugins.forecast"', tone: "string" },
    ],
  },
  {
    id: "editor-line-16",
    number: 16,
    heading: true,
    section: "general-accounts",
    tokens: [{ value: "General Accounts" }],
  },
  {
    id: "editor-line-17",
    number: 17,
    section: "general-accounts",
    tokens: [],
  },
  {
    id: "editor-line-18",
    number: 18,
    section: "general-accounts",
    tokens: [
      {
        value:
          ";; We need to declare a few general accounts that we will use below.",
        tone: "comment",
      },
    ],
  },
  { id: "editor-line-19", number: 19, section: "general-accounts", tokens: [] },
  {
    id: "editor-line-20",
    number: 20,
    section: "general-accounts",
    tokens: [
      {
        value:
          ";; Declare some sort of account to use as the source for padding",
        tone: "comment",
      },
    ],
  },
  {
    id: "editor-line-21",
    number: 21,
    section: "general-accounts",
    tokens: [
      {
        value:
          ";; entries (see below). Use your birth date... that's when you began",
        tone: "comment",
      },
    ],
  },
  {
    id: "editor-line-22",
    number: 22,
    section: "general-accounts",
    tokens: [{ value: ";; accumulating equity!", tone: "comment" }],
  },
  {
    id: "editor-line-23",
    number: 23,
    section: "general-accounts",
    tokens: [{ value: ";;", tone: "comment" }],
  },
  { id: "editor-line-24", number: 24, section: "general-accounts", tokens: [] },
  {
    id: "editor-line-25",
    number: 25,
    section: "general-accounts",
    tokens: [
      { value: "1987-05-15", tone: "value" },
      { value: " " },
      { value: "open", tone: "keyword" },
      { value: "     " },
      { value: "Equity:Opening-Balances", tone: "property" },
      { value: " " },
      { value: "; inline comment", tone: "comment" },
    ],
  },
  {
    id: "editor-line-26",
    number: 26,
    heading: true,
    section: "queries",
    tokens: [{ value: "Queries" }],
  },
  { id: "editor-line-27", number: 27, section: "queries", tokens: [] },
  {
    id: "editor-line-28",
    number: 28,
    section: "queries",
    tokens: [
      { value: "2014-07-23", tone: "value" },
      { value: " " },
      { value: "query", tone: "keyword" },
      { value: " " },
      { value: '"position-by-account"', tone: "string" },
      { value: " " },
      { value: '"SELECT account, sum(position)"', tone: "string" },
    ],
  },
  { id: "editor-line-29", number: 29, section: "queries", tokens: [] },
  {
    id: "editor-line-30",
    number: 30,
    heading: true,
    section: "events",
    tokens: [{ value: "Events" }],
  },
  { id: "editor-line-31", number: 31, section: "events", tokens: [] },
  {
    id: "editor-line-32",
    number: 32,
    section: "events",
    tokens: [
      { value: "2024-11-24", tone: "value" },
      { value: " " },
      { value: "event", tone: "keyword" },
      { value: " " },
      { value: '"address"', tone: "string" },
      { value: " " },
      {
        value: '"19 Discovery Drive, Ashford, Middlesex, TN23 3TR"',
        tone: "string",
      },
    ],
  },
  { id: "editor-line-33", number: 33, section: "events", tokens: [] },
  {
    id: "editor-line-34",
    number: 34,
    heading: true,
    section: "accounts",
    tokens: [{ value: "Accounts" }],
  },
  { id: "editor-line-35", number: 35, section: "accounts", tokens: [] },
  {
    id: "editor-line-36",
    number: 36,
    section: "accounts",
    tokens: [
      { value: "2022-09-01", tone: "value" },
      { value: " " },
      { value: "open", tone: "keyword" },
      { value: "     " },
      { value: "Assets:Cash", tone: "property" },
      { value: "                                " },
      { value: "GBP", tone: "keyword" },
    ],
  },
  {
    id: "editor-line-37",
    number: 37,
    section: "accounts",
    tokens: [
      { value: "2024-10-26", tone: "value" },
      { value: " " },
      { value: "pad", tone: "keyword" },
      { value: "      " },
      { value: "Assets:Cash", tone: "property" },
      { value: "                       " },
      { value: "Equity:Opening-Balances", tone: "property" },
    ],
  },
] satisfies readonly LedgerEditorLine[];
