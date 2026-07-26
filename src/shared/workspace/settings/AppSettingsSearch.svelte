<script lang="ts">
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import { getAppSettingsContext } from "./app-settings-context.svelte.js";

  let { placeholder = "Search settings" }: { placeholder?: string } = $props();
  const state = getAppSettingsContext();
</script>

<label class="ui-workspace-settings__search" data-ui-part="search">
  <WorkspaceIcon name="search" />
  <span class="sr-only">{placeholder}</span>
  <input
    type="search"
    bind:value={state.query}
    {placeholder}
    aria-label={placeholder}
    data-testid="settings-search-input"
  />
</label>
