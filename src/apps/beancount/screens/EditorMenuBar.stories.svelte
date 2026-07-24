<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import EditorMenuBar, { type EditorMenuAction } from "./EditorMenuBar.svelte";

  const sources = [
    { id: "account-ledger", label: "Account Ledger" },
    { id: "notes", label: "notes.beancount" },
  ];

  const { Story } = defineMeta({
    title: "Apps/Beancount/Screens/Editor Menu Bar",
    component: EditorMenuBar,
    parameters: {
      docs: {
        description: {
          component:
            "Controlled Fava-aligned File/Edit menus. Hosts supply source labels and own source selection, format-on-save preference, CodeMirror commands, and AI requests.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let activeSourceId = $state("account-ledger");
  let formatOnSave = $state(true);
  let action = $state("");

  const actionLabels: Record<EditorMenuAction, string> = {
    "ask-ai": "Ask AI about selection requested",
    "close-all-folds": "Close all folds requested",
    find: "Find requested",
    format: "Format requested",
    "go-to-line": "Go to line requested",
    "open-all-folds": "Open all folds requested",
    "toggle-comment": "Toggle comment requested",
  };
</script>

<Story
  name="Requests controlled file and edit commands"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "File" }));
    await userEvent.click(
      within(document.body).getByRole("menuitem", { name: "notes.beancount" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Opened notes.beancount",
    );

    await userEvent.click(canvas.getByRole("button", { name: "File" }));
    await userEvent.click(
      within(document.body).getByRole("menuitemcheckbox", {
        name: "Format on save",
      }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Format on save disabled",
    );

    await userEvent.click(canvas.getByRole("button", { name: "Edit" }));
    await userEvent.click(
      within(document.body).getByRole("menuitem", { name: "Format" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Format requested",
    );
  }}
>
  {#snippet template()}
    <div class="bc-editor-menu-bar-story">
      <EditorMenuBar
        {sources}
        {activeSourceId}
        {formatOnSave}
        onSourceSelect={(source) => {
          activeSourceId = source.id;
          action = `Opened ${source.label}`;
        }}
        onFormatOnSaveChange={(next) => {
          formatOnSave = next;
          action = `Format on save ${next ? "enabled" : "disabled"}`;
        }}
        onAction={(next) => {
          action = actionLabels[next];
        }}
      />
      <output class="bc-editor-menu-bar-story__status" aria-live="polite">
        {action}
      </output>
    </div>
  {/snippet}
</Story>

<Story
  name="Explains when no source files are available"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "File" }));
    await expect(
      within(document.body).getByRole("menuitem", {
        name: "No source files available.",
      }),
    ).toBeDisabled();
  }}
>
  {#snippet template()}
    <div class="bc-editor-menu-bar-story">
      <EditorMenuBar onFormatOnSaveChange={() => {}} onAction={() => {}} />
    </div>
  {/snippet}
</Story>

<style>
  .bc-editor-menu-bar-story {
    padding: var(--ui-beancount-space-5);
  }

  .bc-editor-menu-bar-story__status {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
