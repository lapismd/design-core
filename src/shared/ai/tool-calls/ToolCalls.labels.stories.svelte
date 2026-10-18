<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import ToolCalls from "./ToolCalls.svelte";
  const { Story } = defineMeta({
    title: "AI/Chat/Tool Calls",
    component: ToolCalls,
    tags: ["visual-pending", "!autodocs"],
  });
</script>

<Story
  name="Disclosure names include visible metadata"
  play={async ({ canvas }) => {
    const name = "shell.execute local workspace pnpm test +2 −1 4 files 2s";
    const trigger = canvas.getByRole("button", {
      name: `Show details for ${name}`,
    });
    await expect(trigger).toHaveAccessibleDescription("Complete");
    await userEvent.click(trigger);
    await expect(trigger).toHaveAccessibleName(`Hide details for ${name}`);
    await expect(canvas.getByText("Captured contents")).toBeVisible();
  }}
>
  {#snippet template()}
    {#snippet detail()}<p>Captured contents</p>{/snippet}
    {#snippet stats()}4 files{/snippet}
    <ToolCalls
      calls={[
        {
          id: "same",
          name: "shell.execute",
          node: "local workspace",
          target: "pnpm test",
          additions: 2,
          deletions: 1,
          stats,
          duration: "2s",
          status: "complete",
          detail,
        },
      ]}
    />
  {/snippet}
</Story>

<Story
  name="Grouped summary names include the visible latest call"
  play={async ({ canvas }) => {
    const trigger = canvas.getByRole("button", {
      name: "Expand shell.execute pnpm test 2 tool calls",
    });
    await expect(trigger).toHaveAccessibleDescription("Running");
    await userEvent.click(trigger);
    await expect(trigger).toHaveAccessibleName("Collapse 2 tool calls");
    await expect(
      canvas.getByRole("button", {
        name: "Show details for shell.execute pnpm test",
      }),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    {#snippet detail()}<p>Captured contents</p>{/snippet}
    <ToolCalls
      calls={[
        { id: "first", name: "read", status: "complete" },
        {
          id: "same",
          name: "shell.execute",
          target: "pnpm test",
          status: "running",
          detail,
        },
      ]}
    />
  {/snippet}
</Story>

<Story
  name="Repeated call identities keep separate disclosure labels"
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "Show details for read Alpha.md" }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Show details for read Beta.md" }),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    {#snippet detail()}<p>Captured contents</p>{/snippet}
    <ToolCalls
      calls={[
        {
          id: "same",
          name: "read",
          target: "Alpha.md",
          status: "complete",
          detail,
        },
      ]}
    />
    <ToolCalls
      calls={[
        {
          id: "same",
          name: "read",
          target: "Beta.md",
          status: "complete",
          detail,
        },
      ]}
    />
  {/snippet}
</Story>
