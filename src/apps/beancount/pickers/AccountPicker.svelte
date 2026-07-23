<script lang="ts">
  import {
    FilterCommandPicker,
    type FilterCommandOption,
  } from "@stevejuma/ui/forms";

  let {
    accounts,
    value = "",
    label = "Account",
    ariaLabel = label,
    placeholder = "Select account",
    readOnly = false,
    onChange = () => {},
  }: {
    /** Display-ready account names supplied by the application. */
    accounts: readonly string[];
    value?: string;
    label?: string;
    ariaLabel?: string;
    placeholder?: string;
    readOnly?: boolean;
    onChange?: (account: string) => void | Promise<void>;
  } = $props();

  const options = $derived.by((): FilterCommandOption[] => {
    const values: FilterCommandOption[] = [
      { value: "", label: placeholder },
      ...accounts.map((account) => ({ label: account, value: account })),
    ];

    if (value && !accounts.includes(value)) {
      values.push({
        value,
        label: value,
        description: "Saved account is unavailable in this configuration.",
      });
    }

    return values;
  });
</script>

{#if readOnly}
  <output>{value || " "}</output>
{:else}
  <div class="bj-account-picker">
    <FilterCommandPicker
      fullWidth
      {value}
      {options}
      {label}
      {ariaLabel}
      placeholder={`Filter ${placeholder.toLowerCase()}...`}
      onChange={(account) => void onChange(account)}
    />
  </div>
{/if}

<style>
  .bj-account-picker {
    width: 100%;
    min-width: 0;
  }
</style>
