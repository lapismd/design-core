export const fileTypeIconTokenNames = {
  size: "--ui-file-type-icon-size",
  xs: "--ui-file-type-icon-size-xs",
  s: "--ui-file-type-icon-size-s",
  md: "--ui-file-type-icon-size-md",
  lg: "--ui-file-type-icon-size-lg",
  fallbackColor: "--ui-file-type-icon-fallback-color",
} as const;
export type FileTypeIconToken =
  (typeof fileTypeIconTokenNames)[keyof typeof fileTypeIconTokenNames];
