<script lang="ts">
  import { Button } from "../../shadcn/button/index.js";
  import * as DropdownMenu from "../../shadcn/dropdown-menu/index.js";
  import * as HoverCard from "../../shadcn/hover-card/index.js";
  import type { WorkspaceViewContext } from "../core/types.js";

  let { tab }: WorkspaceViewContext = $props();
</script>

<div class="ui-workspace-overlay-portal-fixture" aria-label={tab.title}>
  <DropdownMenu.Root>
    <DropdownMenu.Trigger>
      {#snippet child({ props })}
        <Button {...props} variant="outline">Open fixture menu</Button>
      {/snippet}
    </DropdownMenu.Trigger>
    <DropdownMenu.Content>
      <DropdownMenu.Item>Popup-only action</DropdownMenu.Item>
    </DropdownMenu.Content>
  </DropdownMenu.Root>

  <HoverCard.Root>
    <HoverCard.Trigger>
      {#snippet child({ props })}
        <Button {...props} variant="outline">Preview fixture link</Button>
      {/snippet}
    </HoverCard.Trigger>
    <HoverCard.Content class="ui-workspace-overlay-portal-fixture__preview">
      <strong>Popup-only preview</strong>
      <button type="button">Preview action</button>
    </HoverCard.Content>
  </HoverCard.Root>
</div>

<style>
  .ui-workspace-overlay-portal-fixture {
    display: flex;
    min-height: 16rem;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 2rem;
  }

  :global(.ui-workspace-overlay-portal-fixture__preview) {
    display: grid;
    gap: 0.75rem;
  }
</style>
