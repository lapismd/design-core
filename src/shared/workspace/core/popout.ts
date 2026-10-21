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
      const closeListeners = new Set<() => void>();
      let requestClose: (() => Promise<boolean>) | undefined;
      let admitted = false;
      let pending = false;
      const beforeUnload = (event: BeforeUnloadEvent) => {
        if (admitted || !requestClose) return;
        event.preventDefault();
        event.returnValue = "";
        if (pending) return;
        pending = true;
        void requestClose()
          .catch(() => false)
          .finally(() => {
            pending = false;
          });
      };
      popup.addEventListener("beforeunload", beforeUnload);
      popup.addEventListener(
        "pagehide",
        () => {
          for (const listener of closeListeners) listener();
          closeListeners.clear();
        },
        { once: true },
      );
      const handle: WorkspacePopoutHandle = {
        window: popup,
        document: popup.document,
        focus: () => popup.focus(),
        close: () => {
          admitted = true;
          popup.close();
        },
        onClose(listener) {
          closeListeners.add(listener);
          return () => closeListeners.delete(listener);
        },
        onCloseRequest(listener) {
          requestClose = listener;
          return () => {
            if (requestClose === listener) requestClose = undefined;
          };
        },
      };
      return handle;
    },
  };
}
