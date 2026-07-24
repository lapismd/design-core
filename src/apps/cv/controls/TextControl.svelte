<script lang="ts">
  let {
    label,
    value = "",
    showLabel = true,
    onChange,
  }: {
    label: string;
    value?: string;
    showLabel?: boolean;
    onChange: (value: string) => void;
  } = $props();
</script>

<label class="cv-text-control">
  {#if showLabel}
    <span class="cv-control-label">{label}</span>
  {/if}
  <input
    class="cv-text-control__input"
    aria-label={label}
    {value}
    oninput={(event) => onChange(event.currentTarget.value)}
  />
</label>

<style>
  @import "../cv-shared.css";

  .cv-text-control {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 0.25rem;
  }

  .cv-text-control__input {
    width: 100%;
    border: 0;
    background: transparent;
    padding: 0.125rem 0;
    font-size: 0.875rem;
    outline: none;
  }
</style>
