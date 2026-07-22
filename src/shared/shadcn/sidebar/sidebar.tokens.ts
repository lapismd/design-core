/**
 * Public CSS custom properties consumed by the sidebar family.
 *
 * Color/surface tokens are defined in `src/theme.css` (`:root` / `.dark`).
 * Width tokens are injected by `Sidebar.Provider` (see `constants.ts`).
 * Component CSS under this family reads these names directly — not `--ui-sidebar-*`.
 */
export const sidebarTokenNames = {
  background: "--sidebar",
  foreground: "--sidebar-foreground",
  primary: "--sidebar-primary",
  primaryForeground: "--sidebar-primary-foreground",
  accent: "--sidebar-accent",
  accentForeground: "--sidebar-accent-foreground",
  borderColor: "--sidebar-border",
  ring: "--sidebar-ring",
  width: "--sidebar-width",
  widthIcon: "--sidebar-width-icon",
} as const;

export type SidebarToken =
  (typeof sidebarTokenNames)[keyof typeof sidebarTokenNames];
