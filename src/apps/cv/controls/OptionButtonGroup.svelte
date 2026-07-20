<script lang="ts">
  import { Button } from "@stevejuma/ui/shadcn/button";

  let {
    label,
    value,
    options,
    showLabel = true,
    onChange,
  }: {
    label: string;
    value: string;
    options: Array<{ value: string; label: string }>;
    showLabel?: boolean;
    onChange: (value: string) => void;
  } = $props();
</script>

<div class="flex flex-col gap-1" data-ui-part="option-button-group">
  {#if showLabel}
    <span class="text-muted-foreground text-xs font-medium">{label}</span>
  {/if}
  <div class="flex flex-wrap gap-1" role="group" aria-label={label}>
    {#each options as option (option.value)}
      <Button
        type="button"
        size="xs"
        variant={value === option.value ? "default" : "outline"}
        onclick={() => onChange(option.value)}
      >
        {option.label}
      </Button>
    {/each}
  </div>
</div>
