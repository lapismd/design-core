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

<nav class="bc-project-switcher" aria-label={ariaLabel}>
  <section class="bc-project-switcher__current">
    <p class="bc-project-switcher__heading">Current project</p>
    {#if currentProject}
      {@render ProjectButton({
        project: currentProject,
        current: true,
        onSelect,
      })}
    {:else}
      <p class="bc-project-switcher__empty">{emptyLabel}</p>
    {/if}
  </section>

  {#if otherProjects.length}
    <section class="bc-project-switcher__others" aria-label="Other projects">
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
    class="bc-project-switcher__add"
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
      ? "bc-project-switcher__project bc-project-switcher__project--current"
      : "bc-project-switcher__project"}
    title={project.name}
    aria-current={current ? "page" : undefined}
    disabled={project.disabled || !onSelect}
    onclick={() => onSelect?.(project)}
  >
    <FolderOpen data-icon="inline-start" />
    <span class="bc-project-switcher__project-copy">
      <span class="bc-project-switcher__project-name">{project.name}</span>
      {#if project.detail}
        <span class="bc-project-switcher__project-detail">
          {project.detail}
        </span>
      {/if}
    </span>
  </Button>
{/snippet}

<style>
  .bc-project-switcher,
  .bc-project-switcher__current,
  .bc-project-switcher__others {
    display: grid;
  }

  .bc-project-switcher {
    gap: var(--ui-beancount-space-3);
  }

  .bc-project-switcher__current {
    gap: calc(var(--ui-beancount-space-1) * 1.5);
  }

  .bc-project-switcher__others {
    gap: var(--ui-beancount-space-1);
  }

  .bc-project-switcher__heading,
  .bc-project-switcher__empty {
    margin: 0;
    padding-inline: var(--ui-beancount-space-2);
    color: var(--ui-beancount-muted-foreground);
  }

  .bc-project-switcher__heading {
    font-size: var(--text-xs);
    font-weight: var(--font-weight-medium);
    text-transform: uppercase;
  }

  .bc-project-switcher__empty {
    font-size: var(--text-sm);
  }

  :global(.bc-project-switcher__add),
  :global(.bc-project-switcher__project) {
    width: 100%;
    height: auto;
    justify-content: flex-start;
    padding-block: var(--ui-beancount-space-2);
  }

  :global(.bc-project-switcher__project--current),
  :global(.bc-project-switcher__project--current:hover) {
    border-color: var(--ui-beancount-border);
    background: var(--ui-beancount-surface);
    color: var(--ui-beancount-sidebar-accent-foreground);
    box-shadow: var(--ui-beancount-shadow-panel);
  }

  .bc-project-switcher__project-copy {
    min-width: 0;
    text-align: start;
  }

  .bc-project-switcher__project-name,
  .bc-project-switcher__project-detail {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .bc-project-switcher__project-detail {
    color: var(--ui-beancount-muted-foreground);
    font-size: var(--text-xs);
  }
</style>
