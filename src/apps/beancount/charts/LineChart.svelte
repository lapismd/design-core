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

  let {
    series,
    mode = "line",
    ariaLabel = "Time series chart",
    emptyLabel = "No chart data is available.",
    valueFormatter = (value) => String(value),
    onPointFocus = () => {},
  }: {
    series: readonly LineChartSeries[];
    mode?: LineChartMode;
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
  const yTicks = $derived(
    [0, 1, 2, 3, 4].map(
      (index) => minValue + ((maxValue - minValue) * index) / 4,
    ),
  );
  const xTicks = $derived.by(() => {
    const labels = new Map<number, string>();
    for (const item of points) labels.set(item.time, item.point.label);
    const values = [...labels.entries()];
    if (values.length <= 3) return values;
    return [values[0], values[Math.floor(values.length / 2)], values.at(-1)!];
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
      .map(
        (point, index) =>
          `${index === 0 ? "M" : "L"}${xFor(point.date)},${yFor(point.value)}`,
      )
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

<section class="flex min-w-0 flex-col gap-3" aria-label={ariaLabel}>
  {#if hasData}
    <div
      class="border-border/80 bg-card overflow-x-auto rounded-xl border p-3 shadow-sm"
    >
      <svg
        class="block min-w-[36rem]"
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
                class="text-[11px]"
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
              class="text-[11px]"
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
                  class="focus:stroke-foreground cursor-pointer outline-none focus:stroke-2"
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
    <output class="text-muted-foreground min-h-5 text-sm" aria-live="polite">
      {#if activePoint}
        {pointLabel(activePoint.point, activePoint.series)}
      {:else}
        Focus a chart point to inspect its value.
      {/if}
    </output>
  {:else}
    <div
      class="border-border bg-muted/35 text-muted-foreground flex min-h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-5 text-center text-sm"
    >
      <CircleAlert class="size-5" aria-hidden="true" />
      <p>{emptyLabel}</p>
    </div>
  {/if}
</section>
