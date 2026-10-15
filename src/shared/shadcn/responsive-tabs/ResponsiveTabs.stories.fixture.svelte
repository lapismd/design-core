<script lang="ts">
  import { ResponsiveTabs } from "./index.js";
  import * as Tabs from "../tabs/index.js";
  import { Button } from "../button/index.js";
  import FileIcon from "@lucide/svelte/icons/file";
  let {
    presentation = "pill",
    disabled = false,
  }: { presentation?: "pill" | "line"; disabled?: boolean } = $props();
  let width = $state(720),
    value = $state("overview");
  const items = [
    { value: "overview", label: "Overview", Icon: FileIcon },
    { value: "documents", label: "Documents" },
    { value: "activity", label: "Activity" },
    { value: "people", label: "People" },
    { value: "settings", label: "Settings", disabled: true },
  ];
</script>

<div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1rem">
  <Button variant="outline" onclick={() => (width = 720)}>Wide</Button><Button
    variant="outline"
    onclick={() => (width = 280)}>Overflow</Button
  ><Button variant="outline" onclick={() => (width = 90)}>Menu only</Button
  ><label
    >Container width <input
      aria-label="Container width"
      type="range"
      min="90"
      max="760"
      bind:value={width}
    /></label
  >
</div>
<div style:width={`${width}px`} style:max-width="100%">
  <Tabs.Root bind:value>
    <ResponsiveTabs
      bind:value
      {items}
      {presentation}
      {disabled}
      inheritContext
      label="Project sections"
    />
    {#each items as item}<Tabs.Content
        value={item.value}
        aria-label={item.label}>{item.label} content</Tabs.Content
      >{/each}
  </Tabs.Root>
</div>
<output data-testid="selected-tab">{value}</output>
