<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import ToolCalls from "./ToolCalls.svelte";
  const { Story } = defineMeta({
    title: "AI/Chat/Tool Calls",
    component: ToolCalls,
    tags: ["visual-pending", "!autodocs"],
  });
  const play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("alert")).toHaveTextContent(
      "Edit permission denied",
    );
    await expect(canvas.getByText("−2")).toBeVisible();
  };
</script>

{#snippet content()}
  {#snippet detail()}<p>The original note was preserved.</p>{/snippet}
  <ToolCalls
    calls={[
      {
        id: "edit",
        name: "notes.patch",
        status: "error",
        errorMessage: "Edit permission denied",
        deletions: 2,
        detail,
      },
    ]}
  />
{/snippet}

<Story name="Failed tool in Lapis dark" {play}>
  {#snippet template()}
    <div
      data-ui-theme="lapis"
      class="dark"
      style="background: var(--background); color: var(--foreground); padding: 1rem;"
    >
      {@render content()}
    </div>
  {/snippet}
</Story>

<Story name="Failed tool in Lapis light" {play}>
  {#snippet template()}
    <div
      data-ui-theme="lapis"
      style="background: var(--background); color: var(--foreground); padding: 1rem;"
    >
      {@render content()}
    </div>
  {/snippet}
</Story>
