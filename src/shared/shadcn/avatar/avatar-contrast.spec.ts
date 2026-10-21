import { describe, expect, it } from "vitest";
import { avatarContrast } from "./avatar-contrast.js";

describe("avatar initials contrast", () => {
  it.each(["#6e56cf", "#000", " #123456 "])(
    "uses white on %s",
    (background) => {
      expect(avatarContrast(background)).toBe("#ffffff");
    },
  );
  it.each(["#fff", "#FFFFFF", "#ffcc00"])("uses black on %s", (background) => {
    expect(avatarContrast(background)).toBe("#000000");
  });
  it.each([
    undefined,
    "transparent",
    "var(--accent)",
    "#0000",
    "#00000080",
    "#invalid",
  ])("retains theme semantics for %s", (background) => {
    expect(avatarContrast(background)).toBeUndefined();
  });
});
