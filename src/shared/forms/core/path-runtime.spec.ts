import { describe, expect, it } from "vitest";
import { defineFormConfig } from "./path-config";
import { normalizePathField } from "./path-runtime";

type Locale = {
  month_names?: string[];
};

describe("path field normalization", () => {
  it("shows defaults without materializing missing source data", () => {
    const source: Locale = {};
    const config = defineFormConfig<Locale>()({
      id: "locale",
      defaults: { month_names: ["January", "February"] },
      fields: {
        "month_names.1": {
          kind: "text",
          defaultValue: "February",
          materializeDefaultFrom: "month_names",
        },
      },
    });
    const field = normalizePathField(
      config,
      "month_names.1",
      config.fields["month_names.1"],
    )!;

    expect(field.get(source, undefined)).toBe("February");
    expect(source).toEqual({});
    expect(field.set?.(source, "Feb", undefined)).toEqual({
      month_names: ["January", "Feb"],
    });
    expect(source).toEqual({});
  });
});
