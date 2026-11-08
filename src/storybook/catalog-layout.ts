type CatalogStoryContext = {
  title?: string;
  viewMode?: string;
  parameters?: { catalogLayout?: "full-viewport" };
};

const FULL_VIEWPORT_TITLE_PREFIXES = ["Workspace/", "Shell/"] as const;

/** Keep application-shell stories edge-to-edge without widening the catalog. */
export function usesFullViewportCatalogLayout(
  context: CatalogStoryContext,
): boolean {
  if (context.viewMode !== "story") return false;
  if (context.parameters?.catalogLayout === "full-viewport") return true;
  const title = context.title ?? "";
  return FULL_VIEWPORT_TITLE_PREFIXES.some((prefix) =>
    title.startsWith(prefix),
  );
}

/** Synchronize the body marker consumed by `src/storybook.css`. */
export function syncCatalogStoryLayout(
  document: Document,
  context: CatalogStoryContext,
): void {
  document.body.toggleAttribute(
    "data-ui-catalog-full-viewport",
    usesFullViewportCatalogLayout(context),
  );
}
