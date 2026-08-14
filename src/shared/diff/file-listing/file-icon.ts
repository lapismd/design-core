export function fileIconNameForPath(path: string): string {
  const basename = path.split("/").filter(Boolean).at(-1)?.toLowerCase() ?? "";
  const extension = basename.includes(".")
    ? basename.slice(basename.lastIndexOf(".") + 1)
    : "";
  switch (extension) {
    case "ts":
    case "tsx":
    case "js":
    case "jsx":
    case "mjs":
    case "cjs":
      return "file-code-2";
    case "json":
    case "yml":
    case "yaml":
    case "toml":
      return "file-json";
    case "md":
    case "mdx":
      return "file-text";
    case "css":
    case "scss":
      return "file-code";
    case "svg":
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "webp":
      return "image";
    default:
      return "file";
  }
}
