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
    .replace(/^src\/shared\//, "")
    .replace(/^src\/apps\//, "apps/")
    .replace(/^packages\/tasks\/src\//, "tasks/");
  // forms/form-field/FormField.stories.svelte → forms/form-field
  // shadcn/input-group/InputGroup.variations.stories.svelte → shadcn/input-group
  // apps/cv/cv-form-overview/CvFormOverview.stories.svelte → apps/cv/cv-form-overview
  // packages/tasks/src/components/task-row/TaskRow.stories.svelte → tasks/components/task-row
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

/**
 * Mid-play interaction baseline path (no project/platform suffix).
 * On disk: `{slug}--{stepId}-chromium-darwin.png`.
 */
export function interactionScreenshotRelativePath(
  entry: StoryIndexEntry,
  stepId: string,
): string {
  const primary = screenshotRelativePath(entry);
  const id = stepId.trim();
  if (!id) {
    throw new Error(`Story ${entry.id}: interaction stepId is required`);
  }
  return primary.replace(/\.png$/, `--${id}.png`);
}

/** Flat legacy basename Playwright used before nesting. */
export function legacyFlatSnapshotName(storyId: string): string {
  return `${storyId}-chromium-darwin.png`;
}

/**
 * Nested path after Playwright appends `-{project}-{platform}` before `.png`.
 * Defaults match the historical chromium/darwin layout.
 */
export function nestedSnapshotFileName(
  entry: StoryIndexEntry,
  project = "chromium",
  platform: NodeJS.Platform | string = "darwin",
): string {
  const rel = screenshotRelativePath(entry);
  return rel.replace(/\.png$/, `-${project}-${platform}.png`);
}

/** Storybook story-id prefix for `-g` filtering, e.g. `shadcn-forms-input-group--`. */
export function storyIdPrefixFromTitle(storyTitle: string): string {
  const slug = storyTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug}--`;
}

/** Prefix used for `-g` from a full story id (`shadcn-disclosure-accordion--…`). */
export function storyIdPrefixFromStoryId(storyId: string): string {
  const head = storyId.split("--")[0]?.trim();
  if (!head) {
    throw new Error(`Unexpected story id (empty): ${storyId}`);
  }
  return `${head}--`;
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
  if (normalized.includes(`tasks/components/${needle}/`)) return true;
  if (normalized.includes(`tasks/${needle}/`)) return true;
  // Legacy flat + explicit recipe prefixes
  for (const inc of extraIncludes) {
    if (normalized.includes(inc)) return true;
  }
  if (normalized.includes(`-${needle}--`)) return true;
  if (normalized.startsWith(`${needle}-`)) return true;
  return false;
}
