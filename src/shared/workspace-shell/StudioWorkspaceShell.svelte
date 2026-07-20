<script lang="ts">
  import type { Snippet } from "svelte";
  import * as Sidebar from "@stevejuma/ui/shadcn/sidebar";

  let {
    class: className = "",
    sidebarOpen = true,
    sidebar,
    main,
    ai,
  }: {
    class?: string;
    /** When true on large screens, drop left padding so the sidebar can sit flush. */
    sidebarOpen?: boolean;
    sidebar?: Snippet;
    main?: Snippet;
    ai?: Snippet;
  } = $props();
</script>

<Sidebar.Provider
  class={className}
  data-workspace-shell="true"
  data-sidebar-open={sidebarOpen ? "true" : "false"}
>
  {@render sidebar?.()}
  <div data-ui-component="workspace-shell" data-ui-part="shell" data-slot="studio-workspace-shell">
    <main data-ui-component="workspace-shell" data-ui-part="main">
      {@render main?.()}
    </main>
  </div>
  {@render ai?.()}
</Sidebar.Provider>

<style>
  :global([data-slot="sidebar-provider"][data-workspace-shell="true"]) {
    --ui-workspace-pad: 0.5rem;
    /* Studio uses a tight 0.25rem gutter between main card and AI rail */
    --ui-workspace-ai-gap: 0.25rem;
    --ui-workspace-ai-width-expanded: 20rem;
    --ui-workspace-ai-width-collapsed: 3rem;
    --ui-workspace-radius: 0.75rem;
    --ui-workspace-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
    --ui-workspace-shadow-dark: 0 2px 8px oklch(0 0 0 / 0.5);
    --ui-workspace-toolbar-height: 3rem;
    --ai-sidebar-inline-size: 0px;

    position: relative;
    display: flex;
    width: 100%;
    height: 100%;
    min-height: 100dvh;
    max-height: 100%;
    overflow: hidden;
    background: var(--sidebar);
    color: var(--foreground);
    padding-right: var(--ai-sidebar-inline-size);
    transition: padding-right 150ms ease;
  }

  /* Inside a sized host (Storybook root / app layout), fill the host exactly. */
  :global(
    #storybook-root:has([data-workspace-shell="true"])
      [data-slot="sidebar-provider"][data-workspace-shell="true"]
  ) {
    min-height: 0;
    height: 100%;
  }

  :global([data-ui-component="workspace-shell"][data-ui-part="shell"]) {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    padding: var(--ui-workspace-pad);
  }

  @media (min-width: 1024px) {
    :global(
      [data-slot="sidebar-provider"][data-workspace-shell="true"][data-sidebar-open="true"]
        [data-ui-component="workspace-shell"][data-ui-part="shell"]
    ) {
      padding-left: 0;
    }
  }

  :global([data-ui-component="workspace-shell"][data-ui-part="main"]) {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: var(--ui-workspace-radius);
    background: var(--background);
    box-shadow: var(--ui-workspace-shadow);
  }

  :global(.dark [data-ui-component="workspace-shell"][data-ui-part="main"]) {
    box-shadow: var(--ui-workspace-shadow-dark);
  }

  @media (min-width: 1024px) {
    :global([data-slot="sidebar-provider"][data-workspace-shell="true"][data-ai-sidebar="expanded"]) {
      --ai-sidebar-inline-size: var(--ui-workspace-ai-width-expanded);
    }

    :global([data-slot="sidebar-provider"][data-workspace-shell="true"][data-ai-sidebar="collapsed"]) {
      --ai-sidebar-inline-size: var(--ui-workspace-ai-width-collapsed);
    }

    :global(
      [data-slot="sidebar-provider"][data-workspace-shell="true"][data-ai-sidebar]
        [data-ui-component="workspace-shell"][data-ui-part="shell"]
    ) {
      padding-right: var(--ui-workspace-ai-gap);
    }
  }
</style>
