<script lang="ts">
  import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
  import MinusIcon from "@lucide/svelte/icons/minus";
  import CheckIcon from "@lucide/svelte/icons/check";
  import { type WithoutChildrenOrChild } from "../../../lib/utils.js";
  import type { Snippet } from "svelte";

  let {
    ref = $bindable(null),
    checked = $bindable(false),
    indeterminate = $bindable(false),
    class: className,
    children: childrenProp,
    ...restProps
  }: WithoutChildrenOrChild<DropdownMenuPrimitive.CheckboxItemProps> & {
    children?: Snippet;
  } = $props();
</script>

<DropdownMenuPrimitive.CheckboxItem
  bind:ref
  bind:checked
  bind:indeterminate
  data-ui-component="dropdown-menu"
  data-ui-part="dropdown-menu-checkbox-item"
  data-slot="dropdown-menu-checkbox-item"
  class={className}
  {...restProps}
>
  {#snippet children({ checked, indeterminate })}
    <span
      data-ui-component="dropdown-menu"
      data-ui-part="dropdown-menu-checkbox-item-indicator"
      data-slot="dropdown-menu-checkbox-item-indicator"
    >
      {#if indeterminate}
        <MinusIcon />
      {:else if checked}
        <CheckIcon />
      {/if}
    </span>
    {@render childrenProp?.()}
  {/snippet}
</DropdownMenuPrimitive.CheckboxItem>

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
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-checkbox-item-indicator"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-radio-item-indicator"] {
        pointer-events: none;
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-checkbox-item-indicator"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-radio-item-indicator"] {
        position: absolute;
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-checkbox-item"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-item"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-radio-item"] {
        position: relative;
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-checkbox-item-indicator"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-radio-item-indicator"] {
        right: calc(var(--spacing) * 2);
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-content"] {
        z-index: 50;
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-separator"] {
        margin-inline: calc(var(--spacing) * -1);
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-separator"] {
        margin-block: var(--spacing);
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-shortcut"] {
        margin-left: auto;
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-checkbox-item"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-checkbox-item-indicator"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-item"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-radio-item"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-radio-item-indicator"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-trigger"] {
        display: flex;
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-separator"] {
        height: 1px;
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-content"] {
        width: var(--bits-dropdown-menu-anchor-width);
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-content"] {
        width: auto;
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-content"] {
        min-width: calc(var(--spacing) * 32);
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-content"] {
        min-width: 96px;
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-checkbox-item"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-item"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-radio-item"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-trigger"] {
        cursor: default;
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-checkbox-item"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-checkbox-item-indicator"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-item"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-radio-item"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-radio-item-indicator"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-trigger"] {
        align-items: center;
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-checkbox-item-indicator"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-radio-item-indicator"] {
        justify-content: center;
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-checkbox-item"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-item"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-radio-item"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-trigger"] {
        gap: calc(var(--spacing) * 2);
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-content"] {
        overflow-x: hidden;
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-content"] {
        overflow-y: auto;
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-content"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-content"] {
        border-radius: calc(var(--radius) * 0.8);
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-checkbox-item"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-item"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-radio-item"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-trigger"] {
        border-radius: calc(var(--radius) * 0.6);
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-separator"] {
        background-color: var(--border);
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-content"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-content"] {
        background-color: var(--popover);
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-content"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-content"] {
        padding: var(--spacing);
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-group-heading"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-item"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-label"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-trigger"] {
        padding-inline: calc(var(--spacing) * 2);
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-checkbox-item"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-group-heading"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-item"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-label"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-radio-item"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-trigger"] {
        padding-block: calc(var(--spacing) * 1.5);
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-checkbox-item"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-radio-item"] {
        padding-right: calc(var(--spacing) * 8);
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-checkbox-item"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-radio-item"] {
        padding-left: calc(var(--spacing) * 2);
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-checkbox-item"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-group-heading"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-item"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-radio-item"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-trigger"] {
        font-size: var(--text-sm);
        line-height: var(--tw-leading, var(--text-sm--line-height));
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-label"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-shortcut"] {
        font-size: var(--text-xs);
        line-height: var(--tw-leading, var(--text-xs--line-height));
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-label"] {
        --tw-font-weight: var(--font-weight-medium);
        font-weight: var(--font-weight-medium);
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-group-heading"] {
        --tw-font-weight: var(--font-weight-semibold);
        font-weight: var(--font-weight-semibold);
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-shortcut"] {
        --tw-tracking: var(--tracking-widest);
        letter-spacing: var(--tracking-widest);
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-label"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-shortcut"] {
        color: var(--muted-foreground);
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-content"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-content"] {
        color: var(--popover-foreground);
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-content"] {
        --tw-shadow: 0 10px 15px -3px var(--tw-shadow-color, #0000001a),
          0 4px 6px -4px var(--tw-shadow-color, #0000001a);
        box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
          var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-content"] {
        --tw-shadow: 0 4px 6px -1px var(--tw-shadow-color, #0000001a),
          0 2px 4px -2px var(--tw-shadow-color, #0000001a);
        box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
          var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-content"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-content"] {
        --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0
          calc(1px + var(--tw-ring-offset-width))
          var(--tw-ring-color, currentcolor);
        box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
          var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-content"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-content"] {
        --tw-ring-color: var(--foreground);
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-content"],
        [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-content"] {
          --tw-ring-color: color-mix(
            in oklab,
            var(--foreground) 10%,
            transparent
          );
        }
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-checkbox-item"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-item"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-radio-item"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-trigger"] {
        --tw-outline-style: none;
        outline-style: none;
      }
      @media (forced-colors: active) {
        [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-checkbox-item"],
        [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-item"],
        [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-radio-item"],
        [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-trigger"] {
          outline-offset: 2px;
          outline: 2px solid #0000;
        }
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-content"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-content"] {
        --tw-duration: 0.1s;
        transition-duration: 0.1s;
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-content"] {
        --tw-outline-style: none;
        outline-style: none;
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-checkbox-item"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-item"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-radio-item"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-trigger"] {
        -webkit-user-select: none;
        user-select: none;
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-shortcut"]:is(
          :where(
              [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-item"]
            ):focus
            *
        ) {
        color: var(--accent-foreground);
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-checkbox-item"]:focus,
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-item"]:focus,
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-radio-item"]:focus,
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-trigger"]:focus {
        background-color: var(--accent);
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-checkbox-item"]:focus,
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-item"]:focus,
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-radio-item"]:focus,
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-trigger"]:focus,
      :is(
          [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-checkbox-item"]:focus
            *
        ),
      :is(
          [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-radio-item"]:focus
            *
        ),
      :is(
          [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-item"]:not(
              [data-variant="destructive"]
            ):focus
            *
        ),
      :is(
          [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-trigger"]:not(
              [data-variant="destructive"]
            ):focus
            *
        ) {
        color: var(--accent-foreground);
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-checkbox-item"][data-inset],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-item"][data-inset],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-label"][data-inset],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-radio-item"][data-inset],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-trigger"][data-inset] {
        padding-left: calc(var(--spacing) * 8);
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-checkbox-item"][data-disabled],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-radio-item"][data-disabled] {
        pointer-events: none;
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-checkbox-item"][data-disabled],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-radio-item"][data-disabled] {
        opacity: 0.5;
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-group-heading"][data-inset] {
        padding-inline-start: calc(var(--spacing) * 8);
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-item"][data-inset],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-label"][data-inset],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-trigger"][data-inset] {
        padding-left: calc(var(--spacing) * 8);
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-content"][data-side="bottom"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-content"][data-side="bottom"] {
        --tw-enter-translate-y: calc(2 * var(--spacing) * -1);
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-content"][data-side="inline-end"] {
        --tw-enter-translate-x: calc(2 * var(--spacing) * -1);
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-content"][data-side="inline-start"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-content"][data-side="left"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-content"][data-side="left"] {
        --tw-enter-translate-x: calc(2 * var(--spacing));
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-content"][data-side="right"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-content"][data-side="right"] {
        --tw-enter-translate-x: calc(2 * var(--spacing) * -1);
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-content"][data-side="top"],
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-content"][data-side="top"] {
        --tw-enter-translate-y: calc(2 * var(--spacing));
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-item"][data-variant="destructive"] {
        color: var(--destructive);
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-item"][data-variant="destructive"]:focus {
        background-color: var(--destructive);
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-item"][data-variant="destructive"]:focus {
          background-color: color-mix(
            in oklab,
            var(--destructive) 10%,
            transparent
          );
        }
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-item"][data-variant="destructive"]:focus {
        color: var(--destructive);
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-item"]:is(
          :global(.dark) *
        )[data-variant="destructive"]:focus {
        background-color: var(--destructive);
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-item"]:is(
            :global(.dark) *
          )[data-variant="destructive"]:focus {
          background-color: color-mix(
            in oklab,
            var(--destructive) 20%,
            transparent
          );
        }
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-content"]:where(
          [data-state="open"]
        ),
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-content"]:where(
          [data-state="open"]
        ),
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-content"]:where(
          [data-open]:not([data-open="false"])
        ),
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-content"]:where(
          [data-open]:not([data-open="false"])
        ) {
        animation: enter var(--tw-animation-duration, var(--tw-duration, 0.15s))
          var(--tw-ease, ease) var(--tw-animation-delay, 0s)
          var(--tw-animation-iteration-count, 1)
          var(--tw-animation-direction, normal)
          var(--tw-animation-fill-mode, none);
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-trigger"]:where(
          [data-state="open"]
        ),
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-trigger"]:where(
          [data-open]:not([data-open="false"])
        ) {
        background-color: var(--accent);
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-trigger"]:where(
          [data-state="open"]
        ),
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-trigger"]:where(
          [data-open]:not([data-open="false"])
        ) {
        color: var(--accent-foreground);
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-content"]:where(
          [data-state="open"]
        ),
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-content"]:where(
          [data-state="open"]
        ),
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-content"]:where(
          [data-open]:not([data-open="false"])
        ),
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-content"]:where(
          [data-open]:not([data-open="false"])
        ) {
        --tw-enter-opacity: 0;
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-content"]:where(
          [data-state="open"]
        ),
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-content"]:where(
          [data-state="open"]
        ),
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-content"]:where(
          [data-open]:not([data-open="false"])
        ),
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-content"]:where(
          [data-open]:not([data-open="false"])
        ) {
        --tw-enter-scale: 0.95;
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-content"]:where(
          [data-state="closed"]
        ),
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-content"]:where(
          [data-state="closed"]
        ),
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-content"]:where(
          [data-closed]:not([data-closed="false"])
        ),
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-content"]:where(
          [data-closed]:not([data-closed="false"])
        ) {
        animation: exit var(--tw-animation-duration, var(--tw-duration, 0.15s))
          var(--tw-ease, ease) var(--tw-animation-delay, 0s)
          var(--tw-animation-iteration-count, 1)
          var(--tw-animation-direction, normal)
          var(--tw-animation-fill-mode, none);
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-content"]:where(
          [data-state="closed"]
        ),
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-content"]:where(
          [data-closed]:not([data-closed="false"])
        ) {
        overflow: hidden;
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-content"]:where(
          [data-state="closed"]
        ),
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-content"]:where(
          [data-state="closed"]
        ),
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-content"]:where(
          [data-closed]:not([data-closed="false"])
        ),
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-content"]:where(
          [data-closed]:not([data-closed="false"])
        ) {
        --tw-exit-opacity: 0;
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-content"]:where(
          [data-state="closed"]
        ),
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-content"]:where(
          [data-state="closed"]
        ),
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-content"]:where(
          [data-closed]:not([data-closed="false"])
        ),
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-content"]:where(
          [data-closed]:not([data-closed="false"])
        ) {
        --tw-exit-scale: 0.95;
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-item"]:where(
          [data-disabled="true"]
        ),
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-item"]:where(
          [data-disabled]:not([data-disabled="false"])
        ) {
        pointer-events: none;
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-item"]:where(
          [data-disabled="true"]
        ),
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-item"]:where(
          [data-disabled]:not([data-disabled="false"])
        ) {
        opacity: 0.5;
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-checkbox-item"]
        svg,
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-item"]
        svg,
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-radio-item"]
        svg,
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-trigger"]
        svg {
        pointer-events: none;
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-checkbox-item"]
        svg,
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-item"]
        svg,
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-radio-item"]
        svg,
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-trigger"]
        svg {
        flex-shrink: 0;
      }
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-checkbox-item"]
        svg:not([class*="size-"]),
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-item"]
        svg:not([class*="size-"]),
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-radio-item"]
        svg:not([class*="size-"]),
      [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-sub-trigger"]
        svg:not([class*="size-"]) {
        width: calc(var(--spacing) * 4);
        height: calc(var(--spacing) * 4);
      }
      :is(
          [data-ui-component="dropdown-menu"][data-ui-part="dropdown-menu-item"][data-variant="destructive"]
            > *
        ):is(svg) {
        color: var(--destructive);
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
    @property --tw-font-weight {
      syntax: "*";
      inherits: false;
    }
    @property --tw-tracking {
      syntax: "*";
      inherits: false;
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
    @property --tw-duration {
      syntax: "*";
      inherits: false;
    }
  }
</style>
