import { describe, expect, it } from "vitest";
import {
  findPluginSettingsSection,
  hasPluginSettings,
} from "./plugin-settings-target.js";
import type { WorkspaceSettingsSection } from "./types.js";

function section(
  partial: Partial<WorkspaceSettingsSection> &
    Pick<WorkspaceSettingsSection, "id" | "title">,
): WorkspaceSettingsSection {
  return partial;
}

describe("plugin settings target", () => {
  it("prefers a sourcePluginId match over a same-id section", () => {
    const sections = [
      section({ id: "backlinks", title: "Backlinks tab" }),
      section({
        id: "backlinks-options",
        title: "Backlinks options",
        sourcePluginId: "backlinks",
        order: 20,
      }),
      section({
        id: "backlinks-advanced",
        title: "Backlinks advanced",
        sourcePluginId: "backlinks",
        order: 10,
      }),
    ];

    expect(findPluginSettingsSection(sections, "backlinks")).toMatchObject({
      id: "backlinks-advanced",
    });
    expect(hasPluginSettings(sections, "workspace-core")).toBe(false);
  });

  it("falls back to a section id match and ignores the core-plugins surface", () => {
    const sections = [
      section({
        id: "core-plugins",
        title: "Core plugins",
        surface: "core-plugins",
      }),
      section({ id: "fmode", title: "F-Mode" }),
    ];

    expect(findPluginSettingsSection(sections, "core-plugins")).toBeUndefined();
    expect(findPluginSettingsSection(sections, "fmode")).toMatchObject({
      id: "fmode",
    });
  });
});
