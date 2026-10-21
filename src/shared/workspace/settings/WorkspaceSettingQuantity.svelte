<script lang="ts">
  import {
    QuantityInput,
    quantityError,
  } from "../../forms/quantity-input/index.js";
  import type { WorkspaceNumberSetting } from "./types.js";
  import type { WorkspaceSettingsController } from "./settings-controller.svelte.js";
  let {
    controller,
    field,
  }: {
    controller: WorkspaceSettingsController;
    field: WorkspaceNumberSetting;
  } = $props();
  let canonical = $state("");
  let draft = $state<{ canonical: string; text: string; unit: string }>();
  $effect(() => {
    canonical = String(controller.get(field.id) ?? field.default);
  });
  const min = $derived(field.minimum ?? Number.MIN_SAFE_INTEGER);
  const max = $derived(field.maximum ?? Number.MAX_SAFE_INTEGER);
</script>

{#if field.quantity}
  <QuantityInput
    id={`setting-${field.id}`}
    label={field.title}
    layout="control"
    value={canonical}
    bind:draft
    units={field.quantity.units}
    preferredUnit={field.quantity.preferredUnit}
    {min}
    {max}
    slider={field.quantity.slider}
    sliderMax={field.quantity.sliderMax}
    defaultValue={field.default}
    disabled={field.disabled || controller.isBusy(field.id)}
    readonly={field.readOnly}
    onValueChange={(next) => {
      canonical = next;
      if (
        !quantityError(
          next,
          min,
          max,
          field.quantity!.units[0]?.label ?? "units",
        )
      )
        void controller.set(field.id, Number(next));
    }}
  />
{/if}
