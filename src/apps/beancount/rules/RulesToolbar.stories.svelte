<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import RulesToolbar from "./RulesToolbar.svelte";

  const { Story } = defineMeta({
    title: "Apps/Beancount/Rules/Rules Toolbar",
    component: RulesToolbar,
    parameters: {
      docs: {
        description: {
          component:
            "Controlled Fava-aligned Rules header actions. The host owns rule creation, dry runs, execution, persistence, and status feedback.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let action = $state("");
</script>

<Story
  name="Requests applying and adding rules"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Apply all" }));
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Apply all requested",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Add rule" }));
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Add rule requested",
    );
  }}
>
  {#snippet template()}
    <div class="bc-rules-toolbar-story">
      <RulesToolbar
        canApplyAll={true}
        onApplyAll={() => {
          action = "Apply all requested";
        }}
        onAddRule={() => {
          action = "Add rule requested";
        }}
      />
      <output class="bc-rules-toolbar-story__status" aria-live="polite">
        {action}
      </output>
    </div>
  {/snippet}
</Story>

<Story name="Disables unavailable application">
  {#snippet template()}
    <div class="bc-rules-toolbar-story">
      <RulesToolbar onApplyAll={() => {}} onAddRule={() => {}} />
    </div>
  {/snippet}
</Story>

<style>
  .bc-rules-toolbar-story {
    padding: var(--ui-beancount-space-5);
  }

  .bc-rules-toolbar-story__status {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
</style>
