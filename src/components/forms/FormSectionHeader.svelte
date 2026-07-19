<script lang="ts">
  import "./FormSectionHeader.css";
  import ArrowDownIcon from "@lucide/svelte/icons/arrow-down";
  import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
  import XIcon from "@lucide/svelte/icons/x";
  import type { Snippet } from "svelte";

  import { autosizeTextarea } from "./autosize-textarea";

  let {
    title,
    disclosureTitle = title,
    index,
    total,
    open = true,
    editable = true,
    movable = true,
    removable = true,
    titleToggleable = false,
    removeLabel = "Delete section",
    titleClass = "",
    titleLabel = "Section title",
    titlePlaceholder = "",
    titleRowClass = "",
    onTitleChange = () => {},
    onMove = () => {},
    onRemove = () => {},
    onToggle = () => {},
    titleContent,
    actions,
  }: {
    title: string;
    disclosureTitle?: string;
    index: number;
    total: number;
    open?: boolean;
    editable?: boolean;
    movable?: boolean;
    removable?: boolean;
    titleToggleable?: boolean;
    removeLabel?: string;
    titleClass?: string;
    titleLabel?: string;
    titlePlaceholder?: string;
    titleRowClass?: string;
    onTitleChange?: (value: string) => void;
    onMove?: (direction: -1 | 1) => void;
    onRemove?: () => void;
    onToggle?: () => void;
    titleContent?: Snippet;
    actions?: Snippet;
  } = $props();
</script>

<div class="cv-form-section-header">
  {#if movable}
    <div class="cv-form-section-move" data-testid="section-actions-move">
      <button
        type="button"
        disabled={index === 0}
        aria-label="Move section up"
        onclick={() => onMove(-1)}
      >
        <ArrowUpIcon />
      </button>
      <button
        type="button"
        disabled={index === total - 1}
        aria-label="Move section down"
        onclick={() => onMove(1)}
      >
        <ArrowDownIcon />
      </button>
    </div>
  {/if}

  <button
    type="button"
    class="cv-form-section-toggle"
    aria-label={open
      ? `Collapse ${disclosureTitle}`
      : `Expand ${disclosureTitle}`}
    aria-expanded={open}
    onclick={onToggle}
  >
    <ChevronDownIcon />
  </button>

  <div class={`cv-form-section-title-row ${titleRowClass}`}>
    {#if titleContent}
      <div class="cv-form-section-title-slot">
        {@render titleContent()}
      </div>
    {:else if editable}
      <textarea
        aria-label={titleLabel}
        class={titleClass}
        placeholder={titlePlaceholder}
        rows="1"
        use:autosizeTextarea={title}
        value={title}
        oninput={(event) => onTitleChange(event.currentTarget.value)}
      ></textarea>
    {:else if titleToggleable}
      <button
        type="button"
        class={`cv-form-section-title-toggle ${titleClass}`}
        aria-expanded={open}
        onclick={onToggle}
      >
        {title}
      </button>
    {:else}
      <h3 class={titleClass}>{title}</h3>
    {/if}

    {#if actions}
      <div class="cv-form-section-actions">
        {@render actions()}
      </div>
    {/if}
  </div>

  {#if removable}
    <button
      type="button"
      class="cv-form-section-remove"
      aria-label={removeLabel}
      onclick={onRemove}
    >
      <XIcon />
    </button>
  {/if}
</div>
