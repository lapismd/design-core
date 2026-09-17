<script lang="ts">
  import { Button } from "../../../shadcn/button/index.js";
  import type {
    AppShellController,
    AppShellDisplayMode,
    AppShellSidebarController,
  } from "../app-shell-controller.svelte.js";
  import { AppShell } from "../index.js";
  import "./AppShellExamples.css";

  let {
    controller,
    overview,
    activity,
    displayMode = "desktop",
    frameClass,
    direction = "ltr",
  }: {
    controller: AppShellController;
    overview: AppShellSidebarController;
    activity: AppShellSidebarController;
    displayMode?: AppShellDisplayMode;
    frameClass?: string;
    direction?: "ltr" | "rtl";
  } = $props();

  let surfaceOpen = $state(false);
  let surfaceTrigger = $state<HTMLButtonElement | null>(null);
</script>

<div
  class={["ui-shell-story-frame", "ui-shell-story-multi-panel", frameClass]
    .filter(Boolean)
    .join(" ")}
  dir={direction}
>
  <AppShell.Root
    {controller}
    {displayMode}
    mobileBreakpoint={760}
    desktopMinMainWidth={440}
    class="ui-shell-story-surface"
  >
    <AppShell.Sidebar side="left" label="Navigation" resizable>
      <AppShell.Sidebar.Header>
        <strong>Workspace</strong>
      </AppShell.Sidebar.Header>
      <AppShell.Sidebar.Body>
        <nav class="ui-shell-story-multi-panel__nav" aria-label="Workspace">
          <button type="button" data-active>Inbox</button>
          <button type="button">Projects</button>
          <button type="button">Archive</button>
        </nav>
      </AppShell.Sidebar.Body>
    </AppShell.Sidebar>

    <AppShell.Main>
      <AppShell.Toolbar class="ui-shell-story-multi-panel__toolbar">
        <AppShell.Sidebar.Toggle side="left" sidebarName="navigation" />
        <strong>Project updates</strong>
        <span></span>
        <AppShell.Sidebar.Toggle side="right" sidebarName="details" />
        <AppShell.Sidebar.Toggle
          side="right"
          sidebarController={overview}
          sidebarName="overview"
        />
      </AppShell.Toolbar>
      <AppShell.Body label="Project workspace">
        <article class="ui-shell-story-multi-panel__content">
          <p>Project workspace</p>
          <h1>Composable same-side panels</h1>
          <p>
            The main surface stays mounted while inspectors, overview rails, and
            structural layers respond to the available width.
          </p>
          <button type="button">Draft update</button>
        </article>
      </AppShell.Body>
    </AppShell.Main>

    <AppShell.Sidebar
      side="right"
      label="Details"
      constraintPriority={0}
      constrainedPresentation="replace-main"
      closeable
    >
      <AppShell.Sidebar.Header>
        <strong>Details</strong>
        <AppShell.Sidebar.Close />
      </AppShell.Sidebar.Header>
      <AppShell.Sidebar.Body>
        <div class="ui-shell-story-multi-panel__panel-copy">
          <p>Owner</p>
          <strong>Design systems</strong>
          <p>Status</p>
          <strong>In review</strong>
        </div>
      </AppShell.Sidebar.Body>
    </AppShell.Sidebar>

    <AppShell.Sidebar
      side="right"
      sidebarController={overview}
      label="Overview rail"
      variant="rail"
      constraintPriority={100}
      resizable
    >
      <AppShell.Sidebar.Body>
        <nav class="ui-shell-story-multi-panel__rail" aria-label="Overview">
          <button type="button"><span>Reviews</span><small>4</small></button>
          <button type="button"><span>People</span><small>12</small></button>
        </nav>
      </AppShell.Sidebar.Body>
    </AppShell.Sidebar>

    <AppShell.Sidebar
      side="right"
      sidebarController={activity}
      label="Activity rail"
      variant="rail"
      constraintPriority={100}
      resizable
    >
      <AppShell.Sidebar.Body>
        <nav class="ui-shell-story-multi-panel__rail" aria-label="Activity">
          <button type="button"><span>Tasks</span><small>7</small></button>
          <button type="button"><span>Commits</span><small>18</small></button>
          <Button
            bind:ref={surfaceTrigger}
            variant="outline"
            size="sm"
            onclick={() => (surfaceOpen = true)}
          >
            Open reviews
          </Button>
        </nav>
      </AppShell.Sidebar.Body>
    </AppShell.Sidebar>

    <AppShell.SurfaceLayer
      open={surfaceOpen}
      label="Release reviews"
      coverPanelIds={["right"]}
      suspendPanelIds={["overview"]}
      returnFocus={surfaceTrigger}
      dismissLabel="Close reviews"
      onDismiss={() => (surfaceOpen = false)}
    >
      <AppShell.SurfaceLayer.Header>
        <strong>Release reviews</strong>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Close release reviews"
          onclick={() => (surfaceOpen = false)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18M6 6l12 12"></path>
          </svg>
        </Button>
      </AppShell.SurfaceLayer.Header>
      <AppShell.SurfaceLayer.Body>
        <div class="ui-shell-story-multi-panel__reviews">
          <article>
            <strong>History 0.1.3</strong>
            <span>Pending review</span>
          </article>
          <article>
            <strong>Markdown 0.1.5</strong>
            <span>Approved</span>
          </article>
        </div>
      </AppShell.SurfaceLayer.Body>
    </AppShell.SurfaceLayer>
  </AppShell.Root>
</div>
