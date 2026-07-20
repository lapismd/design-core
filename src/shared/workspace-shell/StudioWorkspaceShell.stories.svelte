<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import StudioWorkspaceShell from "./StudioWorkspaceShell.svelte";

  const { Story } = defineMeta({
    title: "Workspace Shell/Studio Workspace Shell",
    component: StudioWorkspaceShell,
    parameters: {
      docs: {
        description: {
          component:
            "Prop-driven three-region shell: left sidebar, main body, and optional AI rail. Styles are component-scoped (no Tailwind utilities).",
        },
      },
      layout: "fullscreen",
    },
  });
</script>

<Story name="Empty regions" tags={["skip-visual"]}>
  {#snippet template()}
    <StudioWorkspaceShell>
      {#snippet sidebar()}
        <aside data-ui-component="workspace-shell-story" data-ui-part="sidebar">
          <p data-ui-part="title">Sidebar</p>
          <p data-ui-part="copy">Left rail placeholder</p>
        </aside>
      {/snippet}
      {#snippet main()}
        <div data-ui-component="workspace-shell-story" data-ui-part="main">
          <p data-ui-part="copy">Main body placeholder</p>
        </div>
      {/snippet}
      {#snippet ai()}
        <aside data-ui-component="workspace-shell-story" data-ui-part="ai">
          <span>AI</span>
        </aside>
      {/snippet}
    </StudioWorkspaceShell>
  {/snippet}
</Story>

<style>
  :global([data-ui-component="workspace-shell-story"][data-ui-part="sidebar"]) {
    display: flex;
    width: 16rem;
    flex-direction: column;
    padding: 1rem;
    color: var(--sidebar-foreground);
  }

  :global([data-ui-component="workspace-shell-story"][data-ui-part="main"]) {
    display: flex;
    flex: 1 1 auto;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
  }

  :global([data-ui-component="workspace-shell-story"][data-ui-part="ai"]) {
    display: flex;
    width: 3rem;
    flex-direction: column;
    align-items: center;
    padding: 0.5rem;
    color: var(--sidebar-foreground);
  }

  :global([data-ui-component="workspace-shell-story"][data-ui-part="ai"] span) {
    font-size: 0.75rem;
    writing-mode: vertical-rl;
  }

  :global([data-ui-component="workspace-shell-story"] [data-ui-part="title"]) {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 600;
  }

  :global([data-ui-component="workspace-shell-story"] [data-ui-part="copy"]) {
    margin: 0.5rem 0 0;
    font-size: 0.75rem;
    color: var(--muted-foreground);
  }
</style>
