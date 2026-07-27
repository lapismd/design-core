<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor } from "storybook/test";
  import Composer from "./Composer.svelte";
  import ComposerInput from "./ComposerInput.svelte";
  import type { ComposerInputHandle, ComposerTrigger } from "./types.js";

  const people = [
    { id: "cindy", label: "Cindy Zhang", description: "Design Systems" },
    { id: "alex", label: "Alex Johnson", description: "Frontend" },
    { id: "sam", label: "Sam Rivera", description: "Backend" },
    { id: "jordan", label: "Jordan Lee", description: "Product" },
  ];

  const commands = [
    {
      id: "summarize",
      label: "summarize",
      description: "Summarize the conversation",
    },
    {
      id: "translate",
      label: "translate",
      description: "Translate text to another language",
    },
    {
      id: "search",
      label: "search",
      description: "Search the web or documents",
    },
    { id: "code", label: "code", description: "Generate or explain code" },
    { id: "help", label: "help", description: "Show available commands" },
  ];

  const mentionTrigger: ComposerTrigger = {
    character: "@",
    menuLabel: "People",
    searchSource: async (query, signal) => {
      await Promise.resolve();
      if (signal.aborted) return [];
      return people.filter((person) =>
        person.label.toLowerCase().includes(query.toLowerCase()),
      );
    },
    onSelect: (item) => ({
      value: `@${item.id}`,
      label: item.label,
      variant: "secondary",
    }),
  };

  const commandTrigger: ComposerTrigger = {
    character: "/",
    menuLabel: "Commands",
    searchSource: async (query) =>
      commands.filter((command) =>
        command.label.toLowerCase().includes(query.toLowerCase()),
      ),
    onSelect: (item) => ({
      value: `/${item.label}`,
      label: `/${item.label}`,
      variant: "outline",
    }),
  };

  const mentionTriggers = [mentionTrigger];
  const commandTriggers = [commandTrigger];
  const allTriggers = [mentionTrigger, commandTrigger];

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
  let showcaseValue = $state("");
  let controlledValue = $state("This value is controlled");
  let mentionValue = $state("");
  let multiTriggerValue = $state("");
  let slashValue = $state("");
</script>

<Story
  name="ASTRYX showcase"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/ai/chat/composer-input/astryx-showcase-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-ready"]}
>
  {#snippet template()}
    <div data-story="composer-input-showcase">
      <Composer
        bind:value={showcaseValue}
        onSubmit={() => {
          showcaseValue = "";
        }}
      >
        {#snippet input()}
          <ComposerInput
            bind:value={showcaseValue}
            placeholder="Ask me anything about Astryx..."
          />
        {/snippet}
      </Composer>
    </div>
  {/snippet}
</Story>

<Story
  name="Controlled"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/ai/chat/composer-input/controlled-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-ready"]}
>
  {#snippet template()}
    <div data-story="composer-input-stack">
      <Composer
        bind:value={controlledValue}
        elevation="none"
        onSubmit={() => {}}
      >
        {#snippet input()}
          <ComposerInput
            bind:value={controlledValue}
            placeholder="Type a message..."
          />
        {/snippet}
      </Composer>
      <p>Value: {controlledValue || "(empty)"}</p>
    </div>
  {/snippet}
</Story>

<Story
  name="Disabled"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/ai/chat/composer-input/disabled-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-ready"]}
>
  {#snippet template()}
    <div data-story="composer-input-showcase">
      <Composer disabled value="" onSubmit={() => {}}>
        {#snippet input()}
          <ComposerInput disabled placeholder="Input is disabled" />
        {/snippet}
      </Composer>
    </div>
  {/snippet}
</Story>

<Story
  name="Mentions"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/ai/chat/composer-input/mentions-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-ready"]}
>
  {#snippet template()}
    <div data-story="composer-input-stack">
      <p>Type <code>@</code> to mention a teammate.</p>
      <Composer bind:value={mentionValue} elevation="none" onSubmit={() => {}}>
        {#snippet input()}
          <ComposerInput
            bind:value={mentionValue}
            triggers={mentionTriggers}
            placeholder="Type @ to mention someone..."
          />
        {/snippet}
      </Composer>
    </div>
  {/snippet}
</Story>

<Story
  name="Multiple triggers"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/ai/chat/composer-input/multiple-triggers-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-ready"]}
>
  {#snippet template()}
    <div data-story="composer-input-stack">
      <p>Type <code>@</code> for people or <code>/</code> for commands.</p>
      <Composer
        bind:value={multiTriggerValue}
        elevation="none"
        onSubmit={() => {}}
      >
        {#snippet input()}
          <ComposerInput
            bind:value={multiTriggerValue}
            triggers={allTriggers}
            placeholder="Type @ or / ..."
          />
        {/snippet}
      </Composer>
    </div>
  {/snippet}
</Story>

<Story
  name="Slash commands"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/ai/chat/composer-input/slash-commands-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-ready"]}
>
  {#snippet template()}
    <div data-story="composer-input-stack">
      <Composer bind:value={slashValue} elevation="none" onSubmit={() => {}}>
        {#snippet input()}
          <ComposerInput
            bind:value={slashValue}
            triggers={commandTriggers}
            placeholder="Type / for commands..."
          />
        {/snippet}
      </Composer>
    </div>
  {/snippet}
</Story>

<Story
  name="Selects an async trigger result"
  play={async ({ canvas }) => {
    const input = canvas.getByRole("combobox", { name: "Mention someone" });
    await userEvent.click(input);
    await userEvent.type(input, "@c");
    await expect(
      await canvas.findByRole("option", { name: /Cindy Zhang/ }),
    ).toBeVisible();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("status")).toHaveTextContent("@cindy");
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/ai/chat/composer-input/selects-an-async-trigger-result-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-ready"]}
>
  {#snippet template()}
    <div data-story="input-frame">
      <ComposerInput
        bind:value
        label="Mention someone"
        triggers={mentionTriggers}
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
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/ai/chat/composer-input/inserts-and-expands-a-token-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-ready"]}
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
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/ai/chat/composer-input/handles-long-paste-and-file-drop-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-ready"]}
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

<Story
  name="Browser acceptance surface"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/ai/chat/composer-input/browser-acceptance-surface-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-ready"]}
>
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
  :global([data-story="composer-input-showcase"]) {
    width: min(28.125rem, 90vw);
  }

  :global([data-story="composer-input-stack"]) {
    display: flex;
    width: min(30rem, 90vw);
    flex-direction: column;
    gap: 1rem;
  }

  :global([data-story="composer-input-stack"] p) {
    margin: 0;
    color: var(--muted-foreground);
    font-size: 0.875rem;
  }

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
