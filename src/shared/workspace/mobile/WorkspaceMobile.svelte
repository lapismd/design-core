<script lang="ts">
  import { untrack } from "svelte";
  import type { WorkspaceNode, WorkspaceTab } from "../core/types.js";
  import type { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import WorkspaceViewHost from "../view-host/WorkspaceViewHost.svelte";
  import WorkspaceMobileActionsDrawer from "./WorkspaceMobileActionsDrawer.svelte";
  import WorkspaceMobileDock from "./WorkspaceMobileDock.svelte";
  import WorkspaceMobileSidebar from "./WorkspaceMobileSidebar.svelte";
  import WorkspaceMobileTabs from "./WorkspaceMobileTabs.svelte";
  import WorkspaceMobileViewActions from "./WorkspaceMobileViewActions.svelte";
  import "./WorkspaceMobile.css";

  let {
    controller,
    createTab,
    defaultPage = "editor",
    showBottomNav = true,
    includeSidebarsInTabs = true,
    includeFloatingInTabs = true,
    onOpenSettings,
  }: {
    controller: WorkspaceShellController;
    createTab?: (paneId: string) => WorkspaceTab;
    defaultPage?: "editor" | "tabs";
    showBottomNav?: boolean;
    includeSidebarsInTabs?: boolean;
    includeFloatingInTabs?: boolean;
    onOpenSettings?: () => void;
  } = $props();

  type Reveal = "left" | "center" | "right";
  type Entry = {
    tab: WorkspaceTab;
    paneId: string;
    origin: "main" | "left" | "right" | "floating";
  };
  type PanGesture = {
    pointerId: number;
    startX: number;
    startY: number;
    startOffset: number;
    sidebarWidth: number;
    currentOffset: number;
    lastX: number;
    lastTime: number;
    velocityX: number;
    dragging: boolean;
    captured: boolean;
    startedOnClosePanel: boolean;
  };

  let page = $state<"editor" | "tabs">(untrack(() => defaultPage));
  let reveal = $state<Reveal>("center");
  let menuOpen = $state(false);
  let stageElement = $state<HTMLDivElement | null>(null);
  let panGesture = $state<PanGesture | null>(null);
  let measuredSidebarWidth = $state(0);
  let activeTab = $derived(controller.activeTab);

  function collectEntries(
    node: WorkspaceNode,
    origin: Entry["origin"],
    result: Entry[] = [],
  ): Entry[] {
    if (node.kind === "split") {
      node.children.forEach((child) => collectEntries(child, origin, result));
      return result;
    }
    for (const item of node.items) {
      const tabs = item.kind === "tab" ? [item] : item.tabs;
      tabs.forEach((tab) => result.push({ tab, paneId: node.id, origin }));
    }
    return result;
  }

  let mainEntries = $derived(collectEntries(controller.layout.main, "main"));
  let entries = $derived([
    ...mainEntries,
    ...(includeSidebarsInTabs
      ? [
          ...collectEntries(controller.layout.left.root, "left"),
          ...collectEntries(controller.layout.right.root, "right"),
        ]
      : []),
    ...(includeFloatingInTabs
      ? controller.layout.windows.flatMap((workspaceWindow) =>
          collectEntries(workspaceWindow.root, "floating"),
        )
      : []),
  ]);
  let stageDragging = $derived(Boolean(panGesture?.dragging));
  let stageOffset = $derived(
    panGesture?.dragging ? `${panGesture.currentOffset}px` : offsetFor(reveal),
  );

  $effect(() => {
    const stage = stageElement;
    if (!stage) return;
    const refresh = () => {
      measuredSidebarWidth = sidebarWidth();
    };
    refresh();
    const observer = new ResizeObserver(refresh);
    observer.observe(stage);
    window.addEventListener("resize", refresh, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", refresh);
      clearGesture();
    };
  });

  function paneIdFor(tabId: string) {
    return (
      entries.find((entry) => entry.tab.id === tabId)?.paneId ??
      controller.activePaneId ??
      "main"
    );
  }

  function openTab(tab: WorkspaceTab) {
    const entry = entries.find((candidate) => candidate.tab.id === tab.id);
    controller.selectTab(tab.id);
    page = "editor";
    reveal =
      entry?.origin === "left"
        ? "left"
        : entry?.origin === "right"
          ? "right"
          : "center";
  }

  function addTab() {
    const paneId = controller.activePaneId;
    if (!createTab || !paneId) return;
    controller.addTab(paneId, createTab(paneId), true);
  }

  function sidebarWidth(): number {
    const sidebar = stageElement?.querySelector<HTMLElement>(
      '[data-mobile-sidebar-panel="left"]',
    );
    const width = sidebar?.offsetWidth ?? 0;
    return width > 0 ? width : Math.min(22 * 16, window.innerWidth * 0.86);
  }

  function offsetFor(nextReveal: Reveal): string {
    return nextReveal === "left"
      ? "0px"
      : nextReveal === "right"
        ? "calc(-2 * var(--ui-workspace-mobile-sidebar-width))"
        : "calc(-1 * var(--ui-workspace-mobile-sidebar-width))";
  }

  function numericOffset(nextReveal: Reveal, width: number): number {
    return nextReveal === "left"
      ? 0
      : nextReveal === "right"
        ? -2 * width
        : -width;
  }

  function isStageControl(target: EventTarget | null): boolean {
    return (
      target instanceof Element &&
      Boolean(target.closest("[data-mobile-stage-control]"))
    );
  }

  function isClosePanel(target: EventTarget | null): boolean {
    return (
      target instanceof Element &&
      Boolean(target.closest("[data-mobile-stage-close-panel]"))
    );
  }

  function handlePointerDown(event: PointerEvent) {
    if (!stageElement || menuOpen || event.button !== 0) return;
    if (isStageControl(event.target)) return;
    measuredSidebarWidth = sidebarWidth();
    const startedOnClosePanel = isClosePanel(event.target);
    const captured = event.pointerType !== "touch";
    if (captured) stageElement.setPointerCapture?.(event.pointerId);
    panGesture = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startOffset: numericOffset(reveal, measuredSidebarWidth),
      sidebarWidth: measuredSidebarWidth,
      currentOffset: numericOffset(reveal, measuredSidebarWidth),
      lastX: event.clientX,
      lastTime: event.timeStamp,
      velocityX: 0,
      dragging: false,
      captured,
      startedOnClosePanel,
    };
    if (event.pointerType === "touch") {
      document.addEventListener("pointermove", handlePointerMove, {
        passive: false,
      });
      document.addEventListener("pointerup", handlePointerEnd);
      document.addEventListener("pointercancel", handlePointerCancel);
    }
  }

  function handlePointerMove(event: PointerEvent) {
    const gesture = panGesture;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    const dx = event.clientX - gesture.startX;
    const dy = event.clientY - gesture.startY;
    if (!gesture.dragging) {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
      if (Math.abs(dx) <= Math.abs(dy)) {
        clearGesture();
        return;
      }
      gesture.dragging = true;
    }
    event.preventDefault();
    gesture.currentOffset = Math.max(
      -2 * gesture.sidebarWidth,
      Math.min(0, gesture.startOffset + dx),
    );
    const elapsed = Math.max(1, event.timeStamp - gesture.lastTime);
    gesture.velocityX = (event.clientX - gesture.lastX) / elapsed;
    gesture.lastX = event.clientX;
    gesture.lastTime = event.timeStamp;
    panGesture = { ...gesture };
  }

  function settleGesture(gesture: PanGesture, endX: number) {
    if (!gesture.dragging) return;
    if (Math.abs(gesture.velocityX) >= 0.45) {
      reveal =
        gesture.velocityX > 0
          ? reveal === "right"
            ? "center"
            : "left"
          : reveal === "left"
            ? "center"
            : "right";
      return;
    }
    const offset = Math.min(
      0,
      Math.max(
        -2 * gesture.sidebarWidth,
        gesture.startOffset + endX - gesture.startX,
      ),
    );
    const snapPoints: Record<Reveal, number> = {
      left: 0,
      center: -gesture.sidebarWidth,
      right: -2 * gesture.sidebarWidth,
    };
    reveal = (Object.entries(snapPoints) as Array<[Reveal, number]>).reduce(
      (nearest, [candidate, value]) =>
        Math.abs(offset - value) < Math.abs(offset - snapPoints[nearest])
          ? candidate
          : nearest,
      "center" as Reveal,
    );
  }

  function handlePointerEnd(event: PointerEvent) {
    if (!panGesture || panGesture.pointerId !== event.pointerId) return;
    const gesture = panGesture;
    if (gesture.dragging) settleGesture(gesture, event.clientX);
    else if (gesture.startedOnClosePanel) reveal = "center";
    clearGesture();
  }

  function handlePointerCancel(event: PointerEvent) {
    if (panGesture?.pointerId === event.pointerId) clearGesture();
  }

  function clearGesture() {
    const gesture = panGesture;
    if (gesture?.captured) {
      stageElement?.releasePointerCapture?.(gesture.pointerId);
    }
    document.removeEventListener("pointermove", handlePointerMove);
    document.removeEventListener("pointerup", handlePointerEnd);
    document.removeEventListener("pointercancel", handlePointerCancel);
    panGesture = null;
  }
</script>

<div
  class="ui-workspace-mobile"
  data-ui-component="workspace-mobile"
  data-ui-part="root"
  data-mobile-workspace-page={menuOpen ? "menu" : page}
  data-mobile-left-sidebar-open={reveal === "left"}
  data-mobile-right-sidebar-open={reveal === "right"}
>
  {#if page === "tabs"}
    <WorkspaceMobileTabs
      {controller}
      tabs={entries.map((entry) => entry.tab)}
      {paneIdFor}
      {createTab}
      onDone={() => (page = "editor")}
      onOpenTab={openTab}
    />
  {:else}
    <div
      bind:this={stageElement}
      class="ui-workspace-mobile__stage"
      data-mobile-stage-reveal={reveal}
      data-mobile-stage-dragging={stageDragging}
      data-mobile-stage-sidebar-width-px={measuredSidebarWidth || ""}
      aria-label="Mobile workspace stage"
      role="group"
      style:touch-action={stageDragging ? "none" : "pan-y"}
      onpointerdown={handlePointerDown}
      onpointermove={handlePointerMove}
      onpointerup={handlePointerEnd}
      onpointercancel={handlePointerCancel}
    >
      <div
        class="ui-workspace-mobile__track"
        data-reveal={reveal}
        style:transform={`translateX(${stageOffset})`}
      >
        <aside
          data-mobile-sidebar-panel="left"
          data-mobile-stage-control
          aria-label="Mobile left sidebar"
        >
          <WorkspaceMobileSidebar
            {controller}
            sidebar={controller.layout.left}
            side="left"
          />
        </aside>

        <main>
          <button
            type="button"
            class="ui-workspace-mobile__sidebar-toggle"
            data-mobile-stage-control
            aria-label={reveal === "left"
              ? "Close left sidebar"
              : "Open left sidebar"}
            onclick={() => (reveal = reveal === "left" ? "center" : "left")}
          >
            <WorkspaceIcon name="panel-left" />
          </button>

          <WorkspaceMobileViewActions
            {controller}
            {activeTab}
            onOpenMenu={() => (menuOpen = true)}
          />

          {#if activeTab}
            <WorkspaceViewHost
              {controller}
              tab={activeTab}
              hostId={controller.activeHostId}
              paneId={controller.activePaneId ?? "main"}
            />
          {:else}
            <div class="ui-workspace-mobile__empty">
              <h2>No active view</h2>
              <p>Open a tab to choose a workspace leaf.</p>
              <button type="button" onclick={() => (page = "tabs")}>
                Open tabs
              </button>
            </div>
          {/if}

          {#if reveal !== "center"}
            <button
              type="button"
              class="ui-workspace-mobile__close-panel"
              data-mobile-stage-close-panel
              aria-label="Close sidebar"
              onclick={() => (reveal = "center")}
            ></button>
          {/if}

          {#if showBottomNav}
            <WorkspaceMobileDock
              {controller}
              {activeTab}
              tabCount={entries.length}
              {page}
              {menuOpen}
              {createTab}
              onOpenLeftSidebar={() => (reveal = "left")}
              onOpenTabs={() => (page = "tabs")}
              onToggleMenu={() => (menuOpen = !menuOpen)}
            />
          {/if}
        </main>

        <aside
          data-mobile-sidebar-panel="right"
          data-mobile-stage-control
          aria-label="Mobile right sidebar"
        >
          <WorkspaceMobileSidebar
            {controller}
            sidebar={controller.layout.right}
            side="right"
          />
        </aside>
      </div>
    </div>
  {/if}

  <WorkspaceMobileActionsDrawer
    {controller}
    {activeTab}
    bind:open={menuOpen}
    onNewTab={addTab}
    onOpenRightSidebar={() => (reveal = "right")}
    {onOpenSettings}
  />
</div>
