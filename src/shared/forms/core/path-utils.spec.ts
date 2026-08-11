import { describe, expect, it } from "vitest";
import {
  formPathParts,
  getFormValueAtPath,
  moveFormArrayItem,
  removeFormArrayItem,
  setFormValueAtPath,
  setFormValueWithDefault,
} from "./path-utils";

describe("config-driven form path helpers", () => {
  it("reads object and numeric array paths", () => {
    const value = { groups: [{ name: "First" }, { name: "Second" }] };

    expect(formPathParts("groups.1.name")).toEqual(["groups", 1, "name"]);
    expect(getFormValueAtPath(value, "groups.1.name")).toBe("Second");
  });

  it("immutably updates a leaf and preserves unknown siblings", () => {
    const value = {
      profile: { name: "John", unknown: { preserved: true } },
      external: "keep",
    };

    const next = setFormValueAtPath(value, "profile.name", "Jane");

    expect(next).toEqual({
      profile: { name: "Jane", unknown: { preserved: true } },
      external: "keep",
    });
    expect(next).not.toBe(value);
    expect(next.profile).not.toBe(value.profile);
    expect(next.profile.unknown).toBe(value.profile.unknown);
  });

  it("materializes a typed default branch only when first edited", () => {
    const value: { locale?: { months?: string[] } } = {};
    const defaults = { locale: { months: ["January", "February"] } };

    expect(getFormValueAtPath(value, "locale.months.1")).toBeUndefined();
    const next = setFormValueWithDefault(
      value,
      "locale.months.1",
      "Feb",
      defaults,
      "locale.months",
    );

    expect(next).toEqual({ locale: { months: ["January", "Feb"] } });
    expect(value).toEqual({});
  });

  it("moves and removes array values without mutating the input", () => {
    const values = ["one", "two", "three"];

    expect(moveFormArrayItem(values, 1, -1)).toEqual(["two", "one", "three"]);
    expect(moveFormArrayItem(values, 0, -1)).toBe(values);
    expect(removeFormArrayItem(values, 1)).toEqual(["one", "three"]);
    expect(values).toEqual(["one", "two", "three"]);
  });
});
