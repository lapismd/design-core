<script lang="ts">
  import { Command as CommandPrimitive } from "bits-ui";

  export type CommandRootApi = CommandPrimitive.Root;

  let {
    api = $bindable(null),
    ref = $bindable(null),
    value = $bindable(""),
    class: className,
    ...restProps
  }: CommandPrimitive.RootProps & {
    api?: CommandRootApi | null;
  } = $props();
</script>

<CommandPrimitive.Root
  bind:this={api}
  bind:value
  bind:ref
  data-ui-component="command"
  data-ui-part="command"
  data-slot="command"
  class={className}
  {...restProps}
/>

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
      [data-ui-component="command"][data-ui-part="command-item"] {
        position: relative;
      }
      [data-ui-component="command"][data-ui-part="command-content"] {
        position: fixed;
        top: 33.3333%;
        left: 50%;
        z-index: 50;
        display: grid;
        width: 100%;
        max-width: calc(100% - 2rem);
      }
      [data-ui-component="command"][data-ui-part="command-separator"] {
        margin-inline: calc(var(--spacing) * -1);
      }
      [data-ui-component="command"][data-ui-part="command-check-icon"],
      [data-ui-component="command"][data-ui-part="command-shortcut"] {
        margin-left: auto;
      }
      [data-ui-component="command"][data-ui-part="command-list"] {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      [data-ui-component="command"][data-ui-part="command-list"]::-webkit-scrollbar {
        display: none;
      }
      [data-ui-component="command"][data-ui-part="command-item"],
      [data-ui-component="command"][data-ui-part="command"] {
        display: flex;
      }
      [data-ui-component="command"][data-ui-part="command-search-icon"] {
        width: calc(var(--spacing) * 4);
        height: calc(var(--spacing) * 4);
      }
      [data-ui-component="command"][data-ui-part="command"] {
        width: 100%;
        height: 100%;
      }
      [data-ui-part="command-input-wrapper"]
        > [data-ui-component="input-group"][data-ui-part="input-group"] {
        height: calc(var(--spacing) * 8) !important;
      }
      [data-ui-component="command"][data-ui-part="command-separator"] {
        height: 1px;
      }
      [data-ui-component="command"][data-ui-part="command-list"] {
        max-height: calc(var(--spacing) * 72);
      }
      [data-ui-component="command"][data-ui-part="command-separator"] {
        width: auto;
      }
      [data-ui-part="command-input-wrapper"] [data-slot="input-group-control"] {
        width: 100%;
      }
      [data-ui-component="command"][data-ui-part="command-search-icon"] {
        flex-shrink: 0;
      }
      [data-ui-component="command"][data-ui-part="command-content"] {
        --tw-translate-x: calc(calc(1 / 2 * 100%) * -1);
        --tw-translate-y: 0px;
        translate: var(--tw-translate-x) var(--tw-translate-y);
      }
      [data-ui-component="command"][data-ui-part="command-item"] {
        cursor: default;
      }
      [data-ui-component="command"][data-ui-part="command-list"] {
        scroll-padding-block: var(--spacing);
      }
      [data-ui-component="command"][data-ui-part="command"] {
        flex-direction: column;
      }
      [data-ui-component="command"][data-ui-part="command-item"] {
        align-items: center;
      }
      [data-ui-component="command"][data-ui-part="command-item"] {
        gap: calc(var(--spacing) * 2);
      }
      [data-ui-component="command"][data-ui-part="command-content"],
      [data-ui-component="command"][data-ui-part="command-group"],
      [data-ui-component="command"][data-ui-part="command"] {
        overflow: hidden;
      }
      [data-ui-component="command"][data-ui-part="command-list"] {
        overflow-x: hidden;
      }
      [data-ui-component="command"][data-ui-part="command-list"] {
        overflow-y: auto;
      }
      [data-ui-part="command-input-wrapper"]
        > [data-ui-component="input-group"][data-ui-part="input-group"] {
        border-radius: var(--radius) !important;
      }
      [data-ui-component="command"][data-ui-part="command-item"] {
        border-radius: calc(var(--radius) * 0.6);
      }
      [data-ui-component="command"][data-ui-part="command-content"],
      [data-ui-component="command"][data-ui-part="command"] {
        border-radius: calc(var(--radius) * 1.4) !important;
      }
      [data-ui-part="command-input-wrapper"]
        > [data-ui-component="input-group"][data-ui-part="input-group"] {
        border-color: var(--input);
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-part="command-input-wrapper"]
          > [data-ui-component="input-group"][data-ui-part="input-group"] {
          border-color: color-mix(in oklab, var(--input) 30%, transparent);
        }
      }
      [data-ui-component="command"][data-ui-part="command-separator"] {
        background-color: var(--border);
      }
      [data-ui-part="command-input-wrapper"]
        > [data-ui-component="input-group"][data-ui-part="input-group"] {
        background-color: var(--input);
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-part="command-input-wrapper"]
          > [data-ui-component="input-group"][data-ui-part="input-group"] {
          background-color: color-mix(in oklab, var(--input) 30%, transparent);
        }
      }
      [data-ui-component="command"][data-ui-part="command"] {
        background-color: var(--ui-command-background, var(--popover));
      }
      [data-ui-component="command"][data-ui-part="command-content"] {
        padding: 0;
      }
      [data-ui-component="command"][data-ui-part="command-group"],
      [data-ui-component="command"][data-ui-part="command-input-wrapper"],
      [data-ui-component="command"][data-ui-part="command"] {
        padding: var(--spacing);
      }
      [data-ui-component="command"][data-ui-part="command-group-heading"],
      [data-ui-component="command"][data-ui-part="command-item"] {
        padding-inline: calc(var(--spacing) * 2);
      }
      [data-ui-component="command"][data-ui-part="command-group-heading"],
      [data-ui-component="command"][data-ui-part="command-item"] {
        padding-block: calc(var(--spacing) * 1.5);
      }
      [data-ui-component="command"][data-ui-part="command-empty"] {
        padding-block: calc(var(--spacing) * 6);
      }
      [data-ui-component="command"][data-ui-part="command-input-wrapper"] {
        padding-bottom: 0;
      }
      [data-ui-component="command"][data-ui-part="command-empty"] {
        text-align: center;
      }
      [data-ui-component="command"][data-ui-part="command-empty"],
      [data-ui-part="command-input-wrapper"] [data-slot="input-group-control"],
      [data-ui-component="command"][data-ui-part="command-item"] {
        font-size: var(--text-sm);
        line-height: var(--tw-leading, var(--text-sm--line-height));
      }
      [data-ui-component="command"][data-ui-part="command-group-heading"],
      [data-ui-component="command"][data-ui-part="command-shortcut"] {
        font-size: var(--text-xs);
        line-height: var(--tw-leading, var(--text-xs--line-height));
      }
      [data-ui-component="command"][data-ui-part="command-group-heading"] {
        --tw-font-weight: var(--font-weight-medium);
        font-weight: var(--font-weight-medium);
      }
      [data-ui-component="command"][data-ui-part="command-shortcut"] {
        --tw-tracking: var(--tracking-widest);
        letter-spacing: var(--tracking-widest);
      }
      [data-ui-component="command"][data-ui-part="command-group"] {
        color: var(--foreground);
      }
      [data-ui-component="command"][data-ui-part="command-group-heading"],
      [data-ui-component="command"][data-ui-part="command-shortcut"] {
        color: var(--muted-foreground);
      }
      [data-ui-component="command"][data-ui-part="command"] {
        color: var(--ui-command-foreground, var(--popover-foreground));
      }
      [data-ui-component="command"][data-ui-part="command-check-icon"] {
        opacity: 0;
      }
      [data-ui-component="command"][data-ui-part="command-search-icon"] {
        opacity: 0.5;
      }
      [data-ui-part="command-input-wrapper"]
        > [data-ui-component="input-group"][data-ui-part="input-group"] {
        --tw-shadow: 0 0 #0000 !important;
        box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
          var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow) !important;
      }
      [data-ui-part="command-input-wrapper"] [data-slot="input-group-control"],
      [data-ui-component="command"][data-ui-part="command-item"] {
        --tw-outline-style: none;
        outline-style: none;
      }
      @media (forced-colors: active) {
        [data-ui-part="command-input-wrapper"]
          [data-slot="input-group-control"],
        [data-ui-component="command"][data-ui-part="command-item"] {
          outline-offset: 2px;
          outline: 2px solid #0000;
        }
      }
      @media (min-width: 40rem) {
        [data-ui-component="command"][data-ui-part="command-content"] {
          max-width: var(--container-md);
        }
      }
      [data-ui-component="command"][data-ui-part="command-list"] {
        --tw-outline-style: none;
        outline-style: none;
      }
      [data-ui-component="command"][data-ui-part="command-item"] {
        -webkit-user-select: none;
        user-select: none;
      }
      [data-ui-component="command"][data-ui-part="command-check-icon"]:is(
          :where(
              [data-ui-component="command"][data-ui-part="command-item"]
            ):has([data-slot="command-shortcut"])
            *
        ) {
        display: none;
      }
      [data-ui-component="command"][data-ui-part="command-shortcut"]:is(
          :where(
              [data-ui-component="command"][data-ui-part="command-item"]
            )[data-selected]
            *
        ) {
        color: var(--foreground);
      }
      [data-ui-component="command"][data-ui-part="command-check-icon"]:is(
          :where(
              [data-ui-component="command"][data-ui-part="command-item"]
            )[data-checked="true"]
            *
        ) {
        opacity: 1;
      }
      [data-ui-part="command-input-wrapper"]
        [data-slot="input-group-control"]:disabled {
        cursor: not-allowed;
      }
      [data-ui-part="command-input-wrapper"]
        [data-slot="input-group-control"]:disabled {
        opacity: 0.5;
      }
      :where([data-slot="dialog-content"])
        [data-ui-component="command"][data-ui-part="command-item"] {
        border-radius: var(--radius) !important;
      }
      [data-ui-component="command"][data-ui-part="command-item"][aria-selected="true"] {
        background-color: var(--accent);
      }
      [data-ui-component="command"][data-ui-part="command-item"][aria-selected="true"] {
        color: var(--accent-foreground);
      }
      [data-ui-component="command"][data-ui-part="command-item"][data-selected] {
        background-color: var(--muted);
      }
      [data-ui-component="command"][data-ui-part="command-item"][data-selected] {
        color: var(--foreground);
      }
      [data-ui-component="command"][data-ui-part="command-item"][data-disabled="true"] {
        pointer-events: none;
      }
      [data-ui-component="command"][data-ui-part="command-item"][data-disabled="true"] {
        opacity: 0.5;
      }
      [data-ui-part="command-input-wrapper"] [data-slot="input-group-addon"] {
        padding-left: calc(var(--spacing) * 2) !important;
      }
      [data-ui-component="command"][data-ui-part="command-item"] svg {
        pointer-events: none;
      }
      [data-ui-component="command"][data-ui-part="command-item"] svg {
        flex-shrink: 0;
      }
      [data-ui-component="command"][data-ui-part="command-item"]
        svg:not([class*="size-"]) {
        width: calc(var(--spacing) * 4);
        height: calc(var(--spacing) * 4);
      }
      [data-ui-component="command"][data-ui-part="command-item"]
        svg:not([class*="text-"]) {
        color: var(--muted-foreground);
      }
      :is(
          [data-ui-component="command"][data-ui-part="command-group"] *
        )[cmdk-group-heading] {
        padding-inline: calc(var(--spacing) * 2);
      }
      :is(
          [data-ui-component="command"][data-ui-part="command-group"] *
        )[cmdk-group-heading] {
        padding-block: calc(var(--spacing) * 1.5);
      }
      :is(
          [data-ui-component="command"][data-ui-part="command-group"] *
        )[cmdk-group-heading] {
        font-size: var(--text-xs);
        line-height: var(--tw-leading, var(--text-xs--line-height));
      }
      :is(
          [data-ui-component="command"][data-ui-part="command-group"] *
        )[cmdk-group-heading] {
        --tw-font-weight: var(--font-weight-medium);
        font-weight: var(--font-weight-medium);
      }
      :is(
          [data-ui-component="command"][data-ui-part="command-group"] *
        )[cmdk-group-heading] {
        color: var(--muted-foreground);
      }
      :is(
          [data-ui-component="command"][data-ui-part="command-item"][data-selected]
            > *
        ):is(svg) {
        color: var(--foreground);
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
    @property --tw-translate-x {
      syntax: "*";
      inherits: false;
      initial-value: 0;
    }
    @property --tw-translate-y {
      syntax: "*";
      inherits: false;
      initial-value: 0;
    }
    @property --tw-translate-z {
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
  }
</style>
