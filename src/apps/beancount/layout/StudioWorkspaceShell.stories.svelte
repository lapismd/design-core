<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import StudioWorkspaceShell from "./StudioWorkspaceShell.svelte";

  const { Story } = defineMeta({
    title: "Apps/Beancount/Layout/Studio Workspace Shell",
    component: StudioWorkspaceShell,
    parameters: {
      docs: {
        description: {
          component:
            "The complete reusable Studio frame: a collapsible project/sidebar rail, application-owned sidebar modes, the shared workspace header, and slots for route content. Supply plain display models and callbacks only; filesystem discovery, persisted preferences, routing, syncing, and page data stay in the application adapter. See [Layout guidance](?path=/docs/apps-beancount-layout-guidance--docs) for shell composition.",
        },
      },
    },
  });
</script>

<script lang="ts">
  import FolderOpen from "@lucide/svelte/icons/folder-open";
  import LayoutPanelLeft from "@lucide/svelte/icons/layout-panel-left";
  import Search from "@lucide/svelte/icons/search";
  import { Button } from "@stevejuma/ui/shadcn/button";

  const projects = [
    {
      id: "northstar",
      name: "Northstar household",
      detail: "personal-2026.beancount",
    },
    {
      id: "travel",
      name: "Travel fund",
      detail: "travel-2026.beancount",
    },
  ];
  const sidebarTabs = [
    { id: "projects", label: "Projects", icon: FolderOpen },
    { id: "workspace", label: "Workspace", icon: LayoutPanelLeft },
    { id: "search", label: "Search", icon: Search },
  ];

  let activeSidebarTab = $state("workspace");
  let currentProjectId = $state("northstar");
  let activeWorkspaceView = $state("Transactions");
  let syncInProgress = $state(false);
  let addRequests = $state(0);
  let sidebarWidth = $state(256);

  const currentProject = $derived(
    projects.find((project) => project.id === currentProjectId),
  );
</script>

<Story
  name="Switches sidebar modes and renders application content"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Search" }));
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Sidebar: Search",
    );

    await userEvent.click(canvas.getByRole("button", { name: "Projects" }));
    await userEvent.click(canvas.getByRole("button", { name: /Travel fund/ }));
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Project: Travel fund",
    );

    await userEvent.click(canvas.getByRole("button", { name: "Sync ledger" }));
    await expect(canvas.getByText(/Syncing Travel fund/)).toBeVisible();

    const resizeSlider = canvas.getByRole("slider", {
      name: "Resize sidebar",
    });
    resizeSlider.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(resizeSlider).toHaveAttribute("aria-valuenow", "272");
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Sidebar width: 272px",
    );
  }}
>
  {#snippet template()}
    <div class="bc-studio-workspace-shell-story">
      <StudioWorkspaceShell
        pageTitle={activeWorkspaceView}
        height="container"
        projectName={currentProject?.name ?? "No project"}
        {sidebarWidth}
        {projects}
        {currentProjectId}
        {sidebarTabs}
        {activeSidebarTab}
        onActiveSidebarTabChange={(tab) => {
          activeSidebarTab = tab;
        }}
        onSidebarWidthChange={(width) => {
          sidebarWidth = width;
        }}
        onProjectSelect={(project) => {
          currentProjectId = project.id;
        }}
        onAddProject={() => {
          addRequests += 1;
        }}
      >
        {#snippet sidebarTabContent(tab)}
          {#if tab === "workspace"}
            <nav
              class="bc-studio-workspace-shell-story__workspace-navigation"
              aria-label="Ledger workspace"
            >
              {#each ["Overview", "Transactions", "Accounts"] as item}
                <Button
                  type="button"
                  variant={activeWorkspaceView === item ? "secondary" : "ghost"}
                  class="bc-studio-workspace-shell-story__workspace-item"
                  aria-current={activeWorkspaceView === item
                    ? "page"
                    : undefined}
                  onclick={() => {
                    activeWorkspaceView = item;
                  }}
                >
                  {item}
                </Button>
              {/each}
            </nav>
          {:else if tab === "search"}
            <div class="bc-studio-workspace-shell-story__sidebar-copy">
              Search filters and results are supplied by the application.
            </div>
          {/if}
        {/snippet}

        {#snippet headerActions()}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onclick={() => {
              syncInProgress = !syncInProgress;
            }}
          >
            {syncInProgress ? "Pause sync" : "Sync ledger"}
          </Button>
          <Button type="button" size="sm">New transaction</Button>
        {/snippet}

        {#snippet status()}
          {#if syncInProgress}
            <div
              class="bc-studio-workspace-shell-story__sync-status"
              role="status"
            >
              <span class="bc-studio-workspace-shell-story__sync-indicator"
              ></span>
              Syncing {currentProject?.name}…
            </div>
          {/if}
        {/snippet}

        <section
          class="bc-studio-workspace-shell-story__content"
          aria-label={`${activeWorkspaceView} content`}
        >
          <p class="bc-studio-workspace-shell-story__detail">
            {currentProject?.detail}
          </p>
          <h1 class="bc-studio-workspace-shell-story__title">
            {activeWorkspaceView}
          </h1>
          <div class="bc-studio-workspace-shell-story__route-content">
            This is application-owned route content.
          </div>
        </section>
      </StudioWorkspaceShell>
      <output
        class="bc-studio-workspace-shell-story__announcement"
        aria-live="polite"
      >
        Sidebar: {sidebarTabs.find((tab) => tab.id === activeSidebarTab)
          ?.label}. Project: {currentProject?.name}. Sidebar width: {sidebarWidth}px.
        Open project requested {addRequests}
        {addRequests === 1 ? "time" : "times"}.
      </output>
    </div>
  {/snippet}
</Story>

<Story name="Explains an empty project workspace">
  {#snippet template()}
    <div class="bc-studio-workspace-shell-story">
      <StudioWorkspaceShell
        pageTitle="Welcome"
        height="container"
        projects={[]}
        currentProjectId={undefined}
        projectName="No project"
        sidebarTabs={[{ id: "projects", label: "Projects", icon: FolderOpen }]}
        activeSidebarTab="projects"
        emptyProjectLabel="No projects have been opened yet."
        onAddProject={() => {}}
      >
        <div class="bc-studio-workspace-shell-story__empty">
          Open a ledger project to start working.
        </div>
      </StudioWorkspaceShell>
    </div>
  {/snippet}
</Story>

<style>
  .bc-studio-workspace-shell-story {
    height: 42rem;
    overflow: hidden;
    border: 1px solid var(--ui-beancount-border);
    border-radius: var(--ui-beancount-radius-panel);
  }

  .bc-studio-workspace-shell-story__workspace-navigation {
    display: grid;
    gap: var(--ui-beancount-space-1);
    padding-inline: var(--ui-beancount-space-2);
  }

  :global(.bc-studio-workspace-shell-story__workspace-item) {
    justify-content: flex-start;
  }

  .bc-studio-workspace-shell-story__sidebar-copy {
    padding-inline: var(--ui-beancount-space-2);
    color: var(--ui-beancount-muted-foreground);
    font-size: var(--text-sm);
  }

  .bc-studio-workspace-shell-story__sync-status {
    display: flex;
    align-items: center;
    gap: var(--ui-beancount-space-2);
    border-bottom: 1px solid var(--ui-beancount-border);
    background: color-mix(
      in srgb,
      var(--ui-beancount-surface-muted) 40%,
      transparent
    );
    color: var(--ui-beancount-muted-foreground);
    padding: var(--ui-beancount-space-2) var(--ui-beancount-space-3);
    font-size: var(--text-xs);
  }

  .bc-studio-workspace-shell-story__sync-indicator {
    width: var(--ui-beancount-space-2);
    height: var(--ui-beancount-space-2);
    border-radius: 999px;
    background: var(--ui-beancount-accent);
    animation: bc-studio-workspace-shell-story-pulse 1s ease-in-out infinite
      alternate;
  }

  .bc-studio-workspace-shell-story__content {
    height: 100%;
    overflow: auto;
    padding: var(--ui-beancount-space-5);
  }

  .bc-studio-workspace-shell-story__detail,
  .bc-studio-workspace-shell-story__title {
    margin: 0;
  }

  .bc-studio-workspace-shell-story__detail {
    color: var(--ui-beancount-muted-foreground);
    font-size: var(--text-sm);
  }

  .bc-studio-workspace-shell-story__title {
    margin-block-start: var(--ui-beancount-space-1);
    font-size: var(--text-xl);
    font-weight: var(--font-weight-semibold);
  }

  .bc-studio-workspace-shell-story__route-content {
    margin-block-start: var(--ui-beancount-space-5);
    border: 1px solid var(--ui-beancount-border);
    border-radius: var(--radius-lg);
    padding: var(--ui-beancount-space-4);
    font-size: var(--text-sm);
  }

  .bc-studio-workspace-shell-story__announcement {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }

  .bc-studio-workspace-shell-story__empty {
    display: grid;
    height: 100%;
    color: var(--ui-beancount-muted-foreground);
    padding: var(--ui-beancount-space-5);
    font-size: var(--text-sm);
    place-items: center;
  }

  @keyframes bc-studio-workspace-shell-story-pulse {
    to {
      opacity: 0.4;
    }
  }
</style>
