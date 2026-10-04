export const Basic = `<script lang="ts">
  import { PanelToggle } from "@lapismd/design-core/shadcn/panel-toggle";
  let expanded = $state(true);
</script>
<PanelToggle
  {expanded}
  aria-label={expanded ? "Collapse files" : "Expand files"}
  onclick={() => (expanded = !expanded)}
/>`;

export const Right = `<script lang="ts">
  import { PanelToggle } from "@lapismd/design-core/shadcn/panel-toggle";
  let expanded = $state(false);
</script>
<PanelToggle
  side="right"
  {expanded}
  aria-label={expanded ? "Collapse details" : "Expand details"}
  onclick={() => (expanded = !expanded)}
/>`;

export const Disabled = `<script lang="ts">
  import { PanelToggle } from "@lapismd/design-core/shadcn/panel-toggle";
</script>
<PanelToggle expanded disabled aria-label="Collapse unavailable panel" />`;

export const Custom = `<script lang="ts">
  import { PanelToggle } from "@lapismd/design-core/shadcn/panel-toggle";
  import Columns from "@lucide/svelte/icons/columns-2";
  let expanded = $state(true);
</script>
<PanelToggle {expanded} aria-label="Toggle preview" onclick={() => (expanded = !expanded)}>
  <Columns aria-hidden="true" />
</PanelToggle>`;
