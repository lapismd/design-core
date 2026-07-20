<script lang="ts">
  import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
  import MenuIcon from "@lucide/svelte/icons/menu";
  import type { Snippet } from "svelte";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import { Separator } from "@stevejuma/ui/shadcn/separator";
  import type {
    TasksPagerChangeHandler,
    TasksPagerState,
    TasksViewportId,
  } from "../../lib/contracts.js";
  import "../../lib/tasks-theme.css";

  type Props = {
    pager: TasksPagerState;
    /** Responsive contract viewport; drives the pane/pager layout policy. */
    viewport?: TasksViewportId;
    /** Whether a task is currently open in the detail region. */
    detailOpen?: boolean;
    onPagerChange?: TasksPagerChangeHandler;
    navigation: Snippet;
    main: Snippet;
    detail?: Snippet;
  };

  let {
    pager,
    viewport = "desktop",
    detailOpen = false,
    onPagerChange,
    navigation,
    main,
    detail,
  }: Props = $props();

  const onePane = $derived(
    viewport === "tablet-portrait" || viewport === "mobile",
  );

  function goToPane(pane: TasksPagerState["pane"]) {
    onPagerChange?.({ ...pager, pane });
  }
</script>

<div
  class="tasks-theme tasks-shell"
  data-tasks-shell
  data-viewport={viewport}
  data-pane={onePane ? pager.pane : undefined}
  data-detail-open={detailOpen ? "true" : undefined}
>
  {#if onePane}
    <div class="tasks-shell__topbar" data-tasks-shell-topbar>
      {#if pager.pane === "list"}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Open navigation"
          data-tasks-shell-open-nav
          onclick={() => goToPane("navigation")}
        >
          <MenuIcon aria-hidden="true" />
        </Button>
      {:else}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={pager.pane === "detail"
            ? "Back to list"
            : "Close navigation"}
          data-tasks-shell-back
          onclick={() => goToPane("list")}
        >
          <ArrowLeftIcon aria-hidden="true" />
        </Button>
      {/if}
    </div>
  {/if}

  <div class="tasks-shell__body">
    <div
      class="tasks-shell__navigation"
      data-tasks-shell-navigation
      inert={onePane && pager.pane !== "navigation" ? true : undefined}
    >
      {@render navigation()}
    </div>

    {#if !onePane}
      <Separator orientation="vertical" />
    {/if}

    <div
      class="tasks-shell__main"
      data-tasks-shell-main
      inert={onePane && pager.pane !== "list" ? true : undefined}
    >
      {@render main()}
    </div>

    {#if detail}
      {#if !onePane}
        <Separator orientation="vertical" />
      {/if}
      <div
        class="tasks-shell__detail"
        data-tasks-shell-detail
        inert={onePane && pager.pane !== "detail" ? true : undefined}
      >
        {@render detail()}
      </div>
    {/if}
  </div>
</div>

<style>
  .tasks-shell {
    display: grid;
    grid-template-rows: auto 1fr;
    height: 100%;
    min-height: 0;
    background: var(--tasks-canvas);
    color: var(--tasks-ink);
  }

  .tasks-shell__topbar {
    display: flex;
    align-items: center;
    min-height: 2.75rem;
    padding: 0 0.5rem;
    border-bottom: 1px solid var(--tasks-divider);
    background: var(--tasks-shell);
  }

  .tasks-shell__body {
    display: grid;
    grid-template-columns:
      var(--tasks-sidebar-width) auto minmax(0, 1fr) auto
      0;
    min-height: 0;
  }

  .tasks-shell[data-detail-open="true"] .tasks-shell__body {
    grid-template-columns:
      var(--tasks-sidebar-width) auto minmax(0, 1fr) auto
      var(--tasks-detail-width);
  }

  .tasks-shell[data-viewport="tablet-landscape"] .tasks-shell__body {
    position: relative;
    grid-template-columns: var(--tasks-sidebar-width) auto minmax(0, 1fr);
  }

  .tasks-shell__navigation,
  .tasks-shell__main,
  .tasks-shell__detail {
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }

  .tasks-shell[data-viewport="tablet-landscape"] .tasks-shell__detail {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: var(--tasks-detail-width);
    max-width: 100%;
    box-shadow: -4px 0 16px oklch(0 0 0 / 0.12);
    transform: translateX(100%);
    transition: transform var(--tasks-motion-standard) ease;
  }

  .tasks-shell[data-viewport="tablet-landscape"][data-detail-open="true"]
    .tasks-shell__detail {
    transform: translateX(0);
  }

  .tasks-shell[data-pane] .tasks-shell__body {
    grid-template-columns: 100%;
  }

  .tasks-shell[data-pane] .tasks-shell__navigation,
  .tasks-shell[data-pane] .tasks-shell__main,
  .tasks-shell[data-pane] .tasks-shell__detail {
    grid-column: 1;
    grid-row: 1;
  }

  .tasks-shell[data-pane="navigation"] .tasks-shell__main,
  .tasks-shell[data-pane="navigation"] .tasks-shell__detail,
  .tasks-shell[data-pane="list"] .tasks-shell__navigation,
  .tasks-shell[data-pane="list"] .tasks-shell__detail,
  .tasks-shell[data-pane="detail"] .tasks-shell__navigation,
  .tasks-shell[data-pane="detail"] .tasks-shell__main {
    display: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .tasks-shell__detail {
      transition: none;
    }
  }
</style>
