export const paginationTokenNames = {
  background: "--ui-pagination-background",
  foreground: "--ui-pagination-foreground",
  borderColor: "--ui-pagination-border-color",
  radius: "--ui-pagination-radius",
  focusRingColor: "--ui-pagination-focus-ring-color",
} as const;

export type PaginationToken =
  (typeof paginationTokenNames)[keyof typeof paginationTokenNames];
