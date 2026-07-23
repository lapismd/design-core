export const breadcrumbTokenNames = {
  background: "--ui-breadcrumb-background",
  foreground: "--ui-breadcrumb-foreground",
  borderColor: "--ui-breadcrumb-border-color",
  radius: "--ui-breadcrumb-radius",
  focusRingColor: "--ui-breadcrumb-focus-ring-color",
} as const;

export type BreadcrumbToken =
  (typeof breadcrumbTokenNames)[keyof typeof breadcrumbTokenNames];
