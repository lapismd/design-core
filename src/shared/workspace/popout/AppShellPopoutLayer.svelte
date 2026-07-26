<script lang="ts">
  import { mount, onMount, unmount } from "svelte";
  import {
    createBrowserPopoutHost,
    type WorkspacePopoutHost,
  } from "../core/index.js";
  import type { WorkspaceTheme } from "../core/types.js";
  import { getAppShellContext } from "../app-shell/app-shell-context.svelte.js";
  import WorkspacePopoutSurface from "./WorkspacePopoutSurface.svelte";

  let {
    host,
    theme = "inherit",
  }: {
    host?: WorkspacePopoutHost | null;
    theme?: WorkspaceTheme;
  } = $props();

  const { controller, drag } = getAppShellContext();
  const mounts = new Map<
    string,
    { component: ReturnType<typeof mount>; theme: WorkspaceTheme }
  >();

  $effect(() => {
    const liveIds = new Set(
      controller.renderer.layout.windows
        .filter((workspaceWindow) => workspaceWindow.mode === "popout")
        .map((workspaceWindow) => workspaceWindow.id),
    );
    for (const [id, entry] of mounts) {
      if (!liveIds.has(id)) {
        void unmount(entry.component);
        mounts.delete(id);
      }
    }
    for (const workspaceWindow of controller.renderer.layout.windows) {
      if (workspaceWindow.mode !== "popout") continue;
      const handle = controller.renderer.getPopoutHandle(workspaceWindow.id);
      if (!handle) continue;
      const target = handle.document.body;
      Object.assign(target.style, {
        width: "100vw",
        height: "100vh",
        margin: "0",
        overflow: "hidden",
      });
      const existing = mounts.get(workspaceWindow.id);
      if (existing?.theme === theme) continue;
      if (existing) void unmount(existing.component);
      target.replaceChildren();
      const component = mount(WorkspacePopoutSurface, {
        target,
        props: {
          controller: controller.renderer,
          window: workspaceWindow,
          drag,
          theme,
        },
      });
      mounts.set(workspaceWindow.id, { component, theme });
    }
  });

  onMount(() => {
    controller.renderer.setPopoutHost(
      host === undefined ? createBrowserPopoutHost() : host,
    );
    return () => {
      controller.renderer.setPopoutHost(null);
      for (const entry of mounts.values()) void unmount(entry.component);
      mounts.clear();
    };
  });
</script>
