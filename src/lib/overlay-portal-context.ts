export type OverlayPortalContext = {
  portalTarget: Element | null;
};

export type OverlayPortalProps = {
  to?: Element | string;
  disabled?: boolean;
};

export function createOverlayPortalContext(): OverlayPortalContext {
  return { portalTarget: null };
}

function isCurrentRealmElement(value: unknown): value is Element {
  return typeof Element !== "undefined" && value instanceof Element;
}

function isCrossRealmElement(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    "nodeType" in value &&
    (value as { nodeType: number }).nodeType === 1 &&
    !isCurrentRealmElement(value)
  );
}

/**
 * Resolve a trigger-based overlay's portal without ever handing Bits UI an
 * Element created by a different Window realm.
 */
export function resolveOverlayPortalProps(
  portalContext: OverlayPortalContext | undefined,
  portalProps?: OverlayPortalProps,
  disablePortals = false,
): OverlayPortalProps | undefined {
  if (portalProps) return portalProps;
  if (disablePortals) return { disabled: true };

  const target = portalContext?.portalTarget;
  if (!target) return undefined;
  if (isCurrentRealmElement(target)) return { to: target };
  if (isCrossRealmElement(target)) return { disabled: true };
  return undefined;
}

export const dropdownMenuPortalContextKey = Symbol(
  "dropdown-menu-portal-context",
);
export const contextMenuPortalContextKey = Symbol(
  "context-menu-portal-context",
);
export const hoverCardPortalContextKey = Symbol("hover-card-portal-context");
export const tooltipPortalContextKey = Symbol("tooltip-portal-context");
export const popoverPortalContextKey = Symbol("popover-portal-context");
export const selectPortalContextKey = Symbol("select-portal-context");
export const disableOverlayPortalContextKey = Symbol("disable-overlay-portals");
