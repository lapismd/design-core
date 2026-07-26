<script lang="ts">
  import "./SecretField.css";
  import { Input } from "@stevejuma/ui/shadcn/input";

  import FilterCommandPicker from "../filter-command-picker/FilterCommandPicker.svelte";
  import SegmentedControl from "../segmented-control/SegmentedControl.svelte";
  import {
    secretFieldDisplayValue,
    secretFieldMode,
    secretFieldStoredValue,
  } from "./secret-field-value";

  let {
    value = "",
    environmentKeys = [],
    label = "Secret",
    ariaLabel = label,
    environmentPlaceholder = "",
    readOnly = false,
    /** Validation message shown under the field. */
    error = null,
    onChange = () => {},
  }: {
    /** `env:NAME` selects an environment reference; other values are inline. */
    value?: string;
    /** Environment variable names supplied by the application. */
    environmentKeys?: readonly string[];
    label?: string;
    ariaLabel?: string;
    environmentPlaceholder?: string;
    readOnly?: boolean;
    error?: string | null;
    onChange?: (value: string) => void | Promise<void>;
  } = $props();

  const mode = $derived(secretFieldMode(value));
  const display = $derived(secretFieldDisplayValue(value));
  const environmentLabel = $derived(
    environmentPlaceholder.trim() || label || "Environment variable",
  );
  const environmentOptions = $derived(
    environmentKeys.map((key) => ({ value: key, label: key })),
  );

  function setMode(next: string) {
    if (next === mode) return;
    void onChange(secretFieldStoredValue(next as typeof mode, ""));
  }

  function setDisplay(next: string) {
    void onChange(secretFieldStoredValue(mode, next));
  }
</script>

{#if readOnly}
  <output data-ui-component="secret-field" data-ui-part="secret-field">
    {mode === "env" ? value || " " : value ? "••••••••" : " "}
  </output>
{:else}
  <div
    class="ui-secret-field"
    data-ui-component="secret-field"
    data-ui-part="secret-field"
    data-invalid={error ? "" : undefined}
  >
    <SegmentedControl
      value={mode}
      options={["env", "inline"]}
      labels={{ env: "Environment", inline: "Inline" }}
      ariaLabel={`${ariaLabel} source`}
      onChange={setMode}
    />
    {#if mode === "env"}
      <FilterCommandPicker
        value={display}
        options={environmentOptions}
        allowCustom
        label={environmentLabel}
        placeholder="Search project .env keys..."
        emptyLabel="No matching .env keys. Type a custom name."
        {ariaLabel}
        {error}
        onChange={setDisplay}
      />
    {:else}
      <Input
        type="password"
        autocomplete="off"
        spellcheck={false}
        value={display}
        placeholder="Paste API key"
        aria-label={ariaLabel}
        aria-invalid={error ? "true" : undefined}
        oninput={(event) => setDisplay(event.currentTarget.value)}
      />
      {#if error}
        <p class="ui-form-control-error" role="alert">{error}</p>
      {/if}
    {/if}
  </div>
{/if}
