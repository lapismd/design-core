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
      /\[data-ui-part="table-cell"\][\s\S]*?\[data-ui-component="button"\]:is\([\s\S]*?:hover \{[\s\S]*?background-color:\s*var\(--ui-workspace-panel-action-hover-background\);/,
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

  it("keeps add actions subdued until hover like form add", () => {
    expect(css).toMatch(
      /\.ui-workspace-setting-add \{[\s\S]*?color:\s*color-mix\([\s\S]*?var\(--ui-workspace-foreground\)\s*62%/,
    );
    expect(css).toMatch(
      /\.ui-workspace-setting-add:hover,[\s\S]*?color:\s*var\(--ui-workspace-foreground\)/,
    );
  });
});
