<script lang="ts">
  import { ScrollArea as ScrollAreaPrimitive } from "bits-ui";
  import { Scrollbar } from "./index.js";
  import OverlayScrollbar from "./scroll-area-overlay-scrollbar.svelte";
  import {
    isScrollAreaVisibility,
    SCROLL_AREA_VISIBILITY_ATTRIBUTE,
    type ScrollAreaVisibility,
  } from "./scroll-area-model.js";
  import { type WithoutChild } from "../../../lib/utils.js";
  import { omitDataUiIdentity } from "../../../lib/data-ui-host.js";

  function usesNativeWebKitScrolling(): boolean {
    if (
      typeof document !== "undefined" &&
      document.documentElement.dataset.engine
    ) {
      return document.documentElement.dataset.engine === "webkit";
    }
    if (typeof navigator === "undefined") return false;
    return (
      /AppleWebKit/u.test(navigator.userAgent) &&
      !/(Chrome|Chromium|CriOS|Edg|OPR)/u.test(navigator.userAgent)
    );
  }

  let {
    ref = $bindable(null),
    viewportRef = $bindable(null),
    class: className,
    orientation = "vertical",
    scrollbarXClasses = "",
    scrollbarYClasses = "",
    type,
    scrollHideDelay = 600,
    children,
    ...restProps
  }: WithoutChild<ScrollAreaPrimitive.RootProps> & {
    orientation?: "vertical" | "horizontal" | "both" | undefined;
    scrollbarXClasses?: string | undefined;
    scrollbarYClasses?: string | undefined;
    viewportRef?: HTMLElement | null;
  } = $props();

  let activeRootRef = $state<HTMLElement | null>(null);
  let activeViewportRef = $state<HTMLElement | null>(null);
  let inheritedType = $state<ScrollAreaVisibility | undefined>(undefined);
  let resolvedType = $derived(type ?? inheritedType ?? "hover");
  const nativeWebKitScrolling = usesNativeWebKitScrolling();

  $effect(() => {
    ref = activeRootRef;
    viewportRef = activeViewportRef;
  });

  $effect(() => {
    if (type !== undefined || !activeRootRef) {
      inheritedType = undefined;
      return;
    }
    const owner = activeRootRef.parentElement?.closest(
      `[${SCROLL_AREA_VISIBILITY_ATTRIBUTE}]`,
    );
    if (!owner) {
      inheritedType = undefined;
      return;
    }
    const sync = () => {
      const value = owner.getAttribute(SCROLL_AREA_VISIBILITY_ATTRIBUTE);
      inheritedType = isScrollAreaVisibility(value) ? value : undefined;
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(owner, {
      attributes: true,
      attributeFilter: [SCROLL_AREA_VISIBILITY_ATTRIBUTE],
    });
    return () => observer.disconnect();
  });
</script>

<ScrollAreaPrimitive.Root
  bind:ref={activeRootRef}
  {...omitDataUiIdentity(restProps)}
  type={resolvedType}
  {scrollHideDelay}
  data-ui-component="scroll-area"
  data-ui-part="scroll-area"
  data-slot="scroll-area"
  data-orientation={orientation}
  data-scroll-visibility={resolvedType}
  data-scroll-strategy={nativeWebKitScrolling ? "native" : "styled"}
  class={className}
>
  {#if nativeWebKitScrolling}
    <!-- svelte-ignore a11y_no_noninteractive_tabindex (keyboard access for a named scrollable region) -->
    <div
      bind:this={activeViewportRef}
      tabindex={0}
      role="region"
      aria-label="Scrollable content"
      data-ui-component="scroll-area"
      data-ui-part="scroll-area-viewport"
      data-slot="scroll-area-viewport"
    >
      {@render children?.()}
    </div>
    {#if orientation === "vertical" || orientation === "both"}
      <OverlayScrollbar
        root={activeRootRef}
        viewport={activeViewportRef}
        orientation="vertical"
        type={resolvedType}
        {scrollHideDelay}
        class={scrollbarYClasses}
      />
    {/if}
    {#if orientation === "horizontal" || orientation === "both"}
      <OverlayScrollbar
        root={activeRootRef}
        viewport={activeViewportRef}
        orientation="horizontal"
        type={resolvedType}
        {scrollHideDelay}
        class={scrollbarXClasses}
      />
    {/if}
  {:else}
    <ScrollAreaPrimitive.Viewport
      bind:ref={activeViewportRef}
      tabindex={0}
      data-ui-component="scroll-area"
      data-ui-part="scroll-area-viewport"
      data-slot="scroll-area-viewport"
    >
      {@render children?.()}
    </ScrollAreaPrimitive.Viewport>
    {#if orientation === "vertical" || orientation === "both"}
      <Scrollbar orientation="vertical" class={scrollbarYClasses} />
    {/if}
    {#if orientation === "horizontal" || orientation === "both"}
      <Scrollbar orientation="horizontal" class={scrollbarXClasses} />
    {/if}
    <ScrollAreaPrimitive.Corner
      data-ui-component="scroll-area"
      data-ui-part="scroll-area-corner"
      data-slot="scroll-area-corner"
    />
  {/if}
</ScrollAreaPrimitive.Root>

<style>
  /* Semantic selectors must be global: they target data attributes and descendants. */
  :global {
    /*! tailwindcss v4.3.3 | MIT License | https://tailwindcss.com */
    @layer properties {
    }
    @layer base {
      @supports (not ((-webkit-appearance: -apple-pay-button))) or
        (contain-intrinsic-size: 1px) {
      }
    }
    @layer utilities {
      [data-ui-component="scroll-area"][data-ui-part="scroll-area-thumb"],
      [data-ui-component="scroll-area"][data-ui-part="scroll-area"] {
        position: relative;
      }
      [data-ui-component="scroll-area"][data-ui-part="scroll-area-scrollbar"] {
        display: flex;
      }
      [data-ui-component="scroll-area"][data-ui-part="scroll-area-viewport"] {
        width: 100%;
        height: 100%;
      }
      [data-ui-component="scroll-area"][data-ui-part="scroll-area-thumb"] {
        flex: 1;
      }
      [data-ui-component="scroll-area"][data-ui-part="scroll-area-scrollbar"] {
        touch-action: none;
      }
      [data-ui-component="scroll-area"][data-ui-part="scroll-area-viewport"] {
        border-radius: inherit;
      }
      [data-ui-component="scroll-area"][data-ui-part="scroll-area-thumb"] {
        border-radius: 3.40282e38px;
      }
      [data-ui-component="scroll-area"][data-ui-part="scroll-area-thumb"] {
        background-color: var(--ui-scroll-area-foreground, var(--border));
        transition:
          width 140ms ease,
          height 140ms ease,
          flex-basis 140ms ease,
          background-color 140ms ease;
      }
      [data-ui-component="scroll-area"][data-ui-part="scroll-area-scrollbar"] {
        padding: 0;
      }
      [data-ui-component="scroll-area"][data-ui-part="scroll-area-viewport"] {
        transition-property: color, box-shadow;
        transition-timing-function: var(
          --tw-ease,
          var(--default-transition-timing-function)
        );
        transition-duration: var(
          --tw-duration,
          var(--default-transition-duration)
        );
      }
      [data-ui-component="scroll-area"][data-ui-part="scroll-area-scrollbar"] {
        transition-property: color, background-color, border-color,
          outline-color, text-decoration-color, fill, stroke, --tw-gradient-from,
          --tw-gradient-via, --tw-gradient-to;
        transition-timing-function: var(
          --tw-ease,
          var(--default-transition-timing-function)
        );
        transition-duration: var(
          --tw-duration,
          var(--default-transition-duration)
        );
      }
      [data-ui-component="scroll-area"][data-ui-part="scroll-area-viewport"] {
        --tw-outline-style: none;
        outline-style: none;
      }
      [data-ui-component="scroll-area"][data-ui-part="scroll-area-scrollbar"] {
        -webkit-user-select: none;
        user-select: none;
      }
      [data-ui-component="scroll-area"][data-ui-part="scroll-area-viewport"]:focus-visible {
        --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0
          calc(3px + var(--tw-ring-offset-width))
          var(--tw-ring-color, currentcolor);
        box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
          var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
      }
      [data-ui-component="scroll-area"][data-ui-part="scroll-area-viewport"]:focus-visible {
        --tw-ring-color: var(--ring);
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="scroll-area"][data-ui-part="scroll-area-viewport"]:focus-visible {
          --tw-ring-color: color-mix(in oklab, var(--ring) 50%, transparent);
        }
      }
      [data-ui-component="scroll-area"][data-ui-part="scroll-area-viewport"]:focus-visible {
        outline-style: var(--tw-outline-style);
        outline-width: 1px;
      }
      [data-ui-component="scroll-area"][data-ui-part="scroll-area-scrollbar"]:where(
          [data-orientation="horizontal"]
        ) {
        height: 0.5rem;
      }
      [data-ui-component="scroll-area"][data-ui-part="scroll-area-scrollbar"]:where(
          [data-orientation="horizontal"]
        ) {
        flex-direction: column;
      }
      [data-ui-component="scroll-area"][data-ui-part="scroll-area-scrollbar"]:where(
          [data-orientation="horizontal"]
        ) {
        border: 0;
      }
      [data-ui-component="scroll-area"][data-ui-part="scroll-area-scrollbar"]:where(
          [data-orientation="horizontal"]
        ) {
        border-top-color: #0000;
      }
      [data-ui-component="scroll-area"][data-ui-part="scroll-area-scrollbar"]:where(
          [data-orientation="vertical"]
        ) {
        height: 100%;
      }
      [data-ui-component="scroll-area"][data-ui-part="scroll-area-scrollbar"]:where(
          [data-orientation="vertical"]
        ) {
        width: 0.5rem;
      }
      [data-ui-component="scroll-area"][data-ui-part="scroll-area-scrollbar"]:where(
          [data-orientation="vertical"]
        ) {
        border: 0;
      }
      [data-ui-component="scroll-area"][data-ui-part="scroll-area-scrollbar"]:where(
          [data-orientation="vertical"]
        ) {
        border-left-color: #0000;
      }

      [data-ui-component="scroll-area"][data-ui-part="scroll-area-scrollbar"][data-orientation="vertical"]
        > [data-ui-component="scroll-area"][data-ui-part="scroll-area-thumb"] {
        width: 0.25rem;
        flex: 0 0 0.25rem;
        margin-inline-start: auto;
      }

      [data-ui-component="scroll-area"][data-ui-part="scroll-area-scrollbar"][data-orientation="vertical"]
        > [data-ui-component="scroll-area"][data-ui-part="scroll-area-thumb"]:is(
          :hover,
          :active
        ) {
        width: 0.375rem;
        flex-basis: 0.375rem;
      }

      [data-ui-component="scroll-area"][data-ui-part="scroll-area-scrollbar"][data-orientation="horizontal"]
        > [data-ui-component="scroll-area"][data-ui-part="scroll-area-thumb"] {
        height: 0.25rem;
        flex: 0 0 0.25rem;
        margin-block-start: auto;
      }

      [data-ui-component="scroll-area"][data-ui-part="scroll-area-scrollbar"][data-orientation="horizontal"]
        > [data-ui-component="scroll-area"][data-ui-part="scroll-area-thumb"]:is(
          :hover,
          :active
        ) {
        height: 0.375rem;
        flex-basis: 0.375rem;
      }

      [data-ui-component="scroll-area"][data-ui-part="scroll-area-thumb"]:hover {
        background-color: color-mix(
          in srgb,
          var(--ui-scroll-area-foreground, var(--border)) 65%,
          currentColor
        );
      }

      [data-ui-component="scroll-area"][data-ui-part="scroll-area-thumb"]:active {
        background-color: color-mix(
          in srgb,
          var(--ui-scroll-area-foreground, var(--border)) 50%,
          currentColor
        );
      }

      @media (prefers-reduced-motion: reduce) {
        [data-ui-component="scroll-area"][data-ui-part="scroll-area-thumb"] {
          transition: none;
        }
      }

      /*
       * Bits UI hides the native scrollbar with ::-webkit-scrollbar
       * { display:none!important }. WebKit cannot reliably reverse that mode
       * and some WKWebView releases stop scrolling the viewport altogether.
       * A host marker or the renderer user agent selects a plain native
       * viewport which never receives Bits' data-scroll-area-viewport
       * attribute or its display:none rule. Its native chrome is suppressed
       * without removing native scrolling, and a presentation-only overlay
       * supplies the governed thumb interactions. Other engines retain Bits.
       */
      [data-ui-component="scroll-area"][data-ui-part="scroll-area"][data-scroll-strategy="native"] {
        overflow: hidden !important;
      }
      [data-ui-component="scroll-area"][data-ui-part="scroll-area"][data-scroll-strategy="native"][data-orientation="vertical"]
        > [data-ui-part="scroll-area-viewport"] {
        overflow-x: hidden !important;
        overflow-y: auto !important;
      }
      [data-ui-component="scroll-area"][data-ui-part="scroll-area"][data-scroll-strategy="native"][data-orientation="horizontal"]
        > [data-ui-part="scroll-area-viewport"] {
        overflow-x: auto !important;
        overflow-y: hidden !important;
      }
      [data-ui-component="scroll-area"][data-ui-part="scroll-area"][data-scroll-strategy="native"][data-orientation="both"]
        > [data-ui-part="scroll-area-viewport"] {
        overflow: auto !important;
      }
      [data-ui-component="scroll-area"][data-ui-part="scroll-area"][data-scroll-strategy="native"]
        > [data-ui-part="scroll-area-viewport"] {
        scrollbar-color: transparent transparent;
        scrollbar-width: none;
      }
      [data-ui-component="scroll-area"][data-ui-part="scroll-area"][data-scroll-strategy="native"]
        > [data-ui-part="scroll-area-viewport"]::-webkit-scrollbar {
        width: 0;
        height: 0;
        border: 0;
        background: transparent;
      }
    }
    @property --tw-animation-delay {
      syntax: "*";
      inherits: false;
      initial-value: 0s;
    }
    @property --tw-animation-direction {
      syntax: "*";
      inherits: false;
      initial-value: normal;
    }
    @property --tw-animation-duration {
      syntax: "*";
      inherits: false;
    }
    @property --tw-animation-fill-mode {
      syntax: "*";
      inherits: false;
      initial-value: none;
    }
    @property --tw-animation-iteration-count {
      syntax: "*";
      inherits: false;
      initial-value: 1;
    }
    @property --tw-enter-blur {
      syntax: "*";
      inherits: false;
      initial-value: 0;
    }
    @property --tw-enter-opacity {
      syntax: "*";
      inherits: false;
      initial-value: 1;
    }
    @property --tw-enter-rotate {
      syntax: "*";
      inherits: false;
      initial-value: 0;
    }
    @property --tw-enter-scale {
      syntax: "*";
      inherits: false;
      initial-value: 1;
    }
    @property --tw-enter-translate-x {
      syntax: "*";
      inherits: false;
      initial-value: 0;
    }
    @property --tw-enter-translate-y {
      syntax: "*";
      inherits: false;
      initial-value: 0;
    }
    @property --tw-exit-blur {
      syntax: "*";
      inherits: false;
      initial-value: 0;
    }
    @property --tw-exit-opacity {
      syntax: "*";
      inherits: false;
      initial-value: 1;
    }
    @property --tw-exit-rotate {
      syntax: "*";
      inherits: false;
      initial-value: 0;
    }
    @property --tw-exit-scale {
      syntax: "*";
      inherits: false;
      initial-value: 1;
    }
    @property --tw-exit-translate-x {
      syntax: "*";
      inherits: false;
      initial-value: 0;
    }
    @property --tw-exit-translate-y {
      syntax: "*";
      inherits: false;
      initial-value: 0;
    }
    @property --tw-shadow {
      syntax: "*";
      inherits: false;
      initial-value: 0 0 #0000;
    }
    @property --tw-shadow-color {
      syntax: "*";
      inherits: false;
    }
    @property --tw-shadow-alpha {
      syntax: "<percentage>";
      inherits: false;
      initial-value: 100%;
    }
    @property --tw-inset-shadow {
      syntax: "*";
      inherits: false;
      initial-value: 0 0 #0000;
    }
    @property --tw-inset-shadow-color {
      syntax: "*";
      inherits: false;
    }
    @property --tw-inset-shadow-alpha {
      syntax: "<percentage>";
      inherits: false;
      initial-value: 100%;
    }
    @property --tw-ring-color {
      syntax: "*";
      inherits: false;
    }
    @property --tw-ring-shadow {
      syntax: "*";
      inherits: false;
      initial-value: 0 0 #0000;
    }
    @property --tw-inset-ring-color {
      syntax: "*";
      inherits: false;
    }
    @property --tw-inset-ring-shadow {
      syntax: "*";
      inherits: false;
      initial-value: 0 0 #0000;
    }
    @property --tw-ring-inset {
      syntax: "*";
      inherits: false;
    }
    @property --tw-ring-offset-width {
      syntax: "<length>";
      inherits: false;
      initial-value: 0;
    }
    @property --tw-ring-offset-color {
      syntax: "*";
      inherits: false;
      initial-value: #fff;
    }
    @property --tw-ring-offset-shadow {
      syntax: "*";
      inherits: false;
      initial-value: 0 0 #0000;
    }
    @property --tw-outline-style {
      syntax: "*";
      inherits: false;
      initial-value: solid;
    }
    @property --tw-border-style {
      syntax: "*";
      inherits: false;
      initial-value: solid;
    }
  }
</style>
