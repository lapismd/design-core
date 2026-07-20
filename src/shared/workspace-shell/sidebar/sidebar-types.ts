export type SidebarTab = "projects" | "workspace" | "search";

export type StudioWorkspaceMode = "cv" | "applications" | "tasks" | "docs";

export function formatProjectPath(path: string) {
  return path.replace(/^\/Users\/([^/]+)/, "~");
}

export function middleTruncate(value: string, maxLength = 34) {
  if (value.length <= maxLength) return value;
  const edgeLength = Math.max(8, Math.floor((maxLength - 3) / 2));
  return `${value.slice(0, edgeLength)}...${value.slice(-edgeLength)}`;
}
