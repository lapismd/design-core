import { icons as lucideIcons } from "@iconify-json/lucide";
import { getIconData, iconToHTML, iconToSVG, replaceIDs } from "@iconify/utils";
import type { Component } from "svelte";

const customIcons = new Map<string, Component>();

/**
 * Register an application-owned icon under a serializable workspace icon name.
 *
 * The returned disposer only removes the icon when the same component is still
 * registered, so plugin cleanup cannot remove a newer replacement.
 */
export function registerWorkspaceIcon(
  name: string,
  icon: Component,
): () => void {
  customIcons.set(name, icon);
  return () => {
    if (customIcons.get(name) === icon) customIcons.delete(name);
  };
}

export function resolveWorkspaceIcon(name?: string): Component | null {
  return customIcons.get(name ?? "") ?? null;
}

export function getWorkspaceIconSvg(
  name?: string,
  className?: string,
  dataIcon?: string,
): string {
  const requestedName = name || "file";
  const resolvedName = getIconData(lucideIcons, requestedName)
    ? requestedName
    : "file";
  const iconData = getIconData(lucideIcons, resolvedName)!;
  const renderData = iconToSVG(iconData);
  const classes = ["ui-workspace-icon", `lucide-${resolvedName}`, className]
    .filter(Boolean)
    .join(" ");
  const attributes = [
    `class=${JSON.stringify(classes)}`,
    `aria-hidden="true"`,
    dataIcon ? `data-icon=${JSON.stringify(dataIcon)}` : "",
  ]
    .filter(Boolean)
    .join(" ");
  return iconToHTML(replaceIDs(renderData.body), renderData.attributes).replace(
    "width=",
    `${attributes} width=`,
  );
}
