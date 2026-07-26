import { describe, expect, it } from "vitest";
import { AppShellController } from "../../core/app-shell-controller.svelte.js";
import {
  createFModeSettingsSection,
  createFModeTargetGroups,
  filterFModeTargets,
  readFModeSettings,
} from "./settings.js";

describe("F-Mode settings", () => {
  it("registers generic target groups and normalizes configured values", async () => {
    const groups = createFModeTargetGroups([
      { id: "document", label: "Document", defaultEnabled: false },
    ]);
    const app = new AppShellController({
      configuration: {
        sections: [createFModeSettingsSection(groups)],
      },
    });
    app.configuration.set("fmode.alphabet", "A A S!!");
    app.configuration.set("fmode.enabledSurfaces", ["tabs", "document"]);
    app.configuration.set("fmode.hudMode", "compact");

    expect(readFModeSettings(app, groups)).toMatchObject({
      alphabet: "as",
      enabledSurfaces: ["tabs", "document"],
      hudMode: "compact",
    });
    await app.dispose();
  });

  it("filters grouped targets while retaining ungrouped targets", () => {
    const element = {} as HTMLElement;
    expect(
      filterFModeTargets(
        [
          {
            id: "tab",
            type: "tab",
            label: "Tab",
            action: "click",
            group: "tabs",
            element,
          },
          {
            id: "custom",
            type: "custom",
            label: "Custom",
            action: "click",
            element,
          },
        ],
        [],
      ).map((target) => target.id),
    ).toEqual(["custom"]);
  });
});
