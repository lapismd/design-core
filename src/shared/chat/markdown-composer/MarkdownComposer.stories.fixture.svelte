<script lang="ts">
  import {
    MarkdownComposer,
    type MarkdownComposerHandle,
    type MarkdownComposerReply,
  } from "../index.js";
  import { Button } from "../../shadcn/button/index.js";
  import { Avatar } from "../../shadcn/avatar/index.js";
  import type { ComposerStatus } from "../../ai/types.js";
  import PaperclipIcon from "@lucide/svelte/icons/paperclip";
  import { customEmojis, reactionChoices } from "../chat.stories.data.js";
  let {
    scenario = "framed",
  }: {
    scenario?:
      | "framed"
      | "document"
      | "compact"
      | "narrow"
      | "disabled"
      | "busy"
      | "form"
      | "custom";
  } = $props();
  let value = $state("Draft a **shared** message.");
  let handle = $state<MarkdownComposerHandle | null>(null);
  let submitted = $state(""),
    attachments = $state(0),
    stopped = $state(false),
    formValue = $state("");
  let presentation = $state<"framed" | "document">("framed");
  let status = $state<ComposerStatus | undefined>();
  const replyTarget = {
    authorName: "Sam",
    content: "Please share the project update before Friday.",
  };
  let reply = $state<MarkdownComposerReply | undefined>(replyTarget);
  const documentMode = $derived(
    scenario === "document" ||
      scenario === "compact" ||
      presentation === "document",
  );
  function submit(snapshot: string) {
    submitted = snapshot;
    status = undefined;
  }
</script>

<div
  class="markdown-composer-review"
  data-narrow={scenario === "narrow"}
  style={scenario === "compact"
    ? "--ui-markdown-composer-document-min-height:42px"
    : undefined}
>
  <h2>
    {scenario === "form"
      ? "Compose inside a form"
      : documentMode
        ? "Document reply"
        : "Write a message"}
  </h2>
  <p>
    {documentMode
      ? "An open document surface with an author gutter and room to write, following jj-store."
      : "Drafts remain yours until delivery is acknowledged. Formatting and emoji use the current selection."}
  </p>
  <form
    onsubmit={(event) => {
      event.preventDefault();
      formValue = String(
        new FormData(event.currentTarget).get("message") ?? "",
      );
    }}
  >
    <MarkdownComposer
      bind:value
      bind:handle
      name="message"
      presentation={documentMode ? "document" : "framed"}
      onSubmit={submit}
      disabled={scenario === "disabled"}
      busy={scenario === "busy" && !stopped}
      onStop={() => (stopped = true)}
      {...reply === undefined ? {} : { reply }}
      onCancelReply={() => (reply = undefined)}
      {...status === undefined ? {} : { status }}
      formattingOpen={scenario === "framed" ||
        scenario === "narrow" ||
        scenario === "form"}
      {customEmojis}
      {...scenario === "custom" ? {} : { emojis: reactionChoices }}
    >
      {#snippet avatar()}<Avatar
          name="Alex Morgan"
          size="sm"
          decorative
        />{/snippet}
      {#snippet additionalActions({ disabled })}<Button
          variant="ghost"
          size="icon-sm"
          aria-label="Attach file"
          {disabled}
          onclick={() => attachments++}
          ><PaperclipIcon aria-hidden="true" /></Button
        >{/snippet}
    </MarkdownComposer>
    {#if scenario === "form"}<Button type="submit" variant="outline"
        >Submit host form</Button
      >{/if}
  </form>
  <div class="markdown-composer-review__controls">
    <Button
      variant="outline"
      size="sm"
      disabled={Boolean(reply)}
      onclick={() => (reply = replyTarget)}>Reply to Sam</Button
    >
    <Button
      variant="outline"
      size="sm"
      onclick={() => {
        handle?.setSelection({
          anchor: { line: 0, ch: 0 },
          head: { line: 0, ch: 5 },
        });
        handle?.focus();
      }}>Select first word</Button
    >
    <Button
      variant="outline"
      size="sm"
      onclick={() =>
        (presentation = presentation === "framed" ? "document" : "framed")}
      >Switch presentation</Button
    >
    <Button
      variant="outline"
      size="sm"
      onclick={() =>
        (status = {
          type: "error",
          message: "Delivery failed. Your draft is retained.",
        })}>Simulate failed delivery</Button
    >
    <Button
      variant="outline"
      size="sm"
      disabled={!submitted}
      onclick={() => {
        if (value === submitted) value = "";
      }}>Acknowledge submitted draft</Button
    >
  </div>
  <dl>
    <dt>Controlled draft</dt>
    <dd data-testid="draft-value">{value || "(empty)"}</dd>
    <dt>Submitted snapshot</dt>
    <dd data-testid="submitted-value">{submitted || "(none)"}</dd>
  </dl>
  <output aria-live="polite"
    >{attachments} attachments requested{stopped
      ? " · Response stopped"
      : ""}</output
  >
  {#if scenario === "form"}<output data-testid="form-value">{formValue}</output
    >{/if}
</div>

<style>
  .markdown-composer-review {
    width: min(100%, 48rem);
    padding: 1.5rem;
    margin-inline: auto;
    display: grid;
    gap: 1rem;
  }
  .markdown-composer-review[data-narrow="true"] {
    max-width: 22rem;
    padding: 0.75rem;
  }
  h2,
  p,
  dl,
  dd {
    margin: 0;
  }
  h2 {
    font-size: 1rem;
  }
  p,
  dt,
  output {
    font-size: 0.8125rem;
    color: var(--muted-foreground);
  }
  form {
    display: grid;
    gap: 0.75rem;
  }
  .markdown-composer-review__controls {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  dl {
    display: grid;
    gap: 0.5rem;
  }
  dd {
    font-family: var(--font-mono, monospace);
    font-size: 0.8125rem;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
</style>
