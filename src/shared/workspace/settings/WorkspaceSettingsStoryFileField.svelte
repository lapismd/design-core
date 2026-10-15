<script lang="ts">
  import { Input } from "@lapismd/design-core/shadcn/input";
  import type { WorkspaceCustomSettingProps } from "./types.js";
  let { id, field, disabled, readOnly, busy }: WorkspaceCustomSettingProps =
    $props();
</script>

<Input
  {id}
  aria-label={field.title}
  type="file"
  disabled={disabled || readOnly || busy}
/>
