import { describe, expect, it } from "vitest";
import {
  FAMILY_TOKEN_SPECS,
  TOKEN_SCHEMA_VERSION,
  buildTokensCss,
  buildTokensTs,
  rewritePaintToTokens,
  tokenCssName,
} from "../transform/token-wiring.js";

describe("token wiring", () => {
  it("keeps tokenSchemaVersion at 2 for bindings", () => {
    expect(TOKEN_SCHEMA_VERSION).toBe(2);
  });

  it("emits button token map and defaults css", () => {
    const spec = FAMILY_TOKEN_SPECS.button!;
    const ts = buildTokensTs("button", spec);
    expect(ts).toContain('background: "--ui-button-background"');
    expect(ts).toContain("buttonTokenNames");
    const css = buildTokensCss("button", spec);
    expect(css).toContain(":root");
    expect(css).toContain("--ui-button-background: var(--primary);");
  });

  it("rewrites paint through public tokens without matching --tw-ring-color as color", () => {
    const spec = FAMILY_TOKEN_SPECS.dialog!;
    const input = `
[data-ui-component="dialog"] {
  background-color: var(--popover);
  color: var(--popover-foreground);
  --tw-ring-color: var(--foreground);
}
`;
    const out = rewritePaintToTokens("dialog", input, spec);
    expect(out).toContain(
      "background-color: var(--ui-dialog-background, var(--popover));",
    );
    expect(out).toContain(
      "color: var(--ui-dialog-foreground, var(--popover-foreground));",
    );
    expect(out).toContain("--tw-ring-color: var(--foreground);");
    expect(out).not.toContain("--tw-ring-color: var(--ui-dialog-foreground");
  });

  it("names tokens deterministically", () => {
    expect(tokenCssName("button", "focusRingColor")).toBe(
      "--ui-button-focus-ring-color",
    );
  });
});
