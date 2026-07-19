<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import EntryActions from "./EntryActions.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Entry Actions",
    component: EntryActions,
    parameters: {
      docs: {
        description: {
          component: "Move and delete actions for repeated form entries.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let action = $state("idle");
</script>

<Story
  name="Invokes entry controls"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Move down" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("down");
  }}
>
  {#snippet template()}
    <div class="max-w-xl">
      <EntryActions
        index={0}
        total={2}
        onMove={(direction) => {
          action = direction === 1 ? "down" : "up";
        }}
        onRemove={() => {
          action = "remove";
        }}
      >
        <p class="text-muted-foreground m-0 text-sm">Entry body</p>
      </EntryActions>
      <output class="text-muted-foreground mt-2 block text-sm">{action}</output>
    </div>
  {/snippet}
</Story>
