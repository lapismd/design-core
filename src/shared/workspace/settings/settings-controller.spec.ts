import { describe, expect, it, vi } from "vitest";
import { WorkspaceSettingsController } from "./settings-controller.svelte.js";
import {
  ConfigurationOptionSourceRegistry,
  ConfigurationSchema,
} from "./configuration.js";
import type {
  WorkspaceSettingsDefinition,
  WorkspaceSettingsChangeEvent,
  WorkspaceSettingsPersistence,
  WorkspaceSettingsSnapshotV1,
} from "./types.js";

function sections() {
  return [
    {
      id: "appearance",
      title: "Appearance",
      description: "Theme and shell styling",
      fields: [
        {
          type: "boolean" as const,
          id: "ribbon",
          title: "Show ribbon",
          default: true,
        },
        {
          type: "integer" as const,
          id: "font-size",
          title: "Font size",
          default: 15,
          minimum: 12,
          maximum: 24,
        },
        {
          type: "enum" as const,
          id: "theme",
          title: "Theme",
          default: "system",
          options: [
            { value: "system", label: "System" },
            { value: "dark", label: "Dark" },
          ],
        },
      ],
    },
  ];
}

describe("WorkspaceSettingsController", () => {
  it("keeps declarative navigation groups ordered for the source settings rail", () => {
    const controller = new WorkspaceSettingsController({
      sections: sections(),
      navigationGroups: [
        { id: "advanced", title: "Advanced", order: 20 },
        { id: "options", title: "Options", order: 10 },
      ],
    });
    expect(controller.navigationGroups.map((group) => group.id)).toEqual([
      "options",
      "advanced",
    ]);
  });

  it("validates typed values, restores defaults, and searches schemas", () => {
    const controller = new WorkspaceSettingsController({
      sections: sections(),
    });
    expect(controller.get("ribbon")).toBe(true);
    expect(controller.update("font-size", 30)).toBe(false);
    expect(controller.validationErrors["font-size"]).toContain("no more than");
    expect(controller.update("font-size", 18)).toBe(true);
    expect(controller.get("font-size")).toBe(18);
    expect(controller.restoreDefault("font-size")).toBe(true);
    expect(controller.get("font-size")).toBe(15);
    expect(controller.search("theme")[0]).toMatchObject({ fieldId: "theme" });
  });

  it("opens the dialog and reveals a field or section", () => {
    const controller = new WorkspaceSettingsController({
      sections: sections(),
    });
    expect(controller.open({ fieldId: "theme" })).toBe(true);
    expect(controller.dialogOpen).toBe(true);
    expect(controller.selectedSectionId).toBe("appearance");
    expect(controller.revealFieldId).toBe("theme");
    expect(
      controller.listPaletteEntries("").map((entry) => entry.title),
    ).toContain("Appearance");
    expect(controller.listPaletteEntries("theme")[0]).toMatchObject({
      fieldId: "theme",
    });
    controller.close();
    expect(controller.dialogOpen).toBe(false);
    expect(controller.revealFieldId).toBeNull();
  });

  it("searches and opens entries contributed by custom settings pages", () => {
    const controller = new WorkspaceSettingsController({
      sections: [
        ...sections(),
        {
          id: "community-plugins",
          title: "Community plugins",
          searchEntries: () => [
            {
              id: "community.spellcheck",
              title: "Spellcheck",
              description: "Check prose while editing.",
              keywords: ["dictionary", "language"],
              path: ["Installed", "Spellcheck"],
            },
          ],
        },
      ],
    });

    expect(controller.search("dictionary")[0]).toMatchObject({
      sectionId: "community-plugins",
      fieldId: "community.spellcheck",
      title: "Spellcheck",
      path: ["Community plugins", "Installed", "Spellcheck"],
    });
    expect(
      controller.open({
        sectionId: "community-plugins",
        fieldId: "community.spellcheck",
      }),
    ).toBe(true);
    expect(controller.selectedSectionId).toBe("community-plugins");
    expect(controller.revealFieldId).toBe("community.spellcheck");
    expect(
      controller.open({
        sectionId: "community-plugins",
        fieldId: "community.missing",
      }),
    ).toBe(false);
  });

  it("validates the integer-list presentation used by the complete demo", () => {
    const controller = new WorkspaceSettingsController({
      sections: [
        {
          id: "advanced",
          title: "Advanced",
          fields: [
            {
              type: "list",
              id: "history-limits",
              title: "History limits",
              itemType: "integer",
              default: [10, 25, 50],
            },
          ],
        },
      ],
    });

    expect(controller.update("history-limits", [5, 12.5])).toBe(false);
    expect(controller.validationErrors["history-limits"]).toContain("integer");
    expect(controller.update("history-limits", [5, 15])).toBe(true);
    expect(controller.get("history-limits")).toEqual([5, 15]);
  });

  it("validates key-value settings used by editor associations", () => {
    const controller = new WorkspaceSettingsController({
      sections: [
        {
          id: "workspace",
          title: "Workspace",
          fields: [
            {
              type: "key-value",
              id: "workspace.editorAssociations",
              title: "Editor associations",
              default: {},
            },
          ],
        },
      ],
    });

    expect(
      controller.update("workspace.editorAssociations", {
        "*.md": "markdown",
      }),
    ).toBe(true);
    expect(
      controller.update("workspace.editorAssociations", {
        "*.md": 42,
      }),
    ).toBe(false);
    expect(
      controller.validationErrors["workspace.editorAssociations"],
    ).toContain("key and value must be a string");
  });

  it("keeps toggle-table groups searchable and persists Boolean child keys", () => {
    const controller = new WorkspaceSettingsController({
      sections: [
        {
          id: "markdown",
          title: "Markdown",
          fields: [
            {
              id: "markdown.features",
              type: "group",
              presentation: "toggle-table",
              title: "Features",
              description: "Choose Markdown capabilities.",
              fields: [
                {
                  id: "markdown.features.formatting",
                  type: "boolean",
                  title: "Formatting",
                  description: "Show formatting actions.",
                  default: true,
                },
                {
                  id: "markdown.features.slash-commands",
                  type: "boolean",
                  title: "Slash commands",
                  description: "Show the slash command menu.",
                  default: true,
                },
              ],
            },
          ],
        },
      ],
    });

    expect(controller.get("markdown.features.formatting")).toBe(true);
    expect(controller.get("markdown.features")).toBeUndefined();
    expect(controller.search("slash command menu")[0]).toMatchObject({
      fieldId: "markdown.features.slash-commands",
      path: ["Markdown", "Features", "Slash commands"],
    });

    expect(controller.update("markdown.features.formatting", false)).toBe(true);
    expect(controller.getSnapshot().values).toEqual({
      "markdown.features.formatting": false,
      "markdown.features.slash-commands": true,
    });
  });

  it("loads known settings, ignores malformed values, and saves snapshots", async () => {
    const save = vi.fn<
      (
        snapshot: WorkspaceSettingsSnapshotV1,
        event: WorkspaceSettingsChangeEvent,
      ) => Promise<void>
    >(async () => undefined);
    const persistence: WorkspaceSettingsPersistence = {
      load: async () => ({
        version: 1,
        values: { ribbon: false, "font-size": "wrong", unknown: true },
      }),
      save,
    };
    const controller = new WorkspaceSettingsController({
      sections: sections(),
      persistence,
      saveDebounceMs: 0,
    });
    await controller.load();
    expect(controller.get("ribbon")).toBe(false);
    expect(controller.get("font-size")).toBe(15);
    expect(controller.get("unknown")).toBeUndefined();
    controller.update("theme", "dark");
    await controller.flushSave();
    expect(save).toHaveBeenCalledOnce();
    expect(save.mock.calls[0]?.[0]).toEqual({
      version: 1,
      values: { ribbon: false, "font-size": 15, theme: "dark" },
    });
  });

  it("emits persistence errors without discarding current values", async () => {
    const operations: string[] = [];
    const controller = new WorkspaceSettingsController({
      sections: sections(),
      persistence: {
        load: async () => {
          throw new Error("load");
        },
        save: async () => {
          throw new Error("save");
        },
      },
      saveDebounceMs: 0,
    });
    controller.on("persistence-error", (event) =>
      operations.push(event.operation),
    );
    await controller.load();
    controller.update("ribbon", false);
    await controller.flushSave();
    expect(operations).toEqual(["load", "save"]);
    expect(controller.get("ribbon")).toBe(false);
  });

  it("supports structured, dynamic-option, and navigation extensions", async () => {
    const reactiveRows = new Proxy([{ name: "First" }], {});
    const controller = new WorkspaceSettingsController({
      sections: [
        {
          id: "complete",
          title: "Complete",
          fields: [
            {
              type: "enum",
              id: "dynamic",
              title: "Dynamic",
              default: "one",
              optionsSource: "dynamic",
            },
            {
              type: "object-array",
              id: "rows",
              title: "Rows",
              default: reactiveRows,
              properties: [{ id: "name", title: "Name", type: "string" }],
            },
            {
              type: "object-map",
              id: "map",
              title: "Map",
              default: { first: { enabled: true } },
              properties: [
                { id: "enabled", title: "Enabled", type: "boolean" },
              ],
            },
          ],
        },
      ],
    });
    expect(controller.get("rows")).toEqual([{ name: "First" }]);
    const schema = new ConfigurationSchema(controller);
    const disposeGroup = schema.registerNavigationGroup({
      id: "extensions",
      title: "Extensions",
    });
    expect(controller.navigationGroups[0]?.id).toBe("extensions");
    expect(controller.update("dynamic", "unknown")).toBe(true);
    expect(controller.update("rows", [{ name: "Second" }])).toBe(true);
    expect(controller.update("map", { second: { enabled: false } })).toBe(true);

    const sources = new ConfigurationOptionSourceRegistry();
    sources.register({
      id: "dynamic",
      load: () => [{ value: "one", label: "One" }],
    });
    await expect(
      sources.load("dynamic", { settingId: "dynamic" }),
    ).resolves.toEqual([{ value: "one", label: "One" }]);
    disposeGroup();
    expect(controller.navigationGroups).toEqual([]);
  });

  it("controls source-backed values without adding them to persistence snapshots", async () => {
    const values: Record<string, unknown> = {
      "plugin.endpoint": "wss://relay.example",
      "plugin.status": "Connected",
    };
    const listeners = new Set<(fieldId?: string) => void>();
    const set = vi.fn(async (fieldId: string, value: unknown) => {
      values[fieldId] =
        typeof value === "string" ? value.trim().toLowerCase() : value;
      for (const listener of listeners) listener(fieldId);
      return values[fieldId];
    });
    const definition: WorkspaceSettingsDefinition = {
      section: {
        id: "plugin",
        title: "Plugin",
        fields: [
          {
            id: "plugin.endpoint",
            type: "string",
            title: "Endpoint",
            default: "",
            presentation: "url",
          },
          {
            id: "plugin.status",
            type: "output",
            title: "Status",
            presentation: "status",
          },
        ],
      },
      source: {
        get: (fieldId) => values[fieldId],
        set,
        subscribe: (listener) => {
          listeners.add(listener);
          return () => listeners.delete(listener);
        },
      },
    };
    const controller = new WorkspaceSettingsController({
      sections: sections(),
    });
    const dispose = controller.registerDefinition(definition);

    expect(controller.get("plugin.endpoint")).toBe("wss://relay.example");
    expect(controller.getSnapshot().values).not.toHaveProperty(
      "plugin.endpoint",
    );
    const pending = controller.set(
      "plugin.endpoint",
      "  WSS://SECOND.EXAMPLE  ",
    );
    expect(controller.get("plugin.endpoint")).toBe("  WSS://SECOND.EXAMPLE  ");
    expect(controller.isBusy("plugin.endpoint")).toBe(true);
    await expect(pending).resolves.toBe(true);
    expect(controller.get("plugin.endpoint")).toBe("wss://second.example");
    expect(controller.isBusy("plugin.endpoint")).toBe(false);

    values["plugin.status"] = "Degraded";
    for (const listener of listeners) listener("plugin.status");
    expect(controller.get("plugin.status")).toBe("Degraded");
    dispose();
    expect(listeners.size).toBe(0);
  });

  it("rolls back a rejected source-backed update and exposes its error", async () => {
    const values: Record<string, unknown> = { "plugin.name": "Before" };
    const controller = new WorkspaceSettingsController();
    controller.registerDefinition({
      section: {
        id: "plugin",
        title: "Plugin",
        fields: [
          {
            id: "plugin.name",
            type: "string",
            title: "Name",
            default: "",
          },
        ],
      },
      source: {
        get: (fieldId) => values[fieldId],
        set: async () => {
          throw new Error("Provider rejected the value");
        },
        subscribe: () => () => undefined,
      },
    });

    await expect(controller.set("plugin.name", "After")).resolves.toBe(false);
    expect(controller.get("plugin.name")).toBe("Before");
    expect(controller.getError("plugin.name")).toBe(
      "Provider rejected the value",
    );
  });
});
