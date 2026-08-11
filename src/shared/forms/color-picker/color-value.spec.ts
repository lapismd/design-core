import { describe, expect, it } from "vitest";
import { colorValueForPicker, formatPickerColor } from "./color-value";

describe("color picker values", () => {
  it("normalizes long, short, and RGB colors for the native picker", () => {
    expect(colorValueForPicker("004F90")).toBe("#004f90");
    expect(colorValueForPicker("#abc")).toBe("#aabbcc");
    expect(colorValueForPicker("rgb(0, 79, 144)")).toBe("#004f90");
    expect(colorValueForPicker("rgba(128,128,128,0.4)")).toBe("#808080");
  });

  it("rejects unsupported or out-of-range colors", () => {
    expect(colorValueForPicker("currentColor")).toBeNull();
    expect(colorValueForPicker("rgb(0, 300, 0)")).toBeNull();
  });

  it("serializes with or without the hash", () => {
    expect(formatPickerColor("#004f90")).toBe("#004f90");
    expect(formatPickerColor("#004f90", "hex-without-hash")).toBe("004f90");
  });
});
