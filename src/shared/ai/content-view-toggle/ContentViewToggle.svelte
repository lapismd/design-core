<script lang="ts">
  import CodeIcon from "@lucide/svelte/icons/code";
  import BookOpenIcon from "@lucide/svelte/icons/book-open";
  import { Button } from "../../shadcn/button/index.js";
  import * as Tooltip from "../../shadcn/tooltip/index.js";
  import type { ContentViewToggleProps } from "./content-view-toggle.types.js";
  import "./content-view-toggle.css";
  let {
    view = $bindable("formatted"),
    sourceLabel = "Show source",
    formattedLabel = "Show formatted output",
    disabled = false,
    onViewChange,
  }: ContentViewToggleProps = $props();
  const label = $derived(view === "source" ? formattedLabel : sourceLabel);
  function toggle() {
    view = view === "source" ? "formatted" : "source";
    onViewChange?.(view);
  }
</script>

<span data-ui-component="content-view-toggle">
  <Tooltip.Provider delayDuration={0}
    ><Tooltip.Root
      ><Tooltip.Trigger
        >{#snippet child({ props })}<Button
            {...props}
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            aria-pressed={view === "source"}
            {disabled}
            onclick={toggle}
            >{#if view === "source"}<BookOpenIcon
                aria-hidden="true"
              />{:else}<CodeIcon aria-hidden="true" />{/if}</Button
          >{/snippet}</Tooltip.Trigger
      ><Tooltip.Content>{label}</Tooltip.Content></Tooltip.Root
    ></Tooltip.Provider
  >
</span>
