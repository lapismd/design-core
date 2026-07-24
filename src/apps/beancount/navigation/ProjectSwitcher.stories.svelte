<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import ProjectSwitcher from "./ProjectSwitcher.svelte";

  const { Story } = defineMeta({
    tags: ["skip-visual"],
    title: "Apps/Beancount/Navigation/Project Switcher",
    component: ProjectSwitcher,
    parameters: {
      docs: {
        description: {
          component:
            "Project navigation for a Studio-style sidebar. Supply display-ready project names and entry-file details, then handle selection or opening a new project in the application. Keep discovery, filesystem pickers, storage, and routes out of this shared component; see [Layout guidance](?path=/docs/apps-beancount-layout-guidance--docs) for shell composition.",
        },
      },
    },
  });

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
    {
      id: "archive",
      name: "Archive",
      detail: "archive-2025.beancount",
    },
  ];
</script>

<script lang="ts">
  let currentProjectId = $state("northstar");
  let addCount = $state(0);
</script>

<Story
  name="Changes the current project and opens another"
  play={async ({ canvas }) => {
    const travel = canvas.getByRole("button", { name: /Travel fund/ });
    await userEvent.click(travel);
    await expect(
      canvas.getByRole("button", { name: /Travel fund/ }),
    ).toHaveAttribute("aria-current", "page");
    await expect(canvas.getByRole("status")).toHaveTextContent("Travel fund");

    await userEvent.click(
      canvas.getByRole("button", { name: "Open another project" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Open project requested 1 time",
    );
  }}
>
  {#snippet template()}
    <div class="bc-project-switcher-story">
      <ProjectSwitcher
        {projects}
        {currentProjectId}
        onSelect={(project) => {
          currentProjectId = project.id;
        }}
        onAdd={() => {
          addCount += 1;
        }}
      />
      <output
        class="bc-project-switcher-story__announcement"
        aria-live="polite"
      >
        Current project: {projects.find(
          (project) => project.id === currentProjectId,
        )?.name}. Open project requested {addCount}
        {addCount === 1 ? "time" : "times"}.
      </output>
    </div>
  {/snippet}
</Story>

<Story name="Explains a workspace without saved projects"
>
  {#snippet template()}
    <div class="bc-project-switcher-story">
      <ProjectSwitcher
        projects={[]}
        emptyLabel="No projects have been opened yet."
        onAdd={() => {}}
      />
    </div>
  {/snippet}
</Story>

<style>
  .bc-project-switcher-story {
    width: 18rem;
    border: 1px solid var(--ui-beancount-border);
    border-radius: var(--ui-beancount-radius-panel);
    background: var(--ui-beancount-sidebar);
    color: var(--ui-beancount-sidebar-foreground);
    padding: var(--ui-beancount-space-3);
  }

  .bc-project-switcher-story__announcement {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
</style>
