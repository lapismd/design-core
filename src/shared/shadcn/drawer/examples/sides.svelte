<script lang="ts">
  import * as Drawer from "../index.js";
  import { Button } from "../../button/index.js";

  const DRAWER_SIDES = ["top", "right", "bottom", "left"] as const;
</script>

<div data-ui-part="drawer-sides">
  {#each DRAWER_SIDES as side (side)}
    <Drawer.Root direction={side === "bottom" ? undefined : side}>
      <Drawer.Trigger>
        {#snippet child({ props })}
          <Button {...props} variant="outline">{side}</Button>
        {/snippet}
      </Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Move Goal</Drawer.Title>
          <Drawer.Description>Set your daily activity goal.</Drawer.Description>
        </Drawer.Header>
        <p data-ui-part="drawer-sides-body">
          Drawer opened from the {side}.
        </p>
        <Drawer.Footer>
          <Button>Submit</Button>
          <Drawer.Close>
            {#snippet child({ props })}
              <Button {...props} variant="outline">Cancel</Button>
            {/snippet}
          </Drawer.Close>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer.Root>
  {/each}
</div>

<style>
  :global([data-ui-part="drawer-sides"]) {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  :global([data-ui-part="drawer-sides-body"]) {
    margin: 0;
    padding: 0 1rem 1rem;
    font-size: 0.875rem;
    line-height: 1.5;
  }
</style>
