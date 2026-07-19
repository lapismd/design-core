/**
 * Nested visual baseline paths mirror `src/shared/<…>/` component folders.
 *
 * Example:
 *   importPath: ./src/shared/shadcn/input-group/InputGroup.stories.svelte
 *   storyId:    shadcn-forms-input-group--addon-and-input
 *   →           shadcn/input-group/addon-and-input.png
 * Playwright then appends `-chromium-darwin`.
 */

export type StoryIndexEntry = {
  id: string;
  type?: string;
  name?: string;
  title?: string;
  importPath?: string;
  tags?: string[];
};

/** Directory under the snapshot root for a Storybook entry (posix separators). */
export function snapshotDirFromImportPath(importPath: string): string {
  const normalized = importPath.replace(/\\/g, "/");
  const stripped = normalized
    .replace(/^\.\//, "")
    .replace(/^src\/shared\//, "");
  // forms/form-field/FormField.stories.svelte → forms/form-field
  // shadcn/input-group/InputGroup.variations.stories.svelte → shadcn/input-group
  return stripped.replace(/\/[^/]+\.stories\.\w+$/, "");
}

export function storySlugFromId(storyId: string): string {
  const parts = storyId.split("--");
  if (parts.length < 2) {
    throw new Error(`Unexpected story id (missing --): ${storyId}`);
  }
  return parts.slice(1).join("--");
}

/** Relative path passed to `toHaveScreenshot` (no project/platform suffix). */
export function screenshotRelativePath(entry: StoryIndexEntry): string {
  if (!entry.importPath) {
    throw new Error(`Story ${entry.id} is missing importPath`);
  }
  const dir = snapshotDirFromImportPath(entry.importPath);
  const slug = storySlugFromId(entry.id);
  return `${dir}/${slug}.png`;
}

/** Flat legacy basename Playwright used before nesting. */
export function legacyFlatSnapshotName(storyId: string): string {
  return `${storyId}-chromium-darwin.png`;
}

/** Nested basename after Playwright appends project + platform. */
export function nestedSnapshotFileName(entry: StoryIndexEntry): string {
  const rel = screenshotRelativePath(entry);
  // rel ends with .png → insert -chromium-darwin before .png
  return rel.replace(/\.png$/, "-chromium-darwin.png");
}

/** Storybook story-id prefix for `-g` filtering, e.g. `shadcn-forms-input-group--`. */
export function storyIdPrefixFromTitle(storyTitle: string): string {
  const slug = storyTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug}--`;
}

/** Component folder match for nested keys like `shadcn/button/foo-chromium-darwin.png`. */
export function snapshotKeyMatchesComponent(
  key: string,
  component: string,
  extraIncludes: string[] = [],
): boolean {
  const needle = component.toLowerCase().replace(/\s+/g, "-");
  const normalized = key.replace(/\\/g, "/");
  if (normalized.includes(`shadcn/${needle}/`)) return true;
  if (normalized.includes(`forms/${needle}/`)) return true;
  // Legacy flat + explicit recipe prefixes
  for (const inc of extraIncludes) {
    if (normalized.includes(inc)) return true;
  }
  if (normalized.includes(`-${needle}--`)) return true;
  if (normalized.startsWith(`${needle}-`)) return true;
  return false;
}
