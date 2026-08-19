<script lang="ts">
  import * as CommandView from "@lapismd/design-core/shadcn/command-view";
  import { tick } from "svelte";
  import type { AppShellController } from "../core/app-shell-controller.svelte.js";
  import {
    groupPaletteItems,
    type CommandPaletteItem,
    type Hotkey,
  } from "../core/command-manager.svelte.js";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import "./WorkspaceCommandPalette.css";

  let {
    app,
    placeholder = "Type a command or search...",
  }: {
    app: AppShellController;
    placeholder?: string;
  } = $props();

  let query = $state("");
  let results = $state<CommandPaletteItem[]>([]);
  let input = $state<HTMLInputElement | null>(null);
  let request = 0;
  let tabs = $derived(app.commands.listPaletteTabs());
  let groups = $derived(groupPaletteItems(results));

  $effect(() => {
    if (!app.commands.paletteOpen) {
      query = "";
      results = [];
      return;
    }
    const current = ++request;
    const tab = app.commands.paletteTab;
    void app.commands.searchPalette(query, { tab }).then((next) => {
      if (current === request) results = next;
    });
  });

  $effect(() => {
    if (!app.commands.paletteOpen) return;
    void tick().then(() => input?.focus());
  });

  function displayHotkey(hotkey: Hotkey): string {
    return [...hotkey.modifiers, hotkey.key.toLocaleUpperCase()]
      .join("+")
      .replace("Mod", "⌘");
  }

  function close(): void {
    app.commands.closePalette();
    query = "";
  }

  function setTab(tab: string): void {
    app.commands.paletteTab = tab;
  }

  function cycleTab(delta: number): void {
    if (tabs.length === 0) return;
    const index = Math.max(
      0,
      tabs.findIndex((tab) => tab.id === app.commands.paletteTab),
    );
    const next = tabs[(index + delta + tabs.length) % tabs.length];
    if (next) setTab(next.id);
  }

  function onSearchKeydown(event: KeyboardEvent): void {
    if (
      event.key === "ArrowRight" ||
      (event.shiftKey && event.key === "ArrowRight")
    ) {
      event.preventDefault();
      cycleTab(1);
      return;
    }
    if (
      event.key === "ArrowLeft" ||
      (event.shiftKey && event.key === "ArrowLeft")
    ) {
      event.preventDefault();
      cycleTab(-1);
    }
  }

  async function select(item: CommandPaletteItem): Promise<void> {
    await item.run();
    close();
  }
</script>

{#if app.commands.paletteOpen}
  <div
    class="ui-workspace-command-palette"
    data-ui-component="workspace-command-palette"
    data-ui-part="overlay"
    role="presentation"
    onclick={(event) => {
      if (event.currentTarget === event.target) close();
    }}
  >
    <div
      class="ui-workspace-command-palette__dialog"
      role="dialog"
      tabindex="-1"
      aria-modal="true"
      aria-label="Command Palette"
      onkeydown={(event) => {
        if (event.key === "Escape") close();
      }}
    >
      <CommandView.Root shouldFilter={false} label="Search commands">
        <CommandView.Input
          bind:ref={input}
          bind:value={query}
          {placeholder}
          autocomplete="off"
          spellcheck="false"
          onkeydown={onSearchKeydown}
        >
          {#snippet start()}
            <WorkspaceIcon name="search" />
          {/snippet}
        </CommandView.Input>
        {#if tabs.length > 1}
          <CommandView.Filters
            {tabs}
            value={app.commands.paletteTab}
            onValueChange={setTab}
            label="Command palette filters"
          />
        {/if}
        <CommandView.List aria-label="Commands and actions">
          <CommandView.Empty>No results found.</CommandView.Empty>
          {#each groups as group, index (`${group.heading}:${index}`)}
            <CommandView.Group heading={group.heading || undefined}>
              {#each group.items as item (`${item.providerId}:${item.id}`)}
                <CommandView.Item
                  value={`${item.providerId}:${item.id}`}
                  onSelect={() => void select(item)}
                >
                  {#if item.icon}
                    <CommandView.ItemIcon>
                      <WorkspaceIcon name={item.icon} />
                    </CommandView.ItemIcon>
                  {/if}
                  <CommandView.ItemLabel>{item.title}</CommandView.ItemLabel>
                  {#if item.subtitle}
                    <CommandView.ItemDescription>
                      {item.subtitle}
                    </CommandView.ItemDescription>
                  {/if}
                  {#if item.hotkeys?.[0]}
                    <CommandView.Shortcut>
                      {displayHotkey(item.hotkeys[0])}
                    </CommandView.Shortcut>
                  {:else if item.trailing}
                    <span
                      data-ui-component="command-view"
                      data-ui-part="trailing"
                    >
                      {item.trailing}
                    </span>
                  {/if}
                </CommandView.Item>
              {/each}
            </CommandView.Group>
          {/each}
        </CommandView.List>
        <CommandView.Footer>
          <span>↑↓ Select</span>
          <span>↵ Open</span>
          {#if tabs.length > 1}
            <span>→ or ⇧→ Change Filter</span>
          {/if}
        </CommandView.Footer>
      </CommandView.Root>
    </div>
  </div>
{/if}
