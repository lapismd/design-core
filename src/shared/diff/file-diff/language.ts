const LANGUAGE_BY_EXTENSION: Record<string, string> = {
  bash: "bash",
  cjs: "javascript",
  css: "css",
  html: "html",
  js: "javascript",
  json: "json",
  jsx: "jsx",
  less: "less",
  md: "markdown",
  mdx: "markdown",
  mjs: "javascript",
  php: "php",
  py: "python",
  scss: "scss",
  sh: "bash",
  svg: "svg",
  ts: "typescript",
  tsx: "tsx",
  xml: "xml",
  yaml: "yaml",
  yml: "yaml",
  zsh: "zsh",
};

export function resolveDiffLanguage(
  path: string,
  language?: string | null,
): string | null {
  if (language && language !== "plaintext") {
    return language;
  }
  const basename = path.split("/").filter(Boolean).at(-1)?.toLowerCase() ?? "";
  if (basename === "dockerfile") {
    return "bash";
  }
  const dotIndex = basename.lastIndexOf(".");
  if (dotIndex < 0 || dotIndex === basename.length - 1) {
    return null;
  }
  return LANGUAGE_BY_EXTENSION[basename.slice(dotIndex + 1)] ?? null;
}
