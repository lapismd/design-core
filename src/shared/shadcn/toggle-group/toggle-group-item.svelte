<script lang="ts">
  import { ToggleGroup as ToggleGroupPrimitive } from "bits-ui";
  import { getToggleGroupCtx } from "./toggle-group.svelte";
  import { type ToggleVariants } from "../toggle/index.js";

  let {
    ref = $bindable(null),
    value = $bindable(),
    class: className,
    size,
    variant,
    ...restProps
  }: ToggleGroupPrimitive.ItemProps & ToggleVariants = $props();

  const ctx = getToggleGroupCtx();
</script>

<ToggleGroupPrimitive.Item
  bind:ref
  data-ui-component="toggle-group"
  data-ui-part="toggle-group-item"
  data-slot="toggle-group-item"
  data-variant={ctx.variant || variant}
  data-size={ctx.size || size}
  data-spacing={ctx.spacing}
  class={className}
  {value}
  {...restProps}
/>

<style>
  /* Item chrome mirrors Toggle — conversion only extracted group layout rules. */
  :global {
    [data-ui-component="toggle-group"][data-ui-part="toggle-group-item"] {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing);
      border-radius: calc(var(--radius) * 0.8);
      background-color: transparent;
      font-size: var(--text-sm);
      line-height: var(--tw-leading, var(--text-sm--line-height));
      font-weight: var(--font-weight-medium);
      white-space: nowrap;
      transition-property: color, box-shadow, background-color;
      transition-timing-function: var(
        --tw-ease,
        var(--default-transition-timing-function)
      );
      transition-duration: var(
        --tw-duration,
        var(--default-transition-duration)
      );
      outline-style: none;
    }

    [data-ui-component="toggle-group"][data-ui-part="toggle-group-item"][data-size="sm"] {
      height: calc(var(--spacing) * 8);
      min-width: calc(var(--spacing) * 8);
      padding-inline: calc(var(--spacing) * 2.5);
    }

    [data-ui-component="toggle-group"][data-ui-part="toggle-group-item"][data-size="default"],
    [data-ui-component="toggle-group"][data-ui-part="toggle-group-item"]:not(
        [data-size]
      ) {
      height: calc(var(--spacing) * 9);
      min-width: calc(var(--spacing) * 9);
      padding-inline: calc(var(--spacing) * 2.5);
    }

    [data-ui-component="toggle-group"][data-ui-part="toggle-group-item"][data-size="lg"] {
      height: calc(var(--spacing) * 10);
      min-width: calc(var(--spacing) * 10);
      padding-inline: calc(var(--spacing) * 2.5);
    }

    [data-ui-component="toggle-group"][data-ui-part="toggle-group-item"][data-variant="outline"] {
      border-style: var(--tw-border-style, solid);
      border-width: 1px;
      border-color: var(--input);
      box-shadow:
        var(--tw-inset-shadow, 0 0 #0000), var(--tw-inset-ring-shadow, 0 0 #0000),
        var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000),
        0 1px 2px 0 var(--tw-shadow-color, #0000000d);
    }

    /* Joined outline group when spacing is 0 (default upstream look). */
    [data-ui-component="toggle-group"][data-ui-part="toggle-group"][data-spacing="0"][data-variant="outline"] {
      box-shadow:
        var(--tw-inset-shadow, 0 0 #0000), var(--tw-inset-ring-shadow, 0 0 #0000),
        var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000),
        0 1px 2px 0 var(--tw-shadow-color, #0000000d);
    }

    [data-ui-component="toggle-group"][data-ui-part="toggle-group"][data-spacing="0"]
      > [data-ui-part="toggle-group-item"] {
      border-radius: 0;
      box-shadow: none;
    }

    [data-ui-component="toggle-group"][data-ui-part="toggle-group"][data-spacing="0"][data-orientation="horizontal"]
      > [data-ui-part="toggle-group-item"][data-variant="outline"] {
      border-left-width: 0;
    }

    [data-ui-component="toggle-group"][data-ui-part="toggle-group"][data-spacing="0"][data-orientation="horizontal"]
      > [data-ui-part="toggle-group-item"][data-variant="outline"]:first-child {
      border-left-width: 1px;
      border-top-left-radius: calc(var(--radius) * 0.8);
      border-bottom-left-radius: calc(var(--radius) * 0.8);
    }

    [data-ui-component="toggle-group"][data-ui-part="toggle-group"][data-spacing="0"][data-orientation="horizontal"]
      > [data-ui-part="toggle-group-item"]:last-child {
      border-top-right-radius: calc(var(--radius) * 0.8);
      border-bottom-right-radius: calc(var(--radius) * 0.8);
    }

    @media (hover: hover) {
      [data-ui-component="toggle-group"][data-ui-part="toggle-group-item"]:hover,
      [data-ui-component="toggle-group"][data-ui-part="toggle-group-item"][data-variant="outline"]:hover {
        background-color: var(--muted);
        color: var(--foreground);
      }
    }

    [data-ui-component="toggle-group"][data-ui-part="toggle-group-item"]:focus-visible {
      border-color: var(--ring);
      --tw-ring-color: var(--ring);
      --tw-ring-shadow: var(--tw-ring-inset, ) 0 0 0
        calc(3px + var(--tw-ring-offset-width, 0px))
        var(--tw-ring-color, currentcolor);
      box-shadow:
        var(--tw-inset-shadow, 0 0 #0000), var(--tw-inset-ring-shadow, 0 0 #0000),
        var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow),
        var(--tw-shadow, 0 0 #0000);
    }

    [data-ui-component="toggle-group"][data-ui-part="toggle-group-item"]:disabled {
      pointer-events: none;
      opacity: 0.5;
    }

    [data-ui-component="toggle-group"][data-ui-part="toggle-group-item"][data-state="on"] {
      background-color: var(--muted);
    }

    [data-ui-component="toggle-group"][data-ui-part="toggle-group-item"] svg {
      pointer-events: none;
      flex-shrink: 0;
    }

    [data-ui-component="toggle-group"][data-ui-part="toggle-group-item"]
      svg:not([class*="size-"]) {
      width: calc(var(--spacing) * 4);
      height: calc(var(--spacing) * 4);
    }
  }
</style>
