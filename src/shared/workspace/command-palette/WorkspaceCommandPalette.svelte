<script lang="ts">
  import * as CommandView from "@lapismd/design-core/shadcn/command-view";
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
      <CommandView.Root shouldFilter={false} label="Search commands">
        <CommandView.Input
          bind:ref={input}
          bind:value={query}
          {placeholder}
          autocomplete="off"
          spellcheck="false"
        >
          {#snippet start()}
            <WorkspaceIcon name="search" />
          {/snippet}
        </CommandView.Input>
        <CommandView.List aria-label="Commands and actions">
          <CommandView.Empty>No results found.</CommandView.Empty>
          {#if results.length > 0}
            <CommandView.Group heading="Commands and actions">
              {#each results as item (`${item.providerId}:${item.id}`)}
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
                  {/if}
                </CommandView.Item>
              {/each}
            </CommandView.Group>
          {/if}
        </CommandView.List>
      </CommandView.Root>
    </div>
  </div>
{/if}
