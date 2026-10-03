/** Keep a viewport in the active modal's focus scope without taking focus. */
export function notificationPortal(node: HTMLElement, enabled: boolean) {
  if (!enabled) return {};
  const placeholder = document.createComment("notification viewport");
  node.before(placeholder);
  node.setAttribute("popover", "manual");
  const place = () => {
    const dialogs = [
      ...document.querySelectorAll<HTMLElement>(
        ':modal, [role="dialog"][aria-modal="true"], [role="alertdialog"][aria-modal="true"]',
      ),
    ].filter(
      (element) =>
        element.isConnected &&
        element.getClientRects().length &&
        element.dataset.state !== "closed",
    );
    const target = dialogs.at(-1) ?? document.body;
    if (node.parentElement !== target) {
      const focus = node.contains(document.activeElement)
        ? (document.activeElement as HTMLElement)
        : null;
      target.append(node);
      if (!node.matches(":popover-open")) node.showPopover?.();
      focus?.focus({ preventScroll: true });
    }
  };
  place();
  const observer = new MutationObserver(place);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["data-state", "open", "aria-modal"],
  });
  return {
    destroy() {
      observer.disconnect();
      node.hidePopover?.();
      node.remove();
      placeholder.remove();
    },
  };
}
