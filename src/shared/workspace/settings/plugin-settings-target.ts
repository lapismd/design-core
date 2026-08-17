import type { WorkspaceSettingsSection } from "./types.js";

function isPluginSettingsSection(
  section: WorkspaceSettingsSection,
  pluginId: string,
): boolean {
  if (section.surface === "core-plugins") return false;
  return section.sourcePluginId === pluginId || section.id === pluginId;
}

/** First settings section owned by a plugin, if one is registered. */
export function findPluginSettingsSection(
  sections: readonly WorkspaceSettingsSection[],
  pluginId: string,
): WorkspaceSettingsSection | undefined {
  const bySource = sections.filter(
    (section) =>
      section.surface !== "core-plugins" && section.sourcePluginId === pluginId,
  );
  if (bySource.length > 0) {
    return [...bySource].sort(
      (left, right) => (left.order ?? 0) - (right.order ?? 0),
    )[0];
  }
  return sections.find((section) => isPluginSettingsSection(section, pluginId));
}

export function hasPluginSettings(
  sections: readonly WorkspaceSettingsSection[],
  pluginId: string,
): boolean {
  return findPluginSettingsSection(sections, pluginId) !== undefined;
}
