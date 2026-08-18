import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const css = readFileSync(
  new URL("./WorkspaceSettings.css", import.meta.url),
  "utf8",
);

describe("workspace settings action hover", () => {
  it("paints restore, list, and association icon hover with panel-action tokens", () => {
    expect(css).toMatch(
      /\.ui-workspace-settings[\s\S]*?\.ui-workspace-setting-restore[\s\S]*?\.ui-workspace-setting-list \[data-ui-component="button"\][\s\S]*?\.ui-workspace-setting-key-value \[data-ui-component="button"\][\s\S]*?\.ui-workspace-setting-object-collection \[data-ui-component="button"\][\s\S]*?:hover \{[\s\S]*?color:\s*var\(--ui-workspace-panel-action-hover-foreground\);[\s\S]*?background-color:\s*var\(--ui-workspace-panel-action-hover-background\);/,
    );
    expect(css).toMatch(
      /\.ui-workspace-setting-key-value,[\s\S]*?\.ui-workspace-setting-object-collection \{[\s\S]*?--muted:\s*var\(--ui-workspace-panel-action-hover-background\);/,
    );
    expect(css).toMatch(
      /\.ui-workspace-settings__search-result-open:hover \{[\s\S]*?color:\s*var\(--ui-workspace-panel-action-hover-foreground\);[\s\S]*?background:\s*var\(--ui-workspace-panel-action-hover-background\);/,
    );
    expect(css).toMatch(
      /\[data-ui-part="table-cell"\][\s\S]*?\[data-ui-component="button"\]:is\([\s\S]*?:hover \{[\s\S]*?background-color:\s*var\(--ui-workspace-panel-action-hover-background\);/,
    );
  });

  it("paints the plugin options action with panel-action hover tokens", () => {
    expect(css).toMatch(
      /\.ui-workspace-plugins__settings:hover \{[\s\S]*?color:\s*var\(--ui-workspace-panel-action-hover-foreground\);[\s\S]*?background:\s*var\(--ui-workspace-panel-action-hover-background\);/,
    );
  });

  it("hides the native search cancel so only the workspace clear remains", () => {
    expect(css).toMatch(
      /\.ui-workspace-settings__search[\s\S]*?::-webkit-search-cancel-button,[\s\S]*?::-webkit-search-decoration \{[\s\S]*?display:\s*none;/,
    );
  });

  it("sizes bounded number fields through the shadcn slider host", () => {
    expect(css).toMatch(
      /\.ui-workspace-setting-range[\s\S]*?\[data-ui-component="slider"\]\[data-ui-part="slider"\]/,
    );
    expect(css).not.toMatch(
      /\.ui-workspace-setting-range \[data-ui-component="input"\]/,
    );
  });

  it("sizes the multi-enum trigger with other settings controls", () => {
    expect(css).toMatch(
      /\.ui-workspace-setting-item[\s\S]*?\[data-ui-component="workspace-setting-multiselect"\]\[data-ui-part="trigger"\]/,
    );
    expect(css).toMatch(
      /\[data-ui-component="workspace-setting-multiselect"\]\[data-ui-part="trigger"\] \{[\s\S]*?justify-content:\s*space-between;/,
    );
    expect(css).toMatch(
      /\[data-ui-component="workspace-setting-multiselect"\]\[data-ui-part="trigger"\] \{[\s\S]*?align-items:\s*center;[\s\S]*?padding-inline:\s*0\.75rem;/,
    );
    expect(css).toMatch(
      /\[data-ui-component="workspace-setting-multiselect"\] \[data-ui-part="chevron"\] \{[\s\S]*?justify-content:\s*center;[\s\S]*?width:\s*0\.875rem;[\s\S]*?height:\s*0\.875rem;/,
    );
    expect(css).toMatch(
      /\.ui-workspace-setting-select__value \{[\s\S]*?flex:\s*1 1 auto;[\s\S]*?text-overflow:\s*ellipsis;/,
    );
  });

  it("sizes the icon picker trigger with other settings controls", () => {
    expect(css).toMatch(
      /\.ui-workspace-setting-item[\s\S]*?\[data-ui-component="workspace-icon-picker"\]\[data-ui-part="trigger"\]/,
    );
    expect(css).toMatch(
      /\[data-ui-component="workspace-icon-picker"\]\[data-ui-part="trigger"\] \{[\s\S]*?justify-content:\s*space-between;/,
    );
    expect(css).toMatch(
      /\.ui-workspace-setting-item[\s\S]*?\[data-ui-component="workspace-icon-picker"\]\[data-ui-part="trigger"\] \{[\s\S]*?border:\s*1px solid var\(--ui-workspace-border\);/,
    );
  });

  it("autosizes textareas without a resize handle", () => {
    expect(css).toMatch(
      /\.ui-workspace-setting-item \[data-ui-component="textarea"\] \{[\s\S]*?field-sizing:\s*content;[\s\S]*?resize:\s*none;/,
    );
    expect(css).not.toMatch(
      /\.ui-workspace-setting-item \[data-ui-component="textarea"\][\s\S]*?resize:\s*vertical/,
    );
  });

  it("insets the search-hit wash so the row reads with horizontal padding", () => {
    expect(css).toMatch(
      /\.ui-workspace-setting-item\.ui-workspace-settings__search-hit,[\s\S]*?margin-inline:\s*-0\.75rem;[\s\S]*?padding-inline:\s*0\.75rem;/,
    );
  });

  it("clears the idle border on string and textarea focus so only the ring remains", () => {
    expect(css).toMatch(
      /\.ui-workspace-setting-item[\s\S]*?\[data-ui-component="input"\]:not\(\[type="range"\]\):focus-visible,[\s\S]*?\[data-ui-component="textarea"\]:focus-visible \{[\s\S]*?border-color:\s*transparent;/,
    );
  });

  it("sizes password inputs with other settings controls without a second wrapper border", () => {
    const passwordHost = css.match(
      /\.ui-workspace-setting-item \[data-ui-component="password-input"\] \{[^}]+\}/,
    );
    expect(passwordHost?.[0]).toMatch(/width:\s*min\(100%, 20rem\);/);
    expect(passwordHost?.[0]).not.toMatch(/border:/);
  });

  it("keeps add actions subdued until hover like form add", () => {
    expect(css).toMatch(
      /\.ui-workspace-setting-add \{[\s\S]*?color:\s*var\(--ui-workspace-muted-foreground\)/,
    );
    expect(css).toMatch(
      /\.ui-workspace-setting-add:hover,[\s\S]*?color:\s*var\(--ui-workspace-foreground\)/,
    );
  });
});
