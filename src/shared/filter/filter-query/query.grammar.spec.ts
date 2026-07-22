import { describe, test } from "vitest";
import { testTree } from "@lezer/generator/dist/test";
import { filterQueryLanguage } from "./index.js";

const parser = filterQueryLanguage.parser;

/**
 * @see https://beancount.github.io/docs/beancount_language_syntax.html
 */
const testCases: Record<string, Array<{ input: string; expected: string }>> = {
  "Simple Expressions": [
    {
      input: "age",
      expected: "Filter(Expr(Value(Key)))",
    },
    {
      input: "age.number",
      expected: "Filter(Expr(Value(Key)))",
    },
    {
      input: `"restaurant"`,
      expected: "Filter(Expr(Value(String)))",
    },
    {
      input: `'restaurant'`,
      expected: "Filter(Expr(Value(String)))",
    },
  ],
  Numbers: [
    {
      input: "200",
      expected: "Filter(Expr(DateExpr(Date(Integer))))",
    },
    {
      input: "2000",
      expected: "Filter(Expr(DateExpr(Date(Integer))))",
    },
    {
      input: "2,000",
      expected: "Filter(Expr(DateExpr(Date(Integer))))",
    },
  ],
  "Filter by #tag or ^link": [
    {
      input: "#tag",
      expected: "Filter(Expr(Value(Tag)))",
    },
    {
      input: "-#tag",
      expected: "Filter(Expr(ExprNot(NOT(MINUS),Expr(Value(Tag)))))",
    },
    {
      input: "^link",
      expected: "Filter(Expr(Value(Link)))",
    },
    {
      input: "-^link",
      expected: "Filter(Expr(ExprNot(NOT(MINUS),Expr(Value(Link)))))",
    },
  ],
  "Filter by amount": [
    ...[":", "=", "!=", ">", ">=", "<", "<=", "~", "!~"].map((op) => ({
      input: `amount ${op} 100.20`,
      expected: "Filter(Expr(TermExpr(Key,OP,DateExpr(Date(Integer)))))",
    })),
  ],
  "Filter by any entry attribute": [
    {
      input: `payee:"restaurant"`,
      expected: "Filter(Expr(TermExpr(Key,OP,Value(String))))",
    },
    {
      input: `-payee:"restaurant"`,
      expected:
        "Filter(Expr(ExprNot(NOT(MINUS),Expr(TermExpr(Key,OP,Value(String))))))",
    },
    {
      input: `narration:'Dinner with Joe'`,
      expected: "Filter(Expr(TermExpr(Key,OP,Value(String))))",
    },
  ],
};

for (const [key, cases] of Object.entries(testCases)) {
  describe(key, () => {
    cases.forEach((testCase) =>
      test(testCase.input, () =>
        testTree(parser.parse(testCase.input), testCase.expected),
      ),
    );
  });
}
