<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { AppShell } from "../app-shell/index.js";
  import { AppShellController } from "../core/app-shell-controller.svelte.js";
  import { problemsPlugin } from "../problems/index.js";
  import { APP_SHELL_SETTING_IDS } from "../core/built-in-settings.svelte.js";
  import { notificationsPlugin } from "../plugins/notifications/index.js";
  import type { NotificationProgressHandle } from "../core/notification-manager.svelte.js";

  let {
    manual = false,
    review = false,
    safeArea = false,
  }: { manual?: boolean; review?: boolean; safeArea?: boolean } = $props();
  const app = new AppShellController({
    plugins: [notificationsPlugin(), problemsPlugin()],
  });
  let progress: NotificationProgressHandle | undefined;
  const extraTasks: NotificationProgressHandle[] = [];
  let theme = $state<"inherit" | "light" | "dark">("inherit");
  let ribbonVisible = true;
  let narrow = $state(false);
  let mounts = $state(0);
  let disposals = $state(0);
  let clicks = $state(0);
  app.renderer.setSidebarOpen("left", false);
  app.renderer.setSidebarOpen("right", false);
  app.status.addItem({
    id: "repository",
    align: "left",
    label: "notes-vault",
    onSelect: () => {},
    icon: "git-branch",
    priority: 20,
  });
  app.status.addItem({
    id: "editor",
    align: "right",
    label: "Ln 14, Col 8",
    priority: 20,
  });
  app.status.addItem({
    id: "encoding",
    align: "right",
    label: "UTF-8",
    priority: 30,
  });
  app.status.addItem({
    id: "language",
    align: "right",
    label: "Markdown",
    priority: 40,
  });
  app.status.addItem({
    id: "custom-counter",
    align: "left",
    priority: -100,
    mount: (host) => {
      mounts += 1;
      const button = host.ownerDocument.createElement("button");
      button.textContent = "Custom status counter";
      button.setAttribute("aria-label", "Custom status counter");
      button.onclick = () => {
        clicks += 1;
      };
      host.append(button);
      return () => {
        disposals += 1;
        button.remove();
      };
    },
  });
  function start(long = false) {
    progress?.complete();
    progress = app.notifications.createProgress({
      id: "footer-story-task",
      title: long
        ? "Synchronizing a very long vault name with a remote repository while rebuilding the searchable history of every changed document"
        : "Indexing notes",
      location: "status",
      cancellable: true,
    });
  }
  function crowd() {
    for (const align of ["left", "right"] as const) {
      for (let i = 0; i < 5; i++)
        app.status.addItem({
          id: `${align}-extra-${i}`,
          align,
          label: `Extra ${align} item ${i}`,
          priority: i,
          onSelect: () => {
            clicks += 1;
          },
        });
    }
  }
  onMount(() => {
    let seeded = false;
    const seed = () => {
      if (!review || seeded) return;
      seeded = true;
      app.notifications.notify({
        title: "Backup complete",
        message: "Your vault history is up to date.",
        persist: true,
        duration: 2000,
      });
      app.status.addItem({
        id: "backup-diff",
        align: "left",
        label: "+12 −3",
        icon: "git-commit-horizontal",
        priority: 30,
        tooltip: "Working copy changes",
      });
      start();
      extraTasks.push(
        app.notifications.createProgress({
          id: "initial-fetch",
          title: "Fetching repository history",
          location: "status",
          cancellable: true,
        }),
      );
    };
    app.on("ready", seed);
    if (app.ready) seed();
    return () => app.off("ready", seed);
  });
  onDestroy(() => {
    progress?.complete();
    extraTasks.forEach((task) => task.complete());
    void app.dispose();
  });
</script>

<div class="footer-story-review">
  <div class="footer-story-controls">
    <button onclick={() => start()}>Start short task</button>
    <button onclick={() => start(true)}>Use long message</button>
    <button
      onclick={() => {
        progress?.complete();
        extraTasks.forEach((task) => task.complete());
      }}>Complete task</button
    >
    <button
      onclick={() =>
        extraTasks.push(
          app.notifications.createProgress({
            id: `extra-${extraTasks.length}`,
            title: "Fetching repository history",
            location: "status",
            cancellable: true,
          }),
        )}>Add background task</button
    >
    <button
      onclick={() => {
        app.renderer.setSidebarOpen("left", true);
        app.renderer.setSidebarOpen("right", true);
      }}>Open sidebars</button
    >
    <button
      onclick={() => {
        theme = theme === "dark" ? "light" : "dark";
        void app.configuration.set(
          APP_SHELL_SETTING_IDS.appearanceTheme,
          theme,
        );
      }}>Toggle theme</button
    >
    <button
      onclick={() => {
        ribbonVisible = !ribbonVisible;
        void app.configuration.set(
          APP_SHELL_SETTING_IDS.appearanceRibbon,
          ribbonVisible,
        );
      }}>Toggle ribbon</button
    >
    <button
      onclick={() => {
        narrow = !narrow;
        crowd();
      }}>Constrain footer</button
    >
    <button onclick={() => app.status.removeItem("custom-counter")}
      >Remove custom status</button
    >
    <output aria-label="Custom lifecycle"
      >{mounts} mounts / {disposals} disposals / {clicks} clicks</output
    >
  </div>
  <div
    class="footer-story-frame"
    class:footer-story-rounded-window={safeArea}
    style:width={narrow ? "620px" : "100%"}
  >
    <AppShell.Root controller={app} {theme}>
      {#if manual}
        <AppShell.Ribbon />
        <AppShell.DesktopLayout>
          <AppShell.LeftSidebar onOpenSettings={() => app.settings.open()} />
          <AppShell.Main><AppShell.Workspace /></AppShell.Main>
          <AppShell.RightSidebar />
          <AppShell.BottomPanel />
        </AppShell.DesktopLayout>
        <AppShell.FloatingLayer />
        <AppShell.StatusBar />
        <AppShell.SettingsDialog bind:open={app.settings.dialogOpen} />
      {:else}
        <AppShell.Surface displayMode="desktop" />
      {/if}
    </AppShell.Root>
  </div>
</div>

<style>
  .footer-story-review {
    display: flex;
    flex-direction: column;
    height: 100dvh;
    min-height: 0;
  }
  .footer-story-frame {
    flex: 1 1 auto;
    min-height: 0;
    max-width: 100%;
  }
  .footer-story-rounded-window {
    --ui-workspace-safe-area-inline-start: 8px;
    --ui-workspace-safe-area-inline-end: 12px;
    --ui-workspace-safe-area-block-end: 4px;
    border-radius: 12px;
    overflow: hidden;
  }
  .footer-story-controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
  }
  .footer-story-controls button {
    font: inherit;
    font-size: 0.75rem;
  }
  .footer-story-controls output {
    font-size: 0.75rem;
  }
</style>
