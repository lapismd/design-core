<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import ToolCalls from "./ToolCalls.svelte";
  import { Layout } from "./ToolCallsLayout.example-sources.js";
  const { Story } = defineMeta({
    title: "AI/Chat/Tool Calls",
    component: ToolCalls,
    tags: ["visual-pending"],
    parameters: {
      docs: { source: { code: Layout, language: "tsx", type: "code" } },
    },
  });
  const longName = "Read " + "a-long-directory-name/".repeat(32) + "source.ts";
</script>

<Story
  name="Full width keeps disclosure icons fixed beside long tool titles"
  play={async ({ canvas, canvasElement }) => {
    const roots = Array.from(
      canvasElement.querySelectorAll(
        '[data-ui-component="ai-chat-tool-calls"]',
      ),
    );
    expect(roots).toHaveLength(2);
    for (const root of roots)
      expect(root.getBoundingClientRect().width).toBeCloseTo(
        root.parentElement!.getBoundingClientRect().width,
        0,
      );
    const group = canvas.getByRole("button", { name: "Expand 2 tool calls" });
    expect(
      group.querySelector('[data-ui-part="chevron"]')!.getBoundingClientRect()
        .width,
    ).toBe(14);
    await userEvent.click(group);
    for (const icon of canvasElement.querySelectorAll(
      '[data-ui-part="detail-chevron"]',
    ))
      expect(icon.getBoundingClientRect().width).toBe(14);
    const first = canvas.getAllByRole("button", {
      name: `Show details for ${longName}`,
    })[0]!;
    first.focus();
    await userEvent.keyboard("{Enter}");
    await expect(first).toHaveAttribute("aria-expanded", "true");
    await expect(
      within(first.closest('[data-ui-part="call"]')!).getByText(
        "Captured contents",
      ),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    {#snippet detail()}<p>Captured contents</p>{/snippet}
    <section style="width:50rem;max-width:100%;">
      <ToolCalls
        style="--ui-ai-chat-tool-width:100%;--ui-ai-chat-tool-trigger-padding-inline:0.5rem;"
        calls={[
          { id: "read", name: longName, status: "complete", detail },
          { id: "edit", name: longName + " edit", status: "complete", detail },
        ]}
      />
    </section>
    <section style="width:20rem;max-width:100%;">
      <ToolCalls
        style="--ui-ai-chat-tool-width:100%;--ui-ai-chat-tool-trigger-padding-inline:0.5rem;"
        calls={[{ id: "single", name: longName, status: "complete", detail }]}
      />
    </section>
  {/snippet}
</Story>
