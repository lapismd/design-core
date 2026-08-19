import { describe, expect, it, vi } from "vitest";
import { AppShellController } from "./app-shell-controller.svelte.js";
import {
  ALL_TAB_EMPTY_LIMITS,
  COMMAND_PALETTE_TAB_ACTIONS,
  COMMAND_PALETTE_TAB_ALL,
  COMMAND_PALETTE_TAB_SETTINGS,
  actionPaletteGroup,
  groupPaletteItems,
} from "./command-manager.svelte.js";

describe("command palette tabs and groups", () => {
  it("lists All, Actions, Settings, and registered provider tabs", () => {
    const app = new AppShellController();
    app.commands.registerPaletteProvider({
      id: "vault-files",
      tab: { id: "files", label: "Files", order: 20 },
      search: () => [],
    });
    expect(app.commands.listPaletteTabs().map((tab) => tab.id)).toEqual([
      COMMAND_PALETTE_TAB_ALL,
      "files",
      COMMAND_PALETTE_TAB_ACTIONS,
      COMMAND_PALETTE_TAB_SETTINGS,
    ]);
  });

  it("opens a requested tab and falls back to All for unknown ids", () => {
    const app = new AppShellController();
    app.commands.openPalette({ tab: COMMAND_PALETTE_TAB_ACTIONS });
    expect(app.commands.paletteOpen).toBe(true);
    expect(app.commands.paletteTab).toBe(COMMAND_PALETTE_TAB_ACTIONS);
    app.commands.closePalette();
    expect(app.commands.paletteTab).toBe(COMMAND_PALETTE_TAB_ALL);
    app.commands.openPalette({ tab: "missing" });
    expect(app.commands.paletteTab).toBe(COMMAND_PALETTE_TAB_ALL);
  });

  it("groups empty-query actions by sourcePlugin then category", async () => {
    const app = new AppShellController({
      commands: [
        {
          id: "alpha:one",
          title: "Alpha one",
          sourcePlugin: "alpha",
          callback: () => true,
        },
        {
          id: "beta:one",
          title: "Beta one",
          category: "Workspace",
          sourcePlugin: "beta",
          callback: () => true,
        },
      ],
    });
    const items = await app.commands.searchPalette("", {
      tab: COMMAND_PALETTE_TAB_ACTIONS,
    });
    const contributed = items.filter(
      (item) => item.id === "alpha:one" || item.id === "beta:one",
    );
    expect(contributed.map((item) => item.group)).toEqual(["alpha", "beta"]);
    expect(
      groupPaletteItems(contributed).map((group) => group.heading),
    ).toEqual(["alpha", "beta"]);
    expect(
      actionPaletteGroup({ id: "x", title: "X", callback: () => true }),
    ).toBe("Commands");
  });

  it("limits All empty-query slices when other kinds exist", async () => {
    const app = new AppShellController({
      commands: Array.from({ length: 8 }, (_, index) => ({
        id: `extra:command-${index}`,
        title: `Extra command ${index}`,
        sourcePlugin: "extra",
        callback: () => true,
      })),
    });
    const files = Array.from({ length: 8 }, (_, index) => ({
      id: `file-${index}`,
      title: `Note ${index}`,
      providerId: "vault-files",
      tab: "files",
      group: "Recent",
      run: () => undefined,
    }));
    app.commands.registerPaletteProvider({
      id: "vault-files",
      tab: { id: "files", label: "Files", order: 20 },
      emptyQueryLimit: 3,
      search: () => files,
    });
    const all = await app.commands.searchPalette("", {
      tab: COMMAND_PALETTE_TAB_ALL,
    });
    expect(all.filter((item) => item.tab === "files")).toHaveLength(3);
    expect(
      all.filter((item) => item.tab === COMMAND_PALETTE_TAB_ACTIONS),
    ).toHaveLength(ALL_TAB_EMPTY_LIMITS.actions);
    const actionTab = await app.commands.searchPalette("", {
      tab: COMMAND_PALETTE_TAB_ACTIONS,
    });
    expect(actionTab.length).toBeGreaterThan(ALL_TAB_EMPTY_LIMITS.actions);
  });

  it("runs a settings palette item through settings.open", async () => {
    const app = new AppShellController();
    const open = vi.spyOn(app.settings, "open");
    const items = await app.commands.searchPalette("show ribbon", {
      tab: COMMAND_PALETTE_TAB_SETTINGS,
    });
    const ribbon = items.find((item) => item.title === "Show ribbon");
    expect(ribbon).toBeDefined();
    await ribbon?.run();
    expect(open).toHaveBeenCalledWith({
      sectionId: "appearance",
      fieldId: "appearence.interface.showRibbon",
    });
    expect(app.settings.dialogOpen).toBe(true);
    expect(app.settings.selectedSectionId).toBe("appearance");
    expect(app.settings.revealFieldId).toBe("appearence.interface.showRibbon");
  });
});
