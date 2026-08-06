<script lang="ts">
  import { Input } from "@lapismd/design-core/shadcn/input";
  import type { WorkspaceCustomSettingProps } from "./types.js";

  let { id, value, disabled, update }: WorkspaceCustomSettingProps = $props();
</script>

<label class="ui-workspace-settings-story-custom">
  <span>Custom renderer value</span>
  <Input
    {id}
    type="text"
    value={String(value ?? "")}
    {disabled}
    oninput={(event) => update(event.currentTarget.value)}
  />
</label>
