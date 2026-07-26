import { describe, expect, it } from "vitest";
import { shouldUseWorkspacePointerDrag } from "./workspace-pointer-drag-policy.js";

describe("shouldUseWorkspacePointerDrag", () => {
  it("leaves fine-pointer mouse input to native HTML5 dragging", () => {
    expect(shouldUseWorkspacePointerDrag("auto", "mouse", false)).toBe(false);
  });

  it("uses pointer dragging for coarse mouse, touch, and pen input", () => {
    expect(shouldUseWorkspacePointerDrag("auto", "mouse", true)).toBe(true);
    expect(shouldUseWorkspacePointerDrag("auto", "touch", false)).toBe(true);
    expect(shouldUseWorkspacePointerDrag("auto", "pen", false)).toBe(true);
  });

  it("honours explicit HTML5 and pointer strategies", () => {
    expect(shouldUseWorkspacePointerDrag("html5", "touch", true)).toBe(false);
    expect(shouldUseWorkspacePointerDrag("pointer", "mouse", false)).toBe(true);
  });
});
