<script lang="ts">
  import { Button } from "@lapismd/design-core/shadcn/button";
  import type { WorkspaceCustomSettingProps } from "./types.js";
  let {
    value,
    disabled,
    readOnly,
    busy,
    setValue,
  }: WorkspaceCustomSettingProps = $props();
</script>

<Button
  variant="outline"
  disabled={disabled || readOnly || busy}
  onclick={() => void setValue(value === "active" ? "idle" : "active")}
>
  {value === "active" ? "Cancel invitation" : "Create invitation"}
</Button>
