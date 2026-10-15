import { describe, expect, it } from "vitest";
import {
  buildButtonOwnership,
  remapCompiledCss,
  remapMarkerSelectors,
} from "../transform/selector-remapper.js";

import { assertNoUtilitySelectors } from "../../lib/style-utilities.mjs";
import {
  semanticMarkers,
  semanticMarkerStyles,
} from "../transform/semantic-markers.js";

describe("remapCompiledCss", () => {
  it("rejects an unresolved external marker instead of emitting dead CSS", () => {
    const out = remapCompiledCss(
      ".opacity-50:is(:where(.group\\/unknown) *) { opacity: .5 }",
      [{ candidate: "opacity-50", selector: '[data-slot="label"]' }],
    );
    expect(() => assertNoUtilitySelectors(out, "label conversion")).toThrow(
      /group\/unknown/,
    );
  });

  it("maps external field and label relationships without dropping unrelated rules", () => {
    const checkbox = remapMarkerSelectors(
      '[data-slot="checkbox"]:is(:where(.group\\/field):has(:disabled) *) { opacity: .5 }',
      semanticMarkers("checkbox"),
    );
    const label = remapMarkerSelectors(
      '[data-slot="label"]:is(:where(.peer):disabled ~ *) { opacity: .5 } .semantic { color: red }',
      semanticMarkers("label"),
    );
    expect(checkbox).toContain('[data-slot="field"]');
    expect(label).toContain(":is(input, button, select, textarea)");
    expect(label).toContain(".semantic { color: red }");
    expect(() => assertNoUtilitySelectors(checkbox + label)).not.toThrow();
  });

  it.each(["card", "input-group"])(
    "keeps %s divider paint with its semantic padding condition",
    (family) => {
      const out =
        remapMarkerSelectors(
          '[data-slot="part"].border-b { padding-bottom: 1rem }',
          semanticMarkers(family),
        ) + semanticMarkerStyles(family);
      expect(out).toContain('[data-slot="part"][data-divided="true"]');
      expect(out).toContain("border-bottom: 1px solid var(--border)");
      expect(() => assertNoUtilitySelectors(out)).not.toThrow();
    },
  );

  it("replaces every owned class in a compound selector together", () => {
    const css = `.group-data-test:is(:where(.group) *) { padding: 1rem }`;
    const out = remapCompiledCss(css, [
      { candidate: "group-data-test", selector: '[data-slot="card-header"]' },
      { candidate: "group", selector: '[data-slot="card"]' },
    ]);
    expect(out).toContain(
      '[data-slot="card-header"]:is(:where([data-slot="card"]) *)',
    );
    expect(out).not.toContain(".group");
  });

  it("retains every marker owner in nested selectors", () => {
    const out = remapMarkerSelectors(`.part:where(.group) { opacity: .5 }`, [
      { marker: "group", selector: '[data-slot="first"]' },
      { marker: "group", selector: '[data-slot="second"]' },
    ]);
    expect(out).toContain('[data-slot="first"]');
    expect(out).toContain('[data-slot="second"]');
    expect(out).not.toContain(".group");
  });
  it("replaces whole class tokens only", () => {
    const css = `
.px-2 { padding-inline: 0.5rem }
.px-2\\.5 { padding-inline: 0.625rem }
.border-border { border-color: red }
.border { border-width: 1px }
`;
    const ownership = [
      {
        candidate: "px-2",
        selector: '[data-ui-component="button"][data-size="xs"]',
      },
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
    const ownership = buildButtonOwnership("button", ["inline-flex"], {
      variant: { default: "bg-primary" },
    });
    expect(ownership).toEqual([
      {
        candidate: "inline-flex",
        selector: '[data-ui-component="button"][data-ui-part="button"]',
      },
      {
        candidate: "bg-primary",
        selector:
          '[data-ui-component="button"][data-ui-part="button"][data-variant="default"]',
      },
    ]);
  });
});
