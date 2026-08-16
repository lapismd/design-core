<script lang="ts">
  import { ScrollArea } from "@lapismd/design-core/shadcn/scroll-area";
  import { tick } from "svelte";
  import type { AppShellController } from "../core/app-shell-controller.svelte.js";
  import type {
    CommandPaletteItem,
    Hotkey,
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

  $effect(() => {
    if (!app.commands.paletteOpen) return;
    const current = ++request;
    void app.commands.searchPalette(query).then((next) => {
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
      <label class="ui-workspace-command-palette__search">
        <WorkspaceIcon name="search" />
        <span class="ui-workspace-command-palette__sr-only">
          Search commands
        </span>
        <input
          bind:this={input}
          bind:value={query}
          {placeholder}
          autocomplete="off"
          spellcheck="false"
        />
      </label>
      <ScrollArea
        class="ui-workspace-command-palette__list"
        role={results.length > 0 ? "listbox" : undefined}
        aria-label={results.length > 0 ? "Commands and actions" : undefined}
      >
        <div class="ui-workspace-command-palette__list-content">
          {#if results.length === 0}
            <p class="ui-workspace-command-palette__empty">No results found.</p>
          {:else}
            <p class="ui-workspace-command-palette__heading">
              Commands and actions
            </p>
            {#each results as item (`${item.providerId}:${item.id}`)}
              <button
                type="button"
                class="ui-workspace-command-palette__item"
                role="option"
                aria-selected="false"
                onclick={() => void select(item)}
              >
                {#if item.icon}
                  <WorkspaceIcon name={item.icon} />
                {/if}
                <span>
                  <strong>{item.title}</strong>
                  {#if item.subtitle}<small>{item.subtitle}</small>{/if}
                </span>
                {#if item.hotkeys?.[0]}
                  <kbd>{displayHotkey(item.hotkeys[0])}</kbd>
                {/if}
              </button>
            {/each}
          {/if}
        </div>
      </ScrollArea>
    </div>
  </div>
{/if}
