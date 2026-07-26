<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor } from "storybook/test";
  import ComposerInput from "./ComposerInput.svelte";
  import type { ComposerInputHandle, ComposerTrigger } from "./types.js";

  const mentionTrigger: ComposerTrigger = {
    character: "@",
    menuLabel: "People",
    searchSource: async (query, signal) => {
      await Promise.resolve();
      if (signal.aborted) return [];
      return [
        {
          id: "ada",
          label: "Ada Lovelace",
          value: "@ada",
          description: query ? `Matches “${query}”` : "Engineer",
        },
        {
          id: "grace",
          label: "Grace Hopper",
          value: "@grace",
          description: "Admiral",
        },
      ];
    },
    onSelect: (item) => ({
      value: item.value ?? `@${item.id}`,
      label: `@${item.label.split(" ")[0]}`,
      variant: "secondary",
    }),
  };

  const { Story } = defineMeta({
    title: "AI/Chat/Composer Input",
    component: ComposerInput,
    parameters: {
      docs: {
        description: {
          component:
            "Contenteditable input with imperative insertion, token boundaries, history, IME-safe submit, files, and private trigger menus.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let value = $state("");
  let handle = $state<ComposerInputHandle | null>(null);
  let insertedTokenId = $state<string | undefined>();
  let fileResult = $state("No files");
  let browserValue = $state("");
  let browserFileResult = $state("No browser files");
</script>

<Story
  name="Selects an async trigger result"
  play={async ({ canvas }) => {
    const input = canvas.getByRole("combobox", { name: "Mention someone" });
    await userEvent.click(input);
    await userEvent.type(input, "@a");
    await expect(
      await canvas.findByRole("option", { name: /Ada Lovelace/ }),
    ).toBeVisible();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("status")).toHaveTextContent("@ada");
  }}
>
  {#snippet template()}
    <div data-story="input-frame">
      <ComposerInput
        bind:value
        label="Mention someone"
        triggers={[mentionTrigger]}
        debounceMs={0}
      />
      <output>{value || "Empty"}</output>
    </div>
  {/snippet}
</Story>

<Story
  name="Inserts and expands a token"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Insert context token" }),
    );
    await expect(canvas.getByText("14 lines, 420 chars")).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "Expand context token" }),
    );
    await expect(canvas.getByRole("combobox")).toHaveTextContent(
      "Expanded source text",
    );
  }}
>
  {#snippet template()}
    <div data-story="input-frame">
      <ComposerInput bind:value bind:handle label="Token composer" />
      <div data-story="input-actions">
        <button
          type="button"
          aria-label="Insert context token"
          onclick={() => {
            insertedTokenId = handle?.insertToken({
              value: "Expanded source text",
              label: "14 lines, 420 chars",
              variant: "outline",
            });
          }}>Insert token</button
        >
        <button
          type="button"
          aria-label="Expand context token"
          disabled={!insertedTokenId}
          onclick={() => {
            if (insertedTokenId) handle?.expandToken(insertedTokenId);
          }}>Expand token</button
        >
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Handles long paste and file drop"
  play={async ({ canvas }) => {
    const input = canvas.getByRole("combobox", { name: "Paste or drop" });
    const longText = "A".repeat(220);
    await userEvent.click(input);
    const clipboardData = new DataTransfer();
    clipboardData.setData("text/plain", longText);
    input.dispatchEvent(
      new ClipboardEvent("paste", {
        bubbles: true,
        cancelable: true,
        clipboardData,
      }),
    );
    await expect(canvas.getByText("220 chars")).toBeVisible();
    const file = new File(["hello"], "brief.txt", { type: "text/plain" });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    input.dispatchEvent(
      new DragEvent("drop", {
        bubbles: true,
        cancelable: true,
        dataTransfer,
      }),
    );
    await waitFor(() =>
      expect(canvas.getByRole("status")).toHaveTextContent("drop: brief.txt"),
    );
  }}
>
  {#snippet template()}
    <div data-story="input-frame">
      <ComposerInput
        label="Paste or drop"
        onFiles={(files, source) => {
          fileResult = `${source}: ${files.map((file) => file.name).join(", ")}`;
        }}
      />
      <output>{fileResult}</output>
    </div>
  {/snippet}
</Story>

<Story name="Browser acceptance surface">
  {#snippet template()}
    <div data-story="input-frame">
      <ComposerInput
        bind:value={browserValue}
        label="Browser acceptance composer"
        pasteThreshold={20}
        onFiles={(files, source) => {
          browserFileResult = `${source}: ${files.map((file) => file.name).join(", ")}`;
        }}
      />
      <output data-browser-value>{browserValue || "Empty"}</output>
      <output data-browser-files>{browserFileResult}</output>
    </div>
  {/snippet}
</Story>

<style>
  :global([data-story="input-frame"]) {
    display: flex;
    width: min(36rem, 90vw);
    flex-direction: column;
    gap: 0.625rem;
    border: 1px solid var(--border);
    border-radius: 0.875rem;
    background: var(--background);
    padding: 0.25rem;
  }

  :global([data-story="input-frame"] output) {
    padding: 0.5rem;
    color: var(--muted-foreground);
    font-size: 0.75rem;
  }

  :global([data-story="input-actions"]) {
    display: flex;
    gap: 0.5rem;
    padding: 0.5rem;
  }

  :global([data-story="input-actions"] button) {
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    background: var(--background);
    padding: 0.375rem 0.625rem;
    color: var(--foreground);
  }
</style>
