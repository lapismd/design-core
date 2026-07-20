/** Semantic names for later Tasks components; values live in the scoped CSS companion theme. */
export const tasksThemeTokens = [
  "canvas",
  "shell",
  "surface",
  "surface-raised",
  "ink",
  "muted-ink",
  "divider",
  "focus-ring",
  "accent",
  "accent-ink",
  "selection",
  "danger",
  "success",
  "task-row-height",
  "sidebar-width",
  "detail-width",
  "radius-shell",
  "radius-control",
  "motion-fast",
  "motion-standard",
] as const;

export type TasksThemeToken = (typeof tasksThemeTokens)[number];
