<script lang="ts">
  import ChevronLeft from "@lucide/svelte/icons/chevron-left";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import { FilterCommandPicker } from "@stevejuma/ui/forms";

  export type CycleSelectOption = {
    value: string;
    label: string;
  };

  let {
    value = "",
    options = [] as readonly CycleSelectOption[],
    label = "Option",
    ariaLabel = `Select ${label.toLowerCase()}`,
    disabled = false,
    onChange = () => {},
  }: {
    value?: string;
    options?: readonly CycleSelectOption[];
    label?: string;
    ariaLabel?: string;
    disabled?: boolean;
    onChange?: (value: string) => void;
  } = $props();

  const pickerOptions = $derived([...options]);
  const controlsDisabled = $derived(disabled || options.length === 0);
  const shiftDisabled = $derived(controlsDisabled || options.length <= 1);

  function shift(direction: -1 | 1) {
    if (shiftDisabled) return;

    const currentIndex = options.findIndex((entry) => entry.value === value);
    const index = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex = (index + direction + options.length) % options.length;
    onChange(options[nextIndex]!.value);
  }
</script>

<div data-slot="cycle-select" class="flex min-w-0 shrink items-center gap-1">
  <Button
    variant="ghost"
    size="icon"
    class="size-8 overflow-hidden rounded-md"
    aria-label="Previous {label.toLowerCase()}"
    disabled={shiftDisabled}
    onclick={() => shift(-1)}
  >
    <ChevronLeft />
  </Button>
  <div class="cycle-select-picker">
    <FilterCommandPicker
      {value}
      options={pickerOptions}
      {label}
      {ariaLabel}
      placeholder={`Filter ${label.toLowerCase()}...`}
      closeOnSelect={true}
      onChange={(next) => onChange(next)}
    />
  </div>
  <Button
    variant="ghost"
    size="icon"
    class="size-8 overflow-hidden rounded-md"
    aria-label="Next {label.toLowerCase()}"
    disabled={shiftDisabled}
    onclick={() => shift(1)}
  >
    <ChevronRight />
  </Button>
</div>

<style>
  .cycle-select-picker {
    display: flex;
    min-width: 0;
    flex: 1 1 auto;
  }

  .cycle-select-picker :global(.ui-filter-command-picker__trigger),
  .cycle-select-picker
    :global(.ui-filter-command-picker__trigger[data-active="true"]),
  .cycle-select-picker :global(.ui-filter-command-picker__trigger:hover),
  .cycle-select-picker
    :global(.ui-filter-command-picker__trigger:focus-visible) {
    border-radius: 0.375rem;
    overflow: hidden;
  }

  .cycle-select-picker :global(.ui-filter-command-picker__trigger) {
    width: 100%;
    height: 2rem;
    min-height: 2rem;
    min-width: 5rem;
    max-width: 9rem;
    flex: 1 1 auto;
    border: 0;
    background: transparent;
    box-shadow: none;
    font-weight: 500;
  }

  .cycle-select-picker
    :global(.ui-filter-command-picker__trigger[data-active="true"]) {
    background: transparent;
    color: inherit;
  }

  .cycle-select-picker :global(.ui-filter-command-picker__trigger:hover),
  .cycle-select-picker
    :global(.ui-filter-command-picker__trigger:focus-visible) {
    background: var(--accent);
    color: var(--accent-foreground);
  }
</style>
