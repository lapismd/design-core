<script lang="ts">
  import AppSettingsSection from "./AppSettingsSection.svelte";
  import AppShellHotkeySettings from "./AppShellHotkeySettings.svelte";
  import AppShellPluginsSettings from "./AppShellPluginsSettings.svelte";
  import { getAppSettingsContext } from "./app-settings-context.svelte.js";

  const state = getAppSettingsContext();
  let selected = $derived(
    state.controller.sections.find(
      (section) => section.id === state.controller.selectedSectionId,
    ) ?? state.controller.sections[0],
  );
  let results = $derived(state.controller.search(state.query));
</script>

<main
  class="ui-workspace-settings__content"
  data-ui-part="settings-content"
  data-app-settings-content
>
  <div class="ui-workspace-settings__content-inner">
    {#if state.query.trim()}
      <section
        class="ui-workspace-settings__search-results"
        data-testid="settings-search-results-panel"
      >
        <h1>Settings search results</h1>
        {#each results as result (`${result.sectionId}:${result.fieldId ?? "section"}`)}
          <button
            type="button"
            onclick={() => {
              state.controller.selectSection(result.sectionId);
              state.query = "";
            }}
          >
            <strong>{result.title}</strong>
            <span>{result.path.join(" › ")}</span>
            {#if result.description}<small>{result.description}</small>{/if}
          </button>
        {:else}
          <p>No matching settings</p>
        {/each}
      </section>
    {:else if selected?.page}
      {@const SettingsPage = selected.page}
      <SettingsPage
        controller={state.controller}
        app={state.app}
        section={selected}
      />
    {:else if selected?.surface === "hotkeys" && state.app}
      <AppShellHotkeySettings app={state.app} />
    {:else if selected?.surface === "core-plugins" && state.app}
      <AppShellPluginsSettings app={state.app} />
    {:else if selected}
      <AppSettingsSection section={selected} />
    {/if}
  </div>
</main>
