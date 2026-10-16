<script lang="ts">
  import { getAllContexts, mount, onMount, unmount } from "svelte";
  import {
    createBrowserPopoutHost,
    type WorkspacePopoutHost,
  } from "../core/index.js";
  import type { WorkspaceTheme } from "../core/types.js";
  import type { ScrollAreaVisibility } from "../../shadcn/scroll-area/index.js";
  import { getAppShellContext } from "../app-shell/app-shell-context.svelte.js";
  import WorkspacePopoutShell from "./WorkspacePopoutShell.svelte";
  import { mirrorPopoutDocument } from "./popout-document.js";

  let {
    host,
    theme = "inherit",
    scrollbarVisibility = "scroll",
    appearanceStyle = "",
  }: {
    host?: WorkspacePopoutHost | null;
    theme?: WorkspaceTheme;
    scrollbarVisibility?: ScrollAreaVisibility;
    appearanceStyle?: string;
  } = $props();
  const context = getAllContexts();
  const shell = getAppShellContext();
  const { controller, drag } = shell;
  const settings = $state<{
    theme: WorkspaceTheme;
    scrollbarVisibility: ScrollAreaVisibility;
    appearanceStyle: string;
  }>({ theme: "inherit", scrollbarVisibility: "scroll", appearanceStyle: "" });
  const mounts = new Map<
    string,
    { component: ReturnType<typeof mount>; dispose: () => void }
  >();
  $effect(() => {
    settings.theme = theme;
    settings.scrollbarVisibility = scrollbarVisibility;
    settings.appearanceStyle = appearanceStyle;
  });
  $effect(() => {
    const liveIds = new Set(
      controller.renderer.layout.windows
        .filter((win) => win.mode === "popout")
        .map((win) => win.id),
    );
    for (const [id, entry] of mounts) {
      if (!liveIds.has(id)) {
        void unmount(entry.component);
        entry.dispose();
        mounts.delete(id);
      }
    }
    for (const id of liveIds) {
      if (mounts.has(id)) continue;
      const handle = controller.renderer.getPopoutHandle(id);
      if (!handle || !shell.root) continue;
      const target = handle.document.body;
      Object.assign(target.style, {
        width: "100vw",
        height: "100vh",
        margin: "0",
        overflow: "hidden",
      });
      const dispose = mirrorPopoutDocument(shell.root, handle.document);
      const component = mount(WorkspacePopoutShell, {
        target,
        context,
        props: { app: controller, id, drag, settings },
      });
      mounts.set(id, { component, dispose });
    }
  });
  onMount(() => {
    controller.renderer.setPopoutHost(
      host === undefined ? createBrowserPopoutHost() : host,
    );
    return () => {
      controller.renderer.setPopoutHost(null);
      for (const entry of mounts.values()) {
        void unmount(entry.component);
        entry.dispose();
      }
      mounts.clear();
    };
  });
</script>
