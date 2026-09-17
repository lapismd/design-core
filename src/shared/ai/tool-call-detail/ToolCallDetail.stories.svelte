<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ToolCallDetail from "./ToolCallDetail.svelte";

  const { Story } = defineMeta({
    title: "AI/Chat/Tool Call Detail",
    component: ToolCallDetail,
    tags: ["visual-pending"],
    parameters: {
      docs: {
        description: {
          component:
            "Provider-neutral, presentation-only tool input, output, and error details.",
        },
        source: {
          language: "tsx",
          type: "code",
          code: `<ToolCallDetail toolName="bash" input={'{"command":"pnpm test"}'} output="Tests: 42 passed" />`,
        },
      },
    },
  });
</script>

<Story name="Completed command">
  {#snippet template()}
    <div style="max-width: 42rem; padding: 1rem">
      <ToolCallDetail
        toolName="bash"
        input={'{"command":"pnpm test"}'}
        output={'{"output":"Tests: 42 passed"}'}
      />
    </div>
  {/snippet}
</Story>

<Story name="Failed command">
  {#snippet template()}
    <div style="max-width: 42rem; padding: 1rem">
      <ToolCallDetail
        toolName="bash"
        input={'{"command":"pnpm check"}'}
        error={"stderr: typecheck failed\nexit 1"}
      />
    </div>
  {/snippet}
</Story>
