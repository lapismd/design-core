<script lang="ts">
  import "@stevejuma/ui/forms/FormControlRow.css";
  import PlusIcon from "@lucide/svelte/icons/plus";
  import XIcon from "@lucide/svelte/icons/x";
  import {
    StructuredForm,
    createFormConfig,
    optionField,
    textField,
  } from "@stevejuma/ui/forms";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import type { SocialNetwork } from "../types";

  let {
    items = [],
    onChange,
  }: {
    items?: SocialNetwork[];
    onChange: (items: SocialNetwork[]) => void;
  } = $props();

  const networkOptions = [
    "LinkedIn",
    "GitHub",
    "GitLab",
    "IMDB",
    "Instagram",
    "ORCID",
    "Mastodon",
    "StackOverflow",
    "ResearchGate",
    "YouTube",
    "Google Scholar",
    "Telegram",
    "WhatsApp",
    "Leetcode",
    "X",
    "Bluesky",
    "Reddit",
  ].map((value) => ({ value, label: value }));

  const socialNetworkFormConfig = createFormConfig<SocialNetwork>({
    id: "cv-social-network",
    fields: [
      optionField({
        id: "network",
        label: "Network",
        ariaLabel: "Social network",
        presentation: "menu",
        options: networkOptions,
        get: (item) => item.network,
        set: (item, network) => ({ ...item, network }),
      }),
      textField({
        id: "username",
        label: "Username",
        get: (item) => item.username,
        set: (item, username) => ({ ...item, username }),
      }),
    ],
  });

  function add() {
    onChange([...items, { network: "LinkedIn", username: "" }]);
  }

  function update(index: number, value: SocialNetwork) {
    onChange(
      items.map((item, itemIndex) => (itemIndex === index ? value : item)),
    );
  }

  function remove(index: number) {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  }
</script>

<div
  class="cv-control-row-group cv-social-networks-editor"
  data-ui-part="social-networks-editor"
>
  <div class="cv-control-action-row">
    <span class="cv-control-action-row__label">Social Networks</span>
    <div class="cv-control-action-row__control">
      <Button
        type="button"
        variant="ghost"
        size="xs"
        class="cv-social-networks-editor__add-button"
        onclick={add}
      >
        <PlusIcon data-icon="inline-start" />
        Add
      </Button>
    </div>
  </div>

  <div class="cv-social-networks-editor__list">
    {#each items as item, index (index)}
      <div class="cv-social-networks-editor__item">
        <div class="cv-social-networks-editor__item-content">
          <StructuredForm
            value={item}
            config={socialNetworkFormConfig}
            onChange={(value) => update(index, value as SocialNetwork)}
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          class="cv-social-networks-editor__remove"
          aria-label="Delete social network"
          onclick={() => remove(index)}
        >
          <XIcon />
        </Button>
      </div>
    {/each}
  </div>
</div>

<style>
  .cv-social-networks-editor.cv-control-row-group {
    row-gap: 0;
  }

  .cv-social-networks-editor__list {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
  }

  :global(.cv-social-networks-editor__add-button) {
    height: 1.25rem;
    gap: 0.25rem;
    padding-inline: 0;
    color: var(--muted-foreground);
    font-size: 0.75rem;
    font-weight: 400;
  }

  :global(.cv-social-networks-editor__add-button:hover) {
    color: var(--foreground);
    background: transparent;
  }

  :global(.cv-social-networks-editor__add-button svg) {
    width: 0.75rem;
    height: 0.75rem;
  }

  .cv-social-networks-editor__item {
    position: relative;
    border-bottom: 1px solid var(--border);
  }

  .cv-social-networks-editor__item:last-child {
    border-bottom: 0;
  }

  .cv-social-networks-editor__item-content {
    padding-left: 1rem;
  }

  :global(.cv-social-networks-editor__remove) {
    position: absolute;
    top: 50%;
    right: -1.25rem;
    width: 1.25rem;
    height: 1.25rem;
    transform: translateY(-50%);
    border-radius: calc(var(--radius) - 4px);
    color: color-mix(in srgb, var(--muted-foreground) 70%, transparent);
    opacity: 0;
    transition: opacity 150ms ease;
  }

  .cv-social-networks-editor__item:hover
    :global(.cv-social-networks-editor__remove),
  .cv-social-networks-editor__item:focus-within
    :global(.cv-social-networks-editor__remove),
  :global(.cv-social-networks-editor__remove:focus-visible) {
    opacity: 1;
  }

  :global(.cv-social-networks-editor__remove:hover) {
    color: var(--foreground);
    background: transparent;
  }

  :global(.cv-social-networks-editor__remove svg) {
    width: 0.875rem;
    height: 0.875rem;
  }
</style>
