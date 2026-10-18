<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, fn, userEvent, waitFor } from "storybook/test";
  import { Button } from "@lapismd/design-core/shadcn/button";
  import type { Snippet } from "svelte";
  import type { ToolCallItem } from "../types.js";
  import ToolCalls from "./ToolCalls.svelte";
  import { PerCallActions } from "./ToolCallsWrapper.example-sources.js";
  const onReply = fn();
  const { Story } = defineMeta({
    title: "AI/Chat/Tool Calls",
    component: ToolCalls,
    args: { calls: [] },
    beforeEach: () => {
      onReply.mockClear();
    },
    tags: ["visual-pending"],
    parameters: {
      docs: { source: { code: PerCallActions, language: "tsx", type: "code" } },
    },
  });
</script>

<Story
  name="Per-call actions preserve grouped disclosure"
  play={async ({ canvas, canvasElement }) => {
    await expect(
      canvas.queryByRole("button", { name: "Reply to Read file" }),
    ).not.toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole("button", { name: "Expand Edit file 2 tool calls" }),
    );
    const reply = canvas.getByRole("button", { name: "Reply to Read file" });
    await expect(reply).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "Show details for Read file" }),
    );
    await expect(canvas.getByText("README contents")).toBeVisible();
    await userEvent.tab();
    await expect(reply).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(onReply).toHaveBeenCalledWith("read");
    await expect(canvas.getByText("README contents")).toBeVisible();
    await expect(canvasElement.querySelector("button button")).toBeNull();
    await userEvent.click(
      canvas.getByRole("button", { name: "Reply to Edit file" }),
    );
    await expect(onReply).toHaveBeenLastCalledWith("edit");
    await userEvent.click(
      canvas.getByRole("button", { name: "Collapse 2 tool calls" }),
    );
    await waitFor(() =>
      expect(
        canvas.queryByRole("button", { name: "Reply to Read file" }),
      ).not.toBeInTheDocument(),
    );
  }}
>
  {#snippet template()}
    {#snippet detail()}<p>README contents</p>{/snippet}
    {#snippet callWrapper(call: ToolCallItem, children: Snippet)}
      <div>
        {@render children()}
        <Button onclick={() => onReply(call.id)}>Reply to {call.name}</Button>
      </div>
    {/snippet}
    <ToolCalls
      calls={[
        { id: "read", name: "Read file", status: "complete", detail },
        { id: "edit", name: "Edit file", status: "pending" },
      ]}
      {callWrapper}
    />
  {/snippet}
</Story>
