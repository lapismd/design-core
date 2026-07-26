<script lang="ts">
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import { getAppSettingsContext } from "./app-settings-context.svelte.js";

  const state = getAppSettingsContext();
  let groups = $derived.by(() => {
    const configured = new Map(
      state.controller.navigationGroups.map((group) => [group.id, group]),
    );
    const ids = [
      ...new Set(
        state.controller.sections.map(
          (section) => section.navigationGroupId ?? "options",
        ),
      ),
    ];
    return ids
      .map((id) => ({
        ...(configured.get(id) ?? {
          id,
          title: id === "options" ? "Options" : id,
        }),
        sections: state.controller.sections.filter(
          (section) => (section.navigationGroupId ?? "options") === id,
        ),
      }))
      .sort((left, right) => (left.order ?? 0) - (right.order ?? 0));
  });
</script>

<nav
  class="ui-workspace-settings__navigation"
  data-ui-part="navigation"
  aria-label="Settings"
>
  {#each groups as group (group.id)}
    <section>
      <h2>{group.title}</h2>
      <div>
        {#each group.sections as section (section.id)}
          <button
            type="button"
            data-active={state.controller.selectedSectionId === section.id}
            aria-current={state.controller.selectedSectionId === section.id
              ? "page"
              : undefined}
            onclick={() => {
              state.controller.selectSection(section.id);
              state.query = "";
            }}
          >
            <WorkspaceIcon name={section.icon ?? "settings"} />
            <span>{section.title}</span>
          </button>
        {/each}
      </div>
    </section>
  {/each}
</nav>
