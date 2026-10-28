/** A presentation-only switch. Hosts retain the content and current view. */
export interface ContentViewToggleProps {
  view?: "formatted" | "source" | undefined;
  sourceLabel?: string | undefined;
  formattedLabel?: string | undefined;
  disabled?: boolean | undefined;
  onViewChange?: ((view: "formatted" | "source") => void) | undefined;
}
