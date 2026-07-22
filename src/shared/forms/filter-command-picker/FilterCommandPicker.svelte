<script lang="ts">
  import "./FilterCommandPicker.css";
  import { Command as CommandPrimitive, Popover } from "bits-ui";
  import CheckIcon from "@lucide/svelte/icons/check";
  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
  import SearchIcon from "@lucide/svelte/icons/search";
  import {
    filterCommandOptions,
    hasExactFilterCommandOption,
  } from "./picker-search";
  import type {
    FilterCommandOption,
    FilterCommandSearchAction,
  } from "./picker-options";

  let {
    value = "",
    values,
    multiple = false,
    options,
    label,
    ariaLabel = label,
    placeholder = `Filter ${label.toLowerCase()}...`,
    emptyLabel = "No options found.",
    closeOnSelect,
    fullWidth = false,
    stackedOptions = false,
    allowCustom = false,
    searchAction,
    searchActionGroupLabel = "Actions",
    onSearchAction,
    normalize = (next: string) => next.trim(),
    /** Validation message; sets aria-invalid on the trigger and renders below. */
    error = null,
    onChange = () => {},
    onValuesChange = () => {},
  }: {
    value?: string;
    values?: string[];
    multiple?: boolean;
    options: FilterCommandOption[];
    label: string;
    ariaLabel?: string;
    placeholder?: string;
    emptyLabel?: string;
    closeOnSelect?: boolean;
    fullWidth?: boolean;
    /** Use a larger avatar and vertically stacked, wrapping option details. */
    stackedOptions?: boolean;
    allowCustom?: boolean;
    /** Optionally offer a context-specific action for the typed search text. */
    searchAction?: (
      search: string,
    ) => FilterCommandSearchAction | null | undefined;
    searchActionGroupLabel?: string;
    onSearchAction?: (search: string) => void | Promise<void>;
    normalize?: (value: string) => string;
    error?: string | null;
    onChange?: (value: string) => void | Promise<void>;
    onValuesChange?: (values: string[]) => void | Promise<void>;
  } = $props();

  const shouldCloseOnSelect = $derived(closeOnSelect ?? !multiple);
  const uid = $props.id();
  const errorId = `${uid}-error`;

  let open = $state(false);
  let search = $state("");
  let failedImageUrls = $state(new Set<string>());
  const commandListId = `filter-command-picker-list-${Math.random().toString(36).slice(2)}`;

  const selectedValues = $derived(multiple ? (values ?? []) : []);
  const effectiveSelectedValues = $derived(
    selectedValues.filter((v) => v !== "all" && v !== ""),
  );

  const currentOption = $derived(
    multiple
      ? effectiveSelectedValues.length === 1
        ? (options.find(
            (option) => option.value === effectiveSelectedValues[0],
          ) ?? null)
        : null
      : (options.find((option) => option.value === value) ?? null),
  );

  const active = $derived(
    multiple
      ? effectiveSelectedValues.length > 0
      : Boolean(value.trim()) && currentOption?.value !== "all",
  );

  const triggerLabel = $derived.by(() => {
    if (multiple) {
      const count = effectiveSelectedValues.length;
      if (count === 0) return label;
      if (count === 1) {
        const option = options.find(
          (o) => o.value === effectiveSelectedValues[0],
        );
        return option?.label ?? effectiveSelectedValues[0];
      }
      return `${label} (${count})`;
    }
    return currentOption?.label ?? (value.trim() || label);
  });

  const trimmedSearch = $derived(search.trim());
  const exactMatch = $derived(
    hasExactFilterCommandOption(options, trimmedSearch),
  );
  const canCreateCustom = $derived(
    allowCustom && !multiple && trimmedSearch.length > 0 && !exactMatch,
  );
  const availableSearchAction = $derived.by(() =>
    trimmedSearch && onSearchAction
      ? (searchAction?.(trimmedSearch) ?? null)
      : null,
  );

  const filteredOptions = $derived.by(() => {
    return filterCommandOptions(options, search);
  });

  function setOpen(next: boolean) {
    open = next;
    if (!next) search = "";
  }

  function isOptionChecked(optionValue: string): boolean {
    return multiple
      ? selectedValues.includes(optionValue)
      : optionValue === value;
  }

  function selectOption(nextValue: string) {
    if (multiple) {
      if (nextValue === "all" || nextValue === "") {
        void onValuesChange([]);
      } else {
        const next = selectedValues.includes(nextValue)
          ? selectedValues.filter((v) => v !== nextValue)
          : [...selectedValues, nextValue];
        void onValuesChange(next);
      }
    } else {
      void onChange(normalize(nextValue));
    }

    if (shouldCloseOnSelect) setOpen(false);
  }

  function selectCustomValue() {
    if (!trimmedSearch) return;
    selectOption(trimmedSearch);
  }

  async function selectSearchAction() {
    if (!trimmedSearch || !availableSearchAction || !onSearchAction) return;
    setOpen(false);
    await onSearchAction(trimmedSearch);
  }

  function markImageFailed(imageUrl: string) {
    failedImageUrls = new Set([...failedImageUrls, imageUrl]);
  }

  function canShowImage(option: FilterCommandOption) {
    return Boolean(option.imageUrl && !failedImageUrls.has(option.imageUrl));
  }

  function optionInitial(option: Pick<FilterCommandOption, "label">) {
    return (option.label.trim().charAt(0) || "?").toUpperCase();
  }
</script>

<div class="ui-filter-command-picker">
  <Popover.Root {open} onOpenChange={setOpen}>
    <Popover.Trigger>
      {#snippet child({ props })}
        <button
          {...props}
          type="button"
          class="ui-filter-command-picker__trigger"
          aria-label={ariaLabel}
          title={ariaLabel}
          aria-describedby={error ? errorId : undefined}
          data-active={active}
          data-full-width={fullWidth}
          data-invalid={error ? "" : undefined}
        >
          {#if currentOption && canShowImage(currentOption)}
            <img
              class="ui-filter-command-picker__image"
              src={currentOption.imageUrl}
              alt=""
              onerror={() => markImageFailed(currentOption!.imageUrl!)}
            />
          {:else if currentOption?.accent}
            <span
              class="ui-filter-command-picker__swatch"
              style={`--filter-accent: ${currentOption.accent}`}
              aria-hidden="true"
            ></span>
          {/if}
          <span class="ui-filter-command-picker__label">{triggerLabel}</span>
          <ChevronDownIcon size={12} strokeWidth={1.75} aria-hidden="true" />
        </button>
      {/snippet}
    </Popover.Trigger>
    <Popover.Portal>
      <Popover.Content
        class="ui-filter-command-picker__popover"
        align="start"
        sideOffset={6}
        data-stacked-options={stackedOptions}
        aria-label={`Choose ${label.toLowerCase()}`}
      >
        <CommandPrimitive.Root
          class="ui-filter-command-picker__command"
          label={ariaLabel}
          data-stacked-options={stackedOptions}
          shouldFilter={false}
          loop
        >
          <div class="ui-filter-command-picker__input-wrap">
            <div class="ui-filter-command-picker__input-pill">
              <SearchIcon size={12} strokeWidth={1.75} aria-hidden="true" />
              <CommandPrimitive.Input
                bind:value={search}
                class="ui-filter-command-picker__input"
                aria-controls={commandListId}
                {placeholder}
              />
            </div>
          </div>
          <CommandPrimitive.List
            id={commandListId}
            class="ui-filter-command-picker__list"
          >
            {#if filteredOptions.length > 0}
              <CommandPrimitive.Group
                class="ui-filter-command-picker__group"
                value={label}
                forceMount
              >
                <CommandPrimitive.GroupHeading
                  class="ui-filter-command-picker__heading"
                >
                  {label}
                </CommandPrimitive.GroupHeading>
                <CommandPrimitive.GroupItems>
                  {#each filteredOptions as option (option.value)}
                    <CommandPrimitive.Item
                      class="ui-filter-command-picker__item"
                      value={option.label}
                      keywords={[
                        option.value,
                        option.label,
                        option.description ?? "",
                        ...(option.keywords ?? []),
                      ]}
                      data-checked={isOptionChecked(option.value)}
                      onSelect={() => selectOption(option.value)}
                    >
                      {#if canShowImage(option)}
                        <img
                          class:ui-filter-command-picker__image={!stackedOptions}
                          class:ui-filter-command-picker__item-avatar={stackedOptions}
                          src={option.imageUrl}
                          alt=""
                          onerror={() => markImageFailed(option.imageUrl!)}
                        />
                      {:else if option.accent}
                        <span
                          class="ui-filter-command-picker__swatch"
                          style={`--filter-accent: ${option.accent}`}
                          aria-hidden="true"
                        ></span>
                      {:else if stackedOptions}
                        <span
                          class="ui-filter-command-picker__item-avatar ui-filter-command-picker__item-avatar--fallback"
                          aria-hidden="true">{optionInitial(option)}</span
                        >
                      {/if}
                      <span class="ui-filter-command-picker__item-content">
                        <span class="ui-filter-command-picker__item-label"
                          >{option.label}</span
                        >
                        {#if option.description}
                          <span
                            class="ui-filter-command-picker__item-description"
                            >{option.description}</span
                          >
                        {/if}
                      </span>
                      <CheckIcon
                        size={12}
                        strokeWidth={1.75}
                        class="ui-filter-command-picker__check"
                        aria-hidden="true"
                      />
                    </CommandPrimitive.Item>
                  {/each}
                </CommandPrimitive.GroupItems>
              </CommandPrimitive.Group>
            {/if}
            {#if availableSearchAction}
              <CommandPrimitive.Group
                class="ui-filter-command-picker__group"
                value="search-action"
                forceMount
              >
                <CommandPrimitive.GroupHeading
                  class="ui-filter-command-picker__heading"
                >
                  {searchActionGroupLabel}
                </CommandPrimitive.GroupHeading>
                <CommandPrimitive.GroupItems>
                  <CommandPrimitive.Item
                    class="ui-filter-command-picker__item ui-filter-command-picker__item--create"
                    value={`__search_action__:${trimmedSearch}`}
                    onSelect={() => void selectSearchAction()}
                  >
                    <span class="ui-filter-command-picker__item-content">
                      <span class="ui-filter-command-picker__item-label">
                        {availableSearchAction.label}
                      </span>
                      {#if availableSearchAction.description}
                        <span
                          class="ui-filter-command-picker__item-description"
                        >
                          {availableSearchAction.description}
                        </span>
                      {/if}
                    </span>
                  </CommandPrimitive.Item>
                </CommandPrimitive.GroupItems>
              </CommandPrimitive.Group>
            {/if}
            {#if canCreateCustom}
              <CommandPrimitive.Group
                class="ui-filter-command-picker__group"
                value="create"
                forceMount
              >
                <CommandPrimitive.GroupItems>
                  <CommandPrimitive.Item
                    class="ui-filter-command-picker__item ui-filter-command-picker__item--create"
                    value={`__create__:${trimmedSearch}`}
                    onSelect={selectCustomValue}
                  >
                    <span class="ui-filter-command-picker__item-label">
                      Use "{trimmedSearch}"
                    </span>
                  </CommandPrimitive.Item>
                </CommandPrimitive.GroupItems>
              </CommandPrimitive.Group>
            {:else if filteredOptions.length === 0 && !availableSearchAction}
              <CommandPrimitive.Empty
                class="ui-filter-command-picker__empty"
                forceMount
              >
                {emptyLabel}
              </CommandPrimitive.Empty>
            {/if}
          </CommandPrimitive.List>
        </CommandPrimitive.Root>
      </Popover.Content>
    </Popover.Portal>
  </Popover.Root>

  {#if error}
    <p id={errorId} class="ui-form-control-error" role="alert">{error}</p>
  {/if}
</div>
