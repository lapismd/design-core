import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(
  new URL("./CompleteCvForm.css", import.meta.url),
  "utf8",
);

describe("Complete CV story styling boundary", () => {
  it("keeps configured form styling in reusable form components", () => {
    expect(css).toContain(".complete-cv-shell");
    expect(css).not.toMatch(
      /ui-configured-|cv-form-field|cv-form-entry|cv-form-section|ui-form-add-button/,
    );
  });
});
