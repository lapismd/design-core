<script lang="ts">
  import { flushSync, onDestroy, onMount, untrack } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { WithElementRef } from "../../../lib/utils.js";
  import { setAppShellContext } from "./app-shell-context.svelte.js";
  import type {
    AppShellController,
    AppShellDisplayMode,
    AppShellMobileStage,
  } from "./app-shell-controller.svelte.js";
  import { APP_SHELL_DEFAULT_SIDEBAR_WIDTH } from "./app-shell-controller.svelte.js";
  import AppShellMobilePanelSelector from "./AppShellMobilePanelSelector.svelte";
  import "../shell.tokens.css";
  import "./AppShell.css";

  let {
    ref = $bindable(null),
    controller,
    displayMode = "auto",
    mobileBreakpoint = 1024,
    desktopMinMainWidth,
    tabindex: _tabindex,
    style,
    class: className,
    children,
    onkeydown,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
    /** Reactive state owner shared by this shell's compound components. */
    controller: AppShellController;
    /** Force a presentation or resolve it from the bounded root width. */
    displayMode?: AppShellDisplayMode;
    /** Root width below which automatic presentation becomes mobile. */
    mobileBreakpoint?: number;
    /** Main width protected before desktop sidebars become overlay-only. */
    desktopMinMainWidth?: number;
  } = $props();

  type PanGesture = {
    pointerId: number;
    target: EventTarget | null;
    startX: number;
    startY: number;
    startOffset: number;
    panelWidth: number;
    currentOffset: number;
    lastX: number;
    lastTime: number;
    velocityX: number;
    dragging: boolean;
    captured: boolean;
  };

  const rootController = untrack(() => controller);
  setAppShellContext(rootController);

  let observedWidth = $state(Number.POSITIVE_INFINITY);
  let stageElement = $state<HTMLDivElement | null>(null);
  let leftPanelHost = $state<HTMLDivElement | null>(null);
  let mainHost = $state<HTMLDivElement | null>(null);
  let rightPanelHost = $state<HTMLDivElement | null>(null);
  let desktopMinMainProbe = $state<HTMLDivElement | null>(null);
  let panGesture = $state<PanGesture | null>(null);
  let dragOffset = $state<number | null>(null);
  let measuredPanelWidth = $state(0);
  let measuredDesktopMinMainWidth = $state(576);
  let rootStyle = $derived(
    [
      style,
      desktopMinMainWidth === undefined
        ? undefined
        : `--ui-shell-desktop-min-main-width: ${Math.max(0, desktopMinMainWidth)}px`,
    ]
      .filter(Boolean)
      .join("; "),
  );
  let resolvedMode = $derived(
    displayMode === "auto"
      ? observedWidth < Math.max(0, mobileBreakpoint)
        ? "mobile"
        : "desktop"
      : displayMode,
  );
  let mobileStage = $derived(rootController.mobile.stage);
  let stageDragging = $derived(dragOffset !== null);
  let stageOffset = $derived(
    dragOffset !== null ? `${dragOffset}px` : offsetFor(mobileStage),
  );
  let hasLeftPanels = $derived(
    rootController.mobile.panelsFor("left").length > 0,
  );
  let hasRightPanels = $derived(
    rootController.mobile.panelsFor("right").length > 0,
  );
  let constrainedDesktopPanelIds = $derived.by(() => {
    if (resolvedMode !== "desktop" || !Number.isFinite(observedWidth)) {
      return [] as string[];
    }
    const minimumMainWidth = Math.max(
      0,
      desktopMinMainWidth ?? measuredDesktopMinMainWidth,
    );
    if (minimumMainWidth === 0) return [] as string[];
    const candidates = [
      ...rootController.mobile
        .panelsFor("right")
        .filter((panel) => panel.kind === "sidebar"),
      ...rootController.mobile
        .panelsFor("left")
        .filter((panel) => panel.kind === "sidebar" && panel.id !== "left"),
      ...rootController.mobile
        .panelsFor("left")
        .filter((panel) => panel.kind === "sidebar" && panel.id === "left"),
    ].flatMap((panel) => {
      const sidebar = rootController.getPanel(panel.id);
      if (!sidebar || sidebar.closed) return [];
      return [
        {
          id: panel.id,
          width: sidebar.collapsed
            ? 48
            : (sidebar.width ?? APP_SHELL_DEFAULT_SIDEBAR_WIDTH),
        },
      ];
    });
    let occupiedWidth = candidates.reduce(
      (total, candidate) => total + candidate.width,
      minimumMainWidth + 16,
    );
    const overlayIds: string[] = [];
    for (const candidate of candidates) {
      if (occupiedWidth <= observedWidth) break;
      overlayIds.push(candidate.id);
      occupiedWidth -= candidate.width;
    }
    return overlayIds;
  });

  $effect(() => rootController.mobile.setResolvedMode(resolvedMode));
  $effect(() => {
    const panelIds = constrainedDesktopPanelIds;
    queueMicrotask(() => {
      for (const sidebar of ref?.querySelectorAll<HTMLElement>(
        '[data-ui-part="sidebar"][data-desktop-overlay-preview]',
      ) ?? []) {
        const panelId = sidebar.dataset.mobilePanelId;
        if (!panelId || !panelIds.includes(panelId)) {
          sidebar.removeAttribute("data-desktop-overlay-preview");
        }
      }
    });
  });
  $effect(() => rootController.mobile.setRootElement(ref));
  $effect(() => rootController.mobile.setPanelHost("left", leftPanelHost));
  $effect(() => rootController.mobile.setMainHost(mainHost));
  $effect(() => rootController.mobile.setPanelHost("right", rightPanelHost));

  onMount(() => {
    void rootController.restoreLayout();
    if (!ref || typeof ResizeObserver === "undefined") return;
    const updateWidth = () => {
      if (ref) observedWidth = ref.getBoundingClientRect().width;
      if (desktopMinMainProbe) {
        const probeWidth = desktopMinMainProbe.getBoundingClientRect().width;
        if (probeWidth > 0) {
          measuredDesktopMinMainWidth = probeWidth;
        }
      }
    };
    const observer = new ResizeObserver(updateWidth);
    observer.observe(ref);
    if (desktopMinMainProbe) observer.observe(desktopMinMainProbe);
    updateWidth();
    return () => observer.disconnect();
  });

  onDestroy(() => {
    clearGesture();
    rootController.mobile.setRootElement(null);
    rootController.mobile.setPanelHost("left", null);
    rootController.mobile.setMainHost(null);
    rootController.mobile.setPanelHost("right", null);
    void rootController.flushSave();
  });

  function panelWidth(): number {
    const lane = stageElement?.querySelector<HTMLElement>(
      '[data-ui-part="mobile-lane"][data-side="left"]',
    );
    const width = lane?.offsetWidth ?? 0;
    if (width > 0) return width;
    return Math.min(22 * 16, (stageElement?.clientWidth ?? 0) * 0.86);
  }

  function offsetFor(stage: AppShellMobileStage): string {
    return stage === "left"
      ? "0px"
      : stage === "right"
        ? "calc(-2 * var(--ui-shell-mobile-sidebar-width))"
        : "calc(-1 * var(--ui-shell-mobile-sidebar-width))";
  }

  function numericOffset(stage: AppShellMobileStage, width: number): number {
    return stage === "left" ? 0 : stage === "right" ? -2 * width : -width;
  }

  function isInteractiveTarget(target: EventTarget | null): boolean {
    return (
      target instanceof Element &&
      Boolean(
        target.closest(
          [
            "[data-mobile-stage-control]",
            "[data-app-shell-gesture-ignore]",
            "a",
            "button",
            "input",
            "select",
            "textarea",
            "summary",
            "[contenteditable='true']",
            "[role='button']",
            "[role='combobox']",
            "[role='listbox']",
            "[role='menu']",
            "[role='slider']",
          ].join(","),
        ),
      )
    );
  }

  function horizontalScrollerOwnsGesture(
    target: EventTarget | null,
    deltaX: number,
  ): boolean {
    if (!(target instanceof Element) || !stageElement) return false;
    let candidate: Element | null = target;
    while (candidate && candidate !== stageElement) {
      if (candidate instanceof HTMLElement) {
        const style = getComputedStyle(candidate);
        const scrollable =
          (style.overflowX === "auto" || style.overflowX === "scroll") &&
          candidate.scrollWidth > candidate.clientWidth + 1;
        if (scrollable) {
          const maxScroll = candidate.scrollWidth - candidate.clientWidth;
          if (
            (deltaX < 0 && candidate.scrollLeft < maxScroll) ||
            (deltaX > 0 && candidate.scrollLeft > 0)
          ) {
            return true;
          }
        }
      }
      candidate = candidate.parentElement;
    }
    return false;
  }

  function handlePointerDown(event: PointerEvent): void {
    if (
      resolvedMode !== "mobile" ||
      !stageElement ||
      event.button !== 0 ||
      isInteractiveTarget(event.target)
    ) {
      return;
    }
    measuredPanelWidth = panelWidth();
    const captured = event.pointerType !== "touch";
    if (captured) stageElement.setPointerCapture?.(event.pointerId);
    panGesture = {
      pointerId: event.pointerId,
      target: event.target,
      startX: event.clientX,
      startY: event.clientY,
      startOffset: numericOffset(mobileStage, measuredPanelWidth),
      panelWidth: measuredPanelWidth,
      currentOffset: numericOffset(mobileStage, measuredPanelWidth),
      lastX: event.clientX,
      lastTime: event.timeStamp,
      velocityX: 0,
      dragging: false,
      captured,
    };
    if (event.pointerType === "touch") {
      document.addEventListener("pointermove", handlePointerMove, {
        passive: false,
      });
      document.addEventListener("pointerup", handlePointerEnd);
      document.addEventListener("pointercancel", handlePointerCancel);
    }
  }

  function handlePointerMove(event: PointerEvent): void {
    const gesture = panGesture;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - gesture.startX;
    const deltaY = event.clientY - gesture.startY;
    if (!gesture.dragging) {
      if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) return;
      if (
        Math.abs(deltaX) <= Math.abs(deltaY) ||
        horizontalScrollerOwnsGesture(gesture.target, deltaX)
      ) {
        clearGesture();
        return;
      }
      gesture.dragging = true;
    }

    event.preventDefault();
    const minimum = hasRightPanels
      ? -2 * gesture.panelWidth
      : -gesture.panelWidth;
    const maximum = hasLeftPanels ? 0 : -gesture.panelWidth;
    gesture.currentOffset = Math.max(
      minimum,
      Math.min(maximum, gesture.startOffset + deltaX),
    );
    const elapsed = Math.max(1, event.timeStamp - gesture.lastTime);
    gesture.velocityX = (event.clientX - gesture.lastX) / elapsed;
    gesture.lastX = event.clientX;
    gesture.lastTime = event.timeStamp;
    flushSync(() => {
      dragOffset = gesture.currentOffset;
      panGesture = { ...gesture };
    });
  }

  function settleGesture(gesture: PanGesture, endX: number): void {
    if (!gesture.dragging) return;
    const candidates: AppShellMobileStage[] = [
      ...(hasLeftPanels ? (["left"] as const) : []),
      "main",
      ...(hasRightPanels ? (["right"] as const) : []),
    ];

    if (Math.abs(gesture.velocityX) >= 0.45) {
      const target =
        gesture.velocityX > 0
          ? mobileStage === "right"
            ? "main"
            : hasLeftPanels
              ? "left"
              : "main"
          : mobileStage === "left"
            ? "main"
            : hasRightPanels
              ? "right"
              : "main";
      setMobileStage(target);
      return;
    }

    const offset = gesture.startOffset + endX - gesture.startX;
    const snapPoints: Record<AppShellMobileStage, number> = {
      left: 0,
      main: -gesture.panelWidth,
      right: -2 * gesture.panelWidth,
    };
    const nearest = candidates.reduce((current, candidate) =>
      Math.abs(offset - snapPoints[candidate]) <
      Math.abs(offset - snapPoints[current])
        ? candidate
        : current,
    );
    setMobileStage(nearest);
  }

  function setMobileStage(stage: AppShellMobileStage): void {
    if (stage === "main") rootController.mobile.showMain();
    else rootController.mobile.show(stage);
  }

  function handlePointerEnd(event: PointerEvent): void {
    if (!panGesture || panGesture.pointerId !== event.pointerId) return;
    const gesture = panGesture;
    if (gesture.dragging) settleGesture(gesture, event.clientX);
    clearGesture();
  }

  function handlePointerCancel(event: PointerEvent): void {
    if (panGesture?.pointerId === event.pointerId) clearGesture();
  }

  function clearGesture(): void {
    const gesture = panGesture;
    if (gesture?.captured) {
      stageElement?.releasePointerCapture?.(gesture.pointerId);
    }
    if (typeof document !== "undefined") {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerEnd);
      document.removeEventListener("pointercancel", handlePointerCancel);
    }
    dragOffset = null;
    panGesture = null;
  }

  function handleKeydown(
    event: KeyboardEvent & { currentTarget: EventTarget & HTMLDivElement },
  ): void {
    if (
      resolvedMode === "mobile" &&
      mobileStage !== "main" &&
      event.key === "Escape" &&
      !event.defaultPrevented
    ) {
      event.preventDefault();
      rootController.mobile.showMain();
    }
    onkeydown?.(event);
  }
</script>

<div
  bind:this={ref}
  {...restProps}
  tabindex="-1"
  style={rootStyle || undefined}
  class={["ui-minimal-app-shell", className].filter(Boolean).join(" ")}
  data-ui-component="app-shell"
  data-ui-part="root"
  data-shell-root
  data-display-mode={resolvedMode}
  data-mobile-stage={mobileStage}
  data-mobile-dragging={stageDragging ? "true" : undefined}
  data-desktop-constrained={constrainedDesktopPanelIds.length > 0
    ? "true"
    : undefined}
  data-desktop-overlay-panels={constrainedDesktopPanelIds.length > 0
    ? constrainedDesktopPanelIds.join(" ")
    : undefined}
  data-desktop-overlay-right={constrainedDesktopPanelIds.includes("right")
    ? "true"
    : undefined}
  data-desktop-overlay-left={constrainedDesktopPanelIds.includes("left")
    ? "true"
    : undefined}
  data-desktop-overlay-outer-left={constrainedDesktopPanelIds.some(
    (panelId) =>
      panelId !== "left" && rootController.getPanel(panelId)?.side === "left",
  )
    ? "true"
    : undefined}
  data-left-sidebar-state={rootController.left.state}
  data-right-sidebar-state={rootController.right.state}
  onkeydown={handleKeydown}
>
  <div
    bind:this={desktopMinMainProbe}
    class="ui-minimal-app-shell__desktop-min-main-probe"
    data-ui-component="app-shell"
    data-ui-part="desktop-min-main-probe"
    style:width={desktopMinMainWidth === undefined
      ? undefined
      : `${Math.max(0, desktopMinMainWidth)}px`}
    aria-hidden="true"
  ></div>
  <div
    bind:this={stageElement}
    class="ui-minimal-app-shell__mobile-stage"
    data-ui-component="app-shell"
    data-ui-part="mobile-stage"
    role={resolvedMode === "mobile" ? "group" : undefined}
    aria-label={resolvedMode === "mobile"
      ? "Mobile application shell"
      : undefined}
    style:touch-action={stageDragging ? "none" : "pan-y"}
    onpointerdown={handlePointerDown}
    onpointermove={handlePointerMove}
    onpointerup={handlePointerEnd}
    onpointercancel={handlePointerCancel}
  >
    <div
      class="ui-minimal-app-shell__mobile-track"
      data-ui-component="app-shell"
      data-ui-part="mobile-track"
      data-stage={mobileStage}
      style:transform={`translateX(${stageOffset})`}
    >
      <div
        class="ui-minimal-app-shell__mobile-lane"
        data-ui-component="app-shell"
        data-ui-part="mobile-lane"
        data-side="left"
        data-active={mobileStage === "left" || undefined}
        inert={resolvedMode === "mobile" && mobileStage !== "left"}
        aria-hidden={resolvedMode === "mobile" && mobileStage !== "left"}
      >
        <AppShellMobilePanelSelector
          side="left"
          active={mobileStage === "left"}
        />
        <div
          bind:this={leftPanelHost}
          class="ui-minimal-app-shell__mobile-panel-host"
          data-ui-component="app-shell"
          data-ui-part="mobile-panel-host"
          data-side="left"
        ></div>
      </div>

      <div
        class="ui-minimal-app-shell__mobile-main-lane"
        data-ui-component="app-shell"
        data-ui-part="mobile-main-lane"
        data-active={mobileStage === "main" || undefined}
        inert={resolvedMode === "mobile" && mobileStage !== "main"}
        aria-hidden={resolvedMode === "mobile" && mobileStage !== "main"}
      >
        <div
          bind:this={mainHost}
          class="ui-minimal-app-shell__mobile-main-host"
          data-ui-component="app-shell"
          data-ui-part="mobile-main-host"
        ></div>
      </div>

      <div
        class="ui-minimal-app-shell__mobile-lane"
        data-ui-component="app-shell"
        data-ui-part="mobile-lane"
        data-side="right"
        data-active={mobileStage === "right" || undefined}
        inert={resolvedMode === "mobile" && mobileStage !== "right"}
        aria-hidden={resolvedMode === "mobile" && mobileStage !== "right"}
      >
        <AppShellMobilePanelSelector
          side="right"
          active={mobileStage === "right"}
        />
        <div
          bind:this={rightPanelHost}
          class="ui-minimal-app-shell__mobile-panel-host"
          data-ui-component="app-shell"
          data-ui-part="mobile-panel-host"
          data-side="right"
        ></div>
      </div>
    </div>

    {#if resolvedMode === "mobile" && mobileStage !== "main"}
      <button
        type="button"
        class="ui-minimal-app-shell__mobile-stage-dismiss"
        data-ui-component="app-shell"
        data-ui-part="mobile-stage-dismiss"
        data-side={mobileStage}
        data-mobile-stage-control
        aria-label={`Close ${mobileStage} sidebar`}
        onclick={() => rootController.mobile.showMain()}
      ></button>
    {/if}
  </div>

  <div
    class="ui-minimal-app-shell__composition"
    data-ui-component="app-shell"
    data-ui-part="composition"
  >
    {@render children?.()}
  </div>
</div>
