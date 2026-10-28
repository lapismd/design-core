<script lang="ts">
  import * as RadioGroup from "./index.js";
  import { Label } from "../label/index.js";
  let {
    disabled = false,
    invalid = false,
  }: { disabled?: boolean; invalid?: boolean } = $props();
  let value = $state("development");
  const prefix = $props.id();
</script>

<div class="radio-preview">
  <RadioGroup.Root bind:value {disabled} aria-label="Environment">
    {#each ["development", "staging", "production"] as option}
      <div class="radio-row">
        <RadioGroup.Item
          id={`${prefix}-${option}`}
          value={option}
          aria-invalid={invalid}
        /><Label for={`${prefix}-${option}`}>{option}</Label>
      </div>
    {/each}
  </RadioGroup.Root>
  <p role="status">Selected: {value}</p>
</div>

<style>
  .radio-preview {
    padding: 1.5rem;
    max-width: 24rem;
  }
  .radio-row {
    display: flex;
    align-items: center;
    gap: 0.625rem;
  }
  p {
    color: var(--muted-foreground);
    font-size: 0.8125rem;
  }
</style>
