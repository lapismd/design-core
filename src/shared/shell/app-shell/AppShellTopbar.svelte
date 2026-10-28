<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { Button } from "../../shadcn/button/index.js";
  import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
  import ArrowRightIcon from "@lucide/svelte/icons/arrow-right";
  import type { AppShellController } from "./app-shell-controller.svelte.js";
  import { appShellTeleport } from "./app-shell-teleport.js";
  import "./AppShellTopbar.css";
  let {
    ref = $bindable(null),
    mainElement,
    controller,
    mobilePlacement = "top",
    mobileTarget,
    leading,
    center,
    trailing,
    onBack,
    onForward,
    canBack = true,
    canForward = true,
    ...restProps
  }: HTMLAttributes<HTMLDivElement> & {
    ref?: HTMLElement | null;
    /** Explicit main surface used to align centre content across sidebars. */
    mainElement?: HTMLElement | null;
    /** Existing shell owner used only for opt-in responsive placement. */
    controller?: AppShellController;
    /** Keep native chrome above Root, or move the mounted bar into a body target. */
    mobilePlacement?: "top" | "body";
    /** Explicit Topbar.Target element inside Main; null retains the original position. */
    mobileTarget?: HTMLElement | null;
    leading?: Snippet;
    center?: Snippet;
    trailing?: Snippet;
    onBack?: () => void;
    onForward?: () => void;
    canBack?: boolean;
    canForward?: boolean;
  } = $props();
  let start = $state<HTMLDivElement | null>(null),
    end = $state<HTMLDivElement | null>(null);
  let centerX = $state<number | undefined>(),
    available = $state<number | undefined>();
  const inBody = $derived(
    mobilePlacement === "body" &&
      controller?.mobile.resolvedMode === "mobile" &&
      Boolean(mobileTarget),
  );
  $effect(() => {
    void inBody;
    const host = ref,
      main = mainElement,
      left = start,
      right = end;
    if (!host || !left || !right) return;
    let frame: number | undefined;
    const measure = () => {
      frame = undefined;
      const bounds = host.getBoundingClientRect();
      const rtl = getComputedStyle(host).direction === "rtl";
      const physicalLeft = (rtl ? right : left).getBoundingClientRect();
      const physicalRight = (rtl ? left : right).getBoundingClientRect();
      const startEdge = Math.max(8, physicalLeft.right - bounds.left + 8);
      const endEdge = Math.min(
        bounds.width - 8,
        physicalRight.left - bounds.left - 8,
      );
      const mainBounds = main?.getBoundingClientRect();
      const desired = mainBounds
        ? mainBounds.left + mainBounds.width / 2 - bounds.left
        : bounds.width / 2;
      centerX = Math.max(startEdge, Math.min(endEdge, desired));
      available = Math.max(
        0,
        2 * Math.min(centerX - startEdge, endEdge - centerX),
      );
    };
    const schedule = () => {
      frame ??= requestAnimationFrame(measure);
    };
    const observer = new ResizeObserver(schedule);
    [host, left, right, ...(main ? [main] : [])].forEach((element) =>
      observer.observe(element),
    );
    window.addEventListener("resize", schedule);
    schedule();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
  });
</script>

<div
  bind:this={ref}
  use:appShellTeleport={{ enabled: inBody, target: mobileTarget ?? null }}
  {...restProps}
  data-ui-component="app-shell"
  data-ui-part="topbar"
  data-placement={inBody ? "body" : "top"}
>
  <div bind:this={start} data-ui-part="topbar-leading">
    {@render leading?.()}
    {#if onBack}<Button
        variant="ghost"
        size="icon-sm"
        aria-label="Go back"
        disabled={!canBack}
        onclick={onBack}><ArrowLeftIcon aria-hidden="true" /></Button
      >{/if}
    {#if onForward}<Button
        variant="ghost"
        size="icon-sm"
        aria-label="Go forward"
        disabled={!canForward}
        onclick={onForward}><ArrowRightIcon aria-hidden="true" /></Button
      >{/if}
  </div>
  <div
    data-ui-part="topbar-center"
    style:left={centerX === undefined ? "50%" : `${centerX}px`}
    style:max-width={available === undefined ? "50%" : `${available}px`}
  >
    {@render center?.()}
  </div>
  <div bind:this={end} data-ui-part="topbar-trailing">
    {@render trailing?.()}
  </div>
</div>
