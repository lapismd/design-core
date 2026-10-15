export const Basic = `<script lang="ts">
  import { PanelToggle } from "@lapismd/design-core/shadcn/panel-toggle";
  let expanded = $state(true);
</script>
<PanelToggle
  {expanded}
  aria-label={expanded ? "Collapse files" : "Expand files"}
  onclick={() => (expanded = !expanded)}
/>`;

export const Comparison = `<script lang="ts">
  import { PanelToggle, PanelToggleIcon } from "@lapismd/design-core/shadcn/panel-toggle";
  import Columns from "@lucide/svelte/icons/columns-2";
  const variants = ["standard", "compact"] as const;
  const sides = ["left", "right", "top", "bottom"] as const;
  let states = $state<Record<string, boolean>>({});
  let inspectorOpen = $state(false);
  let previewOpen = $state(true);
</script>
{#each variants as iconVariant}
  {#each sides as side}
    {#each ["collapsed", "expanded", "disabled"] as state}
      {@const initial = state !== "collapsed"}
      {@const key = [iconVariant, side, state].join("-")}
      <PanelToggle {side} {iconVariant} expanded={states[key] ?? initial}
        disabled={state === "disabled"} aria-label={key} onclick={() => (states[key] = !(states[key] ?? initial))} />
    {/each}
  {/each}
{/each}
<button type="button" aria-label="Toggle inspector" aria-expanded={inspectorOpen}
  onclick={() => (inspectorOpen = !inspectorOpen)}>
  <PanelToggleIcon side="right" iconVariant="standard" expanded={inspectorOpen} />
  Inspector
</button>
<PanelToggle expanded={previewOpen} aria-label="Toggle custom preview"
  onclick={() => (previewOpen = !previewOpen)}>
  <Columns aria-hidden="true" />
</PanelToggle>`;
