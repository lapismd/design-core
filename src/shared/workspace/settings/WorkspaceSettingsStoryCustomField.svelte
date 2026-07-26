<script lang="ts">
  import type { WorkspaceCustomSettingProps } from "./types.js";

  let { id, value, disabled, update }: WorkspaceCustomSettingProps = $props();
</script>

<label class="ui-workspace-settings-story-custom">
  <span>Custom renderer value</span>
  <input
    {id}
    type="text"
    value={String(value ?? "")}
    {disabled}
    oninput={(event) => update(event.currentTarget.value)}
  />
</label>
