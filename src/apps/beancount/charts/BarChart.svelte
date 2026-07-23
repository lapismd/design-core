<script lang="ts">
  import CircleAlert from "@lucide/svelte/icons/circle-alert";

  export type BarChartValue = {
    id: string;
    label: string;
    value: number;
    color: string;
    /** Display-ready amount supplied by the application. */
    valueLabel?: string;
    /** Optional target or budget rendered as a marker in single-bar mode. */
    budget?: number;
    budgetLabel?: string;
  };

  export type BarChartGroup = {
    id: string;
    label: string;
    /** Values rendered as side-by-side bars in single mode. */
    values: readonly BarChartValue[];
    /** Account/category values rendered as one diverging stack in stacked mode. */
    stacks?: readonly BarChartValue[];
  };

  export type BarChartMode = "single" | "stacked";

  type BarSegment = {
    value: BarChartValue;
    start: number;
    end: number;
  };

  let {
    groups,
    mode = "single",
    ariaLabel = "Bar chart",
    emptyLabel = "No chart data is available.",
    valueFormatter = (value) => String(value),
    onBarFocus = () => {},
  }: {
    groups: readonly BarChartGroup[];
    mode?: BarChartMode;
    ariaLabel?: string;
    emptyLabel?: string;
    valueFormatter?: (value: number) => string;
    /** Report a hovered, focused, or activated value to the application. */
    onBarFocus?: (value: BarChartValue, group: BarChartGroup) => void;
  } = $props();

  const width = 800;
  const height = 280;
  const margin = { top: 18, right: 20, bottom: 42, left: 64 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  let activeBar = $state<{
    value: BarChartValue;
    group: BarChartGroup;
  } | null>(null);

  const hasData = $derived(
    groups.some((group) =>
      (mode === "stacked" ? (group.stacks ?? group.values) : group.values).some(
        (value) => Number.isFinite(value.value),
      ),
    ),
  );
  const singleValues = $derived(
    groups.flatMap((group) =>
      group.values.filter((value) => Number.isFinite(value.value)),
    ),
  );
  const stackedSegments = $derived(
    groups.map((group) => ({ group, segments: segmentsFor(group) })),
  );
  const scaleValues = $derived(
    mode === "stacked"
      ? stackedSegments.flatMap(({ segments }) =>
          segments.flatMap((segment) => [segment.start, segment.end]),
        )
      : singleValues.flatMap((value) => [
          value.value,
          value.budget ?? value.value,
        ]),
  );
  const rawMinValue = $derived(Math.min(0, ...scaleValues));
  const rawMaxValue = $derived(Math.max(0, ...scaleValues));
  const valuePadding = $derived(
    rawMinValue === rawMaxValue
      ? Math.max(Math.abs(rawMinValue) * 0.1, 1)
      : (rawMaxValue - rawMinValue) * 0.05,
  );
  const minValue = $derived(rawMinValue - valuePadding);
  const maxValue = $derived(rawMaxValue + valuePadding);
  const baseline = $derived(Math.max(minValue, Math.min(maxValue, 0)));
  const yTicks = $derived(
    [0, 1, 2, 3, 4].map(
      (index) => minValue + ((maxValue - minValue) * index) / 4,
    ),
  );
  const groupWidth = $derived(innerWidth / Math.max(groups.length, 1));
  const groupGap = $derived(Math.min(20, groupWidth * 0.16));
  const usableGroupWidth = $derived(Math.max(groupWidth - groupGap, 1));
  const maxSingleValues = $derived(
    Math.max(...groups.map((group) => group.values.length), 1),
  );
  const singleBarWidth = $derived(usableGroupWidth / maxSingleValues);

  function segmentsFor(group: BarChartGroup): BarSegment[] {
    const source = group.stacks?.length ? group.stacks : group.values;
    let positive = 0;
    let negative = 0;
    return source
      .filter((value) => Number.isFinite(value.value))
      .map((value) => {
        const start = value.value >= 0 ? positive : negative;
        const end = start + value.value;
        if (value.value >= 0) positive = end;
        else negative = end;
        return { value, start, end };
      });
  }

  function yFor(value: number) {
    if (minValue === maxValue) return innerHeight / 2;
    return (
      innerHeight - ((value - minValue) / (maxValue - minValue)) * innerHeight
    );
  }

  function groupX(index: number) {
    return index * groupWidth + groupGap / 2;
  }

  function activateBar(value: BarChartValue, group: BarChartGroup) {
    activeBar = { value, group };
    onBarFocus(value, group);
  }

  function handleBarKeydown(
    event: KeyboardEvent,
    value: BarChartValue,
    group: BarChartGroup,
  ) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    activateBar(value, group);
  }

  function barLabel(value: BarChartValue, group: BarChartGroup) {
    const valueText = value.valueLabel ?? valueFormatter(value.value);
    const budgetText =
      value.budgetLabel ??
      (value.budget == null ? "" : `, budget ${valueFormatter(value.budget)}`);
    return `${value.label}, ${group.label}: ${valueText}${budgetText}`;
  }
</script>

<section class="bc-bar-chart" aria-label={ariaLabel}>
  {#if hasData}
    <div class="bc-bar-chart__canvas">
      <svg
        class="bc-bar-chart__svg"
        viewBox={`0 0 ${width} ${height}`}
        role="group"
        aria-label={ariaLabel}
      >
        <g transform={`translate(${margin.left},${margin.top})`}>
          {#each yTicks as tick}
            <g transform={`translate(0,${yFor(tick)})`}>
              <line x1="0" x2={innerWidth} stroke="var(--border)" />
              <text
                x="-10"
                y="4"
                text-anchor="end"
                fill="var(--muted-foreground)"
                class="bc-bar-chart__axis-label"
              >
                {valueFormatter(tick)}
              </text>
            </g>
          {/each}
          <line
            x1="0"
            x2={innerWidth}
            y1={yFor(baseline)}
            y2={yFor(baseline)}
            stroke="var(--muted-foreground)"
            opacity="0.6"
          />
          {#each groups as group, groupIndex (group.id)}
            <text
              x={groupX(groupIndex) + usableGroupWidth / 2}
              y={innerHeight + 26}
              text-anchor="middle"
              fill="var(--muted-foreground)"
              class="bc-bar-chart__axis-label"
            >
              {group.label}
            </text>
            {#if mode === "stacked"}
              {#each segmentsFor(group) as segment (segment.value.id)}
                {@const value = segment.value}
                <rect
                  x={groupX(groupIndex)}
                  y={yFor(Math.max(segment.start, segment.end))}
                  width={usableGroupWidth}
                  height={Math.abs(yFor(segment.end) - yFor(segment.start))}
                  fill={value.color}
                  class="bc-bar-chart__bar"
                  role="button"
                  tabindex="0"
                  aria-label={barLabel(value, group)}
                  onmouseenter={() => activateBar(value, group)}
                  onfocus={() => activateBar(value, group)}
                  onclick={() => activateBar(value, group)}
                  onkeydown={(event) => handleBarKeydown(event, value, group)}
                />
              {/each}
            {:else}
              {#each group.values as value, valueIndex (value.id)}
                {#if Number.isFinite(value.value)}
                  {@const x = groupX(groupIndex) + valueIndex * singleBarWidth}
                  {@const barWidth = Math.max(singleBarWidth - 4, 2)}
                  <rect
                    x={x + 2}
                    y={yFor(Math.max(0, value.value))}
                    width={barWidth}
                    height={Math.abs(yFor(value.value) - yFor(0))}
                    fill={value.color}
                    class="bc-bar-chart__bar"
                    role="button"
                    tabindex="0"
                    aria-label={barLabel(value, group)}
                    onmouseenter={() => activateBar(value, group)}
                    onfocus={() => activateBar(value, group)}
                    onclick={() => activateBar(value, group)}
                    onkeydown={(event) => handleBarKeydown(event, value, group)}
                  />
                  {#if value.budget != null && Number.isFinite(value.budget)}
                    <line
                      x1={x + 2}
                      x2={x + 2 + barWidth}
                      y1={yFor(value.budget)}
                      y2={yFor(value.budget)}
                      stroke="var(--foreground)"
                      stroke-width="2"
                      opacity="0.6"
                      aria-label={`Budget for ${value.label}: ${value.budgetLabel ?? valueFormatter(value.budget)}`}
                    />
                  {/if}
                {/if}
              {/each}
            {/if}
          {/each}
        </g>
      </svg>
    </div>
    <output class="bc-bar-chart__summary" aria-live="polite">
      {#if activeBar}
        {barLabel(activeBar.value, activeBar.group)}
      {:else}
        Focus a bar to inspect its value.
      {/if}
    </output>
  {:else}
    <div class="bc-bar-chart__empty">
      <CircleAlert class="bc-bar-chart__empty-icon" aria-hidden="true" />
      <p>{emptyLabel}</p>
    </div>
  {/if}
</section>

<style>
  .bc-bar-chart {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: var(--ui-beancount-space-3);
  }

  .bc-bar-chart__canvas {
    overflow-x: auto;
    border: 1px solid color-mix(in srgb, var(--ui-beancount-border) 80%, transparent);
    border-radius: var(--ui-beancount-radius-panel);
    background-color: var(--ui-beancount-surface);
    padding: var(--ui-beancount-space-3);
    box-shadow: var(--ui-beancount-shadow-panel);
  }

  .bc-bar-chart__svg {
    display: block;
    min-width: 36rem;
  }

  .bc-bar-chart__axis-label {
    font-size: 0.6875rem;
  }

  .bc-bar-chart__bar {
    cursor: pointer;
    outline: none;
  }

  .bc-bar-chart__bar:focus {
    stroke: var(--ui-beancount-foreground);
    stroke-width: 2;
  }

  .bc-bar-chart__summary {
    min-height: var(--ui-beancount-space-5);
    color: var(--ui-beancount-muted-foreground);
    font-size: 0.875rem;
  }

  .bc-bar-chart__empty {
    display: flex;
    min-height: 12rem;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--ui-beancount-space-2);
    border: 1px dashed var(--ui-beancount-border);
    border-radius: var(--ui-beancount-radius-panel);
    background-color: color-mix(
      in srgb,
      var(--ui-beancount-surface-muted) 35%,
      transparent
    );
    padding-inline: var(--ui-beancount-space-5);
    color: var(--ui-beancount-muted-foreground);
    text-align: center;
    font-size: 0.875rem;
  }

  :global(.bc-bar-chart__empty-icon) {
    width: var(--ui-beancount-space-5);
    height: var(--ui-beancount-space-5);
  }
</style>
