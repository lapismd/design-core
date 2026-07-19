import { describe, expect, it } from "vitest";
import {
  buildButtonOwnership,
  remapCompiledCss,
} from "../transform/selector-remapper.js";

describe("remapCompiledCss", () => {
  it("replaces whole class tokens only", () => {
    const css = `
.px-2 { padding-inline: 0.5rem }
.px-2\\.5 { padding-inline: 0.625rem }
.border-border { border-color: red }
.border { border-width: 1px }
`;
    const ownership = [
      { candidate: "px-2", selector: '[data-ui-component="button"][data-size="xs"]' },
      {
        candidate: "px-2.5",
        selector: '[data-ui-component="button"][data-size="default"]',
      },
      {
        candidate: "border-border",
        selector: '[data-ui-component="button"][data-variant="outline"]',
      },
      { candidate: "border", selector: '[data-ui-component="button"]' },
    ];
    const out = remapCompiledCss(css, ownership).replace(/\s+/g, "");
    expect(out).toContain(
      '[data-ui-component="button"][data-size="xs"]{padding-inline:0.5rem}',
    );
    expect(out).toContain(
      '[data-ui-component="button"][data-size="default"]{padding-inline:0.625rem}',
    );
    expect(out).toContain(
      '[data-ui-component="button"][data-variant="outline"]{border-color:red}',
    );
    expect(out).toContain('[data-ui-component="button"]{border-width:1px}');
    expect(out).not.toContain('[data-ui-component="button"]-border');
    expect(out).not.toContain("\\.5");
  });

  it("keeps shared utilities for every owning variant/size", () => {
    const css = `.px-2\\.5 { padding-inline: 0.625rem }`;
    const ownership = [
      {
        candidate: "px-2.5",
        selector: '[data-ui-component="button"][data-size="default"]',
      },
      {
        candidate: "px-2.5",
        selector: '[data-ui-component="button"][data-size="sm"]',
      },
      {
        candidate: "px-2.5",
        selector: '[data-ui-component="button"][data-size="lg"]',
      },
    ];
    const out = remapCompiledCss(css, ownership);
    expect(out).toContain('[data-size="default"]');
    expect(out).toContain('[data-size="sm"]');
    expect(out).toContain('[data-size="lg"]');
  });
});

describe("buildButtonOwnership", () => {
  it("maps base and variant classes", () => {
    const ownership = buildButtonOwnership(
      "button",
      ["inline-flex"],
      { variant: { default: "bg-primary" } },
    );
    expect(ownership).toEqual([
      { candidate: "inline-flex", selector: '[data-ui-component="button"]' },
      {
        candidate: "bg-primary",
        selector: '[data-ui-component="button"][data-variant="default"]',
      },
    ]);
  });
});
