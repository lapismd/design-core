/** Join vault-relative path segments. Root is represented as `""` or `"/"`. */
export function joinExplorerPath(...parts: string[]): string {
  const segments = parts
    .flatMap((part) => part.split("/"))
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && part !== ".");
  return segments.join("/");
}

export function dirnameExplorerPath(path: string): string {
  const normalized = path.replace(/^\/+|\/+$/g, "");
  if (!normalized) return "";
  const index = normalized.lastIndexOf("/");
  return index === -1 ? "" : normalized.slice(0, index);
}

export function basenameExplorerPath(path: string): string {
  const normalized = path.replace(/^\/+|\/+$/g, "");
  if (!normalized) return "";
  const index = normalized.lastIndexOf("/");
  return index === -1 ? normalized : normalized.slice(index + 1);
}

export function ancestorExplorerPaths(path: string): string[] {
  const normalized = path.replace(/^\/+|\/+$/g, "");
  if (!normalized) return [];
  const segments = normalized.split("/");
  const ancestors: string[] = [];
  for (let i = 1; i <= segments.length; i++) {
    ancestors.push(segments.slice(0, i).join("/"));
  }
  return ancestors;
}

export function parentExplorerPath(path: string): string {
  return dirnameExplorerPath(path);
}
