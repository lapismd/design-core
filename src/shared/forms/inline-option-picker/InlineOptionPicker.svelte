<script lang="ts">
  import "./InlineOptionPicker.css";
  import type { Component } from "svelte";

  export type InlineOptionPickerOption = {
    value: string;
    label: string;
    icon?: Component;
    accent?: string;
  };

  let {
    value = "",
    options,
    placeholder = "Select option",
    ariaLabel = "Select option",
    presentation = "swap",
    onChange = () => {},
  }: {
    value?: string;
    options: InlineOptionPickerOption[];
    placeholder?: string;
    ariaLabel?: string;
    presentation?: "menu" | "swap";
    onChange?: (value: string) => void;
  } = $props();

  let open = $state(false);
  let root = $state<HTMLElement | null>(null);

  const currentOption = $derived(
    options.find((option) => option.value === value),
  );
  const currentLabel = $derived(currentOption?.label ?? value ?? placeholder);

  $effect(() => {
    if (!open) return;

    let armed = false;
    const armTimer = setTimeout(() => {
      armed = true;
    }, 0);

    function handlePointerDown(event: PointerEvent) {
      if (!armed) return;
      if (!(event.target instanceof Node)) return;
      if (root?.contains(event.target)) return;
      open = false;
    }

    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => {
      clearTimeout(armTimer);
      document.removeEventListener("pointerdown", handlePointerDown, true);
    };
  });

  function optionStyle(option?: InlineOptionPickerOption) {
    return option?.accent ? `--cv-inline-option-accent: ${option.accent};` : "";
  }

  function select(nextValue: string) {
    onChange(nextValue);
    open = false;
  }

  function toggleOpen(event: MouseEvent) {
    event.stopPropagation();
    open = !open;
  }

  function chooseOption(event: MouseEvent, nextValue: string) {
    event.stopPropagation();
    select(nextValue);
  }
</script>

<div
  bind:this={root}
  class="cv-form-inline-option-picker"
  class:cv-form-inline-option-picker--swap={presentation === "swap"}
  data-open={open}
>
  {#if presentation === "swap" && open}
    <div
      class="cv-form-inline-option-list cv-form-inline-option-list--swap"
      role="listbox"
      aria-label={ariaLabel}
    >
      {#each options as option (option.value)}
        <button
          type="button"
          class:active={option.value === value}
          style={optionStyle(option)}
          role="option"
          aria-selected={option.value === value}
          onclick={(event) => chooseOption(event, option.value)}
        >
          {#if option.icon}
            {@const Icon = option.icon}
            <Icon />
          {/if}
          <span>{option.label}</span>
        </button>
      {/each}
    </div>
  {:else}
    <button
      type="button"
      class="cv-form-inline-option-trigger"
      style={optionStyle(currentOption)}
      aria-label={ariaLabel}
      aria-expanded={open}
      onclick={toggleOpen}
    >
      <span class="cv-form-inline-option-trigger-content">
        {#if currentOption?.icon}
          {@const CurrentIcon = currentOption.icon}
          <CurrentIcon />
        {/if}
        <span>{currentLabel || placeholder}</span>
      </span>
    </button>

    {#if presentation === "menu" && open}
      <div class="cv-form-inline-option-list">
        {#each options as option (option.value)}
          <button
            type="button"
            class:active={option.value === value}
            style={optionStyle(option)}
            aria-pressed={option.value === value}
            onclick={(event) => chooseOption(event, option.value)}
          >
            {#if option.icon}
              {@const Icon = option.icon}
              <Icon />
            {/if}
            <span>{option.label}</span>
          </button>
        {/each}
      </div>
    {/if}
  {/if}
</div>
