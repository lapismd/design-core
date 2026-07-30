<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import * as Collapsible from "./index.js";
  import { Button } from "../button/index.js";

  const { Story } = defineMeta({
    title: "Shadcn/Disclosure/Collapsible",
    component: Collapsible.Root,
    parameters: {
      docs: {
        description: {
          component:
            "Show and hide secondary content without leaving the page.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let open = $state(false);
</script>

<Story
  name="Expands details"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Toggle details" }),
    );
    await expect(canvas.getByText("Hidden until expanded")).toBeVisible();
  }}
  tags={["visual-approved"]}
>
  {#snippet template()}
    <Collapsible.Root bind:open class="max-w-sm">
      <Collapsible.Trigger>
        {#snippet child({ props })}
          <Button {...props} variant="outline">Toggle details</Button>
        {/snippet}
      </Collapsible.Trigger>
      <Collapsible.Content class="text-muted-foreground mt-2 text-sm">
        Hidden until expanded
      </Collapsible.Content>
    </Collapsible.Root>
  {/snippet}
</Story>
