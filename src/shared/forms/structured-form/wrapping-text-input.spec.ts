import { describe, expect, it } from "vitest";
import {
  inputModeForWrappingTextType,
  wrapsTextInputType,
} from "./wrapping-text-input";

describe("wrapping structured-form text controls", () => {
  it.each(["text", "email", "search", "tel", "url"])(
    "renders %s as wrapping text",
    (inputType) => {
      expect(wrapsTextInputType(inputType)).toBe(true);
    },
  );

  it.each(["date", "number", "password", "time"])(
    "keeps %s on a semantic native input",
    (inputType) => {
      expect(wrapsTextInputType(inputType)).toBe(false);
    },
  );

  it("preserves virtual-keyboard hints for typed wrapping controls", () => {
    expect(inputModeForWrappingTextType("email")).toBe("email");
    expect(inputModeForWrappingTextType("tel")).toBe("tel");
    expect(inputModeForWrappingTextType("url")).toBe("url");
    expect(inputModeForWrappingTextType("search")).toBeUndefined();
  });
});
