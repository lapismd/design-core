import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  analyzeSvelteSource,
  DATA_UI_SHADCN_ALLOWLIST,
  loadDataUiHostCatalog,
  type DataUiViolation,
} from "./data-ui-contract.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const srcRoot = path.resolve(dirname, "..");
const shadcnRoot = path.join(srcRoot, "shared", "shadcn");

/** Avoid Storybook/vitest HTML pipelines stripping `<style>` from fixtures. */
const STYLE_CLOSE = "</" + "style>";

function walkSvelteFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue;
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      out.push(...walkSvelteFiles(full));
      continue;
    }
    if (entry.endsWith(".svelte") && !entry.endsWith(".stories.svelte")) {
      out.push(full);
    }
  }
  return out;
}

function formatViolations(violations: DataUiViolation[]): string {
  return violations
    .map((v) => `${v.file}: [${v.kind}] ${v.message}`)
    .join("\n\n");
}

describe("data-ui-contract analyzer", () => {
  it("flags missing data-ui-component on a same-element compound part (AI dock regression)", () => {
    const styleOpen = "<" + "style>";
    const source = [
      '<div data-ui-part="root" data-placement="right"></div>',
      styleOpen,
      ':global([data-ui-component="ai-chat-dock"][data-ui-part="root"]) { position: absolute; }',
      STYLE_CLOSE,
    ].join("\n");
    const violations = analyzeSvelteSource(source, "AiChatDock.svelte");
    expect(violations.some((v) => v.kind === "missing-component-on-part")).toBe(
      true,
    );
  });

  it("flags project-path Tooltip.Trigger when CSS requires same-element compound", () => {
    const styleOpen = "<" + "style>";
    const source = [
      "<script>",
      '  import * as Tooltip from "@stevejuma/ui/shadcn/tooltip";',
      "</script>",
      '<Tooltip.Trigger type="button" data-ui-part="project-path">',
      "  <span>~/Projects/portfolio</span>",
      "</Tooltip.Trigger>",
      styleOpen,
      ':global([data-ui-component="studio-sidebar"][data-ui-part="project-path"]) { font-size: 10px; }',
      STYLE_CLOSE,
    ].join("\n");
    const violations = analyzeSvelteSource(source, "StudioSidebar.svelte");
    expect(violations.some((v) => v.kind === "missing-component-on-part")).toBe(
      true,
    );
  });

  it("flags data-ui-component override on shadcn Button host", () => {
    const styleOpen = "<" + "style>";
    const source = [
      "<script>",
      '  import { Button } from "@stevejuma/ui/shadcn/button";',
      "</script>",
      '<Button data-ui-component="studio-sidebar" data-ui-part="icon-button">Go</Button>',
      styleOpen,
      ':global([data-ui-component="studio-sidebar"] [data-ui-part="icon-button"]) { margin: 0; }',
      STYLE_CLOSE,
    ].join("\n");
    const violations = analyzeSvelteSource(source, "StudioSidebar.svelte");
    expect(violations.some((v) => v.kind === "host-component-override")).toBe(
      true,
    );
  });

  it("accepts native hosts with matching same-element attrs", () => {
    const styleOpen = "<" + "style>";
    const source = [
      '<div data-ui-component="ai-chat-dock" data-ui-part="root"></div>',
      styleOpen,
      ':global([data-ui-component="ai-chat-dock"][data-ui-part="root"]) { display: flex; }',
      STYLE_CLOSE,
    ].join("\n");
    expect(analyzeSvelteSource(source)).toEqual([]);
  });

  it("flags data-ui-part override on Tooltip.Content (kills host background)", () => {
    const source = [
      "<script>",
      '  import * as Tooltip from "@stevejuma/ui/shadcn/tooltip";',
      "</script>",
      '<Tooltip.Content data-studio-sidebar="tooltip-wide" data-ui-part="tooltip-wide">',
      "  /Users/demo/Projects/portfolio",
      "</Tooltip.Content>",
    ].join("\n");
    const violations = analyzeSvelteSource(source, "StudioSidebar.svelte");
    expect(violations.some((v) => v.kind === "host-part-override")).toBe(true);
  });

  it("accepts Tooltip.Content with side-channel attrs only", () => {
    const source = [
      "<script>",
      '  import * as Tooltip from "@stevejuma/ui/shadcn/tooltip";',
      "</script>",
      '<Tooltip.Content data-studio-sidebar="tooltip-wide">',
      "  /Users/demo/Projects/portfolio",
      "</Tooltip.Content>",
    ].join("\n");
    expect(analyzeSvelteSource(source)).toEqual([]);
  });

  it("accepts descendant selectors with part-only attrs on hosts", () => {
    const styleOpen = "<" + "style>";
    const source = [
      "<script>",
      '  import { Button } from "@stevejuma/ui/shadcn/button";',
      "</script>",
      '<div data-ui-component="studio-sidebar" data-ui-part="header">',
      '  <Button data-ui-part="icon-button">X</Button>',
      "</div>",
      styleOpen,
      ':global([data-ui-component="studio-sidebar"][data-ui-part="header"]) { display: flex; }',
      ':global([data-ui-component="studio-sidebar"] [data-ui-part="icon-button"]) { margin: 0; }',
      STYLE_CLOSE,
    ].join("\n");
    expect(analyzeSvelteSource(source)).toEqual([]);
  });

  it("allowlists intentional Field.Label dataUiComponent restyle", () => {
    const source = [
      "<script>",
      '  import { Label } from "../label/index.js";',
      "</script>",
      '<Label dataUiComponent="field" data-ui-part="field-label" />',
    ].join("\n");
    const violations = analyzeSvelteSource(
      source,
      "shared/shadcn/field/field-label.svelte",
      { allowlist: DATA_UI_SHADCN_ALLOWLIST },
    );
    expect(
      violations.filter((v) => v.kind === "host-component-override"),
    ).toEqual([]);
  });
});

describe("data-ui host catalog discovery", () => {
  it("discovers leaf hosts and fixed parts from shadcn", () => {
    const catalog = loadDataUiHostCatalog(shadcnRoot);
    expect(catalog.components.Button).toBe("button");
    expect(catalog.components.Input).toBe("input");
    expect(catalog.components.Label).toBe("label");
    expect(catalog.components.Separator).toBe("separator");
    expect(catalog.components["Tooltip.Content"]).toBe("tooltip");
    expect(catalog.components["Sidebar.Root"]).toBe("sidebar");
    expect(catalog.components["DropdownMenu.Content"]).toBe("dropdown-menu");
    expect(catalog.components["Dialog.Content"]).toBe("dialog");
    expect(catalog.parts["Tooltip.Content"]).toBe("tooltip-content");
    expect(catalog.parts["Sidebar.Root"]).toBeUndefined();
    expect(catalog.parts.ScrollArea).toBe("scroll-area");
    expect(catalog.parts["Dialog.Content"]).toBe("dialog-content");
    // Colliding bare exports must not overwrite leaf hosts
    expect(catalog.components.Input).not.toBe("command");
    expect(catalog.parts.Label).toBeUndefined();
  });
});

describe("data-ui-contract source scan", () => {
  it("keeps composition + app Svelte sources free of data-ui attribute regressions", () => {
    const catalog = loadDataUiHostCatalog(shadcnRoot);
    const roots = [
      path.join(srcRoot, "shared", "ai"),
      path.join(srcRoot, "shared", "forms"),
    ];
    const files = roots.flatMap((root) => walkSvelteFiles(root));
    expect(files.length).toBeGreaterThan(10);

    const violations = files.flatMap((file) =>
      analyzeSvelteSource(
        readFileSync(file, "utf8"),
        path.relative(srcRoot, file),
        {
          hostComponents: catalog.components,
          hostParts: catalog.parts,
        },
      ),
    );

    expect(violations, formatViolations(violations)).toEqual([]);
  });

  it("keeps shadcn free of non-allowlisted host overrides", () => {
    const catalog = loadDataUiHostCatalog(shadcnRoot);
    const files = walkSvelteFiles(shadcnRoot);
    expect(files.length).toBeGreaterThan(50);

    const violations = files
      .flatMap((file) =>
        analyzeSvelteSource(
          readFileSync(file, "utf8"),
          path.relative(srcRoot, file),
          {
            hostComponents: catalog.components,
            hostParts: catalog.parts,
            allowlist: DATA_UI_SHADCN_ALLOWLIST,
          },
        ),
      )
      .filter(
        (v) =>
          v.kind === "host-component-override" ||
          v.kind === "host-part-override",
      );

    expect(violations, formatViolations(violations)).toEqual([]);
  });
});
