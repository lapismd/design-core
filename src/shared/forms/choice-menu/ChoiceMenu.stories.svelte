<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import ChoiceMenu from "./ChoiceMenu.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Choice Menu",
    component: ChoiceMenu,
    parameters: {
      docs: {
        description: {
          component: "Compact details/summary menu for string options.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let value = $state("draft");
</script>

<Story
  name="Selects a choice"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByLabelText("Status"));
    await userEvent.click(canvas.getByRole("button", { name: "Published" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("published");
  }}
>
  {#snippet template()}
    <div class="flex flex-col gap-2">
      <ChoiceMenu
        {value}
        options={["draft", "published"]}
        labels={{ draft: "Draft", published: "Published" }}
        ariaLabel="Status"
        onChange={(next) => {
          value = next;
        }}
      />
      <output class="text-muted-foreground text-sm">{value}</output>
    </div>
  {/snippet}
</Story>
