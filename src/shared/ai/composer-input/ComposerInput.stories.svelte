<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor } from "storybook/test";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import Composer from "../composer/Composer.svelte";
  import ComposerInput from "./ComposerInput.svelte";
  import type { ComposerInputHandle, ComposerTrigger } from "../types.js";

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
            "Rich text input for the chat composer. Supports trigger menus (type @ or / to open a typeahead), inline tokens rendered as badges, message history recall with ArrowUp/Down, paste/drop file handling, and a 16px touch-device font-size floor to prevent iOS input zoom. Pass it to ChatComposer's input slot when you need more than a plain textarea.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let value = $state("");
  let tokenValue = $state("");
  let handle = $state<ComposerInputHandle | null>(null);
  let insertedTokenId = $state<string | undefined>();
  let fileResult = $state("No files");
  let pasteValue = $state("");
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
        "/visual-baselines/ai/composer-input/astryx-showcase-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-approved"]}
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
  exportName="Controlled"
  parameters={{
    docs: {
      description: {
        story:
          "Controlled chat input with live value display. Use controlled mode when you need to read or transform the input value outside the composer.",
      },
    },
    visualDelta: {
      images: [
        "/visual-baselines/ai/composer-input/controlled-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-approved"]}
>
  {#snippet template()}
    <div data-story="composer-input-stack">
      <Composer bind:value={controlledValue} onSubmit={() => {}}>
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
  exportName="Disabled"
  parameters={{
    docs: {
      description: {
        story:
          "Composer in a disabled state. Use when the input should be visible but not interactive, such as during streaming or when a prerequisite is unmet.",
      },
    },
    visualDelta: {
      images: [
        "/visual-baselines/ai/composer-input/disabled-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-approved"]}
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
  exportName="Mentions"
  parameters={{
    docs: {
      description: {
        story:
          "Chat input with an @ trigger that opens a typeahead menu for mentioning users. Selected names appear as inline tokens.",
      },
    },
    visualDelta: {
      images: [
        "/visual-baselines/ai/composer-input/mentions-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-approved"]}
>
  {#snippet template()}
    <div data-story="composer-input-stack">
      <p>Type <code>@</code> to mention a teammate.</p>
      <Composer bind:value={mentionValue} onSubmit={() => {}}>
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
  exportName="MultipleTriggers"
  parameters={{
    docs: {
      description: {
        story:
          "Chat input with both @ mentions and / commands. Each trigger type renders tokens in a distinct color so users can tell them apart at a glance.",
      },
    },
    visualDelta: {
      images: [
        "/visual-baselines/ai/composer-input/multiple-triggers-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-approved"]}
>
  {#snippet template()}
    <div data-story="composer-input-stack">
      <p>Type <code>@</code> for people or <code>/</code> for commands.</p>
      <Composer bind:value={multiTriggerValue} onSubmit={() => {}}>
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
  exportName="SlashCommands"
  parameters={{
    docs: {
      description: {
        story:
          "Chat input with a / trigger for command selection. Use for AI assistants or bots that support structured commands.",
      },
    },
    visualDelta: {
      images: [
        "/visual-baselines/ai/composer-input/slash-commands-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-approved"]}
>
  {#snippet template()}
    <div data-story="composer-input-stack">
      <Composer bind:value={slashValue} onSubmit={() => {}}>
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
        "/visual-baselines/ai/composer-input/selects-an-async-trigger-result-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-approved"]}
>
  {#snippet template()}
    <div data-story="composer-input-stack">
      <Composer bind:value onSubmit={() => {}}>
        {#snippet input()}
          <ComposerInput
            bind:value
            label="Mention someone"
            triggers={mentionTriggers}
            debounceMs={0}
          />
        {/snippet}
      </Composer>
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
        "/visual-baselines/ai/composer-input/inserts-and-expands-a-token-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-approved"]}
>
  {#snippet template()}
    <div data-story="composer-input-stack">
      <Composer bind:value={tokenValue} onSubmit={() => {}}>
        {#snippet input()}
          <ComposerInput
            bind:value={tokenValue}
            bind:handle
            label="Token composer"
          />
        {/snippet}
      </Composer>
      <div data-story="input-actions">
        <Button
          type="button"
          size="sm"
          variant="outline"
          aria-label="Insert context token"
          onclick={() => {
            insertedTokenId = handle?.insertToken({
              value: "Expanded source text",
              label: "14 lines, 420 chars",
              variant: "outline",
            });
          }}
        >
          Insert token
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          aria-label="Expand context token"
          disabled={!insertedTokenId}
          onclick={() => {
            if (insertedTokenId) handle?.expandToken(insertedTokenId);
          }}
        >
          Expand token
        </Button>
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
        "/visual-baselines/ai/composer-input/handles-long-paste-and-file-drop-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-approved"]}
>
  {#snippet template()}
    <div data-story="composer-input-stack">
      <Composer bind:value={pasteValue} onSubmit={() => {}}>
        {#snippet input()}
          <ComposerInput
            bind:value={pasteValue}
            label="Paste or drop"
            onFiles={(files, source) => {
              fileResult = `${source}: ${files.map((file) => file.name).join(", ")}`;
            }}
          />
        {/snippet}
      </Composer>
      <output>{fileResult}</output>
    </div>
  {/snippet}
</Story>

<Story
  name="Browser acceptance surface"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/ai/composer-input/browser-acceptance-surface-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-approved"]}
>
  {#snippet template()}
    <div data-story="composer-input-stack">
      <Composer bind:value={browserValue} onSubmit={() => {}}>
        {#snippet input()}
          <ComposerInput
            bind:value={browserValue}
            label="Browser acceptance composer"
            pasteThreshold={20}
            onFiles={(files, source) => {
              browserFileResult = `${source}: ${files.map((file) => file.name).join(", ")}`;
            }}
          />
        {/snippet}
      </Composer>
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

  :global([data-story="composer-input-stack"] p),
  :global([data-story="composer-input-stack"] output) {
    margin: 0;
    color: var(--muted-foreground);
    font-size: 0.875rem;
  }

  :global([data-story="input-actions"]) {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
</style>
