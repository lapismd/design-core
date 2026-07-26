import { DateTime } from "luxon";
import { getDuration, writeString } from "./parser";
import type { Interval } from "./parser";

export enum FilterType {
  OR = "OR",
  AND = "AND",
  NOT = "NOT",
}

const ESCAPE_PATTERN = new RegExp(
  "(\\" +
    ["/", ".", "*", "+", "?", "|", "(", ")", "[", "]", "{", "}", "\\"].join(
      "|\\",
    ) +
    ")",
  "g",
);

export function escapeRegex(input: string) {
  return input.replace(ESCAPE_PATTERN, "\\$1");
}

export type RangeInclusivity = "()" | "[)" | "(]" | "[]";

export class DateRange {
  readonly from: DateTime;
  readonly to: DateTime;
  /**
   * @param from The start date of this range of dates.
   * @param to The end date of this range of dates.
   * @param inclusivity A [ indicates inclusion of a value. A ( indicates
   *   exclusion. If the inclusivity parameter is used, both indicators must be
   *   passed.
   */
  constructor(
    from: DateTime,
    to: DateTime,
    readonly inclusivity: RangeInclusivity = "[)",
  ) {
    if (from < to) {
      this.from = from;
      this.to = to;
    } else {
      this.from = to;
      this.to = from;
    }
  }

  intervals(interval: Interval, unit: number = 1): Array<DateTime> {
    const dates: Array<DateTime> = [];
    let start: DateTime = this.from;
    if (this.inclusivity.startsWith("[")) {
      dates.push(this.from);
      start = start.plus(getDuration(interval, unit));
    }

    while (start < this.to) {
      dates.push(start);
      start = start.plus(getDuration(interval, unit));
    }
    return dates;
  }

  get endInclusive(): DateTime {
    if (this.inclusivity.endsWith(")")) {
      return this.to.minus({ day: 1 });
    }
    return this.to;
  }

  inclusiveEnd() {
    return new DateRange(this.from, this.endInclusive, "[]");
  }

  contains(date: Date | DateTime): boolean {
    if (date instanceof Date) {
      return this.contains(DateTime.fromJSDate(date, { zone: "utc" }));
    }
    switch (this.inclusivity) {
      case "()":
        return date > this.from && date < this.to;
      case "[)":
        return date >= this.from && date < this.to;
      case "(]":
        return date > this.from && date <= this.to;
      case "[]":
        return date >= this.from && date <= this.to;
    }
  }

  public toString() {
    return `${this.inclusivity.charAt(0)}${writeString(this.from.toString())} TO ${writeString(this.to.toString())}${this.inclusivity.charAt(1)}`;
  }
}

export type Op = ":" | ">" | "=" | "<" | "!=" | ">=" | "<=" | "~" | "!~";

export type VisitorContext = Record<string, unknown> & {
  op: Op;
};

export interface FilterVisitor<T> {
  accept(filter: Filter, entity: T, context: VisitorContext): boolean;
}

export abstract class AbstractFilterVisitor<T> implements FilterVisitor<T> {
  abstract visitTagFilter(
    filter: TagFilter,
    entity: T,
    context: VisitorContext,
  ): boolean;
  abstract visitLinkFilter(
    filter: LinkFilter,
    entity: T,
    context: VisitorContext,
  ): boolean;
  abstract visitNumberFilter(
    filter: NumberFilter,
    entity: T,
    context: VisitorContext,
  ): boolean;
  abstract visitTextFilter(
    filter: TextFilter,
    entity: T,
    context: VisitorContext,
  ): boolean;
  abstract visitPatternFilter(
    filter: PatternFilter,
    entity: T,
    context: VisitorContext,
  ): boolean;
  abstract visitAccountFilter(
    filter: AccountFilter,
    entity: T,
    context: VisitorContext,
  ): boolean;
  abstract visitFieldFilter(
    filter: FieldFilter,
    entity: T,
    context: VisitorContext,
  ): boolean;
  abstract visitDateFilter(
    filter: DateFilter,
    entity: T,
    context: VisitorContext,
  ): boolean;
  abstract visitBooleanFilter(
    filter: BooleanFilter,
    entity: T,
    context: VisitorContext,
  ): boolean;

  accept(filter: Filter, entity: T, context: VisitorContext): boolean {
    if (filter instanceof TagFilter) {
      return this.visitTagFilter(filter, entity, context);
    } else if (filter instanceof LinkFilter) {
      return this.visitLinkFilter(filter, entity, context);
    } else if (filter instanceof NumberFilter) {
      return this.visitNumberFilter(filter, entity, context);
    } else if (filter instanceof TextFilter) {
      return this.visitTextFilter(filter, entity, context);
    } else if (filter instanceof PatternFilter) {
      return this.visitPatternFilter(filter, entity, context);
    } else if (filter instanceof AccountFilter) {
      return this.visitAccountFilter(filter, entity, context);
    } else if (filter instanceof FieldFilter) {
      return this.visitFieldFilter(filter, entity, context);
    } else if (filter instanceof DateFilter) {
      return this.visitDateFilter(filter, entity, context);
    } else if (filter instanceof BooleanFilter) {
      return this.visitBooleanFilter(filter, entity, context);
    }
    throw new Error(
      `Unrecognized filter value (${filter}). This can happen when multiple package instances are loaded, breaking instanceof checks.`,
    );
  }
}

export abstract class Filter {
  accept<T>(
    visitor: FilterVisitor<T>,
    entity: T,
    context: VisitorContext,
  ): boolean {
    return visitor.accept(this, entity, context);
  }
}

export class TagFilter extends Filter {
  public readonly tag: string;
  constructor(tag: string) {
    super();
    this.tag = tag.trim().replace(/^#+/, "");
  }

  public toString() {
    return "#" + this.tag;
  }

  static of(value: string) {
    return new TagFilter(value);
  }
}

export class LinkFilter extends Filter {
  public readonly link: string;
  constructor(link: string) {
    super();
    this.link = link.trim().replace(/^\^+/, "");
  }

  public toString() {
    return "^" + this.link;
  }

  static of(value: string) {
    return new LinkFilter(value);
  }
}

export class NumberFilter extends Filter {
  constructor(readonly value: string | number) {
    super();
  }

  static of(value: string | number) {
    return new NumberFilter(value);
  }

  public toString() {
    return this.value;
  }
}

export class TextFilter extends Filter {
  constructor(readonly value: string) {
    super();
  }

  pattern(flags: string = "ig") {
    return PatternFilter.of(this.value, flags);
  }

  static of(value: string) {
    return new TextFilter(value);
  }

  public toString() {
    return this.value;
  }
}

export class PatternFilter extends Filter {
  constructor(readonly value: RegExp) {
    super();
  }

  static of(value: RegExp | string, flags: string = "ig") {
    if (value instanceof RegExp) {
      return new PatternFilter(value);
    }
    try {
      return new PatternFilter(new RegExp(value, flags));
    } catch (_) {
      return new PatternFilter(new RegExp(escapeRegex(value), flags));
    }
  }

  public toString() {
    return this.value;
  }
}

export class AccountFilter extends Filter {
  constructor(readonly value: string) {
    super();
  }

  /** Case-insensitive search (no `g` — RegExp#test is stateful with /g). */
  pattern(flags: string = "i") {
    return PatternFilter.of(this.value, flags);
  }

  public toString() {
    return `account: ${this.value}`;
  }

  static of(value: string) {
    return new AccountFilter(value);
  }
}

export class FieldFilter extends Filter {
  constructor(
    readonly field: string,
    readonly value: Filter,
    readonly op: Op = ":",
  ) {
    super();
  }

  public toString() {
    if (this.op === ":") {
      return `${this.field}${this.op} ${this.value}`;
    }
    return `${this.field} ${this.op} ${this.value}`;
  }

  static of(field: string, value: Filter) {
    return new FieldFilter(field, value);
  }
}

export class DateFilter extends Filter {
  constructor(readonly range: DateRange) {
    super();
  }

  public toString() {
    return this.range.toString();
  }

  static of(value: DateRange) {
    return new DateFilter(value);
  }
}

export class BooleanFilter extends Filter {
  constructor(
    readonly op: FilterType,
    readonly args: Array<Filter>,
  ) {
    super();
  }

  add(predicate: Filter) {
    if (predicate instanceof BooleanFilter && predicate.op === this.op) {
      this.args.push(...predicate.args);
    } else {
      this.args.push(predicate);
    }
  }

  public toString() {
    if (!this.args.length) {
      return "";
    }

    const size = this.args.length;
    if (this.op == FilterType.NOT) {
      if (size == 1) {
        return `-${this.args[0]}`;
      }
      return `-(${this.args.map((it) => it.toString()).join("")})`;
    }

    const separator = this.op === FilterType.AND ? " " : ",";
    return size == 1
      ? this.args[0].toString()
      : `(${this.args.map((it) => it.toString()).join(separator)})`;
  }

  static and(...args: Array<Filter>) {
    return new BooleanFilter(FilterType.AND, args);
  }

  static or(...args: Array<Filter>) {
    return new BooleanFilter(FilterType.OR, args);
  }

  static not(...args: Array<Filter>) {
    return new BooleanFilter(FilterType.NOT, args);
  }
}
