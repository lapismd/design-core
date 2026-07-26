import type { WorkspacePopoutHandle, WorkspacePopoutHost } from "./types.js";

export function createBrowserPopoutHost(): WorkspacePopoutHost {
  return {
    open({ id, title, bounds }) {
      const popup = window.open(
        "",
        `workspace-shell-${id}`,
        `popup=yes,left=${bounds.x},top=${bounds.y},width=${bounds.width},height=${bounds.height}`,
      );
      if (!popup) return null;
      popup.document.title = title;
      popup.document.documentElement.className =
        document.documentElement.className;
      for (const node of document.querySelectorAll(
        'style,link[rel="stylesheet"]',
      )) {
        popup.document.head.append(node.cloneNode(true));
      }
      const closeListeners = new Set<() => void>();
      const onUnload = () => {
        for (const listener of closeListeners) listener();
      };
      popup.addEventListener("beforeunload", onUnload, { once: true });
      const handle: WorkspacePopoutHandle = {
        window: popup,
        document: popup.document,
        focus: () => popup.focus(),
        close: () => popup.close(),
        onClose(listener) {
          closeListeners.add(listener);
          return () => closeListeners.delete(listener);
        },
      };
      return handle;
    },
  };
}
