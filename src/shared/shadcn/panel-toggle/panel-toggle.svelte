<script lang="ts" module>
  export type PanelToggleProps =
    import("../button/button.svelte").ButtonProps & {
      /** Controlled panel state; consumers handle activation. */
      expanded: boolean;
      /** Edge represented by the filled indicator. */
      side?: "left" | "right";
    };
</script>

<script lang="ts">
  import "./panel-toggle.css";
  import { Button } from "../button/index.js";
  import PanelToggleIcon from "./panel-toggle-icon.svelte";

  let {
    ref = $bindable(null),
    expanded,
    side = "left",
    variant = "ghost",
    size = "icon-xs",
    children,
    ...restProps
  }: PanelToggleProps = $props();
</script>

<Button
  bind:ref
  {variant}
  {size}
  aria-label={`${expanded ? "Collapse" : "Expand"} ${side} panel`}
  {...restProps}
  data-panel-toggle
  aria-expanded={expanded}
>
  {#if children}
    {@render children()}
  {:else}
    <PanelToggleIcon {expanded} {side} />
  {/if}
</Button>
