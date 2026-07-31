<script module lang="ts">
  let nextComposerInputId = 0;
</script>

<script lang="ts">
  import * as Command from "@stevejuma/ui/shadcn/command";
  import type { HTMLAttributes } from "svelte/elements";
  import {
    createComposerTokens,
    createPasteAsToken,
    captureComposerSelection,
    insertComposerText,
    restoreComposerSelection,
    serializeComposerValue,
    type PasteAsTokenController,
  } from "../composer-tokens.js";
  import {
    createComposerHistory,
    shouldSubmitComposerKey,
  } from "../composer-behavior.js";
  import {
    createTriggerSearch,
    findActiveComposerTrigger,
    type TriggerSearchState,
  } from "../trigger-menu.js";
  import { useComposerContext } from "../context.svelte.js";
  import type {
    ComposerInputHandle,
    ComposerToken,
    ComposerTrigger,
    ComposerTriggerItem,
  } from "../types.js";
  import "../chat.css";

  let {
    ref = $bindable(null),
    editableRef = $bindable(null),
    handle = $bindable(null),
    value = $bindable(""),
    placeholder = "Ask the assistant…",
    label = "Message",
    disabled = false,
    maxRows = 8,
    triggers = [],
    debounceMs = 150,
    hasHistory = true,
    pasteAsToken,
    pasteThreshold = 200,
    onChange,
    onPaste,
    onFiles,
    onSubmit,
    onKeyDown,
    ...restProps
  }: Omit<HTMLAttributes<HTMLDivElement>, "onchange"> & {
    ref?: HTMLDivElement | null;
    editableRef?: HTMLDivElement | null;
    handle?: ComposerInputHandle | null;
    value?: string;
    placeholder?: string;
    label?: string;
    disabled?: boolean;
    maxRows?: number;
    triggers?: ComposerTrigger[];
    debounceMs?: number;
    hasHistory?: boolean;
    pasteAsToken?: PasteAsTokenController | false;
    pasteThreshold?: number;
    onChange?: (value: string) => void;
    onPaste?: (event: ClipboardEvent, text: string) => boolean | void;
    onFiles?: (files: File[], source: "paste" | "drop") => void;
    onSubmit?: (value: string) => void;
    onKeyDown?: (event: KeyboardEvent) => void;
  } = $props();

  const context = useComposerContext();
  const menuId = `ai-chat-trigger-menu-${++nextComposerInputId}`;
  const history = createComposerHistory();
  let triggerSearch = createTriggerSearch();
  let searchState = $state<TriggerSearchState>({
    query: "",
    items: [],
    loading: false,
    error: null,
  });
  let activeTrigger = $state<ComposerTrigger | null>(null);
  let highlightedIndex = $state(0);
  let triggerNode: Text | null = null;
  let triggerStart = -1;
  let menuLeft = $state(0);
  let menuTop = $state(0);
  let composing = false;
  let syncingDom = false;
  const triggerMenuOpen = $derived(
    activeTrigger != null &&
      !(searchState.loading && searchState.items.length === 0),
  );

  function emitChange(): void {
    if (!editableRef) return;
    const next = serializeComposerValue(editableRef);
    value = next;
    context?.setValue(next);
    onChange?.(next);
  }

  const tokens = createComposerTokens({
    getEditable: () => editableRef,
    onChange(next) {
      value = next;
      context?.setValue(next);
      onChange?.(next);
    },
  });

  function focus(): void {
    editableRef?.focus();
    if (editableRef && typeof window !== "undefined") {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        const range = document.createRange();
        range.selectNodeContents(editableRef);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
  }

  function insertText(text: string): void {
    if (!editableRef) return;
    focus();
    insertComposerText(editableRef, text);
    emitChange();
    updateTriggerMenu();
  }

  const inputHandle: ComposerInputHandle = {
    focus,
    getValue: () => (editableRef ? serializeComposerValue(editableRef) : value),
    insertText,
    insertToken: (token) => tokens.insertToken(token),
    expandToken: (id) => tokens.expandToken(id),
  };

  $effect(() => {
    handle = inputHandle;
    context?.setInputHandle(inputHandle);
    return () => {
      triggerSearch.cancel();
      tokens.cleanup();
      context?.setInputHandle(null);
      if (handle === inputHandle) handle = null;
    };
  });

  $effect(() => {
    const next = createTriggerSearch(debounceMs);
    triggerSearch.cancel();
    triggerSearch = next;
    return () => next.cancel();
  });

  $effect(() => {
    if (!editableRef || syncingDom) return;
    const current = serializeComposerValue(editableRef);
    if (current === value) return;
    const selection = captureComposerSelection(editableRef);
    syncingDom = true;
    editableRef.textContent = value;
    restoreComposerSelection(editableRef, selection);
    syncingDom = false;
  });

  function resetTriggerMenu(): void {
    triggerSearch.cancel();
    activeTrigger = null;
    highlightedIndex = 0;
    triggerNode = null;
    triggerStart = -1;
    searchState = {
      query: "",
      items: [],
      loading: false,
      error: null,
    };
  }

  function updateMenuPosition(range: Range): void {
    const rect =
      typeof range.getBoundingClientRect === "function"
        ? range.getBoundingClientRect()
        : null;
    const fallback = editableRef?.getBoundingClientRect();
    menuLeft = rect?.left || fallback?.left || 0;
    menuTop = (rect?.bottom || fallback?.bottom || 0) + 6;
  }

  function updateTriggerMenu(): void {
    if (
      triggers.length === 0 ||
      typeof window === "undefined" ||
      !editableRef
    ) {
      resetTriggerMenu();
      return;
    }
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !selection.isCollapsed) {
      resetTriggerMenu();
      return;
    }
    const range = selection.getRangeAt(0);
    if (
      !editableRef.contains(range.startContainer) ||
      range.startContainer.nodeType !== 3
    ) {
      resetTriggerMenu();
      return;
    }
    const node = range.startContainer as Text;
    const before = node.data.slice(0, range.startOffset);
    const match = findActiveComposerTrigger(before, triggers);
    if (!match) {
      resetTriggerMenu();
      return;
    }

    activeTrigger = match.trigger;
    triggerNode = node;
    triggerStart = match.start;
    highlightedIndex = 0;
    updateMenuPosition(range.cloneRange());
    triggerSearch.search(match.trigger, match.query, (state) => {
      // Keep prior suggestions while a search is in flight so the menu never
      // flashes a loading state (Astryx only paints results once ready).
      if (state.loading) {
        searchState = { ...state, items: searchState.items };
        return;
      }
      searchState = state;
      highlightedIndex = Math.min(
        highlightedIndex,
        Math.max(0, state.items.length - 1),
      );
    });
  }

  function insertTriggerSelection(item: ComposerTriggerItem): void {
    if (!activeTrigger || !triggerNode || typeof window === "undefined") {
      return;
    }
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const caret = range.startOffset;
    triggerNode.data =
      triggerNode.data.slice(0, triggerStart) + triggerNode.data.slice(caret);
    range.setStart(triggerNode, triggerStart);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);

    const result = activeTrigger.onSelect(item);
    resetTriggerMenu();
    if (typeof result === "string") {
      insertText(`${result} `);
    } else {
      tokens.insertToken(result);
    }
    emitChange();
  }

  function selectAllText(): void {
    if (!editableRef || typeof window === "undefined") return;
    const range = document.createRange();
    range.selectNodeContents(editableRef);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  function replaceWithHistory(next: string): void {
    if (!editableRef) return;
    editableRef.textContent = next;
    value = next;
    onChange?.(next);
    context?.setValue(next);
    focus();
    selectAllText();
  }

  function submit(): void {
    const submitted = inputHandle.getValue().trim();
    if (!submitted || disabled) return;
    if (hasHistory) history.record(submitted);
    if (onSubmit) onSubmit(submitted);
    else context?.submit();
    value = "";
    context?.setValue("");
    if (editableRef) editableRef.textContent = "";
    onChange?.("");
    resetTriggerMenu();
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (activeTrigger) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const direction = event.key === "ArrowDown" ? 1 : -1;
        highlightedIndex =
          (highlightedIndex + direction + searchState.items.length) %
          Math.max(1, searchState.items.length);
        return;
      }
      if (event.key === "Enter" && searchState.items[highlightedIndex]) {
        event.preventDefault();
        insertTriggerSelection(searchState.items[highlightedIndex]);
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        resetTriggerMenu();
        return;
      }
    }

    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (tokens.handleDeletion(event)) return;

    if (
      shouldSubmitComposerKey({
        key: event.key,
        shiftKey: event.shiftKey,
        isComposing: composing || event.isComposing,
        keyCode: event.keyCode,
      })
    ) {
      event.preventDefault();
      submit();
      return;
    }

    if (
      hasHistory &&
      !event.shiftKey &&
      (event.key === "ArrowUp" || event.key === "ArrowDown")
    ) {
      const next =
        event.key === "ArrowUp"
          ? history.previous(inputHandle.getValue())
          : history.next();
      if (next != null) {
        event.preventDefault();
        replaceWithHistory(next);
      }
    }
  }

  function handlePaste(event: ClipboardEvent): void {
    if (!editableRef) return;
    tokens.protectPasteBoundary();
    const files = Array.from(event.clipboardData?.files ?? []);
    if (files.length > 0) {
      event.preventDefault();
      onFiles?.(files, "paste");
      return;
    }
    const text = event.clipboardData?.getData("text/plain") ?? "";
    event.preventDefault();
    if (onPaste?.(event, text)) {
      emitChange();
      return;
    }
    const pasteController =
      pasteAsToken === false
        ? null
        : (pasteAsToken ??
          createPasteAsToken({
            input: () => inputHandle,
            threshold: pasteThreshold,
          }));
    if (pasteController?.insert(text)) {
      emitChange();
      return;
    }
    insertText(text);
  }

  function handleDrop(event: DragEvent): void {
    const files = Array.from(event.dataTransfer?.files ?? []);
    if (files.length === 0) return;
    event.preventDefault();
    onFiles?.(files, "drop");
  }
</script>

<div
  bind:this={ref}
  {...restProps}
  data-ui-component="ai-chat-composer-input"
  data-ui-part="root"
  data-empty={value.length === 0}
  data-disabled={disabled}
>
  {#if value.length === 0}
    <span data-ui-part="placeholder" aria-hidden="true">{placeholder}</span>
  {/if}
  <div
    bind:this={editableRef}
    data-ui-part="editable"
    contenteditable={!disabled}
    role="combobox"
    aria-label={label}
    aria-autocomplete={triggers.length > 0 ? "list" : "none"}
    aria-haspopup={triggers.length > 0 ? "listbox" : undefined}
    aria-controls={triggerMenuOpen ? menuId : undefined}
    aria-expanded={triggerMenuOpen}
    aria-activedescendant={triggerMenuOpen &&
    searchState.items[highlightedIndex]
      ? `${menuId}-option-${highlightedIndex}`
      : undefined}
    aria-disabled={disabled}
    tabindex={disabled ? -1 : 0}
    spellcheck="true"
    style:max-height={`${maxRows * 1.375}rem`}
    oninput={() => {
      emitChange();
      updateTriggerMenu();
    }}
    onkeydown={handleKeydown}
    onkeyup={() => updateTriggerMenu()}
    onpaste={handlePaste}
    ondrop={handleDrop}
    ondragover={(event) => {
      if ((event.dataTransfer?.files.length ?? 0) > 0) event.preventDefault();
    }}
    oncompositionstart={() => {
      composing = true;
    }}
    oncompositionend={() => {
      composing = false;
      emitChange();
      updateTriggerMenu();
    }}
  ></div>

  {#if triggerMenuOpen && activeTrigger}
    <div
      data-ui-part="trigger-menu"
      role="presentation"
      style:left={`${menuLeft}px`}
      style:top={`${menuTop}px`}
      onmousedown={(event) => event.preventDefault()}
    >
      <Command.Root>
        <Command.List
          id={menuId}
          aria-label={activeTrigger.menuLabel ?? "Suggestions"}
        >
          {#if searchState.items.length === 0}
            <Command.Empty>
              {activeTrigger.emptySearchResultsText ?? "No results found."}
            </Command.Empty>
          {:else}
            <Command.Group heading={activeTrigger.menuLabel ?? "Suggestions"}>
              {#each searchState.items as item, index (item.id)}
                <Command.Item
                  id={`${menuId}-option-${index}`}
                  value={item.id}
                  data-highlighted={index === highlightedIndex}
                  onSelect={() => insertTriggerSelection(item)}
                  onpointermove={() => {
                    highlightedIndex = index;
                  }}
                >
                  <span data-ui-part="trigger-item-label">{item.label}</span>
                  {#if item.description}
                    <span data-ui-part="trigger-item-description">
                      {item.description}
                    </span>
                  {/if}
                </Command.Item>
              {/each}
            </Command.Group>
          {/if}
        </Command.List>
      </Command.Root>
    </div>
  {/if}
</div>
