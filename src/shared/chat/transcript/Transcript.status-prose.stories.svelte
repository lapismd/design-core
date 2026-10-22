<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import Transcript from "./Transcript.svelte";
  import MarkdownComposer from "../markdown-composer/MarkdownComposer.svelte";
  import TranscriptContent from "./ChatContent.svelte";
  import { TranscriptController } from "./comments.svelte.js";
  import type { TranscriptItem } from "./model.js";
  import RotateCw from "@lucide/svelte/icons/rotate-cw";
  import { Button } from "../../shadcn/button/index.js";
  const body = (id: string, kind: "markdown" | "context" | "custom") => ({
    id,
    revision: "1",
    kind,
    label: id,
    text: "Captured **prose** uses the same font.",
    surface: "plain" as const,
  });
  const items: TranscriptItem[] = [
    {
      id: "request",
      kind: "message",
      role: "user",
      label: "Request",
      timestamp: "2:30 PM",
      author: { id: "you", name: "You" },
      blocks: [body("message", "markdown")],
      status: {
        type: "error",
        label: "Failed",
        message: "The agent could not start. Your message is retained.",
      },
    },
    {
      id: "context",
      kind: "context",
      label: "Context",
      defaultExpanded: true,
      blocks: [body("context", "context")],
    },
    {
      id: "handoff",
      kind: "handoff",
      label: "Handoff",
      defaultExpanded: true,
      blocks: [body("handoff", "custom")],
    },
  ];
  const commentState = new TranscriptController(() => ({ items }));
  const { Story } = defineMeta({
    title: "Chat/Transcript",
    component: Transcript,
    tags: ["visual-pending", "!autodocs"],
  });
  const prose = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const reader = canvasElement.querySelector<HTMLElement>(
      '[data-block-id="message"] .cm-content',
    )!;
    await expect(reader).toBeVisible();
    const reference = getComputedStyle(reader);
    for (const el of canvasElement.querySelectorAll<HTMLElement>(
      '[data-ui-component="chat-markdown"] p',
    )) {
      expect(getComputedStyle(el).fontSize).toBe(reference.fontSize);
      expect(getComputedStyle(el).fontFamily).toBe(reference.fontFamily);
    }
  };
  const failure = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const alert = canvas.getByRole("alert", { name: "Failed details" });
    expect(alert).toHaveTextContent("Your message is retained.");
    const metadata = canvas.getByRole("group", { name: "Request metadata" });
    expect(metadata).toHaveTextContent("2:30 PM");
    const button = within(metadata).getByRole("button", {
      name: "Retry message",
    });
    expect(button.getBoundingClientRect().top).toBeGreaterThan(
      canvasElement
        .querySelector('[data-block-id="message"]')!
        .getBoundingClientRect().top,
    );
    await userEvent.click(button);
    expect(canvas.getByRole("status")).toHaveTextContent("Retry requests: 1");
  };
</script>

<script lang="ts">
  let retries = $state(0);
  let spacingView = $state<"document" | "classic">("document");
</script>

{#snippet content(view: "document" | "classic", size?: string)}
  <div style:--ui-transcript-font-size={size} style="height:34rem">
    <Transcript {items} {view} canComment={false} reactionsDisabled>
      {#snippet metadataSupplement(item)}{#if item.status}<Button
            variant="ghost"
            size="icon-xs"
            aria-label="Retry message"
            onclick={() => retries++}><RotateCw aria-hidden="true" /></Button
          >{/if}{/snippet}
    </Transcript>
  </div>
  <aside aria-label="Rootless reader" style:--ui-transcript-font-size={size}>
    <TranscriptContent
      blocks={[
        body("rootless-context", "context"),
        body("rootless-custom", "custom"),
      ]}
      state={commentState}
    />
  </aside>
{/snippet}
<Story name="Context and rootless prose parity" play={prose}
  >{#snippet template()}{@render content("document")}{/snippet}</Story
>
<Story name="Styled context and rootless prose parity" play={prose}
  >{#snippet template()}{@render content(
      "classic",
      "1.125rem",
    )}{/snippet}</Story
>
<Story name="Document failed message metadata" play={failure}
  >{#snippet template()}{@render content("document")}{#if retries}<span
        role="status">Retry requests: {retries}</span
      >{/if}{/snippet}</Story
>
<Story name="Classic failed message metadata" play={failure}
  >{#snippet template()}{@render content("classic")}{#if retries}<span
        role="status">Retry requests: {retries}</span
      >{/if}{/snippet}</Story
>

<Story
  name="Document composer trailing space"
  play={async ({ canvasElement }) => {
    const root = canvasElement.querySelector<HTMLElement>(
      '[data-ui-component="transcript"]',
    )!;
    const composer = root.querySelector<HTMLElement>(
      "[data-transcript-composer]",
    )!;
    expect(getComputedStyle(composer).paddingBottom).toBe(
      window.innerWidth <= 600 ? "48px" : "64px",
    );
    root.style.setProperty("--ui-transcript-composer-trailing-space", "6rem");
    expect(getComputedStyle(composer).paddingBottom).toBe("96px");
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "Classic spacing" }),
    );
    await expect(composer).toHaveStyle({ paddingBottom: "16px" });
  }}
  >{#snippet template()}
    <Button onclick={() => (spacingView = "classic")}>Classic spacing</Button>
    <div style="height:34rem">
      <Transcript items={items.slice(0, 1)} view={spacingView}>
        {#snippet composer(view)}<MarkdownComposer
            value="A retained draft"
            onSubmit={() => {}}
            presentation={view === "document" ? "document" : "framed"}
          />{/snippet}
      </Transcript>
    </div>
  {/snippet}</Story
>

<Story
  name="Bottom composer warning"
  play={async ({ canvasElement }) => {
    const banner = within(canvasElement).getByRole("status");
    expect(banner).toHaveTextContent("Context window is 90% full.");
    expect(banner.getBoundingClientRect().top).toBeGreaterThan(
      canvasElement.querySelector('[role="textbox"]')!.getBoundingClientRect()
        .top,
    );
  }}
  >{#snippet template()}<MarkdownComposer
      value="Retain my draft"
      onSubmit={() => {}}
      status={{ type: "warning", message: "Context window is 90% full." }}
      statusPosition="bottom"
    />{/snippet}</Story
>
