<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import ToolCalls from "./ToolCalls.svelte";
  const { Story } = defineMeta({
    title: "AI/Chat/Tool Calls",
    component: ToolCalls,
    tags: ["visual-pending", "!autodocs"],
  });
</script>

<Story
  name="Running with details"
  play={async ({ canvas }) => {
    const trigger = canvas.getByRole("button", {
      name: "Show details for shell.execute",
    });
    const spinner = trigger.querySelector('[data-ui-component="spinner"]');
    expect(spinner).not.toBeNull();
    expect(spinner).toHaveAttribute("aria-hidden", "true");
    expect(trigger).toHaveTextContent("Running");
  }}
>
  {#snippet template()}
    {#snippet detail()}<p>A bounded tool request is still running.</p>{/snippet}
    <ToolCalls
      calls={[
        { id: "running", name: "shell.execute", status: "running", detail },
      ]}
    />
  {/snippet}
</Story>
