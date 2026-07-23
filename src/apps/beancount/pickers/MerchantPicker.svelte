<script lang="ts">
  import {
    FilterCommandPicker,
    type FilterCommandOption,
    type FilterCommandSearchAction,
  } from "@stevejuma/ui/forms";

  /** A display-ready saved merchant supplied by the application adapter. */
  export type MerchantPickerMerchant = {
    merchantId: string;
    canonicalName: string;
    domain?: string;
    description?: string;
    aliases?: readonly { normalizedValue: string }[];
    logoUrl?: string;
  };

  export type MerchantPickerEmptyOption = {
    label: string;
    description: string;
  };

  let {
    merchants,
    value = "",
    label = "Merchant",
    ariaLabel = label,
    placeholder = "Search merchants...",
    emptyOption,
    readOnly = false,
    searchAction,
    searchActionGroupLabel = "Actions",
    onSearchAction,
    onChange = () => {},
    onAttach,
  }: {
    /** Ordered or ranked by the application before it reaches this picker. */
    merchants: readonly MerchantPickerMerchant[];
    value?: string;
    label?: string;
    ariaLabel?: string;
    placeholder?: string;
    emptyOption?: MerchantPickerEmptyOption;
    readOnly?: boolean;
    /** Optional application-owned action for the text currently being searched. */
    searchAction?: (
      search: string,
    ) => FilterCommandSearchAction | null | undefined;
    searchActionGroupLabel?: string;
    onSearchAction?: (search: string) => void | Promise<void>;
    onChange?: (merchantId: string) => void | Promise<void>;
    onAttach?: (merchant: MerchantPickerMerchant) => void;
  } = $props();

  const options = $derived.by((): FilterCommandOption[] => {
    const selectedMerchant = merchants.find(
      (merchant) => merchant.merchantId === value,
    );
    const visibleMerchants = selectedMerchant
      ? [
          selectedMerchant,
          ...merchants.filter(
            (merchant) => merchant.merchantId !== selectedMerchant.merchantId,
          ),
        ]
      : merchants;
    const items: FilterCommandOption[] = emptyOption
      ? [
          {
            value: "",
            label: emptyOption.label,
            description: emptyOption.description,
          },
        ]
      : [];

    if (value && !selectedMerchant) {
      items.push({
        value,
        label: value,
        description: "Saved merchant is unavailable in this project.",
      });
    }

    for (const merchant of visibleMerchants) {
      items.push({
        value: merchant.merchantId,
        label: merchant.canonicalName,
        description: [merchant.domain, merchant.description]
          .filter(Boolean)
          .join("\n"),
        imageUrl: merchant.logoUrl,
        keywords: [
          merchant.canonicalName,
          ...(merchant.domain ? [merchant.domain] : []),
          ...(merchant.description ? [merchant.description] : []),
          ...(merchant.aliases?.map((alias) => alias.normalizedValue) ?? []),
        ],
      });
    }

    return items;
  });

  function handleChange(nextValue: string) {
    const merchant = merchants.find(
      (candidate) => candidate.merchantId === nextValue,
    );

    void onChange(nextValue);
    if (merchant) onAttach?.(merchant);
  }
</script>

<div class="bj-merchant-picker">
  {#if readOnly}
    <output>
      {(options.find((option) => option.value === value)?.label ?? value) ||
        " "}
    </output>
  {:else}
    <FilterCommandPicker
      fullWidth
      stackedOptions
      {value}
      {options}
      {label}
      {ariaLabel}
      {placeholder}
      emptyLabel={merchants.length
        ? "No matching merchants."
        : "No saved merchants yet."}
      {searchAction}
      {searchActionGroupLabel}
      {onSearchAction}
      onChange={handleChange}
    />
  {/if}
</div>

<style>
  .bj-merchant-picker {
    width: 100%;
    min-width: 0;
  }
</style>
