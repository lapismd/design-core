<script lang="ts">
  import * as InputGroup from "@lapismd/design-core/shadcn/input-group";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import { getAppSettingsContext } from "./app-settings-context.svelte.js";

  let { placeholder = "Search settings" }: { placeholder?: string } = $props();
  const state = getAppSettingsContext();
</script>

<div class="ui-workspace-settings__search" data-ui-part="search">
  <InputGroup.Root>
    <InputGroup.Addon align="inline-start">
      <WorkspaceIcon name="search" />
    </InputGroup.Addon>
    <InputGroup.Input
      type="search"
      bind:value={state.query}
      {placeholder}
      aria-label={placeholder}
      data-testid="settings-search-input"
    />
    {#if state.query}
      <InputGroup.Addon align="inline-end">
        <InputGroup.Button
          size="icon-xs"
          class="ui-workspace-settings__search-clear"
          aria-label="Clear settings search"
          onclick={() => {
            state.query = "";
          }}
        >
          <WorkspaceIcon name="x" />
        </InputGroup.Button>
      </InputGroup.Addon>
    {/if}
  </InputGroup.Root>
</div>
