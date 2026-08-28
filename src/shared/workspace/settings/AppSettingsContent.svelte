<script lang="ts">
  import { onMount, tick } from "svelte";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import AppSettingsSection from "./AppSettingsSection.svelte";
  import AppShellHotkeySettings from "./AppShellHotkeySettings.svelte";
  import AppShellPluginsSettings from "./AppShellPluginsSettings.svelte";
  import { getAppSettingsContext } from "./app-settings-context.svelte.js";
  import { SETTINGS_SEARCH_HIT_MS } from "./search-hit.js";
  import type { WorkspaceSettingsSearchResult } from "./types.js";

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
  let wasSearching = false;
  let highlightTimeout: ReturnType<typeof setTimeout> | null = null;

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

  $effect(() => {
    const searching = settingsState.query.trim().length > 0;
    if (searching && !wasSearching) {
      void tick().then(() => {
        viewport?.scrollTo({ top: 0 });
        updateScrollbar();
      });
    }
    wasSearching = searching;
  });

  function resultSelector(result: WorkspaceSettingsSearchResult): string {
    const id = CSS.escape(result.fieldId ?? result.sectionId);
    return result.fieldId
      ? `[data-setting-id="${id}"]`
      : `[data-settings-schema-section-id="${id}"]`;
  }

  function markSearchTarget(element: HTMLElement) {
    if (highlightTimeout) clearTimeout(highlightTimeout);
    element.classList.add("ui-workspace-settings__search-hit");
    highlightTimeout = setTimeout(() => {
      element.classList.remove("ui-workspace-settings__search-hit");
      highlightTimeout = null;
    }, SETTINGS_SEARCH_HIT_MS);
  }

  $effect(() => {
    const fieldId = settingsState.controller.revealFieldId;
    if (!fieldId) return;
    void revealPendingField(fieldId);
  });

  async function revealPendingField(fieldId: string): Promise<void> {
    await openSearchResult({
      sectionId: settingsState.controller.selectedSectionId,
      fieldId,
      title: "",
      path: [],
      score: 0,
    });
    settingsState.controller.revealFieldId = null;
  }

  async function openSearchResult(result: WorkspaceSettingsSearchResult) {
    settingsState.controller.selectSection(result.sectionId);
    settingsState.query = "";
    await tick();
    if (result.fieldId) {
      const section = settingsState.controller.sections.find(
        (candidate) => candidate.id === result.sectionId,
      );
      await section?.revealSearchEntry?.(result.fieldId);
    }
    await tick();
    requestAnimationFrame(() => {
      const element = viewport?.querySelector<HTMLElement>(
        resultSelector(result),
      );
      if (!viewport || !element) return;
      const viewportRect = viewport.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      viewport.scrollTo({
        top: Math.max(
          0,
          viewport.scrollTop + elementRect.top - viewportRect.top - 12,
        ),
      });
      markSearchTarget(element);
      updateScrollbar();
    });
  }

  onMount(() => {
    const observer = new ResizeObserver(updateScrollbar);
    if (viewport) observer.observe(viewport);
    updateScrollbar();
    return () => {
      observer.disconnect();
      if (highlightTimeout) clearTimeout(highlightTimeout);
    };
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
                    onclick={() => void openSearchResult(result)}
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
                  <div class="ui-workspace-settings__search-result-actions">
                    <button
                      type="button"
                      class="ui-workspace-settings__search-result-open"
                      aria-label={`Open ${result.title}`}
                      title={`Open ${result.title}`}
                      onclick={() => void openSearchResult(result)}
                    >
                      <WorkspaceIcon name="arrow-up-right" />
                    </button>
                  </div>
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
