import { describe, expect, it } from "vitest";

import { applyJsonPatch, pointerValue } from "./json-patch";

describe("json-patch", () => {
  it("applies replace, add, and remove operations", () => {
    const base = { name: "Ada", tags: ["a"], nested: { role: "eng" } };
    const next = applyJsonPatch(base, [
      { op: "replace", path: "/name", value: "Grace" },
      { op: "add", path: "/tags/-", value: "b" },
      { op: "remove", path: "/nested/role" },
    ]);

    expect(next).toEqual({ name: "Grace", tags: ["a", "b"], nested: {} });
    expect(base.name).toBe("Ada");
  });

  it("reads pointer values", () => {
    const value = { items: [{ title: "One" }] };
    expect(pointerValue(value, "/items/0/title")).toBe("One");
    expect(pointerValue(value, "/items/2")).toBeUndefined();
  });

  it("enforces requiredRoot when provided", () => {
    expect(() =>
      applyJsonPatch(
        { notes: { title: "A" } },
        [{ op: "replace", path: "/other/title", value: "B" }],
        "notes",
      ),
    ).toThrow("Patch path must target /notes");
  });
});
