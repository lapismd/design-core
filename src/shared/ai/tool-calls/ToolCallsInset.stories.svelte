<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import ToolCalls from "./ToolCalls.svelte";
  import { Inset } from "./ToolCallsInset.example-sources.js";
  const { Story } = defineMeta({
    title: "AI/Chat/Tool Calls",
    component: ToolCalls,
    tags: ["visual-pending"],
    parameters: {
      docs: { source: { code: Inset, language: "tsx", type: "code" } },
    },
  });
</script>

<Story
  name="Icon inset stays inside the hover surface"
  play={async ({ canvas }) => {
    const trigger = canvas.getByRole("button", {
      name: "Show details for Read file",
    });
    const icon = trigger.querySelector('[data-ui-part="call-status"]')!;
    const before = icon.getBoundingClientRect().left;
    expect(getComputedStyle(trigger).paddingInlineStart).toBe("8px");
    expect(before - trigger.getBoundingClientRect().left).toBe(8);
    await userEvent.hover(trigger);
    expect(icon.getBoundingClientRect().left).toBe(before);
    await userEvent.click(trigger);
    await expect(canvas.getByText("Captured file contents")).toBeVisible();
  }}
>
  {#snippet template()}
    {#snippet detail()}<p>Captured file contents</p>{/snippet}
    <ToolCalls
      style="--ui-ai-chat-tool-trigger-padding-inline: 0.5rem;"
      calls={[{ name: "Read file", status: "complete", detail }]}
    />
  {/snippet}
</Story>
