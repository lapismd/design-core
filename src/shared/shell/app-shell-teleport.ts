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

  function restore(): void {
    anchor.parentNode?.insertBefore(node, anchor.nextSibling);
  }

  function update(next: AppShellTeleportOptions): void {
    if (next.enabled && next.target) next.target.appendChild(node);
    else restore();
  }

  update(options);

  return {
    update,
    destroy() {
      restore();
      anchor.remove();
    },
  };
}
