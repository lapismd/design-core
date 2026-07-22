<script lang="ts">
  import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
  import PanelTopOpenIcon from "@lucide/svelte/icons/panel-top-open";
  import PictureInPicture2Icon from "@lucide/svelte/icons/picture-in-picture-2";
  import SparklesIcon from "@lucide/svelte/icons/sparkles";
  import type { Snippet } from "svelte";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import type { AiChatPlacement, AiChatVisibility } from "./types.js";

  let {
    placement,
    visibility,
    label = "AI chat",
    onExpand,
    onPopOut = () => {},
    children,
  }: {
    placement: AiChatPlacement;
    visibility: AiChatVisibility;
    label?: string;
    onExpand: () => void;
    onPopOut?: () => void;
    children?: Snippet;
  } = $props();

  $effect(() => {
    const shell = document.querySelector<HTMLElement>(
      '[data-slot="sidebar-provider"]',
    );
    const sidebarState = placement === "right" ? visibility : null;
    if (!shell || !sidebarState) return;

    shell.dataset.aiSidebar = sidebarState;
    return () => {
      if (shell.dataset.aiSidebar === sidebarState)
        delete shell.dataset.aiSidebar;
    };
  });
</script>

<div
  data-ui-component="ai-chat-dock"
  data-ui-part="root"
  data-placement={placement}
  data-visibility={visibility}
>
  <div data-ui-component="ai-chat-dock" data-ui-part="frame">
    {#if visibility === "expanded"}
      {@render children?.()}
    {:else if visibility === "collapsed"}
      {#if placement === "right"}
        <div data-ui-component="ai-chat-dock" data-ui-part="collapsed-rail">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            data-ui-part="icon-button"
            aria-label="Expand AI sidebar"
            title="Expand AI sidebar"
            onclick={onExpand}
          >
            <ChevronLeftIcon />
          </Button>
          <button
            type="button"
            data-ui-component="ai-chat-dock"
            data-ui-part="vertical-label"
            title={`Expand ${label}`}
            aria-label={`Expand AI sidebar for ${label}`}
            onclick={onExpand}
          >
            <span>{label}</span>
          </button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            data-ui-part="icon-button"
            aria-label="Pop AI chat out"
            title="Pop AI chat out"
            onclick={onPopOut}
          >
            <PictureInPicture2Icon />
          </Button>
        </div>
      {:else}
        <div data-ui-component="ai-chat-dock" data-ui-part="fab-wrap">
          <Button
            variant="outline"
            size="icon-sm"
            data-ui-part="fab"
            aria-label="Open AI chat"
            onclick={onExpand}
          >
            <SparklesIcon />
          </Button>
        </div>
      {/if}
    {:else}
      <Button
        variant="outline"
        size="icon-sm"
        data-ui-part="fab"
        data-round="true"
        aria-label="Show AI chat"
        title="Show AI chat"
        onclick={onExpand}
      >
        <PanelTopOpenIcon />
      </Button>
    {/if}
  </div>
</div>

<style>
  :global([data-ui-component="ai-chat-dock"][data-ui-part="root"]) {
    --ui-ai-width-expanded: var(--ui-workspace-ai-width-expanded, 20rem);
    --ui-ai-width-collapsed: var(--ui-workspace-ai-width-collapsed, 3rem);
    --ui-ai-z-index: 70;
    pointer-events: none;
    z-index: var(--ui-ai-z-index);
    display: flex;
  }

  /* Pin to the shell provider so the rail is end-to-end (top→bottom). */
  :global(
      [data-ui-component="ai-chat-dock"][data-ui-part="root"][data-placement="right"]
    ) {
    position: absolute;
    inset: 0 0 0 auto;
    height: 100%;
  }

  :global(
      [data-ui-component="ai-chat-dock"][data-ui-part="root"][data-placement="floating"][data-visibility="expanded"]
    ) {
    position: absolute;
    right: 0;
    bottom: 0.75rem;
    left: 0;
    justify-content: center;
  }

  :global(
      [data-ui-component="ai-chat-dock"][data-ui-part="root"][data-placement="floating"][data-visibility="collapsed"]
    ),
  :global(
      [data-ui-component="ai-chat-dock"][data-ui-part="root"][data-placement="floating"][data-visibility="hidden"]
    ) {
    position: absolute;
    right: 0.75rem;
    bottom: 0.75rem;
    justify-content: flex-end;
  }

  :global([data-ui-component="ai-chat-dock"][data-ui-part="frame"]) {
    pointer-events: auto;
  }

  :global(
      [data-ui-component="ai-chat-dock"][data-ui-part="root"][data-placement="right"]
        > [data-ui-part="frame"]
    ) {
    height: 100%;
  }

  :global(
      [data-ui-component="ai-chat-dock"][data-ui-part="root"][data-visibility="expanded"][data-placement="right"]
        > [data-ui-part="frame"]
    ) {
    width: var(--ui-ai-width-expanded);
    max-width: calc(100vw - 3rem);
  }

  :global(
      [data-ui-component="ai-chat-dock"][data-ui-part="root"][data-visibility="collapsed"][data-placement="right"]
        > [data-ui-part="frame"]
    ) {
    width: var(--ui-ai-width-collapsed);
  }

  :global(
      [data-ui-component="ai-chat-dock"][data-ui-part="root"][data-visibility="expanded"][data-placement="floating"]
        > [data-ui-part="frame"]
    ) {
    width: 100%;
    max-width: 680px;
  }

  :global([data-ui-component="ai-chat-dock"][data-ui-part="collapsed-rail"]) {
    display: flex;
    width: var(--ui-ai-width-collapsed);
    height: 100%;
    min-height: 0;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    background: var(--sidebar);
    padding: 0.5rem 0.375rem;
  }

  :global([data-ui-component="ai-chat-dock"] [data-ui-part="icon-button"] svg) {
    width: 1rem;
    height: 1rem;
  }

  :global([data-ui-component="ai-chat-dock"][data-ui-part="vertical-label"]) {
    display: flex;
    min-height: 0;
    flex: 1 1 auto;
    align-items: center;
    justify-content: center;
    border: 1px solid transparent;
    border-radius: 0.375rem;
    padding: 0.5rem 0.25rem;
    color: var(--sidebar-foreground);
  }

  :global(
      [data-ui-component="ai-chat-dock"][data-ui-part="vertical-label"]:hover
    ) {
    border-color: var(--sidebar-border);
    background: var(--sidebar-accent);
    color: var(--sidebar-accent-foreground);
  }

  :global(
      [data-ui-component="ai-chat-dock"][data-ui-part="vertical-label"] span
    ) {
    max-height: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 12px;
    font-weight: 600;
    writing-mode: vertical-rl;
  }

  :global([data-ui-component="ai-chat-dock"][data-ui-part="fab-wrap"]) {
    display: flex;
    justify-content: center;
  }

  :global([data-ui-component="ai-chat-dock"] [data-ui-part="fab"]) {
    background: color-mix(in oklab, var(--background) 90%, transparent);
    box-shadow:
      0 10px 15px -3px rgb(0 0 0 / 0.1),
      0 4px 6px -4px rgb(0 0 0 / 0.1);
    backdrop-filter: blur(8px);
  }

  :global(
      [data-ui-component="ai-chat-dock"] [data-ui-part="fab"][data-round="true"]
    ) {
    border-radius: 9999px;
  }

  :global([data-ui-component="ai-chat-dock"] [data-ui-part="fab"] svg) {
    width: 1rem;
    height: 1rem;
  }
</style>
