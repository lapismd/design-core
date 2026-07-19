<script lang="ts">
  import PlusIcon from "@lucide/svelte/icons/plus";
  import XIcon from "@lucide/svelte/icons/x";
  import { tick } from "svelte";

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

  const addChoiceButtonClass =
    "h-7 rounded-md border border-border bg-transparent px-2 text-xs font-normal text-muted-foreground/80 hover:bg-muted/60 hover:text-foreground";
  const addSectionButtonClass =
    "my-2 inline-flex h-auto min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-transparent py-3 text-sm font-normal text-foreground/80 hover:bg-muted/40 hover:text-foreground [&_svg]:size-4";

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
  <section class="relative">
    <div
      class="border-primary grid grid-cols-[minmax(0,1fr)_auto] items-center gap-1 border-b pb-0.5"
    >
      <input
        bind:this={titleInput}
        aria-label={inputLabel}
        class="h-8 w-full rounded-none border-0 bg-transparent px-0 py-0 text-2xl font-semibold shadow-none outline-none focus-visible:ring-0"
        value={title}
        oninput={(event) => onTitleChange(event.currentTarget.value)}
      />
      <button
        type="button"
        class="text-muted-foreground/70 hover:text-foreground inline-grid size-5 shrink-0 place-items-center rounded-sm border-0 bg-transparent transition-colors hover:bg-transparent [&_svg]:size-3.5"
        aria-label={cancelLabel}
        onclick={onCancel}
      >
        <XIcon class="size-3.5" />
      </button>
    </div>
    <div class="flex flex-col gap-3 px-4 py-5">
      <p
        class="text-muted-foreground text-xs font-medium tracking-wide uppercase"
      >
        {optionLabel}
      </p>
      <div class="flex flex-wrap gap-2">
        {#each options as option (option.value)}
          <button
            type="button"
            class={addChoiceButtonClass}
            onclick={() => onChoose(option.value)}
          >
            {option.label}
          </button>
        {/each}
      </div>
    </div>
  </section>
{:else}
  <button type="button" class={addSectionButtonClass} onclick={onOpen}>
    <PlusIcon data-icon="inline-start" />
    {addLabel}
  </button>
{/if}
