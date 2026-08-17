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

let lucideIconNames: readonly string[] | undefined;

function listLucideIconNames(): readonly string[] {
  lucideIconNames ??= Object.keys(lucideIcons.icons).sort((left, right) =>
    left.localeCompare(right),
  );
  return lucideIconNames;
}

/** Serializable Lucide names plus any application-registered extras. */
export function listWorkspaceIconNames(): string[] {
  const lucide = listLucideIconNames();
  if (customIcons.size === 0) return [...lucide];
  const extras = [...customIcons.keys()]
    .filter((name) => !lucide.includes(name))
    .sort((left, right) => left.localeCompare(right));
  return extras.length > 0 ? [...extras, ...lucide] : [...lucide];
}

/** Filter serializable icon names by Lucide id, ignoring extra spaces. */
export function filterWorkspaceIconNames(query: string): string[] {
  const normalized = query.trim().toLowerCase();
  const names = listWorkspaceIconNames();
  if (!normalized) return names;
  const compact = normalized.replace(/[\s_]+/g, "-");
  return names.filter((name) => {
    const haystack = name.toLowerCase();
    return haystack.includes(normalized) || haystack.includes(compact);
  });
}

/** Normalize Obsidian-style `lucide-foo` / `lucide:foo` to Lucide short names. */
export function normalizeWorkspaceIconName(name?: string): string {
  const raw = (name || "file").trim();
  if (!raw) return "file";
  if (raw.startsWith("lucide:")) return raw.slice("lucide:".length) || "file";
  if (raw.startsWith("lucide-")) return raw.slice("lucide-".length) || "file";
  return raw;
}

export function getWorkspaceIconSvg(
  name?: string,
  className?: string,
  dataIcon?: string,
): string {
  const requestedName = normalizeWorkspaceIconName(name);
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
