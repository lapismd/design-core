<script lang="ts">
  import * as Drawer from "../index.js";
  import { Button } from "../../button/index.js";

  let goal = $state(350);
</script>

<Drawer.Root>
  <Drawer.Trigger>
    {#snippet child({ props })}
      <Button {...props} variant="outline">Open drawer</Button>
    {/snippet}
  </Drawer.Trigger>
  <Drawer.Content>
    <Drawer.Header>
      <Drawer.Title>Move Goal</Drawer.Title>
      <Drawer.Description>Set your daily activity goal.</Drawer.Description>
    </Drawer.Header>
    <div data-ui-part="drawer-preview-body">
      <p data-ui-part="drawer-preview-value">{goal}</p>
      <div data-ui-part="drawer-preview-actions">
        <Button
          variant="outline"
          size="icon"
          aria-label="Decrease"
          onclick={() => (goal = Math.max(200, goal - 10))}
        >
          -
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="Increase"
          onclick={() => (goal = Math.min(400, goal + 10))}
        >
          +
        </Button>
      </div>
    </div>
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

<style>
  :global([data-ui-part="drawer-preview-body"]) {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
  }

  :global([data-ui-part="drawer-preview-value"]) {
    margin: 0;
    font-size: 2.5rem;
    font-weight: 700;
    letter-spacing: -0.03em;
  }

  :global([data-ui-part="drawer-preview-actions"]) {
    display: flex;
    gap: 0.5rem;
  }
</style>
