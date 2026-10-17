import { describe, it, expect } from "vitest";
import { safeLink } from "./safe-link.js";
describe("reference destinations", () => {
  it("retains supported web and local destinations", () => {
    for (const href of [
      "https://example.com/a",
      "/local/path",
      "#heading",
      "../relative",
    ])
      expect(safeLink(href)).toBe(href);
  });
  it("rejects executable, control-character and protocol-relative destinations", () => {
    for (const href of [
      "javascript:alert(1)",
      "data:text/html,<script>",
      "//elsewhere.test",
      "/\\elsewhere.test",
      "java\nscript:alert(1)",
    ])
      expect(safeLink(href)).toBeUndefined();
  });
});
