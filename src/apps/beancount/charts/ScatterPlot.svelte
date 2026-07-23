<script lang="ts">
  import CircleAlert from "@lucide/svelte/icons/circle-alert";

  export type ScatterPlotPoint = {
    id: string;
    /** ISO timestamp used for horizontal positioning. */
    date: string;
    /** Display-ready label for the x-axis and focused-point summary. */
    dateLabel: string;
    category: string;
    label: string;
    color: string;
    detail?: string;
  };

  let {
    points,
    ariaLabel = "Ledger events",
    emptyLabel = "No events are available.",
    onPointFocus = () => {},
  }: {
    points: readonly ScatterPlotPoint[];
    ariaLabel?: string;
    emptyLabel?: string;
    /** Report a hovered, focused, or activated event to the application. */
    onPointFocus?: (point: ScatterPlotPoint) => void;
  } = $props();

  const width = 800;
  const height = 280;
  const margin = { top: 18, right: 20, bottom: 42, left: 116 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  let activePoint = $state<ScatterPlotPoint | null>(null);

  const validPoints = $derived(
    points.filter((point) => !Number.isNaN(Date.parse(point.date))),
  );
  const hasData = $derived(validPoints.length > 0);
  const categories = $derived([
    ...new Set(validPoints.map((point) => point.category)),
  ]);
  const minTime = $derived(
    Math.min(...validPoints.map((point) => Date.parse(point.date))),
  );
  const maxTime = $derived(
    Math.max(...validPoints.map((point) => Date.parse(point.date))),
  );
  const xTicks = $derived.by(() => {
    const labels = new Map<number, string>();
    for (const point of validPoints) {
      labels.set(Date.parse(point.date), point.dateLabel);
    }
    const values = [...labels.entries()];
    if (values.length <= 3) return values;
    return [values[0], values[Math.floor(values.length / 2)], values.at(-1)!];
  });

  function xFor(date: string) {
    const time = Date.parse(date);
    if (minTime === maxTime) return innerWidth / 2;
    return ((time - minTime) / (maxTime - minTime)) * innerWidth;
  }

  function yFor(category: string) {
    const index = categories.indexOf(category);
    if (categories.length <= 1) return innerHeight / 2;
    return (index / (categories.length - 1)) * innerHeight;
  }

  function activatePoint(point: ScatterPlotPoint) {
    activePoint = point;
    onPointFocus(point);
  }

  function handlePointKeydown(event: KeyboardEvent, point: ScatterPlotPoint) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    activatePoint(point);
  }

  function pointLabel(point: ScatterPlotPoint) {
    return [point.label, point.category, point.dateLabel, point.detail]
      .filter(Boolean)
      .join(", ");
  }
</script>

<section class="bc-scatter-plot" aria-label={ariaLabel}>
  {#if hasData}
    <div class="bc-scatter-plot__canvas">
      <svg
        class="bc-scatter-plot__svg"
        viewBox={`0 0 ${width} ${height}`}
        role="group"
        aria-label={ariaLabel}
      >
        <g transform={`translate(${margin.left},${margin.top})`}>
          {#each categories as category}
            <g transform={`translate(0,${yFor(category)})`}>
              <line x1="0" x2={innerWidth} stroke="var(--border)" />
              <text
                x="-12"
                y="4"
                text-anchor="end"
                fill="var(--muted-foreground)"
                class="bc-scatter-plot__axis-label"
              >
                {category}
              </text>
            </g>
          {/each}
          {#each xTicks as [time, label] (time)}
            <text
              x={minTime === maxTime
                ? innerWidth / 2
                : ((time - minTime) / (maxTime - minTime)) * innerWidth}
              y={innerHeight + 26}
              text-anchor="middle"
              fill="var(--muted-foreground)"
              class="bc-scatter-plot__axis-label"
            >
              {label}
            </text>
          {/each}
          {#each validPoints as point (point.id)}
            <circle
              cx={xFor(point.date)}
              cy={yFor(point.category)}
              r={activePoint?.id === point.id ? 7 : 5}
              fill={point.color}
              class="bc-scatter-plot__point"
              role="button"
              tabindex="0"
              aria-label={pointLabel(point)}
              onmouseenter={() => activatePoint(point)}
              onfocus={() => activatePoint(point)}
              onclick={() => activatePoint(point)}
              onkeydown={(event) => handlePointKeydown(event, point)}
            />
          {/each}
        </g>
      </svg>
    </div>
    <output class="bc-scatter-plot__summary" aria-live="polite">
      {#if activePoint}
        {pointLabel(activePoint)}
      {:else}
        Focus an event to inspect its details.
      {/if}
    </output>
  {:else}
    <div class="bc-scatter-plot__empty">
      <CircleAlert class="bc-scatter-plot__empty-icon" aria-hidden="true" />
      <p>{emptyLabel}</p>
    </div>
  {/if}
</section>

<style>
  .bc-scatter-plot {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: var(--ui-beancount-space-3);
  }

  .bc-scatter-plot__canvas {
    overflow-x: auto;
    border: 1px solid color-mix(in srgb, var(--ui-beancount-border) 80%, transparent);
    border-radius: var(--ui-beancount-radius-panel);
    background-color: var(--ui-beancount-surface);
    padding: var(--ui-beancount-space-3);
    box-shadow: var(--ui-beancount-shadow-panel);
  }

  .bc-scatter-plot__svg {
    display: block;
    min-width: 36rem;
  }

  .bc-scatter-plot__axis-label {
    font-size: 0.6875rem;
  }

  .bc-scatter-plot__point {
    cursor: pointer;
    outline: none;
  }

  .bc-scatter-plot__point:focus {
    stroke: var(--ui-beancount-foreground);
    stroke-width: 2;
  }

  .bc-scatter-plot__summary {
    min-height: var(--ui-beancount-space-5);
    color: var(--ui-beancount-muted-foreground);
    font-size: 0.875rem;
  }

  .bc-scatter-plot__empty {
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

  :global(.bc-scatter-plot__empty-icon) {
    width: var(--ui-beancount-space-5);
    height: var(--ui-beancount-space-5);
  }
</style>
