<script lang="ts">
  import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
  import MenuIcon from "@lucide/svelte/icons/menu";
  import type { Snippet } from "svelte";
  import { Button } from "@stevejuma/ui/shadcn/button";
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
            ? "Back to task list"
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

    <div class="tasks-shell__workspace">
      <div
        class="tasks-shell__main"
        data-tasks-shell-main
        inert={onePane && pager.pane !== "list" ? true : undefined}
      >
        {@render main()}
      </div>

      {#if detail}
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
</div>

<style>
  .tasks-shell {
    display: grid;
    grid-template-rows: auto 1fr;
    width: 100%;
    height: 100%;
    min-height: 0;
    padding: var(--tasks-space-canvas);
    background: var(--tasks-canvas);
    color: var(--tasks-ink);
  }

  .tasks-shell[data-viewport="mobile"] {
    padding: var(--tasks-space-canvas-compact);
  }

  .tasks-shell[data-pane] {
    padding: 0;
  }

  .tasks-shell__topbar {
    display: flex;
    align-items: center;
    min-height: var(--tasks-topbar-height);
    padding: 0 0.5rem;
    border-bottom: 1px solid var(--tasks-divider);
    background: var(--tasks-surface);
  }

  .tasks-shell__body {
    display: grid;
    grid-template-columns: var(--tasks-sidebar-width) minmax(0, 1fr);
    gap: var(--tasks-gap-nav);
    min-height: 0;
  }

  .tasks-shell__navigation {
    min-width: 0;
    min-height: 0;
    overflow: auto;
    background: transparent;
  }

  .tasks-shell__workspace {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    /* Flush with canvas; soft left edge separates nav (Superlist shell chrome). */
    border: 0;
    border-radius: 0;
    box-shadow: var(--tasks-shadow-workspace);
    background: var(--tasks-surface);
  }

  .tasks-shell[data-detail-open="true"] .tasks-shell__workspace {
    grid-template-columns: minmax(0, 1fr) var(--tasks-detail-width);
  }

  .tasks-shell__main,
  .tasks-shell__detail {
    min-width: 0;
    min-height: 0;
    overflow: auto;
  }

  .tasks-shell[data-detail-open="true"] .tasks-shell__main {
    border-right: 1px solid var(--tasks-divider);
  }

  .tasks-shell[data-viewport="tablet-landscape"] .tasks-shell__body {
    position: relative;
  }

  .tasks-shell[data-viewport="tablet-landscape"] .tasks-shell__workspace {
    position: relative;
    grid-template-columns: minmax(0, 1fr);
  }

  .tasks-shell[data-viewport="tablet-landscape"] .tasks-shell__main {
    border-right: none;
  }

  .tasks-shell[data-viewport="tablet-landscape"] .tasks-shell__detail {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: var(--tasks-detail-width);
    max-width: 100%;
    box-shadow: var(--tasks-shadow-detail);
    transform: translateX(100%);
    transition: transform var(--tasks-motion-standard) ease;
    border-left: 1px solid var(--tasks-divider);
    background: var(--tasks-surface);
  }

  .tasks-shell[data-viewport="tablet-landscape"][data-detail-open="true"]
    .tasks-shell__detail {
    transform: translateX(0);
  }

  .tasks-shell[data-pane] .tasks-shell__body {
    grid-template-columns: 100%;
    gap: 0;
  }

  .tasks-shell[data-pane] .tasks-shell__navigation,
  .tasks-shell[data-pane] .tasks-shell__workspace {
    grid-column: 1;
    grid-row: 1;
  }

  .tasks-shell[data-pane="navigation"] .tasks-shell__workspace,
  .tasks-shell[data-pane="list"] .tasks-shell__navigation,
  .tasks-shell[data-pane="detail"] .tasks-shell__navigation {
    display: none;
  }

  .tasks-shell[data-pane="navigation"] .tasks-shell__navigation,
  .tasks-shell[data-pane="list"] .tasks-shell__workspace,
  .tasks-shell[data-pane="detail"] .tasks-shell__workspace {
    display: grid;
  }

  .tasks-shell[data-pane="list"] .tasks-shell__detail,
  .tasks-shell[data-pane="navigation"] .tasks-shell__detail {
    display: none;
  }

  .tasks-shell[data-pane="detail"] .tasks-shell__main {
    display: none;
  }

  .tasks-shell[data-pane="detail"] .tasks-shell__detail {
    display: block;
    position: static;
    width: auto;
    transform: none;
    box-shadow: none;
    border-left: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .tasks-shell__detail {
      transition: none;
    }
  }
</style>
