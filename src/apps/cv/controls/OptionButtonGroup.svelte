<script lang="ts">
  import { Button } from "@stevejuma/ui/shadcn/button";
  import "../cv-shared.css";

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

<div class="cv-option-button-group" data-ui-part="option-button-group">
  {#if showLabel}
    <span class="cv-control-label">{label}</span>
  {/if}
  <div class="cv-option-button-group__options" role="group" aria-label={label}>
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

<style>
  .cv-option-button-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .cv-option-button-group__options {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }
</style>
