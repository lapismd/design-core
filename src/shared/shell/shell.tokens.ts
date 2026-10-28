/** Public CSS custom properties for `@lapismd/design-core/shell`. */
export const shellTokenNames = {
  topbarHeight: "--ui-shell-topbar-height",
  topbarPadding: "--ui-shell-topbar-padding",
  topbarBackground: "--ui-shell-topbar-background",
  topbarBodyBackground: "--ui-shell-topbar-body-background",
  attachedDivider: "--ui-shell-attached-divider",
  attachedShadow: "--ui-shell-attached-shadow",
  attachedHeaderPadding: "--ui-shell-attached-header-padding",
  attachedFooterPadding: "--ui-shell-attached-footer-padding",
  sidebarSectionGap: "--ui-shell-sidebar-section-gap",
  sidebarSectionPadding: "--ui-shell-sidebar-section-padding",
  surfaceLayerHeaderPadding: "--ui-shell-surface-layer-header-padding",
  surfaceLayerFooterPadding: "--ui-shell-surface-layer-footer-padding",
  surfaceLayerFooterBorder: "--ui-shell-surface-layer-footer-border",
  surfaceLayerMobileMainStartAllowance:
    "--ui-shell-surface-layer-mobile-main-start-allowance",
  surfaceLayerMobileInlineEndInset:
    "--ui-shell-surface-layer-mobile-inline-end-inset",

  height: "--ui-shell-height",
  leftSidebarWidth: "--ui-shell-left-sidebar-width",
  rightSidebarWidth: "--ui-shell-right-sidebar-width",
  rightSidebarGap: "--ui-shell-right-sidebar-gap",
  collapsedSidebarWidth: "--ui-shell-collapsed-sidebar-width",
  bodySidebarWidth: "--ui-shell-body-sidebar-width",
  mobileSidebarWidth: "--ui-shell-mobile-sidebar-width",
  desktopMinMainWidth: "--ui-shell-desktop-min-main-width",
  sidebarToggleIndicatorWidth: "--ui-shell-sidebar-toggle-indicator-width",
  toolbarHeight: "--ui-shell-toolbar-height",
  toolbarPaddingInline: "--ui-shell-toolbar-padding-inline",
  toolbarPaddingBlock: "--ui-shell-toolbar-padding-block",
  mainBlockInset: "--ui-shell-main-block-inset",
  mainRadius: "--ui-shell-main-radius",
  mainShadow: "--ui-shell-main-shadow",
  mainBorder: "--ui-shell-main-border",
  surfaceLayerMainStartAllowance:
    "--ui-shell-surface-layer-main-start-allowance",
  surfaceLayerInlineEndInset: "--ui-shell-surface-layer-inline-end-inset",
} as const;

export type ShellTokenKey = keyof typeof shellTokenNames;
export type ShellToken = (typeof shellTokenNames)[ShellTokenKey];

/** Default bindings from `shell.tokens.css`. */
export const shellTokenDefaults: Record<ShellTokenKey, string> = {
  topbarHeight: "2.75rem",
  topbarPadding: "0.5rem",
  topbarBackground: "initial",
  topbarBodyBackground: "initial",
  attachedDivider: "1px solid var(--border)",
  attachedShadow: "none",
  attachedHeaderPadding: "0.125rem 0.75rem",
  attachedFooterPadding: "0.75rem",
  sidebarSectionGap: "0.5rem",
  sidebarSectionPadding: "0.75rem",
  surfaceLayerHeaderPadding: "0.625rem 0.75rem 0.625rem 1rem",
  surfaceLayerFooterPadding: "0.75rem 1rem",
  surfaceLayerFooterBorder: "1px solid var(--border)",
  surfaceLayerMobileMainStartAllowance: "initial",
  surfaceLayerMobileInlineEndInset: "initial",

  height: "100vh",
  leftSidebarWidth: "18rem",
  rightSidebarWidth: "18rem",
  rightSidebarGap: "0.5rem",
  collapsedSidebarWidth: "3rem",
  bodySidebarWidth: "14rem",
  mobileSidebarWidth: "min(22rem, 86cqw)",
  desktopMinMainWidth: "36rem",
  sidebarToggleIndicatorWidth: "24%",
  toolbarHeight: "3rem",
  toolbarPaddingInline: "1rem",
  toolbarPaddingBlock: "0.125rem",
  mainBlockInset: "0.5rem",
  mainRadius: "0.875rem",
  mainShadow:
    "0 1px 3px color-mix(in srgb, var(--foreground) 10%, transparent), 0 1px 2px -1px color-mix(in srgb, var(--foreground) 10%, transparent)",
  mainBorder: "1px solid var(--border)",
  surfaceLayerMainStartAllowance: "0px",
  surfaceLayerInlineEndInset: "var(--ui-shell-main-block-inset)",
};
