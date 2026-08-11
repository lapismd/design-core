<script lang="ts">
  import "./CyclePicker.css";
  import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
  import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
  import { Button } from "../../shadcn/button";
  import * as ButtonGroup from "../../shadcn/button-group";
  import type { InlineOptionPickerOption } from "../inline-option-picker/InlineOptionPicker.svelte";

  export type CyclePickerPreview = "plain" | "font";

  let {
    value = "",
    options,
    placeholder = "Select option",
    ariaLabel = "Option",
    preview = "plain",
    error = null,
    onChange = () => {},
    onBlur = () => {},
  }: {
    value?: string;
    options: InlineOptionPickerOption[];
    placeholder?: string;
    ariaLabel?: string;
    preview?: CyclePickerPreview;
    error?: string | null;
    onChange?: (value: string) => void;
    onBlur?: () => void;
  } = $props();

  let open = $state(false);
  let root = $state<HTMLElement | null>(null);

  const currentOption = $derived(
    options.find((option) => option.value === value),
  );
  const currentLabel = $derived(currentOption?.label ?? value ?? placeholder);

  $effect(() => {
    if (!open) return;
    function closeOutside(event: PointerEvent) {
      if (!(event.target instanceof Node) || root?.contains(event.target))
        return;
      open = false;
    }
    document.addEventListener("pointerdown", closeOutside, true);
    return () =>
      document.removeEventListener("pointerdown", closeOutside, true);
  });

  function previewStyle(optionValue: string) {
    if (preview !== "font") return "";
    const family = optionValue.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
    return `font-family: "${family}", var(--font-sans, sans-serif);`;
  }

  function shift(direction: -1 | 1) {
    if (!options.length) return;
    const currentIndex = options.findIndex((option) => option.value === value);
    const nextIndex =
      (Math.max(currentIndex, 0) + direction + options.length) % options.length;
    onChange(options[nextIndex].value);
  }

  function select(nextValue: string) {
    onChange(nextValue);
    open = false;
  }

  function handleFocusOut(event: FocusEvent) {
    if (
      event.relatedTarget instanceof Node &&
      event.currentTarget instanceof HTMLElement &&
      event.currentTarget.contains(event.relatedTarget)
    ) {
      return;
    }
    onBlur();
  }
</script>

<div
  bind:this={root}
  class="ui-cycle-picker"
  data-ui-component="cycle-picker"
  data-preview={preview}
  data-invalid={error ? "" : undefined}
  onfocusout={handleFocusOut}
>
  <ButtonGroup.Root
    class="ui-cycle-picker__controls"
    aria-label={`${ariaLabel} cycle controls`}
  >
    <Button
      variant="ghost"
      size="icon-xs"
      data-ui-part="cycle-previous"
      aria-label={`Previous ${ariaLabel}`}
      disabled={!options.length}
      onclick={() => shift(-1)}
    >
      <ChevronLeftIcon />
    </Button>
    <Button
      class="ui-cycle-picker__current"
      variant="ghost"
      size="xs"
      data-ui-part="cycle-current"
      style={previewStyle(value)}
      title={currentLabel || placeholder}
      aria-label={`Select ${ariaLabel}`}
      aria-expanded={open}
      disabled={!options.length}
      onclick={() => (open = !open)}
    >
      <span class="ui-cycle-picker__current-content">
        {#if currentOption?.icon}
          {@const CurrentIcon = currentOption.icon}
          <CurrentIcon />
        {/if}
        <span>{currentLabel || placeholder}</span>
      </span>
    </Button>
    <Button
      variant="ghost"
      size="icon-xs"
      data-ui-part="cycle-next"
      aria-label={`Next ${ariaLabel}`}
      disabled={!options.length}
      onclick={() => shift(1)}
    >
      <ChevronRightIcon />
    </Button>
  </ButtonGroup.Root>

  {#if open}
    <div
      class="ui-cycle-picker__options"
      role="listbox"
      aria-label={`${ariaLabel} options`}
    >
      {#each options as option (option.value)}
        <Button
          class="ui-cycle-picker__option"
          variant={option.value === value ? "secondary" : "ghost"}
          size="xs"
          style={previewStyle(option.value)}
          role="option"
          aria-selected={option.value === value}
          onclick={() => select(option.value)}
        >
          {#if option.icon}
            {@const Icon = option.icon}
            <Icon data-icon="inline-start" />
          {/if}
          {option.label}
        </Button>
      {/each}
    </div>
  {/if}

  {#if error}
    <p class="ui-cycle-picker__error" role="alert">{error}</p>
  {/if}
</div>
