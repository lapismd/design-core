<script lang="ts">
  import { Switch } from "@stevejuma/ui/shadcn/switch";
  import "../cv-shared.css";

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

<label class="cv-switch-control">
  {#if showLabel}
    <span class="cv-control-label">{label}</span>
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

<style>
  .cv-switch-control {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
</style>
