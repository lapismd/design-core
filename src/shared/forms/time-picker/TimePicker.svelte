<script lang="ts">
  import "./TimePicker.css";

  let {
    value = $bindable<string | undefined>(undefined),
    ariaLabel = "Choose time",
    placeholder = "Choose time",
    clearable = true,
    disabled = false,
    error = null,
    onValueChange,
  }: {
    /** Selected time as `HH:mm`. Bind it to keep the picker controlled. */
    value?: string | undefined;
    /** Accessible name for the native time control. */
    ariaLabel?: string;
    /** Hint for browsers that surface placeholders on time inputs. */
    placeholder?: string;
    /** When true, shows a Clear action beside the input. */
    clearable?: boolean;
    disabled?: boolean;
    /** Validation message shown under the control; also sets aria-invalid. */
    error?: string | null;
    onValueChange?: (value: string | undefined) => void;
  } = $props();

  const uid = $props.id();
  const errorId = `${uid}-error`;

  const inputValue = $derived(normalizeTime(value) ?? "");
  const showClear = $derived(clearable && Boolean(inputValue) && !disabled);

  function normalizeTime(next: string | undefined): string | undefined {
    if (next == null) return undefined;
    const trimmed = next.trim();
    if (!trimmed) return undefined;
    // Accept `HH:mm` or `HH:mm:ss` from the native control; store `HH:mm`.
    const match = /^(\d{2}):(\d{2})(?::\d{2})?$/.exec(trimmed);
    if (!match) return trimmed;
    return `${match[1]}:${match[2]}`;
  }

  function updateValue(next: string | undefined) {
    const normalized = normalizeTime(next);
    value = normalized;
    onValueChange?.(normalized);
  }

  function clearTime() {
    updateValue(undefined);
  }
</script>

<div
  class="ui-time-picker"
  data-ui-component="time-picker"
  data-invalid={error ? "" : undefined}
  data-disabled={disabled ? "" : undefined}
>
  <div class="ui-time-picker__control">
    <input
      class="ui-time-picker__input"
      type="time"
      value={inputValue}
      aria-label={ariaLabel}
      {placeholder}
      {disabled}
      aria-invalid={error ? "true" : undefined}
      aria-describedby={error ? errorId : undefined}
      oninput={(event) => {
        updateValue(event.currentTarget.value || undefined);
      }}
    />
    {#if showClear}
      <button
        type="button"
        class="ui-time-picker__clear"
        aria-label="Clear time"
        onclick={() => clearTime()}
      >
        Clear
      </button>
    {/if}
  </div>
  {#if error}
    <p id={errorId} class="ui-time-picker__error" role="alert">{error}</p>
  {/if}
</div>
