import {
  AccountFilter,
  BooleanFilter,
  DateFilter,
  DateRange,
  FieldFilter,
  Filter,
  FilterType,
  LinkFilter,
  NumberFilter,
  PatternFilter,
  TagFilter,
  TextFilter,
} from "./filters";
import type { Op } from "./filters";
import { parser } from "./query.js";
import { Tree, type SyntaxNode, type SyntaxNodeRef } from "@lezer/common";
import { DateTime, Duration } from "luxon";
import type { DurationLikeObject } from "luxon";

export function isValidNumber(value: string) {
  value = value.trim().replaceAll(/[,]/g, "");
  return /^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i.test(value);
}

export function readString(value: string) {
  if (/^\s*["]/.test(value) && /["]\s*$/.test(value)) {
    return value
      .replace(/^\s*["]/, "")
      .replace(/["]\s*$/, "")
      .replaceAll('\\"', '"');
  } else if (/^\s*[']/.test(value) && /[']\s*$/.test(value)) {
    return value
      .replace(/^\s*[']/, "")
      .replace(/[']\s*$/, "")
      .replaceAll("\\'", "'");
  }
  return value;
}

export function writeString(value: string) {
  return '"' + value.replaceAll(/["]/g, '\\"') + '"';
}

export interface QueryParserOptions {
  now?: DateTime;
}

export function parseQuery(
  query: string,
  options: QueryParserOptions = {},
): [Filter, Array<string>, Tree] {
  const ast = new Parser(query, options);
  return [ast.predicate, ast.errors, ast.tree];
}

export type Interval =
  | "year"
  | "month"
  | "day"
  | "week"
  | "quarter"
  | "hour"
  | "minute"
  | "second";

export const DEFAULT_INTERVAL: Interval = "month";

export const INTERVALS: Interval[] = [
  "year",
  "quarter",
  "month",
  "week",
  "day",
  "hour",
  "minute",
  "second",
];

const intervalAliases: Record<string, string> = {
  q: "quarter",
  Q: "quarter",
  y: "year",
  yr: "year",
  Y: "year",
  M: "month",
  mon: "month",
  mth: "month",
  w: "week",
  wk: "week",
  W: "week",
  d: "day",
  dy: "day",
  D: "day",
  now: "day",
  today: "day",
  h: "hour",
  hr: "hour",
  hrs: "hours",
  H: "hour",
  m: "minute",
  min: "minute",
  s: "second",
  sec: "second",
  S: "second",
};

export function findInterval(s: string | null): Interval | null {
  s = (s || "").trim();
  s = intervalAliases[s] || s;
  s = s
    .trim()
    .toLocaleLowerCase()
    .replaceAll(/[^a-z]+/g, "");
  return INTERVALS.find((v) => s && s.startsWith(v)) ?? null;
}

export function getInterval(s: string | null): Interval {
  const value = findInterval(s);
  if (value) {
    return value;
  }
  throw new Error(`Unsupported value for interval: {${s}}`);
}

export function getDuration(
  s: string | null | Interval,
  units: number,
): DurationLikeObject {
  const interval = findInterval(s);
  switch (interval) {
    case "year":
      return { year: units };
    case "quarter":
      return { quarter: units };
    case "month":
      return { month: units };
    case "week":
      return { week: units };
    case "day":
      return { day: units };
    case "hour":
      return { hour: units };
    case "minute":
      return { minute: units };
    case "second":
      return { second: units };
  }
  throw new Error(`Unsupported value for interval: ${s}`);
}

export class DateType {
  duration: Interval;
  dt: DateTime;
  constructor(
    readonly value: string | DateTime,
    duration?: Interval,
    now?: DateTime,
  ) {
    if (typeof value === "string") {
      value = value.trim().replace(/[()]/g, "");
      if (value === "now" || value === "today") {
        value = "day";
      }
      const interval = findInterval(value);
      if (interval) {
        this.duration = interval;
        this.dt = (now ?? DateTime.now()).startOf(this.duration);
      } else if (/^[0-9]{4}$/.test(value)) {
        this.duration = "year";
        this.dt = DateTime.fromFormat(value, "yyyy", { zone: "utc" });
      } else if (/^[0-9]{4}-Q[1-4]$/.test(value)) {
        this.duration = "quarter";
        this.dt = DateTime.fromFormat(value, "yyyy-'Q'Q", { zone: "utc" });
      } else if (/^[0-9]{4}-W[0-9]{1,2}$/.test(value)) {
        this.duration = "week";
        this.dt = DateTime.fromFormat(value, "yyyy-'W'w", { zone: "utc" });
      } else if (/^[0-9]{4}-[0-9]{1,2}$/.test(value)) {
        this.duration = "month";
        this.dt = DateTime.fromFormat(value, "yyyy-MM", { zone: "utc" });
      } else if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value)) {
        this.duration = "day";
        this.dt = DateTime.fromFormat(value, "yyyy-MM-dd", { zone: "utc" });
      } else {
        throw new Error("Invalid date: " + value);
      }
    } else {
      this.dt = value;
      this.duration = duration ?? "day";
    }
  }

  isRelative(): boolean {
    if (typeof this.value === "string") {
      return /(^\((year|month|day|week|quarter)\)$)/.test(this.value);
    }
    return false;
  }

  add(number: number | Duration): DateType {
    if (number instanceof Duration) {
      return new DateType(this.dt.plus(number), this.duration);
    }
    return new DateType(
      this.dt.plus(getDuration(this.duration, number)),
      this.duration,
    );
  }

  div(interval: Interval) {
    // `/month` rounds the date down to the beginning of that interval while
    // preserving the original range duration. For example, `now/month` is
    // the first day of the current month, whereas `month/month` remains the
    // whole current month.
    return new DateType(this.dt.startOf(interval), this.duration);
  }

  subtract(number: number | Duration): DateType {
    if (number instanceof Duration) {
      return new DateType(this.dt.minus(number), this.duration);
    }
    if (this.isRelative()) {
      switch (this.duration) {
        case "year":
          return new DateType(
            this.dt.set(getDuration("month", number)),
            this.duration,
          );
        case "quarter":
          return new DateType(
            this.dt.set(getDuration("quarter", number)),
            this.duration,
          );
        case "month":
          return new DateType(
            this.dt.set(getDuration("day", number)),
            this.duration,
          );
        case "day":
          return new DateType(
            this.dt.set(getDuration("day", number)),
            this.duration,
          );
        case "week":
          return new DateType(
            this.dt.set(getDuration("week", number)),
            this.duration,
          );
      }
    }

    return new DateType(
      this.dt.minus(getDuration(this.duration, number)),
      this.duration,
    );
  }

  get date(): DateTime {
    return this.dt;
  }

  get end(): DateTime {
    return this.dt.endOf(this.duration);
  }

  get range(): DateRange {
    return new DateRange(this.dt, this.dt.plus(getDuration(this.duration, 1)));
  }

  public toString() {
    return this.value.toString();
  }
}

type DateExpressionInput =
  | Interval
  | number
  | DateType
  | DateExpression
  | Duration;

export class DateExpression {
  #operands: Array<DateExpressionInput> = [];
  op: string;

  constructor(
    value: DateExpressionInput | Array<DateExpressionInput>,
    op: string = "",
  ) {
    this.op = op;
    if (Array.isArray(value)) {
      this.#operands.push(...value);
    } else {
      this.#operands.push(value);
    }
    if (this.#operands.length < 1 || this.#operands.length > 2) {
      throw new Error(
        `Invalid DateExpression expected  2 operands found ${this.#operands.length}`,
      );
    }
  }

  get value() {
    return this.resolve();
  }

  get operands() {
    return [...this.#operands];
  }

  resolve(): DateExpressionInput | DateRange {
    if (this.#operands.length == 1) {
      if (this.#operands[0] instanceof DateExpression) {
        return this.#operands[0].resolve();
      } else {
        return this.#operands[0];
      }
    }
    return this.eval(this.#operands[0], this.#operands[1]);
  }

  private eval(left: DateExpressionInput, right: DateExpressionInput) {
    const l: DateExpressionInput | DateRange =
      left instanceof DateExpression ? left.resolve() : left;
    const r: DateExpressionInput | DateRange =
      right instanceof DateExpression ? right.resolve() : right;

    if (typeof l === "number" && typeof r === "number") {
      switch (this.op) {
        case "*":
          return l * r;
        case "-":
          return l - r;
        case "/":
          return l / r;
        case "+":
          return l + r;
      }
    } else if (l instanceof DateType && typeof r === "number") {
      switch (this.op) {
        case "-":
          return l.subtract(r);
        case "+":
          return l.add(r);
      }
    } else if (l instanceof DateType && r instanceof Duration) {
      switch (this.op) {
        case "-":
          return l.subtract(r);
        case "+":
          return l.add(r);
      }
    } else if (
      l instanceof DateType &&
      r instanceof DateType &&
      this.op === "-"
    ) {
      return new DateRange(l.date, r.end);
    } else if (
      l instanceof DateType &&
      typeof r === "string" &&
      this.op == "/"
    ) {
      const interval = findInterval(r);
      if (interval) {
        return l.div(interval);
      }
    }
    throw new Error("Unsupported expression: " + this.toString());
  }

  times(value: DateExpressionInput) {
    return new DateExpression([this, value], "*");
  }

  plus(value: DateExpressionInput) {
    return new DateExpression([this, value], "+");
  }

  minus(value: DateExpressionInput) {
    return new DateExpression([this, value], "-");
  }

  div(value: DateExpressionInput) {
    return new DateExpression([this, value], "/");
  }

  public toString(): string {
    if (this.#operands.length == 1) {
      const operand = this.#operands[0];
      if (!operand) {
        throw new Error("Date expression is missing an operand");
      }
      if (operand instanceof DateExpression) {
        return "(" + this.#operands[0] + ")";
      }
      return operand.toString() ?? "";
    }
    return this.#operands[0] + " " + this.op + " " + this.#operands[1];
  }

  get hasRange(): boolean {
    if (typeof this.resolve() === "number") {
      return false;
    }
    return true;
  }

  get range(): DateRange {
    const value = this.resolve();
    if (value instanceof DateRange) {
      return value;
    } else if (value instanceof DateType) {
      return value.range;
    }
    throw new Error(`invalid date expression, no range: ${this.toString()}`);
  }

  get numeric(): boolean {
    if (typeof this.resolve() === "number") {
      return true;
    }
    return false;
  }
}

export function dateExpression(
  node: SyntaxNode | null | undefined,
  props: {
    content: (node: SyntaxNode | null) => string;
    now?: DateTime;
  },
): DateExpression | null {
  if (!node) {
    return null;
  }

  const date = node.getChild("Date");
  const duration = node.getChild("Duration");

  const op =
    node.getChild("PLUS") ||
    node.getChild("MINUS") ||
    node.getChild("ASTERISK") ||
    node.getChild("SLASH");

  const operands = node.getChildren("DateExpr") || [];
  operands.push(...(node.getChildren("Interval") || []));
  operands.push(...(node.getChildren("Date") || []));

  if (date) {
    const number = props.content(date.getChild("Integer"));
    if (number) {
      const x = new DateExpression(
        /^(19|20)\d{2}$/.test(number)
          ? new DateType(props.content(date), undefined, props.now)
          : +number,
      );
      return x;
    } else {
      return new DateExpression(
        new DateType(props.content(date), undefined, props.now),
      );
    }
  } else if (duration) {
    const number = +props.content(duration.getChild("Integer"));
    return new DateExpression(
      Duration.fromObject(
        getDuration(props.content(duration.getChild("Interval")), number),
      ),
    );
  }
  const expressionOperands = operands.flatMap((node): DateExpressionInput[] => {
    if (node.name === "DateExpr") {
      const expression = dateExpression(node, props);
      return expression ? [expression] : [];
    } else if (node.name === "Interval") {
      const value = props.content(node);
      const interval = findInterval(value);
      if (interval) {
        return [interval];
      }
      const expression = dateExpression(node, props);
      return expression ? [expression] : [];
    }
    return [];
  });
  const x = new DateExpression(expressionOperands, op ? props.content(op) : "");
  return x;
}

export class Parser {
  tree: Tree;
  predicate!: Filter;
  private stack: Array<Filter> = [];
  readonly errors: Array<string> = [];

  constructor(
    readonly contents: string,
    readonly options: QueryParserOptions,
  ) {
    this.tree = parser.configure({ strict: false }).parse(contents);
    this.stack.push(new BooleanFilter(FilterType.AND, []));
    this.tree.cursor().iterate((node) => {
      try {
        return this.enter(node);
      } catch (e: unknown) {
        this.errors.push(node.toString() + ":" + String(e));
      }
    }, this.leave.bind(this));

    if (this.stack.length == 1) {
      const filter = this.stack[0];
      if (filter instanceof BooleanFilter) {
        this.predicate = filter.args.length == 1 ? filter.args[0] : filter;
      } else {
        this.errors.push(
          `Expected {${filter}} to be instance of BooleanFilter`,
        );
      }
    } else {
      this.errors.push(
        `Found multiple(${this.stack.length} ) unexpected filters in the stack`,
      );
    }
  }

  private enter(node: SyntaxNodeRef) {
    if (node.type.isError) {
      this.errors.push(`node: ${node}`);
    }
    if (node.name === "ExprAnd") {
      this.stack.push(new BooleanFilter(FilterType.AND, []));
    } else if (node.name === "ExprOr") {
      this.stack.push(new BooleanFilter(FilterType.OR, []));
    } else if (node.name === "ExprNot") {
      this.stack.push(new BooleanFilter(FilterType.NOT, []));
    } else if (node.name === "Value") {
      this.add(this.resolve(node));
      return false;
    } else if (node.name === "TermExpr") {
      const op = node.node.getChild("OP");
      const value =
        node.node.getChild("Integer") ||
        node.node.getChild("DateExpr") ||
        node.node.getChild("Value") ||
        op?.nextSibling;
      if (!op || !value) {
        this.errors.push(
          `Expected Term OP <Value|Number> found ${node.toString()}`,
        );
        return false;
      }

      const operand = this.content(op) as Op;
      if (value.name === "DateExpr") {
        const expr = this.dateExpression(value);
        if (!expr) {
          this.errors.push(`invalid date expression: ${this.content(node)}`);
          return false;
        }
        const exprValue = expr.resolve();
        if (typeof exprValue === "number") {
          this.add(
            new FieldFilter(
              this.content(node.node.getChild("Key")),
              new NumberFilter(exprValue),
              operand,
            ),
          );
        } else if (exprValue instanceof DateType) {
          this.add(
            new FieldFilter(
              this.content(node.node.getChild("Key")),
              new DateFilter(exprValue.range),
              operand,
            ),
          );
        } else if (exprValue instanceof DateRange) {
          this.add(
            new FieldFilter(
              this.content(node.node.getChild("Key")),
              new DateFilter(exprValue),
              operand,
            ),
          );
        } else {
          this.errors.push(
            `Invalid DateExpr: ${exprValue} : ${node.toString()}`,
          );
        }
        return false;
      } else if (value.name === "Integer") {
        this.add(
          new FieldFilter(
            this.content(node.node.getChild("Key")),
            new NumberFilter(this.content(value)),
            operand,
          ),
        );
        return false;
      }

      this.add(
        new FieldFilter(
          this.content(node.node.getChild("Key")),
          this.resolve(value),
          operand as Op,
        ),
      );
      return false;
    } else if (node.name === "DateExpr") {
      const expr = this.dateExpression(node.node);
      if (!expr) {
        this.errors.push(`invalid date expression: ${this.content(node)}`);
        return false;
      }
      if (!expr.numeric) {
        this.add(DateFilter.of(expr.range));
      } else {
        const value = expr.resolve();
        if (typeof value === "number") {
          this.add(NumberFilter.of(value));
        }
      }
      return false;
    } else if (node.name === "Expr") {
      const content = this.content(node).trim();
      if (
        isValidNumber(content) ||
        /^([-])?\d{1,3}(,\d{3})*(\.\d+)?$/.test(content)
      ) {
        if (/^(19|20)\d{2}$/.test(content)) {
          this.add(
            DateFilter.of(new DateExpression(new DateType(content)).range),
          );
        } else {
          this.add(NumberFilter.of(content.replace(/,/g, "")));
        }
        return false;
      }
    }
  }

  private resolve(node: SyntaxNodeRef): Filter {
    if (node.name == "Value") {
      const child = node.node.firstChild;
      return child ? this.resolve(child) : new TextFilter("");
    } else if (node.name === "Tag") {
      return new TagFilter(this.content(node));
    } else if (node.name === "Link") {
      return new LinkFilter(this.content(node));
    } else if (node.name === "Key") {
      return new TextFilter(this.content(node));
    } else if (node.name === "String") {
      return new TextFilter(readString(this.content(node)));
    } else if (node.name === "Integer") {
      return new NumberFilter(this.content(node));
    } else if (node.name === "Regex") {
      const value = this.content(node).match(/\/(.+)\/([a-z]+)?/) || [];
      return new PatternFilter(new RegExp(value[1], value[2] ?? ""));
    } else if (node.name === "AccountName") {
      return new AccountFilter(this.content(node));
    }
    return new TextFilter(readString(this.content(node)));
  }

  private add(predicate: Filter) {
    const last = this.stack.length
      ? this.stack[this.stack.length - 1]
      : undefined;
    if (last instanceof BooleanFilter) {
      last.add(predicate);
      return;
    }
    this.errors.push(`Expected ${last} to be instance of BooleanFilter`);
  }

  private leave(node: SyntaxNodeRef) {
    if (["ExprAnd", "ExprOr", "ExprNot"].includes(node.name)) {
      this.handleBooleanFilter();
    }
  }

  private content(pos?: { from: number; to: number } | null) {
    if (!pos) {
      return "";
    }
    return this.contents.substring(pos.from, pos.to);
  }

  private handleBooleanFilter() {
    const predicate = this.stack.pop();
    if (!predicate) {
      this.errors.push(
        "invalid boolean filter, expected boolean filter found nothing",
      );
      return;
    }

    this.add(predicate);
  }

  private dateExpression(node: SyntaxNode | null | undefined) {
    return dateExpression(node, {
      content: this.content.bind(this),
      now: this.options.now,
    });
  }
}
