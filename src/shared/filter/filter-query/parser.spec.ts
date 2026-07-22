import { describe, test, expect } from "vitest";
import { parseQuery, type QueryParserOptions } from "./parser";
import {
  BooleanFilter,
  DateFilter,
  DateRange,
  FieldFilter,
  NumberFilter,
  TextFilter,
  type Filter,
} from "./filters";
import { DateTime } from "luxon";

describe("Filter", () => {
  const testCases: Array<{
    queries: Array<string>;
    expected?: Filter;
    options?: QueryParserOptions;
    filter?: string;
  }> = [
    {
      queries: ["2024-07-28"],
      options: { now: DateTime.fromObject({ year: 2024, month: 7, day: 1 }) },
      expected: DateFilter.of(
        new DateRange(
          DateTime.fromISO("2024-07-28T00:00:00.000Z", { zone: "utc" }),
          DateTime.fromISO("2024-07-29T00:00:00.000Z", { zone: "utc" }),
        ),
      ),
    },
    {
      queries: ["now-1w"],
      options: {
        now: DateTime.fromObject(
          { year: 2024, month: 7, day: 20 },
          { zone: "utc" },
        ),
      },
      expected: DateFilter.of(
        new DateRange(
          DateTime.fromISO("2024-07-13T00:00:00.000Z", { zone: "utc" }),
          DateTime.fromISO("2024-07-14T00:00:00.000Z", { zone: "utc" }),
        ),
      ),
    },
    {
      queries: ["now/month"],
      options: {
        now: DateTime.fromObject(
          { year: 2024, month: 7, day: 20 },
          { zone: "utc" },
        ),
      },
      expected: DateFilter.of(
        new DateRange(
          DateTime.fromISO("2024-07-01T00:00:00.000Z", { zone: "utc" }),
          DateTime.fromISO("2024-07-02T00:00:00.000Z", { zone: "utc" }),
        ),
      ),
    },
    {
      queries: ["month/month"],
      options: {
        now: DateTime.fromObject(
          { year: 2024, month: 7, day: 20 },
          { zone: "utc" },
        ),
      },
      expected: DateFilter.of(
        new DateRange(
          DateTime.fromISO("2024-07-01T00:00:00.000Z", { zone: "utc" }),
          DateTime.fromISO("2024-08-01T00:00:00.000Z", { zone: "utc" }),
        ),
      ),
    },
    {
      queries: ["2010 - 2012-10"],
      options: { now: DateTime.fromObject({ year: 2020, month: 5, day: 30 }) },
      expected: DateFilter.of(
        new DateRange(
          DateTime.fromISO("2010-01-01T00:00:00.000Z", { zone: "utc" }),
          DateTime.fromISO("2012-10-31T23:59:59.999Z", { zone: "utc" }),
        ),
      ),
    },

    {
      queries: ["year-1"],
      options: {
        now: DateTime.fromObject(
          { year: 2020, month: 5, day: 30 },
          { zone: "utc" },
        ),
      },
      expected: DateFilter.of(
        new DateRange(
          DateTime.fromISO("2019-01-01T00:00:00.000Z", { zone: "utc" }),
          DateTime.fromISO("2020-01-01T00:00:00.000Z", { zone: "utc" }),
        ),
      ),
    },
    {
      queries: ["year-1 - year"],
      options: { now: DateTime.fromObject({ year: 2020, month: 5, day: 30 }) },
      expected: DateFilter.of(
        new DateRange(
          DateTime.fromISO("2019-01-01T00:00:00.000+00:00"),
          DateTime.fromISO("2020-12-31T23:59:59.999+00:00"),
        ),
      ),
    },
    {
      queries: ["2020-01-03"],
      expected: DateFilter.of(
        new DateRange(
          DateTime.fromISO("2020-01-03T00:00:00.000Z", { zone: "utc" }),
          DateTime.fromISO("2020-01-04T00:00:00.000Z", { zone: "utc" }),
        ),
      ),
    },
    {
      queries: ["2020-01-28 - 2020-02-27"],
      expected: DateFilter.of(
        new DateRange(
          DateTime.fromISO("2020-01-28T00:00:00.000Z", { zone: "utc" }),
          DateTime.fromISO("2020-02-27T23:59:59.999Z", { zone: "utc" }),
        ),
      ),
    },
    {
      queries: ["2020-01"],
      expected: DateFilter.of(
        new DateRange(
          DateTime.fromISO("2020-01-01T00:00:00.000Z", { zone: "utc" }),
          DateTime.fromISO("2020-02-01T00:00:00.000Z", { zone: "utc" }),
        ),
      ),
    },
    {
      queries: ["2020 - 2025"],
      expected: DateFilter.of(
        new DateRange(
          DateTime.fromISO("2020-01-01T00:00:00.000Z", { zone: "utc" }),
          DateTime.fromISO("2025-12-31T23:59:59.999Z", { zone: "utc" }),
        ),
      ),
    },
    {
      queries: ["2020"],
      expected: DateFilter.of(
        new DateRange(
          DateTime.fromObject(
            { year: 2020, month: 1, day: 1 },
            { zone: "utc" },
          ),
          DateTime.fromObject(
            { year: 2021, month: 1, day: 1 },
            { zone: "utc" },
          ),
        ),
      ),
    },
    {
      queries: ["year - day"],
      options: {
        now: DateTime.fromObject(
          { year: 2020, month: 6, day: 30 },
          { zone: "utc" },
        ),
      },
      expected: DateFilter.of(
        new DateRange(
          DateTime.fromISO("2020-01-01T00:00:00.000Z", { zone: "utc" }),
          DateTime.fromISO("2020-06-30T23:59:59.999Z", { zone: "utc" }),
        ),
      ),
    },
    {
      queries: ["month-10"],
      options: {
        now: DateTime.fromISO("2024-03-21T19:45:00.000Z", { zone: "utc" }),
      },
      expected: DateFilter.of(
        new DateRange(
          DateTime.fromISO("2023-05-01T00:00:00.000Z", { zone: "utc" }),
          DateTime.fromISO("2023-06-01T00:00:00.000Z", { zone: "utc" }),
        ),
      ),
    },
    {
      queries: ["(month)-10"],
      options: {
        now: DateTime.fromISO("2024-03-21T19:45:00.000Z", { zone: "utc" }),
      },
      expected: DateFilter.of(
        new DateRange(
          DateTime.fromISO("2024-03-10T00:00:00.000Z", { zone: "utc" }),
          DateTime.fromISO("2024-04-10T00:00:00.000Z", { zone: "utc" }),
        ),
      ),
    },
    {
      queries: ["narrative: bagel"],
      filter: "narrative: bagel",
      expected: FieldFilter.of("narrative", TextFilter.of("bagel")),
    },
    {
      queries: ["a b c", "a (b c)", "(a b) c"],
      filter: "(a b c)",
      expected: BooleanFilter.and(
        TextFilter.of("a"),
        TextFilter.of("b"),
        TextFilter.of("c"),
      ),
    },
    {
      queries: ["a,b,c", "a,(b,c)", "(a,b),c"],
      filter: "(a,b,c)",
      expected: BooleanFilter.or(
        TextFilter.of("a"),
        TextFilter.of("b"),
        TextFilter.of("c"),
      ),
    },
    {
      queries: ["a,b c"],
      filter: "(a,(b c))",
      expected: BooleanFilter.or(
        TextFilter.of("a"),
        BooleanFilter.and(TextFilter.of("b"), TextFilter.of("c")),
      ),
    },
    {
      queries: ["amount < 20"],
      filter: "amount < 20",
      expected: new FieldFilter("amount", new NumberFilter(20), "<"),
    },
    {
      queries: ["amount > 480.05"],
      filter: "amount > 480.05",
      expected: new FieldFilter("amount", new NumberFilter(480.05), ">"),
    },
    {
      queries: ["date: 2024-12-11"],
      filter: `date: ["2024-12-11T00:00:00.000Z" TO "2024-12-12T00:00:00.000Z")`,
      expected: new FieldFilter(
        "date",
        DateFilter.of(
          new DateRange(
            DateTime.fromISO("2024-12-11T00:00:00.000Z", { zone: "utc" }),
            DateTime.fromISO("2024-12-12T00:00:00.000Z", { zone: "utc" }),
          ),
        ),
      ),
    },
  ];

  testCases.forEach((testCase, i) => {
    testCase.queries.forEach((query, j) => {
      test(`${i}:${j} - ${query}`, () => {
        const [predicate, errors] = parseQuery(query, testCase.options);
        expect(errors).toEqual([]);
        if (testCase.expected) {
          expect(predicate).toEqual(testCase.expected);
        }
        if (testCase.filter) {
          expect(predicate.toString()).toEqual(testCase.filter);
        }
      });
    });
  });
});
