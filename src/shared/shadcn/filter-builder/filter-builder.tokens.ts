export const filterBuilderTokenNames = [
  "--ui-filter-builder-background",
  "--ui-filter-builder-border",
  "--ui-filter-builder-radius",
  "--ui-filter-builder-gap",
  "--ui-filter-builder-width",
] as const;
export type FilterBuilderToken = (typeof filterBuilderTokenNames)[number];
