<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import * as Empty from "./index.js";
  import { Button } from "../button/index.js";

  const { Story } = defineMeta({
    title: "Shadcn/Feedback/Empty",
    component: Empty.Root,
    parameters: {
      docs: {
        description: {
          component: "Empty-state composition for lists and workspaces with no data.",
        },
      },
    },
  });
</script>

<Story
  name="No results state"
  play={async ({ canvas }) => {
    await expect(canvas.getByText("No documents yet")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Create document" })).toBeVisible();
  }}
>
  {#snippet template()}
    <Empty.Root class="max-w-md border">
      <Empty.Header>
        <Empty.Title>No documents yet</Empty.Title>
        <Empty.Description>Create your first document to get started.</Empty.Description>
      </Empty.Header>
      <Empty.Content>
        <Button>Create document</Button>
      </Empty.Content>
    </Empty.Root>
  {/snippet}
</Story>
