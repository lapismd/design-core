<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import ToolCalls from "./ToolCalls.svelte";
  import { UnavailableStatus } from "./ToolCallsStatus.example-sources.js";
  const { Story } = defineMeta({
    title: "AI/Chat/Tool Calls",
    component: ToolCalls,
    tags: ["visual-pending"],
    parameters: {
      docs: {
        source: {
          language: "tsx",
          type: "code",
          code: UnavailableStatus,
        },
      },
    },
  });
</script>

<Story
  name="Unavailable execution status"
  play={async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText("Status unavailable")).toBeInTheDocument();
    await expect(
      canvas.queryByText("Error", { exact: true }),
    ).not.toBeInTheDocument();
    await expect(
      canvasElement.querySelector(
        '[data-ui-part="call-status"] [data-ui-component="spinner"]',
      ),
    ).toBeNull();
    await userEvent.click(
      canvas.getByRole("button", { name: "Show details for Read file" }),
    );
    await expect(canvas.getByText("Previously observed output")).toBeVisible();
  }}
>
  {#snippet template()}
    {#snippet detail()}<p>Previously observed output</p>{/snippet}
    <ToolCalls calls={[{ name: "Read file", status: "unknown", detail }]} />
  {/snippet}
</Story>
