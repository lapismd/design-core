<script lang="ts">
  import CircleAlert from "@lucide/svelte/icons/circle-alert";

  export type LineChartPoint = {
    id: string;
    /** ISO date or preformatted x-axis value used to position the point. */
    date: string;
    label: string;
    value: number;
    /** A display-ready value; formatting ledger amounts remains application-owned. */
    valueLabel?: string;
  };

  export type LineChartSeries = {
    id: string;
    label: string;
    color: string;
    points: readonly LineChartPoint[];
  };

  export type LineChartMode = "line" | "area";
  export type LineChartInterpolation = "linear" | "step";

  let {
    series,
    mode = "line",
    interpolation = "linear",
    xTickCount = 3,
    yTickCount = 5,
    ariaLabel = "Time series chart",
    emptyLabel = "No chart data is available.",
    valueFormatter = (value) => String(value),
    onPointFocus = () => {},
  }: {
    series: readonly LineChartSeries[];
    mode?: LineChartMode;
    /** Use step interpolation for ledger balances that remain constant between postings. */
    interpolation?: LineChartInterpolation;
    /** Maximum number of labelled timestamps to render along the horizontal axis. */
    xTickCount?: number;
    /** Number of evenly spaced value ticks to render along the vertical axis. */
    yTickCount?: number;
    ariaLabel?: string;
    emptyLabel?: string;
    valueFormatter?: (value: number) => string;
    /** Report a hovered, focused, or activated point to the application. */
    onPointFocus?: (point: LineChartPoint, series: LineChartSeries) => void;
  } = $props();

  const width = 800;
  const height = 280;
  const margin = { top: 18, right: 20, bottom: 42, left: 64 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  let activePoint = $state<{
    point: LineChartPoint;
    series: LineChartSeries;
  } | null>(null);

  const points = $derived(
    series.flatMap((item) =>
      item.points
        .filter(
          (point) =>
            Number.isFinite(point.value) &&
            !Number.isNaN(Date.parse(point.date)),
        )
        .map((point) => ({
          point,
          series: item,
          time: Date.parse(point.date),
        })),
    ),
  );
  const hasData = $derived(points.length > 0);
  const minTime = $derived(Math.min(...points.map((item) => item.time)));
  const maxTime = $derived(Math.max(...points.map((item) => item.time)));
  const rawMinValue = $derived(
    Math.min(...points.map((item) => item.point.value)),
  );
  const rawMaxValue = $derived(
    Math.max(...points.map((item) => item.point.value)),
  );
  const valuePadding = $derived(
    rawMinValue === rawMaxValue ? Math.max(Math.abs(rawMinValue) * 0.1, 1) : 0,
  );
  const minValue = $derived(
    mode === "area"
      ? Math.min(0, rawMinValue) - valuePadding
      : rawMinValue - valuePadding,
  );
  const maxValue = $derived(
    mode === "area"
      ? Math.max(0, rawMaxValue) + valuePadding
      : rawMaxValue + valuePadding,
  );
  const baseline = $derived(Math.max(minValue, Math.min(maxValue, 0)));
  const resolvedXTickCount = $derived(Math.max(2, Math.floor(xTickCount)));
  const resolvedYTickCount = $derived(Math.max(2, Math.floor(yTickCount)));
  const yTicks = $derived(
    Array.from(
      { length: resolvedYTickCount },
      (_, index) =>
        minValue + ((maxValue - minValue) * index) / (resolvedYTickCount - 1),
    ),
  );
  const xTicks = $derived.by(() => {
    const labels = new Map<number, string>();
    for (const item of points) labels.set(item.time, item.point.label);
    const values = [...labels.entries()].filter(([, label]) => label);
    if (values.length <= resolvedXTickCount) return values;
    return Array.from({ length: resolvedXTickCount }, (_, index) => {
      const position = Math.round(
        (index * (values.length - 1)) / (resolvedXTickCount - 1),
      );
      return values[position]!;
    });
  });

  function xFor(date: string) {
    const time = Date.parse(date);
    if (minTime === maxTime) return innerWidth / 2;
    return ((time - minTime) / (maxTime - minTime)) * innerWidth;
  }

  function yFor(value: number) {
    if (minValue === maxValue) return innerHeight / 2;
    return (
      innerHeight - ((value - minValue) / (maxValue - minValue)) * innerHeight
    );
  }

  function linePath(item: LineChartSeries) {
    return item.points
      .filter(
        (point) =>
          Number.isFinite(point.value) && !Number.isNaN(Date.parse(point.date)),
      )
      .map((point, index) => {
        const x = xFor(point.date);
        const y = yFor(point.value);
        if (index === 0) return `M${x},${y}`;
        return interpolation === "step" ? `H${x} V${y}` : `L${x},${y}`;
      })
      .join(" ");
  }

  function areaPath(item: LineChartSeries) {
    const validPoints = item.points.filter(
      (point) =>
        Number.isFinite(point.value) && !Number.isNaN(Date.parse(point.date)),
    );
    if (!validPoints.length) return "";
    const line = linePath({ ...item, points: validPoints });
    const first = validPoints[0];
    const last = validPoints.at(-1)!;
    return `${line} L${xFor(last.date)},${yFor(baseline)} L${xFor(first.date)},${yFor(baseline)} Z`;
  }

  function activatePoint(point: LineChartPoint, item: LineChartSeries) {
    activePoint = { point, series: item };
    onPointFocus(point, item);
  }

  function handlePointKeydown(
    event: KeyboardEvent,
    point: LineChartPoint,
    item: LineChartSeries,
  ) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    activatePoint(point, item);
  }

  function pointLabel(point: LineChartPoint, item: LineChartSeries) {
    return `${item.label}, ${point.label}: ${point.valueLabel ?? valueFormatter(point.value)}`;
  }
</script>

<section class="bc-line-chart" aria-label={ariaLabel}>
  {#if hasData}
    <div class="bc-line-chart__canvas">
      <svg
        class="bc-line-chart__svg"
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
                class="bc-line-chart__axis-label"
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
          {#each xTicks as [time, label] (time)}
            <text
              x={minTime === maxTime
                ? innerWidth / 2
                : ((time - minTime) / (maxTime - minTime)) * innerWidth}
              y={innerHeight + 26}
              text-anchor="middle"
              fill="var(--muted-foreground)"
              class="bc-line-chart__axis-label"
            >
              {label}
            </text>
          {/each}
          {#each series as item (item.id)}
            {#if mode === "area"}
              <path
                data-testid={`area-${item.id}`}
                d={areaPath(item)}
                fill={item.color}
                opacity="0.2"
              />
            {/if}
            <path
              d={linePath(item)}
              fill="none"
              stroke={item.color}
              stroke-width="2.5"
              stroke-linejoin="round"
              stroke-linecap="round"
            />
            {#each item.points as point (point.id)}
              {#if Number.isFinite(point.value) && !Number.isNaN(Date.parse(point.date))}
                <circle
                  cx={xFor(point.date)}
                  cy={yFor(point.value)}
                  r={activePoint?.point.id === point.id &&
                  activePoint.series.id === item.id
                    ? 5
                    : 3.5}
                  fill={item.color}
                  class="bc-line-chart__point"
                  role="button"
                  tabindex="0"
                  aria-label={pointLabel(point, item)}
                  onmouseenter={() => activatePoint(point, item)}
                  onfocus={() => activatePoint(point, item)}
                  onclick={() => activatePoint(point, item)}
                  onkeydown={(event) => handlePointKeydown(event, point, item)}
                />
              {/if}
            {/each}
          {/each}
        </g>
      </svg>
    </div>
    <output class="bc-line-chart__summary" aria-live="polite">
      {#if activePoint}
        {pointLabel(activePoint.point, activePoint.series)}
      {:else}
        Focus a chart point to inspect its value.
      {/if}
    </output>
  {:else}
    <div class="bc-line-chart__empty">
      <CircleAlert class="bc-line-chart__empty-icon" aria-hidden="true" />
      <p>{emptyLabel}</p>
    </div>
  {/if}
</section>

<style>
  .bc-line-chart {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: var(--ui-beancount-space-3);
  }

  .bc-line-chart__canvas {
    overflow-x: auto;
    border: 1px solid
      color-mix(in srgb, var(--ui-beancount-border) 80%, transparent);
    border-radius: var(--ui-beancount-radius-panel);
    background-color: var(--ui-beancount-surface);
    padding: var(--ui-beancount-space-3);
    box-shadow: var(--ui-beancount-shadow-panel);
  }

  .bc-line-chart__svg {
    display: block;
    min-width: 36rem;
  }

  .bc-line-chart__axis-label {
    font-size: 0.6875rem;
  }

  .bc-line-chart__point {
    cursor: pointer;
    outline: none;
  }

  .bc-line-chart__point:focus {
    stroke: var(--ui-beancount-foreground);
    stroke-width: 2;
  }

  .bc-line-chart__summary {
    min-height: var(--ui-beancount-space-5);
    color: var(--ui-beancount-muted-foreground);
    font-size: 0.875rem;
  }

  .bc-line-chart__empty {
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

  :global(.bc-line-chart__empty-icon) {
    width: var(--ui-beancount-space-5);
    height: var(--ui-beancount-space-5);
  }
</style>
