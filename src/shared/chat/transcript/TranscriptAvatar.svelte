<script lang="ts">
  import { getContext } from "svelte";
  import { Avatar } from "../../shadcn/avatar/index.js";
  import { AuthorCard } from "../../shadcn/author-card/index.js";
  import {
    authorContext,
    type TranscriptAuthorContext,
  } from "./author-context.js";
  import { transcriptAuthorIdentity } from "./author-identity.js";
  import type { TranscriptAuthor } from "./model.js";
  let {
    member,
    size = "xsmall",
    decorative = true,
    interactive = true,
  }: {
    member: TranscriptAuthor;
    size?: string;
    decorative?: boolean;
    interactive?: boolean;
  } = $props();
  const context = getContext<TranscriptAuthorContext | undefined>(
    authorContext,
  );
  const identity = $derived(transcriptAuthorIdentity(member));
  const pixels = $derived(
    size === "inline"
      ? "1rem"
      : size === "group"
        ? "1.25rem"
        : size === "medium"
          ? "2.25rem"
          : "1.5rem",
  );
  const description = $derived(context?.popover?.description?.(member));
  const actions = $derived(
    (context?.popover?.actions?.(member) ?? []).map((action) => ({
      id: action.id,
      label: action.label,
      ...(action.disabled === undefined ? {} : { disabled: action.disabled }),
      onSelect: () => action.onSelect(member),
    })),
  );
  let open = $state(false);
</script>

{#snippet details()}{@render context?.popover?.details?.(member)}{/snippet}
{#if interactive && context?.popover}
  <span
    class="ui-transcript-author"
    style={`--ui-author-card-avatar-size: ${pixels}`}
  >
    <AuthorCard
      author={identity}
      size="md"
      interaction={context.popover.interaction ?? "popover"}
      {...description === undefined ? {} : { description }}
      {...member.role === undefined ? {} : { role: member.role }}
      {details}
      {actions}
      bind:open
    />
  </span>
{:else}
  <Avatar {...identity} {decorative} style={`--ui-avatar-size: ${pixels}`} />
{/if}

<style>
  .ui-transcript-author {
    display: inline-flex;
    flex: none;
    vertical-align: middle;
  }
</style>
