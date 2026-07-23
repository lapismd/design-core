<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import SourceToolbar from "./SourceToolbar.svelte";

  const { Story } = defineMeta({
    title: "Apps/Beancount/Sources/Source Toolbar",
    component: SourceToolbar,
    parameters: {
      docs: {
        description: {
          component:
            "Controlled Sources header actions. The host owns source syncing, configuration mode, editing, and sync-history navigation.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let yamlMode = $state(false);
  let action = $state("");
</script>

<Story
  name="Requests source actions and YAML mode"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Sync all" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("Sync all");

    await userEvent.click(
      canvas.getByRole("switch", { name: "Use YAML source configuration" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent("YAML enabled");

    await userEvent.click(canvas.getByRole("button", { name: "Edit sources" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("Edit sources");

    await userEvent.click(
      canvas.getByRole("button", { name: "Open source sync history" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Open source sync history",
    );
  }}
>
  {#snippet template()}
    <div class="bc-source-toolbar-story">
      <SourceToolbar
        {yamlMode}
        onSyncAll={() => {
          action = "Sync all";
        }}
        onYamlModeChange={(next) => {
          yamlMode = next;
          action = `YAML ${next ? "enabled" : "disabled"}`;
        }}
        onEditSources={() => {
          action = "Edit sources";
        }}
        onOpenSyncHistory={() => {
          action = "Open source sync history";
        }}
      />
      <output class="bc-source-toolbar-story__status" aria-live="polite"
        >{action}</output
      >
    </div>
  {/snippet}
</Story>

<style>
  .bc-source-toolbar-story {
    padding: var(--ui-beancount-space-5);
  }

  .bc-source-toolbar-story__status {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
</style>
