import { describe, expect, it } from "vitest";
import {
  syncCatalogStoryLayout,
  usesFullViewportCatalogLayout,
} from "./catalog-layout.js";

describe("catalog story layout", () => {
  it("allows explicit bounded application stories without changing regular catalog padding", () => {
    expect(
      usesFullViewportCatalogLayout({
        title: "Plugins/Bases/Views/Kanban",
        viewMode: "story",
        parameters: { catalogLayout: "full-viewport" },
      }),
    ).toBe(true);
    expect(
      usesFullViewportCatalogLayout({
        title: "Plugins/Bases/Views/Kanban",
        viewMode: "story",
      }),
    ).toBe(false);
    expect(
      usesFullViewportCatalogLayout({
        title: "Plugins/Bases/Views/Kanban",
        viewMode: "docs",
        parameters: { catalogLayout: "full-viewport" },
      }),
    ).toBe(false);
  });
  it("uses edge-to-edge roots only for application-shell stories", () => {
    expect(
      usesFullViewportCatalogLayout({
        title: "Workspace/App Shell",
        viewMode: "story",
      }),
    ).toBe(true);
    expect(
      usesFullViewportCatalogLayout({
        title: "Shell/App Shell",
        viewMode: "story",
      }),
    ).toBe(true);
    expect(
      usesFullViewportCatalogLayout({
        title: "Shadcn/Forms/Label",
        viewMode: "story",
      }),
    ).toBe(false);
    expect(
      usesFullViewportCatalogLayout({
        title: "Workspace/App Shell",
        viewMode: "docs",
      }),
    ).toBe(false);
  });

  it("clears the full-viewport marker when navigation returns to the catalog", () => {
    const attributes = new Set<string>();
    const testDocument = {
      body: {
        toggleAttribute(name: string, force?: boolean) {
          if (force) attributes.add(name);
          else attributes.delete(name);
        },
      },
    } as unknown as Document;

    syncCatalogStoryLayout(testDocument, {
      title: "Workspace/App Shell",
      viewMode: "story",
    });
    expect(attributes).toContain("data-ui-catalog-full-viewport");

    syncCatalogStoryLayout(testDocument, {
      title: "Shadcn/Forms/Label",
      viewMode: "story",
    });
    expect(attributes).not.toContain("data-ui-catalog-full-viewport");
  });
});
