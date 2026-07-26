<script lang="ts">
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import { getAppSettingsContext } from "./app-settings-context.svelte.js";

  let { placeholder = "Search settings" }: { placeholder?: string } = $props();
  const state = getAppSettingsContext();
</script>

<label class="ui-workspace-settings__search" data-ui-part="search">
  <WorkspaceIcon name="search" />
  <input
    type="search"
    bind:value={state.query}
    {placeholder}
    aria-label={placeholder}
    data-testid="settings-search-input"
  />
  {#if state.query}
    <button
      type="button"
      class="ui-workspace-settings__search-clear"
      aria-label="Clear settings search"
      onclick={() => {
        state.query = "";
      }}
    >
      <WorkspaceIcon name="x" />
    </button>
  {/if}
</label>
