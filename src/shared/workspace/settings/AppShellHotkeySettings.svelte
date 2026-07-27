<script lang="ts">
  import AlertTriangle from "@lucide/svelte/icons/alert-triangle";
  import Check from "@lucide/svelte/icons/check";
  import Filter from "@lucide/svelte/icons/filter";
  import Keyboard from "@lucide/svelte/icons/keyboard";
  import PlusCircle from "@lucide/svelte/icons/plus-circle";
  import RotateCcw from "@lucide/svelte/icons/rotate-ccw";
  import Search from "@lucide/svelte/icons/search";
  import X from "@lucide/svelte/icons/x";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import { Input } from "@stevejuma/ui/shadcn/input";
  import { onMount, tick } from "svelte";
  import type { AppShellController } from "../core/app-shell-controller.svelte.js";
  import {
    getHotkeyId,
    type Hotkey,
    type HotkeyModifier,
  } from "../core/command-manager.svelte.js";

  let { app }: { app: AppShellController } = $props();
  let query = $state("");
  let assignedOnly = $state(false);
  let hotkeyFilters = $state<Hotkey[]>([]);
  let capturingSearch = $state(false);
  let searchCaptureDraft = $state<Hotkey[]>([]);
  let capturingCommandId = $state<string | null>(null);
  let draftHotkey = $state<Hotkey | null>(null);
  let revision = $state(0);
  let rootEl = $state<HTMLElement | null>(null);
  let searchCaptureButton = $state<HTMLButtonElement | null>(null);
  let searchCaptureCommitTimer: ReturnType<typeof setTimeout> | null = null;

  const modifierLabels: Record<string, string> = {
    Mod: "⌘",
    Meta: "⌘",
    Alt: "⌥",
    Shift: "⇧",
    Ctrl: "⌃",
    Enter: "↵",
    Escape: "Esc",
    ArrowUp: "↑",
    ArrowDown: "↓",
    ArrowLeft: "←",
    ArrowRight: "→",
    Backspace: "⌫",
    Delete: "⌦",
    Tab: "⇥",
    Space: "Space",
    " ": "Space",
  };
  const modifierKeys = new Set(["Control", "Alt", "Shift", "Meta", "OS"]);

  let assignments = $derived.by(() => {
    revision;
    return app.commands
      .getHotkeyAssignments()
      .sort((left, right) =>
        left.command.title.localeCompare(right.command.title),
      );
  });
  let conflicts = $derived.by(() => {
    revision;
    return app.commands.getConflicts();
  });
  let filteredAssignments = $derived.by(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return assignments.filter((assignment) => {
      if (assignedOnly && assignment.hotkeys.length === 0) return false;
      if (
        hotkeyFilters.length &&
        !assignment.hotkeys.some((hotkey) =>
          hotkeyFilters.some(
            (filter) => getHotkeyId(filter) === getHotkeyId(hotkey),
          ),
        )
      ) {
        return false;
      }
      return (
        !normalized ||
        `${assignment.command.title} ${assignment.command.id} ${assignment.command.category ?? ""}`
          .toLocaleLowerCase()
          .includes(normalized)
      );
    });
  });

  onMount(() => {
    const changeRef = app.commands.on("change", () => (revision += 1));
    const hotkeysRef = app.commands.on("hotkeys-change", () => (revision += 1));
    window.addEventListener("keydown", handleWindowKeydown, true);
    return () => {
      if (searchCaptureCommitTimer) clearTimeout(searchCaptureCommitTimer);
      window.removeEventListener("keydown", handleWindowKeydown, true);
      app.commands.offref(changeRef);
      app.commands.offref(hotkeysRef);
    };
  });

  function eventToHotkey(event: KeyboardEvent): Hotkey | null {
    if (modifierKeys.has(event.key)) return null;
    const modifiers: HotkeyModifier[] = [];
    if (event.metaKey || event.ctrlKey) modifiers.push("Mod");
    if (event.altKey) modifiers.push("Alt");
    if (event.shiftKey) modifiers.push("Shift");
    const key =
      event.key === " "
        ? "Space"
        : event.key.length === 1
          ? event.key.toLocaleUpperCase()
          : event.key;
    return { modifiers, key };
  }

  function formatHotkey(hotkey: Hotkey): string {
    const modifiers = hotkey.modifiers
      .map((modifier) => modifierLabels[modifier] ?? modifier)
      .join("");
    const key =
      hotkey.key.length === 1 ? hotkey.key.toLocaleUpperCase() : hotkey.key;
    return `${modifiers}${modifierLabels[key] ?? key}`;
  }

  function consume(event: KeyboardEvent) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  }

  async function startCommandCapture(commandId: string) {
    cancelSearchCapture();
    capturingCommandId = commandId;
    draftHotkey = null;
    await tick();
    rootEl
      ?.querySelector<HTMLButtonElement>(
        `[data-hotkey-capture-command="${CSS.escape(commandId)}"]`,
      )
      ?.focus();
  }

  function cancelCommandCapture() {
    capturingCommandId = null;
    draftHotkey = null;
  }

  function handleCommandKeydown(event: KeyboardEvent, commandId: string) {
    consume(event);
    if (event.key === "Escape") {
      cancelCommandCapture();
      return;
    }
    if (event.key === "Enter" && draftHotkey) {
      app.commands.addHotkey(commandId, draftHotkey);
      cancelCommandCapture();
      return;
    }
    draftHotkey = eventToHotkey(event);
  }

  async function startSearchCapture() {
    cancelCommandCapture();
    capturingSearch = true;
    searchCaptureDraft = [];
    await tick();
    searchCaptureButton?.focus();
  }

  function cancelSearchCapture() {
    if (searchCaptureCommitTimer) clearTimeout(searchCaptureCommitTimer);
    searchCaptureCommitTimer = null;
    capturingSearch = false;
    searchCaptureDraft = [];
  }

  function commitSearchCapture() {
    const existing = new Set(hotkeyFilters.map(getHotkeyId));
    hotkeyFilters = [
      ...hotkeyFilters,
      ...searchCaptureDraft.filter((hotkey) => {
        const id = getHotkeyId(hotkey);
        if (existing.has(id)) return false;
        existing.add(id);
        return true;
      }),
    ];
    cancelSearchCapture();
  }

  function handleSearchKeydown(event: KeyboardEvent) {
    if (!capturingSearch) return;
    consume(event);
    if (event.key === "Escape") {
      cancelSearchCapture();
      return;
    }
    if (event.repeat) return;
    const hotkey = eventToHotkey(event);
    if (!hotkey) return;
    if (
      !searchCaptureDraft.some(
        (candidate) => getHotkeyId(candidate) === getHotkeyId(hotkey),
      )
    ) {
      searchCaptureDraft = [...searchCaptureDraft, hotkey];
    }
    if (searchCaptureCommitTimer) clearTimeout(searchCaptureCommitTimer);
    searchCaptureCommitTimer = setTimeout(commitSearchCapture, 650);
  }

  function handleWindowKeydown(event: KeyboardEvent) {
    if (capturingSearch) handleSearchKeydown(event);
    else if (capturingCommandId) {
      handleCommandKeydown(event, capturingCommandId);
    }
  }

  function conflictsFor(commandId: string) {
    return conflicts
      .filter((conflict) => conflict.commandIds.includes(commandId))
      .flatMap((conflict) =>
        conflict.commandIds.filter((id) => id !== commandId),
      );
  }
</script>

<section bind:this={rootEl} class="ui-workspace-hotkeys">
  <div class="ui-workspace-hotkeys__header">
    <div class="ui-workspace-hotkeys__summary">
      <h1>Search hotkeys</h1>
      <p>Showing {filteredAssignments.length} hotkeys.</p>
    </div>
    <div class="ui-workspace-hotkeys__filters">
      <Button
        variant={assignedOnly ? "secondary" : "ghost"}
        size="icon"
        aria-label="Show assigned hotkeys only"
        aria-pressed={assignedOnly}
        data-testid="hotkeys-assigned-filter"
        onclick={() => (assignedOnly = !assignedOnly)}
      >
        <Filter />
      </Button>
      <div class="ui-workspace-hotkeys__search">
        <Search aria-hidden="true" />
        <Input
          placeholder="Filter..."
          bind:value={query}
          data-testid="hotkeys-filter-input"
        />
        <div class="ui-workspace-hotkeys__search-actions">
          {#if query}
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Clear hotkey search text"
              data-testid="hotkeys-clear-text-filter"
              onclick={() => (query = "")}
            >
              <X />
            </Button>
          {/if}
          <Button
            bind:ref={searchCaptureButton}
            variant={capturingSearch
              ? "default"
              : hotkeyFilters.length
                ? "secondary"
                : "ghost"}
            size={capturingSearch ? "sm" : "icon-sm"}
            aria-label={capturingSearch
              ? "Press hotkey filter. Press Escape to exit."
              : "Search by hotkey"}
            aria-pressed={capturingSearch}
            data-testid="hotkeys-keyboard-filter"
            onkeydown={handleSearchKeydown}
            onclick={() => !capturingSearch && startSearchCapture()}
          >
            {#if capturingSearch}
              {searchCaptureDraft.map(formatHotkey).join(", ") ||
                "Press hotkey"}
            {:else}
              <Keyboard />
            {/if}
          </Button>
        </div>
      </div>
      {#each hotkeyFilters as filter (getHotkeyId(filter))}
        <Button
          variant="ghost"
          size="sm"
          data-testid="hotkeys-clear-keyboard-filter"
          onclick={() =>
            (hotkeyFilters = hotkeyFilters.filter(
              (candidate) => getHotkeyId(candidate) !== getHotkeyId(filter),
            ))}
        >
          {formatHotkey(filter)}
          <X />
        </Button>
      {/each}
    </div>
  </div>

  <div class="ui-workspace-hotkeys__list">
    {#each filteredAssignments as assignment (assignment.commandId)}
      <article data-testid="hotkey-row" data-command-id={assignment.commandId}>
        <div class="ui-workspace-hotkeys__command">
          <strong>{assignment.command.title}</strong>
          {#if conflictsFor(assignment.commandId).length}
            <span
              class="ui-workspace-hotkeys__conflict"
              data-testid="hotkey-conflict"
            >
              <AlertTriangle />
              Conflicts with {conflictsFor(assignment.commandId).join(", ")}
            </span>
          {/if}
        </div>
        <div class="ui-workspace-hotkeys__bindings">
          {#if assignment.hotkeys.length === 0 && capturingCommandId !== assignment.commandId}
            <span
              class="ui-workspace-hotkeys__blank"
              data-testid="hotkey-blank"
            >
              Blank
            </span>
          {/if}
          {#each assignment.hotkeys as hotkey (getHotkeyId(hotkey))}
            <span class="ui-workspace-hotkeys__chip" data-testid="hotkey-chip">
              {formatHotkey(hotkey)}
              <button
                type="button"
                aria-label={`Remove ${formatHotkey(hotkey)} from ${assignment.command.title}`}
                data-testid="hotkey-remove"
                onclick={() =>
                  app.commands.removeHotkey(assignment.commandId, hotkey)}
              >
                <X />
              </button>
            </span>
          {/each}
          {#if capturingCommandId === assignment.commandId}
            <Button
              class="ui-workspace-hotkeys__capture"
              data-testid="hotkey-capture"
              data-hotkey-capture-command={assignment.commandId}
              onkeydown={(event) =>
                handleCommandKeydown(event, assignment.commandId)}
            >
              {draftHotkey ? formatHotkey(draftHotkey) : "Press hotkey..."}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Save hotkey"
              disabled={!draftHotkey}
              data-testid="hotkey-save"
              onclick={() => {
                if (draftHotkey) {
                  app.commands.addHotkey(assignment.commandId, draftHotkey);
                  cancelCommandCapture();
                }
              }}
            >
              <Check />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Cancel hotkey capture"
              data-testid="hotkey-cancel"
              onclick={cancelCommandCapture}
            >
              <X />
            </Button>
          {:else}
            {#if assignment.customized}
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Reset ${assignment.command.title} hotkeys`}
                data-testid="hotkey-reset"
                onclick={() => app.commands.resetHotkeys(assignment.commandId)}
              >
                <RotateCcw />
              </Button>
            {/if}
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Add hotkey for ${assignment.command.title}`}
              data-testid="hotkey-add"
              onclick={() => startCommandCapture(assignment.commandId)}
            >
              <PlusCircle />
            </Button>
          {/if}
        </div>
      </article>
    {/each}
  </div>
</section>
