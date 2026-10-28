export interface AppShellTeleportOptions {
  enabled: boolean;
  target: HTMLElement | null;
}

/**
 * Re-parent one compound part into a root-owned mobile lane while retaining
 * its original desktop position.
 */
export function appShellTeleport(
  node: HTMLElement,
  options: AppShellTeleportOptions,
): {
  update: (next: AppShellTeleportOptions) => void;
  destroy: () => void;
} {
  const anchor = document.createComment("app-shell-teleport");
  node.before(anchor);

  function move(parent: Node, before: Node | null): void {
    if (node.parentNode === parent && node.nextSibling === before) return;
    const focused = node.contains(node.ownerDocument.activeElement)
      ? (node.ownerDocument.activeElement as HTMLElement | null)
      : null;
    // Native state-preserving moves retain focus and open descendant widgets.
    const destination = parent as Node & {
      moveBefore?: (node: Node, before: Node | null) => void;
    };
    if (destination.moveBefore && node.isConnected && parent.isConnected) {
      destination.moveBefore(node, before);
    } else {
      parent.insertBefore(node, before);
      if (focused?.isConnected && typeof focused.focus === "function") {
        focused.focus({ preventScroll: true });
      }
    }
  }

  function restore(): void {
    if (anchor.parentNode)
      move(
        anchor.parentNode,
        anchor.nextSibling === node ? node.nextSibling : anchor.nextSibling,
      );
  }

  function update(next: AppShellTeleportOptions): void {
    if (next.enabled && next.target) move(next.target, null);
    else restore();
  }

  update(options);

  return {
    update,
    destroy() {
      node.remove();
      anchor.remove();
    },
  };
}
