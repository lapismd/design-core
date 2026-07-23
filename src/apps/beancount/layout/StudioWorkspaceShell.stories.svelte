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
  }}
>
  {#snippet template()}
    <div class="border-border h-[42rem] overflow-hidden rounded-xl border">
      <StudioWorkspaceShell
        pageTitle={activeWorkspaceView}
        height="container"
        projectName={currentProject?.name ?? "No project"}
        {projects}
        {currentProjectId}
        {sidebarTabs}
        {activeSidebarTab}
        onActiveSidebarTabChange={(tab) => {
          activeSidebarTab = tab;
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
            <nav class="grid gap-1 px-2" aria-label="Ledger workspace">
              {#each ["Overview", "Transactions", "Accounts"] as item}
                <Button
                  type="button"
                  variant={activeWorkspaceView === item ? "secondary" : "ghost"}
                  class="justify-start"
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
            <div class="text-muted-foreground px-2 text-sm">
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
              class="border-border bg-muted/40 text-muted-foreground flex items-center gap-2 border-b px-3 py-2 text-xs"
              role="status"
            >
              <span class="bg-primary size-2 animate-pulse rounded-full"></span>
              Syncing {currentProject?.name}…
            </div>
          {/if}
        {/snippet}

        <section
          class="h-full overflow-auto p-5"
          aria-label={`${activeWorkspaceView} content`}
        >
          <p class="text-muted-foreground text-sm">
            {currentProject?.detail}
          </p>
          <h1 class="mt-1 text-xl font-semibold">{activeWorkspaceView}</h1>
          <div class="border-border mt-5 rounded-lg border p-4 text-sm">
            This is application-owned route content.
          </div>
        </section>
      </StudioWorkspaceShell>
      <output class="sr-only" aria-live="polite">
        Sidebar: {sidebarTabs.find((tab) => tab.id === activeSidebarTab)
          ?.label}. Project: {currentProject?.name}. Open project requested {addRequests}
        {addRequests === 1 ? "time" : "times"}.
      </output>
    </div>
  {/snippet}
</Story>

<Story name="Explains an empty project workspace">
  {#snippet template()}
    <div class="border-border h-[42rem] overflow-hidden rounded-xl border">
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
        <div
          class="text-muted-foreground grid h-full place-items-center p-5 text-sm"
        >
          Open a ledger project to start working.
        </div>
      </StudioWorkspaceShell>
    </div>
  {/snippet}
</Story>
