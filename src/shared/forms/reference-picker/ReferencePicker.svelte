<script lang="ts">
  import "./ReferencePicker.css";
  import { Command as CommandPrimitive } from "bits-ui";
  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
  import PlusIcon from "@lucide/svelte/icons/plus";
  import SearchIcon from "@lucide/svelte/icons/search";
  import XIcon from "@lucide/svelte/icons/x";
  import type { Snippet } from "svelte";
  import ReadOnlyFormGroup from "../read-only-form/ReadOnlyFormGroup.svelte";
  import ReadOnlyFormList from "../read-only-form/ReadOnlyFormList.svelte";
  import ReadOnlyFormRow from "../read-only-form/ReadOnlyFormRow.svelte";
  import {
    duplicateReferenceCount,
    normalizeReferenceList,
    resolveReferenceTarget,
    type ReferenceIndex,
    type ReferenceSelectedSlotProps,
    type ReferenceTarget,
  } from "../core/reference-utils";

  let {
    refs = [],
    referenceIndex,
    excludedRefs = [],
    addOpen = false,
    addButtonClass = "",
    addLabel = "Add Reference",
    addHeading = "Reference",
    searchPlaceholder = "Search references...",
    emptyLabel = "No available references found.",
    unresolvedLabel = "Unresolved reference",
    unresolvedDescription = "Keep this reference or remove it after updating refs.",
    duplicateMessage = "Duplicate references are hidden until each ref appears only once.",
    onAddOpenChange = () => {},
    onChange,
    onSearchCreate,
    selected,
    searchOption,
    searchCreate,
    preview,
  }: {
    refs?: string[];
    referenceIndex: ReferenceIndex;
    excludedRefs?: string[];
    addOpen?: boolean;
    addButtonClass?: string;
    addLabel?: string;
    addHeading?: string;
    searchPlaceholder?: string;
    emptyLabel?: string;
    unresolvedLabel?: string;
    unresolvedDescription?: string;
    duplicateMessage?: string;
    onAddOpenChange?: (open: boolean) => void;
    onChange: (refs: string[]) => void;
    onSearchCreate?: (query: string) => string | null | void;
    selected?: Snippet<[ReferenceSelectedSlotProps]>;
    searchOption?: Snippet<[ReferenceTarget, { onSelect: () => void }]>;
    searchCreate?: Snippet<[string]>;
    preview?: Snippet<[ReferenceTarget]>;
  } = $props();

  let expandedRefs = $state<string[]>([]);
  let localRefs = $state<string[]>([]);
  let query = $state("");

  $effect(() => {
    localRefs = normalizeReferenceList(refs);
  });

  function selectedRefs() {
    return localRefs;
  }

  function duplicateCount(ref: string) {
    return duplicateReferenceCount(referenceIndex, ref);
  }

  function availableReferences() {
    const selected = new Set(selectedRefs());
    const excluded = new Set(normalizeReferenceList(excludedRefs));
    const normalizedQuery = query.trim().toLowerCase();
    const byRef = new Map<string, ReferenceTarget>();
    for (const reference of referenceIndex.references) {
      if (
        reference.duplicate ||
        reference.selectable === false ||
        selected.has(reference.ref) ||
        excluded.has(reference.ref)
      )
        continue;
      const searchable = [
        reference.ref,
        reference.path,
        reference.type,
        reference.label,
        reference.excerpt,
        reference.optionNotes ?? "",
      ]
        .join(" ")
        .toLowerCase();
      if (normalizedQuery && !searchable.includes(normalizedQuery)) continue;
      if (!byRef.has(reference.ref)) byRef.set(reference.ref, reference);
    }
    return [...byRef.values()].sort((left, right) =>
      left.ref.localeCompare(right.ref),
    );
  }

  function addReference(ref: string) {
    if (duplicateCount(ref) > 0) return;
    if (selectedRefs().includes(ref)) return;
    if (!resolveReferenceTarget(referenceIndex, ref)) return;
    const nextRefs = [...selectedRefs(), ref];
    localRefs = nextRefs;
    onChange(nextRefs);
    query = "";
    onAddOpenChange(false);
  }

  function removeReference(ref: string) {
    const nextRefs = selectedRefs().filter((item) => item !== ref);
    localRefs = nextRefs;
    expandedRefs = expandedRefs.filter((item) => item !== ref);
    onChange(nextRefs);
  }

  function isExpanded(ref: string) {
    return expandedRefs.includes(ref);
  }

  function toggleExpanded(ref: string) {
    expandedRefs = isExpanded(ref)
      ? expandedRefs.filter((item) => item !== ref)
      : [...expandedRefs, ref];
  }

  function hasPreview(reference: ReferenceTarget | null) {
    return Boolean(
      reference &&
        (preview ||
          (reference.preview?.items && reference.preview.items.length > 0)),
    );
  }

  function handleButtonClick(event: MouseEvent, action: () => void) {
    event.stopPropagation();
    action();
  }

  function canCreateFromSearch() {
    return Boolean(query.trim() && onSearchCreate);
  }

  function addCreatedReference(ref: string) {
    if (duplicateCount(ref) > 0) return;
    if (selectedRefs().includes(ref)) return;
    const nextRefs = [...selectedRefs(), ref];
    localRefs = nextRefs;
    onChange(nextRefs);
    query = "";
    onAddOpenChange(false);
  }

  function handleSearchCreate() {
    const trimmed = query.trim();
    if (!trimmed || !onSearchCreate) return;
    const createdRef = onSearchCreate(trimmed);
    if (createdRef) {
      addCreatedReference(createdRef);
      return;
    }
    query = "";
    onAddOpenChange(false);
  }
</script>

<div class="cv-reference-picker">
  {#each selectedRefs() as ref (ref)}
    {@const resolved = resolveReferenceTarget(referenceIndex, ref)}
    {@const duplicates = duplicateCount(ref)}
    {@const expanded = isExpanded(ref)}
    <div class="cv-reference-row-group">
      <div
        class="cv-reference-row"
        class:cv-reference-row--custom={Boolean(selected)}
      >
        {#if hasPreview(resolved)}
          <button
            type="button"
            class="cv-reference-expand"
            aria-label={expanded
              ? `Collapse ${ref} context`
              : `Expand ${ref} context`}
            aria-expanded={expanded}
            onclick={(event) =>
              handleButtonClick(event, () => toggleExpanded(ref))}
          >
            <ChevronDownIcon class={expanded ? "" : "is-collapsed"} />
          </button>
        {/if}
        <div class="cv-reference-row-copy">
          {#if selected}
            {@render selected({
              ref,
              reference: resolved,
              duplicates,
              expanded,
              onToggleExpand: () => toggleExpanded(ref),
            })}
          {:else}
            <div class="cv-reference-title-row">
              {#if resolved}
                {#if resolved.href}
                  <a
                    class="cv-reference-title-link"
                    href={resolved.href}
                    title={ref}
                  >
                    {resolved.label}
                  </a>
                {:else}
                  <span class="cv-reference-title-link" title={ref}>
                    {resolved.label}
                  </span>
                {/if}
              {:else if duplicates > 0}
                <span class="cv-reference-ref">{ref}</span>
                <span class="cv-reference-error">
                  Duplicate reference ({duplicates} matches)
                </span>
              {:else}
                <span class="cv-reference-ref">{ref}</span>
                <span class="cv-reference-error">{unresolvedLabel}</span>
              {/if}
            </div>
            {#if resolved}
              <p class="cv-reference-path">{resolved.path}</p>
              {#if resolved.excerpt}
                <p class="cv-reference-excerpt">{resolved.excerpt}</p>
              {/if}
            {:else}
              <p class="cv-reference-help">{unresolvedDescription}</p>
            {/if}
          {/if}
        </div>
        <button
          type="button"
          class="cv-reference-remove"
          aria-label={`Remove ${ref}`}
          onclick={(event) =>
            handleButtonClick(event, () => removeReference(ref))}
        >
          <XIcon />
        </button>
      </div>
      {#if resolved && expanded && hasPreview(resolved)}
        <div class="cv-reference-preview">
          {#if preview}
            {@render preview(resolved)}
          {:else if resolved.preview}
            <ReadOnlyFormGroup
              title={resolved.preview.title ?? resolved.label}
              meta={resolved.preview.meta ?? resolved.path}
            >
              {#each resolved.preview.items as item, itemIndex (`${item.kind}-${item.label}-${itemIndex}`)}
                {#if item.kind === "list"}
                  <ReadOnlyFormList
                    label={item.label}
                    items={item.items ?? []}
                    highlightedIndexes={item.highlightedIndexes ?? []}
                  />
                {:else}
                  <ReadOnlyFormRow
                    label={item.label}
                    value={item.value ?? ""}
                    highlighted={item.highlighted ?? false}
                  />
                {/if}
              {/each}
            </ReadOnlyFormGroup>
          {/if}
        </div>
      {/if}
    </div>
  {/each}

  {#if addOpen}
    {@const references = availableReferences()}
    <section class="cv-reference-add">
      <div class="cv-reference-add-header">
        <p>{addHeading}</p>
        <button
          type="button"
          class="cv-reference-add-close"
          aria-label="Cancel adding reference"
          onclick={(event) =>
            handleButtonClick(event, () => onAddOpenChange(false))}
        >
          <XIcon />
        </button>
      </div>
      <CommandPrimitive.Root
        class="cv-reference-command"
        label={`${addHeading} search`}
        shouldFilter={false}
        loop
      >
        <div class="cv-reference-command-input-row">
          <SearchIcon />
          <CommandPrimitive.Input
            bind:value={query}
            class="cv-reference-command-input"
            placeholder={searchPlaceholder}
            aria-controls="cv-reference-command-list"
          />
        </div>
        <CommandPrimitive.List
          id="cv-reference-command-list"
          class="cv-reference-command-list"
        >
          {#if references.length > 0}
            <CommandPrimitive.Group
              class="cv-reference-command-group"
              value="references"
              forceMount
            >
              <CommandPrimitive.GroupItems>
                {#each references as reference (reference.ref)}
                  <CommandPrimitive.Item
                    class={[
                      "cv-reference-command-item",
                      searchOption && "cv-reference-command-item--custom",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    value={reference.ref}
                    keywords={[
                      reference.path,
                      reference.type,
                      reference.label,
                      reference.excerpt,
                      reference.optionNotes ?? "",
                    ]}
                    onSelect={() => addReference(reference.ref)}
                  >
                    {#if searchOption}
                      {@render searchOption(reference, {
                        onSelect: () => addReference(reference.ref),
                      })}
                    {:else}
                      <span class="cv-reference-option-title">
                        <span class="cv-reference-ref">{reference.ref}</span>
                        <span class="cv-reference-label">{reference.label}</span
                        >
                      </span>
                      <span class="cv-reference-path">{reference.path}</span>
                      {#if reference.excerpt}
                        <span class="cv-reference-excerpt">
                          {reference.excerpt}
                        </span>
                      {/if}
                    {/if}
                  </CommandPrimitive.Item>
                {/each}
              </CommandPrimitive.GroupItems>
            </CommandPrimitive.Group>
          {:else if canCreateFromSearch()}
            <CommandPrimitive.Group
              class="cv-reference-command-group"
              value="create"
              forceMount
            >
              <CommandPrimitive.GroupItems>
                <CommandPrimitive.Item
                  class={[
                    "cv-reference-command-item",
                    searchCreate && "cv-reference-command-item--custom",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  value={`__create__:${query.trim()}`}
                  onSelect={handleSearchCreate}
                >
                  {#if searchCreate}
                    {@render searchCreate(query.trim())}
                  {:else}
                    <span class="cv-reference-create-label">
                      Create "{query.trim()}"
                    </span>
                  {/if}
                </CommandPrimitive.Item>
              </CommandPrimitive.GroupItems>
            </CommandPrimitive.Group>
          {:else}
            <CommandPrimitive.Empty class="cv-reference-empty" forceMount>
              {emptyLabel}
            </CommandPrimitive.Empty>
          {/if}
        </CommandPrimitive.List>
      </CommandPrimitive.Root>
      {#if Object.keys(referenceIndex.duplicates).length > 0}
        <p class="cv-reference-duplicates">{duplicateMessage}</p>
      {/if}
    </section>
  {:else}
    <button
      type="button"
      class={`cv-reference-add-button ${addButtonClass}`}
      onclick={(event) => handleButtonClick(event, () => onAddOpenChange(true))}
    >
      <PlusIcon />
      {addLabel}
    </button>
  {/if}
</div>
