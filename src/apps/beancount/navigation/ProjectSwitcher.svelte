<script lang="ts">
  import FolderOpen from "@lucide/svelte/icons/folder-open";
  import Plus from "@lucide/svelte/icons/plus";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import { Separator } from "@stevejuma/ui/shadcn/separator";

  export type ProjectSwitcherItem = {
    /** Stable application-owned identifier used for the selected project. */
    id: string;
    name: string;
    /** Usually an entry file or other compact project detail. */
    detail?: string;
    disabled?: boolean;
  };

  /**
   * Router- and filesystem-independent project navigation. Applications keep
   * project discovery, folder pickers, persistence, and routes outside this
   * display component.
   */
  let {
    projects,
    currentProjectId,
    ariaLabel = "Project switcher",
    emptyLabel = "No saved projects are available.",
    addLabel = "Open another project",
    addPending = false,
    onSelect,
    onAdd,
  }: {
    projects: readonly ProjectSwitcherItem[];
    currentProjectId?: string;
    ariaLabel?: string;
    emptyLabel?: string;
    addLabel?: string;
    addPending?: boolean;
    onSelect?: (project: ProjectSwitcherItem) => void;
    onAdd?: () => void;
  } = $props();

  const currentProject = $derived(
    projects.find((project) => project.id === currentProjectId),
  );
  const otherProjects = $derived(
    projects.filter((project) => project.id !== currentProjectId),
  );
</script>

<nav class="grid gap-3" aria-label={ariaLabel}>
  <section class="grid gap-1.5">
    <p class="text-muted-foreground px-2 text-xs font-medium uppercase">
      Current project
    </p>
    {#if currentProject}
      {@render ProjectButton({
        project: currentProject,
        current: true,
        onSelect,
      })}
    {:else}
      <p class="text-muted-foreground px-2 text-sm">{emptyLabel}</p>
    {/if}
  </section>

  {#if otherProjects.length}
    <section class="grid gap-1" aria-label="Other projects">
      {#each otherProjects as project (project.id)}
        {@render ProjectButton({ project, onSelect })}
      {/each}
    </section>
  {/if}

  <Separator />
  <Button
    type="button"
    variant="outline"
    size="sm"
    class="w-full justify-start"
    disabled={addPending || !onAdd}
    onclick={() => onAdd?.()}
  >
    <Plus data-icon="inline-start" />
    {addPending ? "Opening folder…" : addLabel}
  </Button>
</nav>

{#snippet ProjectButton({
  project,
  current = false,
  onSelect,
}: {
  project: ProjectSwitcherItem;
  current?: boolean;
  onSelect?: (project: ProjectSwitcherItem) => void;
})}
  <Button
    type="button"
    variant="ghost"
    size="sm"
    class={current
      ? "border-sidebar-border bg-background text-sidebar-accent-foreground hover:bg-background hover:text-sidebar-accent-foreground h-auto w-full justify-start border py-2 shadow-sm"
      : "h-auto w-full justify-start py-2"}
    title={project.name}
    aria-current={current ? "page" : undefined}
    disabled={project.disabled || !onSelect}
    onclick={() => onSelect?.(project)}
  >
    <FolderOpen data-icon="inline-start" />
    <span class="min-w-0 text-left">
      <span class="block truncate">{project.name}</span>
      {#if project.detail}
        <span class="text-muted-foreground block truncate text-xs">
          {project.detail}
        </span>
      {/if}
    </span>
  </Button>
{/snippet}
