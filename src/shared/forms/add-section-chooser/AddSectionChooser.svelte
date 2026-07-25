<script lang="ts">
  import "./AddSectionChooser.css";
  import PlusIcon from "@lucide/svelte/icons/plus";
  import XIcon from "@lucide/svelte/icons/x";
  import { tick } from "svelte";
  import { Button } from "@stevejuma/ui/shadcn/button";

  export type AddSectionOption = {
    value: string;
    label: string;
  };

  let {
    open,
    title,
    options,
    addLabel = "Add New Section",
    cancelLabel = "Cancel new section",
    inputLabel = "New section title",
    optionLabel = "Entry Type",
    onOpen,
    onCancel,
    onTitleChange,
    onChoose,
  }: {
    open: boolean;
    title: string;
    options: AddSectionOption[];
    addLabel?: string;
    cancelLabel?: string;
    inputLabel?: string;
    optionLabel?: string;
    onOpen: () => void;
    onCancel: () => void;
    onTitleChange: (value: string) => void;
    onChoose: (value: string) => void;
  } = $props();

  let titleInput = $state<HTMLInputElement | null>(null);
  let focusedOpen = $state(false);

  $effect(() => {
    if (open && !focusedOpen) {
      focusedOpen = true;
      tick().then(() => {
        titleInput?.focus();
        titleInput?.select();
      });
    } else if (!open && focusedOpen) {
      focusedOpen = false;
    }
  });
</script>

{#if open}
  <section data-ui-component="add-section-chooser" data-ui-part="open">
    <div
      data-ui-component="add-section-chooser"
      data-ui-part="add-section-chooser-title-row"
    >
      <input
        bind:this={titleInput}
        data-ui-component="add-section-chooser"
        data-ui-part="add-section-chooser-title"
        aria-label={inputLabel}
        value={title}
        oninput={(event) => onTitleChange(event.currentTarget.value)}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        class="ui-add-section-chooser__cancel"
        aria-label={cancelLabel}
        onclick={onCancel}
      >
        <XIcon aria-hidden="true" />
      </Button>
    </div>
    <div
      data-ui-component="add-section-chooser"
      data-ui-part="add-section-chooser-body"
    >
      <p
        data-ui-component="add-section-chooser"
        data-ui-part="add-section-chooser-option-label"
      >
        {optionLabel}
      </p>
      <div
        data-ui-component="add-section-chooser"
        data-ui-part="add-section-chooser-options"
      >
        {#each options as option (option.value)}
          <Button
            type="button"
            variant="outline"
            size="xs"
            class="ui-add-section-chooser__choice"
            onclick={() => onChoose(option.value)}
          >
            {option.label}
          </Button>
        {/each}
      </div>
    </div>
  </section>
{:else}
  <button
    type="button"
    data-ui-component="add-section-chooser"
    data-ui-part="cta"
    onclick={onOpen}
  >
    <PlusIcon data-icon="inline-start" aria-hidden="true" />
    {addLabel}
  </button>
{/if}
