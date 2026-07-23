<script lang="ts">
  import type { Snippet } from "svelte";
  import * as Select from "@stevejuma/ui/shadcn/select";
  import ChartLegend, { type ChartLegendItem } from "./ChartLegend.svelte";
  import ChartModeSwitch, {
    type ChartModeOption,
  } from "./ChartModeSwitch.svelte";

  export type ChartPanelOption = {
    value: string;
    label: string;
  };

  export type ChartPanelSelect = {
    /** Describes the compact chart setting for assistive technology. */
    ariaLabel: string;
    value: string;
    options: readonly ChartPanelOption[];
    onChange?: (value: string) => void;
  };

  export type ChartPanelLegend = {
    items: readonly ChartLegendItem[];
    selection?: "multiple" | "single";
    selectedIds: readonly string[];
    onSelectedIdsChange?: (ids: string[]) => void;
  };

  export type ChartPanelModes = {
    value: string;
    options: readonly ChartModeOption[];
    ariaLabel?: string;
    onChange?: (value: string) => void;
  };

  let {
    legend,
    conversion,
    interval,
    modes,
    ariaLabel = "Chart panel",
    children,
  }: {
    /** Series visibility or focus controls displayed on the left of the toolbar. */
    legend?: ChartPanelLegend;
    /** A controlled compact display setting, such as at cost or market value. */
    conversion?: ChartPanelSelect;
    /** A controlled date grouping, such as month or quarter. */
    interval?: ChartPanelSelect;
    /** Alternate visual renderings of the same display model. */
    modes?: ChartPanelModes;
    ariaLabel?: string;
    /** The application renders the appropriate model-driven chart here. */
    children?: Snippet;
  } = $props();

  const hasControls = $derived(
    Boolean(legend || conversion || interval || modes),
  );

  function updateSelect(select: ChartPanelSelect, value: string | undefined) {
    if (value) select.onChange?.(value);
  }
</script>

<section class="bc-chart-panel" aria-label={ariaLabel}>
  {#if hasControls}
    <div class="bc-chart-panel__toolbar">
      {#if legend}
        <div class="bc-chart-panel__legend">
          <ChartLegend
            items={legend.items}
            selection={legend.selection}
            selectedIds={legend.selectedIds}
            onSelectedIdsChange={legend.onSelectedIdsChange}
          />
        </div>
      {/if}

      {#if conversion || interval || modes}
        <div class="bc-chart-panel__controls">
          {#if conversion}
            <Select.Root
              type="single"
              value={conversion.value}
              onValueChange={(value) => updateSelect(conversion, value)}
            >
              <Select.Trigger
                class="bc-chart-panel__select bc-chart-panel__select--conversion"
                aria-label={conversion.ariaLabel}
              >
                {conversion.options.find(
                  (option) => option.value === conversion.value,
                )?.label ?? conversion.value}
              </Select.Trigger>
              <Select.Content aria-label={`${conversion.ariaLabel} options`}>
                {#each conversion.options as option (option.value)}
                  <Select.Item value={option.value}>{option.label}</Select.Item>
                {/each}
              </Select.Content>
            </Select.Root>
          {/if}

          {#if interval}
            <Select.Root
              type="single"
              value={interval.value}
              onValueChange={(value) => updateSelect(interval, value)}
            >
              <Select.Trigger
                class="bc-chart-panel__select bc-chart-panel__select--interval"
                aria-label={interval.ariaLabel}
              >
                {interval.options.find(
                  (option) => option.value === interval.value,
                )?.label ?? interval.value}
              </Select.Trigger>
              <Select.Content aria-label={`${interval.ariaLabel} options`}>
                {#each interval.options as option (option.value)}
                  <Select.Item value={option.value}>{option.label}</Select.Item>
                {/each}
              </Select.Content>
            </Select.Root>
          {/if}

          {#if modes}
            <ChartModeSwitch
              value={modes.value}
              options={modes.options}
              ariaLabel={modes.ariaLabel ?? "Chart representation"}
              onChange={modes.onChange}
            />
          {/if}
        </div>
      {/if}
    </div>
  {/if}

  {@render children?.()}
</section>

<style>
  .bc-chart-panel {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: var(--ui-beancount-space-3);
  }

  .bc-chart-panel__toolbar {
    display: flex;
    flex-direction: column;
    gap: var(--ui-beancount-space-3);
    border-block-end: 1px solid
      color-mix(in srgb, var(--ui-beancount-border) 70%, transparent);
    padding-block-end: var(--ui-beancount-space-3);
  }

  .bc-chart-panel__legend {
    min-width: 0;
    overflow-x: auto;
    padding-block-end: calc(var(--ui-beancount-space-1) / 2);
  }

  .bc-chart-panel__controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--ui-beancount-space-2);
  }

  :global(.bc-chart-panel__select--conversion) {
    width: 10rem;
  }

  :global(.bc-chart-panel__select--interval) {
    width: 8.5rem;
  }

  @media (min-width: 768px) {
    .bc-chart-panel__toolbar {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }

    .bc-chart-panel__controls {
      justify-content: flex-end;
    }
  }
</style>
