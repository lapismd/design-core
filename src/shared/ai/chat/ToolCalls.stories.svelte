<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import ToolCalls from "./ToolCalls.svelte";

  const { Story } = defineMeta({
    title: "AI/Chat/Tool Calls",
    component: ToolCalls,
    parameters: {
      docs: {
        description: {
          component:
            "Bindable shadcn Collapsible tool group with pending, running, complete, error, stats, and per-call details.",
        },
      },
    },
  });
</script>

<Story
  name="Expands call details"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Show details for Read file" }),
    );
    await expect(canvas.getByText("Loaded 84 lines")).toBeVisible();
  }}
>
  {#snippet template()}
    {#snippet readDetail()}
      <p data-story="tool-detail">Loaded 84 lines</p>
    {/snippet}
    <ToolCalls
      expanded
      calls={[
        {
          id: "read",
          name: "Read file",
          target: "release-notes.md",
          status: "complete",
          duration: "42 ms",
          detail: readDetail,
        },
        {
          id: "edit",
          name: "Update changelog",
          status: "running",
          additions: 12,
          deletions: 3,
        },
        {
          id: "test",
          name: "Run checks",
          status: "error",
          errorMessage: "One visual comparison failed.",
        },
      ]}
    />
  {/snippet}
</Story>

<Story name="Collapsed summary">
  {#snippet template()}
    <ToolCalls
      calls={[
        { name: "Search files", status: "pending" },
        { name: "Read source", status: "complete" },
      ]}
    />
  {/snippet}
</Story>

<style>
  :global([data-story="tool-detail"]) {
    margin: 0;
  }
</style>
