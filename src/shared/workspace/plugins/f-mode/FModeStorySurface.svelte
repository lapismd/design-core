<script lang="ts">
  let lastAction = $state("No hint activated");

  function activate(label: string) {
    lastAction = `${label} activated`;
  }
</script>

<main class="ui-workspace-fmode-story__surface">
  <header>
    <div>
      <span>Keyboard navigation</span>
      <h1>F-Mode target surface</h1>
    </div>
    <output aria-live="polite">{lastAction}</output>
  </header>
  <section aria-label="Hint targets">
    <button
      type="button"
      data-hint-target="tab"
      data-hint-group="tabs"
      data-hint-target-id="fmode-story:open-note"
      data-hint-label="Open note"
      data-hint-description="Activate the current note tab"
      onclick={() => activate("Open note")}
    >
      Open note
    </button>
    <button
      type="button"
      data-hint-target="tab-add"
      data-hint-group="tabs"
      data-hint-target-id="fmode-story:new-tab"
      data-hint-label="New tab"
      data-hint-description="Create another workspace tab"
      onclick={() => activate("New tab")}
    >
      New tab
    </button>
    <button
      type="button"
      data-hint-target="sidebar-toggle"
      data-hint-group="sidebar"
      data-hint-target-id="fmode-story:toggle-sidebar"
      data-hint-label="Toggle sidebar"
      data-hint-description="Show or hide the left sidebar"
      onclick={() => activate("Toggle sidebar")}
    >
      Toggle sidebar
    </button>
    <button
      type="button"
      data-hint-target="status-action"
      data-hint-group="status"
      data-hint-target-id="fmode-story:sync"
      data-hint-label="Sync workspace"
      data-hint-description="Synchronize the current workspace"
      onclick={() => activate("Sync workspace")}
    >
      Sync workspace
    </button>
  </section>
</main>
