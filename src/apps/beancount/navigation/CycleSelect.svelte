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

<div data-slot="cycle-select" class="bc-cycle-select">
  <Button
    variant="ghost"
    size="icon"
    class="bc-cycle-select__button"
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
    class="bc-cycle-select__button"
    aria-label="Next {label.toLowerCase()}"
    disabled={shiftDisabled}
    onclick={() => shift(1)}
  >
    <ChevronRight />
  </Button>
</div>

<style>
  .bc-cycle-select {
    display: flex;
    min-width: 0;
    flex: 0 1 auto;
    align-items: center;
    gap: var(--ui-beancount-space-1);
  }

  :global(.bc-cycle-select__button) {
    width: var(--ui-beancount-compact-control-height);
    height: var(--ui-beancount-compact-control-height);
    overflow: hidden;
    border-radius: var(--radius-md);
  }

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
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  .cycle-select-picker :global(.ui-filter-command-picker__trigger) {
    width: 100%;
    height: var(--ui-beancount-compact-control-height);
    min-height: var(--ui-beancount-compact-control-height);
    min-width: calc(var(--ui-beancount-space-5) * 2);
    max-width: calc(
      var(--ui-beancount-space-5) * 3 + var(--ui-beancount-space-4)
    );
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
    background: var(--ui-beancount-sidebar-accent);
    color: var(--ui-beancount-sidebar-accent-foreground);
  }
</style>
