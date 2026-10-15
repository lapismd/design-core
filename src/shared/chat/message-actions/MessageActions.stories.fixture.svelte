<script lang="ts">
  import {
    MessageActions,
    MarkdownContent,
    ReactionBar,
    type MessageAction,
  } from "../index.js";
  import { customEmojis, reactionChoices } from "../chat.stories.data.js";
  import ReplyIcon from "@lucide/svelte/icons/message-square-reply";
  import CopyIcon from "@lucide/svelte/icons/copy";
  import PencilIcon from "@lucide/svelte/icons/pencil";
  let {
    scenario = "visible",
  }: { scenario?: "visible" | "hover" | "restricted" | "empty" | "disabled" } =
    $props();
  let lastAction = $state("No action yet");
  const actions: MessageAction[] = [
    {
      id: "reply",
      label: "Reply",
      primary: true,
      icon: replyIcon,
      onSelect: () => (lastAction = "Reply requested"),
    },
    {
      id: "copy",
      label: "Copy message",
      icon: copyIcon,
      onSelect: () => (lastAction = "Copy requested"),
    },
    {
      id: "edit",
      label: "Edit message",
      icon: editIcon,
      disabledReason: "Only the author can edit this message",
      onSelect: () => (lastAction = "Edit requested"),
    },
    {
      id: "hidden",
      label: "Hidden host action",
      hidden: true,
      onSelect: () => (lastAction = "Hidden action"),
    },
  ];
</script>

{#snippet replyIcon()}<ReplyIcon aria-hidden="true" />{/snippet}
{#snippet copyIcon()}<CopyIcon aria-hidden="true" />{/snippet}
{#snippet editIcon()}<PencilIcon aria-hidden="true" />{/snippet}
<div class="message-actions-review">
  <p>
    Hover the message or tab into its actions. Touch layouts show the controls
    below the message.
  </p>
  <MessageActions
    {actions}
    alwaysVisible={scenario !== "hover"}
    label="Actions for Sam's message"
    disabled={scenario === "disabled"}
    {customEmojis}
    {...scenario === "restricted"
      ? { emojis: reactionChoices }
      : scenario === "empty"
        ? { emojis: [] }
        : {}}
    onAddReaction={(emoji, custom) =>
      (lastAction = `Reaction: ${custom?.shortcode ?? emoji}`)}
  >
    <article aria-label="Sam's message">
      <header><strong>Sam Kim</strong><span>10:42</span></header>
      <MarkdownContent
        content="The shared controls are ready for review. **Thanks for the feedback!**"
      />
      <ReactionBar
        reactions={[
          { emoji: "👍", count: 3 },
          { emoji: "lapis", count: 2, custom: customEmojis[0]! },
        ]}
      />
    </article>
  </MessageActions>
  <output aria-live="polite" data-testid="message-action-result"
    >{lastAction}</output
  >
</div>

<style>
  .message-actions-review {
    width: min(100%, 44rem);
    margin-inline: auto;
    padding: 2rem;
    display: grid;
    gap: 2rem;
  }
  article {
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--background);
  }
  header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.8125rem;
    padding-bottom: 0.5rem;
  }
  header span,
  p,
  output {
    color: var(--muted-foreground);
    font-size: 0.8125rem;
  }
  p {
    margin: 0;
  }
</style>
