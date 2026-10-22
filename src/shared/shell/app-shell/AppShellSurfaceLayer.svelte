<script lang="ts">
  import { untrack, type Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { useAppShell } from "./app-shell-context.svelte.js";
  import { appShellTeleport } from "./app-shell-teleport.js";
  import type { AppShellSurfaceLayerMobilePlacement } from "./app-shell-controller.svelte.js";
  import { setSurfaceLayerContext } from "./app-shell-surface-layer-context.svelte.js";

  let {
    ref = $bindable(null),
    open,
    label,
    coverPanelIds = [],
    suspendPanelIds = [],
    returnFocus,
    mobilePlacement = "active-lane",
    dismissLabel = `Close ${label}`,
    dismissOnEscape = true,
    onDismiss,
    class: className,
    children,
    ...restProps
  }: HTMLAttributes<HTMLDivElement> & {
    ref?: HTMLElement | null;
    /** Whether the structural replacement layer is mounted. */
    open: boolean;
    /** Accessible name for the non-modal replacement surface. */
    label: string;
    /** Mounted sidebar ids included in the covered surface bounds. */
    coverPanelIds?: readonly string[];
    /** Sidebar ids hidden transiently while the layer is active. */
    suspendPanelIds?: readonly string[];
    /** Focus target restored after dismissal. Defaults to the opener. */
    returnFocus?: HTMLElement | null;
    /** Mobile host used while the shell is in mobile display mode. */
    mobilePlacement?: AppShellSurfaceLayerMobilePlacement;
    /** Accessible name for the dismissible scrim. */
    dismissLabel?: string;
    /** Whether unhandled Escape dismisses the layer. */
    dismissOnEscape?: boolean;
    /** Consumer-owned route or state transition that closes the layer. */
    onDismiss?: () => void;
    children?: Snippet;
  } = $props();

  const controller = useAppShell();
  setSurfaceLayerContext({
    get dismissLabel() {
      return dismissLabel;
    },
    dismiss() {
      onDismiss?.();
    },
  });
  const token = Symbol("app-shell-surface-layer");
  let surfaceElement = $state<HTMLElement | null>(null);
  let inlineStart = $state(0);
  let inlineEnd = $state(0);
  let blockStart = $state(0);
  let blockEnd = $state(0);
  const mobileHost = $derived.by(() => {
    if (controller.mobile.resolvedMode !== "mobile") return null;
    if (mobilePlacement === "root") return controller.mobile.getRootElement();
    const stage = controller.mobile.stage;
    return stage === "main"
      ? controller.mobile.getMainHost()
      : controller.mobile.getPanelHost(stage);
  });

  $effect(() => {
    if (!open || typeof document === "undefined") return;
    const { focusTarget, registration } = untrack(() => ({
      focusTarget:
        returnFocus ??
        (document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null),
      registration: {
        token,
        coverPanelIds: [...coverPanelIds],
        suspendPanelIds: [...suspendPanelIds],
      },
    }));
    untrack(() => controller.activateSurfaceLayer(registration));
    queueMicrotask(() => surfaceElement?.focus({ preventScroll: true }));

    let active = true;
    const handleKeydown = (event: KeyboardEvent) => {
      if (
        !dismissOnEscape ||
        event.defaultPrevented ||
        event.key !== "Escape"
      ) {
        return;
      }
      // Portalled popovers can register their document listener after the page.
      // Let the whole event dispatch finish before claiming an unhandled Escape.
      queueMicrotask(() => {
        if (!active || event.defaultPrevented) return;
        event.preventDefault();
        onDismiss?.();
      });
    };
    document.addEventListener("keydown", handleKeydown);
    return () => {
      active = false;
      document.removeEventListener("keydown", handleKeydown);
      untrack(() => controller.deactivateSurfaceLayer(token));
      queueMicrotask(() => {
        const target = returnFocus ?? focusTarget;
        if (target?.isConnected) target.focus({ preventScroll: true });
        else controller.mobile.getMainElement()?.focus({ preventScroll: true });
      });
    };
  });

  $effect(() => {
    void controller.panelElementsVersion;
    if (!open || !ref || typeof ResizeObserver === "undefined") return;
    const root = controller.mobile.getRootElement();
    const main = controller.mobile.getMainElement();
    if (!root || !main) return;
    if (
      controller.mobile.resolvedMode === "mobile" &&
      (mobilePlacement === "root" || controller.mobile.stage !== "main")
    ) {
      inlineStart = 0;
      inlineEnd = 0;
      blockStart = 0;
      blockEnd = 0;
      return;
    }
    const coveredElements = coverPanelIds.flatMap((id) => {
      const element = controller.getPanelElement(id);
      return element ? [element] : [];
    });

    const updateInsets = () => {
      const rootBounds = root.getBoundingClientRect();
      const paddingLeft = rootBounds.left + root.clientLeft;
      const paddingRight = paddingLeft + root.clientWidth;
      const paddingTop = rootBounds.top + root.clientTop;
      const paddingBottom = paddingTop + root.clientHeight;
      const visibleBounds = [main, ...coveredElements]
        .map((element) => element.getBoundingClientRect())
        .filter((bounds) => bounds.width > 0 && bounds.height > 0);
      if (visibleBounds.length === 0) return;
      const left = Math.min(...visibleBounds.map((bounds) => bounds.left));
      const right = Math.max(...visibleBounds.map((bounds) => bounds.right));
      const top = main.getBoundingClientRect().top;
      const bottom = main.getBoundingClientRect().bottom;
      const rtl = getComputedStyle(root).direction === "rtl";
      inlineStart = Math.max(
        0,
        rtl ? paddingRight - right : left - paddingLeft,
      );
      inlineEnd = Math.max(0, rtl ? left - paddingLeft : paddingRight - right);
      blockStart = Math.max(0, top - paddingTop);
      blockEnd = Math.max(0, paddingBottom - bottom);
    };

    let frame = requestAnimationFrame(updateInsets);
    const scheduleUpdate = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateInsets);
    };
    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(root);
    observer.observe(main);
    for (const element of coveredElements) observer.observe(element);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  });
</script>

{#if open}
  <div
    bind:this={ref}
    use:appShellTeleport={{
      enabled: controller.mobile.resolvedMode === "mobile",
      target: mobileHost,
    }}
    {...restProps}
    class={["ui-minimal-app-shell__surface-layer", className]
      .filter(Boolean)
      .join(" ")}
    data-ui-component="app-shell"
    data-ui-part="surface-layer"
    data-mobile-placement={controller.mobile.resolvedMode === "mobile"
      ? mobilePlacement
      : undefined}
    style:inset-inline-start={`${inlineStart}px`}
    style:inset-inline-end={`${inlineEnd}px`}
    style:inset-block-start={`${blockStart}px`}
    style:inset-block-end={`${blockEnd}px`}
  >
    <button
      type="button"
      tabindex="-1"
      class="ui-minimal-app-shell__surface-layer-scrim"
      data-ui-component="app-shell"
      data-ui-part="surface-layer-scrim"
      aria-label={dismissLabel}
      onclick={() => onDismiss?.()}
    ></button>
    <section
      bind:this={surfaceElement}
      class="ui-minimal-app-shell__surface-layer-surface"
      data-ui-component="app-shell"
      data-ui-part="surface-layer-surface"
      aria-label={label}
      tabindex="-1"
    >
      {@render children?.()}
    </section>
  </div>
{/if}
