<script lang="ts">
  import { onMount, tick } from "svelte";
  import AppSettingsSection from "./AppSettingsSection.svelte";
  import AppShellHotkeySettings from "./AppShellHotkeySettings.svelte";
  import AppShellPluginsSettings from "./AppShellPluginsSettings.svelte";
  import { getAppSettingsContext } from "./app-settings-context.svelte.js";

  const settingsState = getAppSettingsContext();
  let selected = $derived(
    settingsState.controller.sections.find(
      (section) => section.id === settingsState.controller.selectedSectionId,
    ) ?? settingsState.controller.sections[0],
  );
  let results = $derived(settingsState.controller.search(settingsState.query));
  let viewport = $state<HTMLElement | null>(null);
  let showScrollbar = $state(false);
  let scrollbarTop = $state(0);
  let scrollbarHeight = $state(0);

  function updateScrollbar() {
    if (!viewport) return;
    const { clientHeight, scrollHeight, scrollTop } = viewport;
    showScrollbar = scrollHeight > clientHeight;
    if (!showScrollbar) return;
    scrollbarHeight =
      Math.max(24, (clientHeight / scrollHeight) * clientHeight) + 2;
    const available = clientHeight - scrollbarHeight;
    scrollbarTop =
      scrollHeight === clientHeight
        ? 0
        : (scrollTop / (scrollHeight - clientHeight)) * available;
  }

  $effect(() => {
    settingsState.query;
    selected;
    void tick().then(updateScrollbar);
  });

  onMount(() => {
    const observer = new ResizeObserver(updateScrollbar);
    if (viewport) observer.observe(viewport);
    updateScrollbar();
    return () => observer.disconnect();
  });
</script>

<main
  class="ui-workspace-settings__content"
  data-ui-part="settings-content"
  data-app-settings-content
>
  <div
    bind:this={viewport}
    class="ui-workspace-settings__content-viewport"
    onscroll={updateScrollbar}
  >
    <div class="ui-workspace-settings__content-inner">
      {#if settingsState.query.trim()}
        <section
          class="ui-workspace-settings__search-results"
          data-testid="settings-search-results-panel"
        >
          <h1>Settings Search Results</h1>
          {#if results.length === 0}
            <p class="ui-workspace-settings__search-empty">
              No matching settings
            </p>
          {:else}
            <div class="ui-workspace-settings__search-list">
              {#each results as result (`${result.sectionId}:${result.fieldId ?? "section"}`)}
                <article
                  class="ui-workspace-settings__search-result"
                  data-ui-part="search-result"
                >
                  <button
                    type="button"
                    class="ui-workspace-settings__search-result-main"
                    onclick={() => {
                      settingsState.controller.selectSection(result.sectionId);
                      settingsState.query = "";
                    }}
                  >
                    <span class="ui-workspace-settings__search-result-title">
                      {result.title}
                    </span>
                    <span class="ui-workspace-settings__search-result-path">
                      {result.path.join(" › ")}
                    </span>
                    {#if result.description}
                      <span
                        class="ui-workspace-settings__search-result-excerpt"
                      >
                        {result.description}
                      </span>
                    {/if}
                  </button>
                </article>
              {/each}
            </div>
          {/if}
        </section>
      {:else if selected?.page}
        {@const SettingsPage = selected.page}
        <SettingsPage
          controller={settingsState.controller}
          app={settingsState.app}
          section={selected}
        />
      {:else if selected?.surface === "hotkeys" && settingsState.app}
        <AppShellHotkeySettings app={settingsState.app} />
      {:else if selected?.surface === "core-plugins" && settingsState.app}
        <AppShellPluginsSettings app={settingsState.app} />
      {:else if selected}
        <AppSettingsSection section={selected} />
      {/if}
    </div>
  </div>
  {#if showScrollbar}
    <div class="ui-workspace-settings__scrollbar" aria-hidden="true">
      <div
        style:height={`${scrollbarHeight}px`}
        style:top={`${scrollbarTop}px`}
      ></div>
    </div>
  {/if}
</main>
