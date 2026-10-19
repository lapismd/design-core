<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Transcript from "./Transcript.svelte";
  import MarkdownComposer from "../markdown-composer/MarkdownComposer.svelte";
  import TranscriptFooter from "./TranscriptFooter.svelte";
  import ComposerStatusBanner from "../../ai/composer/ComposerStatusBanner.svelte";
  import type { TranscriptItem } from "./model.js";
  import { expect, userEvent, within } from "storybook/test";
  import { Button } from "../../shadcn/button/index.js";
  import * as Tooltip from "../../shadcn/tooltip/index.js";
  import RotateCcwIcon from "@lucide/svelte/icons/rotate-ccw";
  const items: TranscriptItem[] = Array.from({ length: 14 }, (_, index) => ({
    id: `message-${index}`,
    kind: "message",
    role: index % 2 ? "assistant" : "user",
    label: `Message ${index + 1}`,
    author: {
      id: index % 2 ? "agent" : "user",
      name: index % 2 ? "Assistant" : "You",
    },
    blocks: [
      {
        id: `message-${index}/body`,
        revision: "1",
        kind: "markdown",
        label: `Message ${index + 1}`,
        text: `## Review ${index + 1}\n\nScroll this history while the Classic draft and keyboard hint remain available. The retained composer keeps its draft and selection when switching views.`,
      },
    ],
  }));
  const { Story } = defineMeta({
    title: "Chat/Transcript",
    component: Transcript,
    tags: ["visual-pending", "!autodocs"],
    args: {
      items,
      canComment: false,
      reactionsDisabled: true,
      classicComposerPlacement: "fixed",
    },
  });
  const status = {
    type: "error" as const,
    message:
      "The agent could not start this turn. Your message is retained. Please retry.",
  };
</script>

<script lang="ts">
  let draft = $state("");
  let retries = $state(0);
</script>

<Story
  name="Inline interrupted turn"
  args={{
    items: [
      {
        id: "interrupted",
        kind: "context",
        label: "Turn interrupted",
        notice: "error",
        blocks: [
          {
            id: "interrupted/body",
            revision: "1",
            kind: "markdown",
            label: "Failure details",
            text: "The agent could not start. Your message is retained.",
            commentable: false,
          },
        ],
      },
    ],
  }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const alert = canvas.getByRole("alert", { name: "Turn interrupted" });
    expect(alert).toHaveTextContent("Your message is retained.");
    expect(canvas.getAllByText("Turn interrupted")).toHaveLength(1);
    const retry = within(alert).getByRole("button", { name: "Retry message" });
    expect(retry.textContent?.trim()).toBe("");
    expect(
      alert.getBoundingClientRect().right - retry.getBoundingClientRect().right,
    ).toBeLessThan(20);
    expect(
      getComputedStyle(alert.querySelector(".transcript-notice-icon")!)
        .borderRadius,
    ).toBe("50%");
    expect(canvas.queryByRole("status")).toBeNull();
    await userEvent.click(retry);
    expect(canvas.getByRole("status")).toHaveTextContent("Retry requests: 1");
  }}
>
  {#snippet template(args)}
    <div style="height:30rem">
      <Transcript {...args}>
        {#snippet metadataSupplement()}<Tooltip.Provider delayDuration={0}
            ><Tooltip.Root
              ><Tooltip.Trigger
                >{#snippet child({ props })}<Button
                    {...props}
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Retry message"
                    onclick={() => retries++}
                    ><RotateCcwIcon aria-hidden="true" /></Button
                  >{/snippet}</Tooltip.Trigger
              ><Tooltip.Content role="tooltip">Retry message</Tooltip.Content
              ></Tooltip.Root
            ></Tooltip.Provider
          >{/snippet}
      </Transcript>
      {#if retries}<span role="status">Retry requests: {retries}</span>{/if}
    </div>
  {/snippet}
</Story>

<Story name="Fixed Classic composer and host hint" args={{ view: "classic" }}>
  {#snippet template(args)}
    <div style="height:36rem">
      <Transcript {...args}>
        {#snippet composer(view)}
          <MarkdownComposer
            bind:value={draft}
            presentation={view === "classic" ? "framed" : "document"}
            showHint={false}
            showSendButton={false}
            submitOnEnter={false}
            onSubmit={() => {}}
          />
        {/snippet}
        {#snippet footer()}<div style="padding:0.25rem 1rem;font-size:0.75rem">
            Ctrl/⌘+Enter to send
          </div>{/snippet}
      </Transcript>
    </div>
  {/snippet}
</Story>

<Story name="Standalone error above compact footer" args={{ view: "classic" }}>
  {#snippet template(args)}
    <div style="height:36rem;display:flex;flex-direction:column">
      <Transcript {...args}>
        {#snippet composer()}
          <MarkdownComposer
            bind:value={draft}
            showHint={false}
            showSendButton={false}
            submitOnEnter={false}
            onSubmit={() => {}}
          />
        {/snippet}
        {#snippet footer()}
          <div style="padding:0.25rem 0.5rem;display:grid;gap:0.25rem">
            <ComposerStatusBanner {status} position="standalone" />
            <span style="font-size:0.6875rem">Ctrl/⌘+Enter to send</span>
          </div>
        {/snippet}
      </Transcript>
      <div
        style="height:2rem;flex:none;--ui-transcript-footer-padding:0.125rem"
      >
        <TranscriptFooter
          {status}
          showStatus={false}
          canSend
          onSend={() => {}}
        />
      </div>
    </div>
  {/snippet}
</Story>
