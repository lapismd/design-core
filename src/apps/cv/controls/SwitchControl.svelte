<script lang="ts">
  import { Switch } from "@stevejuma/ui/shadcn/switch";

  let {
    label,
    checked = $bindable(false),
    showLabel = true,
    onCheckedChange,
  }: {
    label: string;
    checked?: boolean;
    showLabel?: boolean;
    onCheckedChange?: (checked: boolean) => void;
  } = $props();
</script>

<label class="flex items-center gap-2">
  {#if showLabel}
    <span class="text-muted-foreground text-xs font-medium">{label}</span>
  {/if}
  <Switch
    bind:checked
    aria-label={label}
    onCheckedChange={(next) => {
      checked = next;
      onCheckedChange?.(next);
    }}
  />
</label>
