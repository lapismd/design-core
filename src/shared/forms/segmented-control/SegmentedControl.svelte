<script lang="ts">
  import "./SegmentedControl.css";
  let {
    value,
    options,
    labels = {},
    ariaLabel,
    disabled = false,
    /** Validation message; marks the control invalid and renders below. */
    error = null,
    onChange = () => {},
  }: {
    value: string;
    options: string[];
    labels?: Record<string, string>;
    ariaLabel: string;
    disabled?: boolean;
    error?: string | null;
    onChange?: (value: string) => void;
  } = $props();
</script>

<div
  class="cv-form-segmented-root"
  data-ui-component="segmented-control"
  data-ui-part="segmented-control"
>
  <div
    class="cv-form-segmented"
    aria-label={ariaLabel}
    data-invalid={error ? "" : undefined}
    data-disabled={disabled ? "" : undefined}
  >
    {#each options as option (option)}
      <button
        type="button"
        class:active={value === option}
        aria-pressed={value === option}
        {disabled}
        onclick={() => {
          if (!disabled) onChange(option);
        }}
      >
        {labels[option] ?? option}
      </button>
    {/each}
  </div>
  {#if error}
    <p class="ui-form-control-error" role="alert">{error}</p>
  {/if}
</div>
