<script module lang="ts">
  let nextDashboardLineId = 0;
</script>

<script lang="ts">
  import { scaleLinear, scaleUtc } from "d3-scale";
  import { area, curveMonotoneX, line } from "d3-shape";
  import DashboardChartTooltip from "./DashboardChartTooltip.svelte";

  export type DashboardLinePoint = {
    id: string;
    date: Date;
    value: number;
    /** Display-ready date label supplied by the application when required. */
    label?: string;
    /** Display-ready value supplied by the application when required. */
    valueLabel?: string;
  };

  export type DashboardTrendTone = "positive" | "negative" | "neutral";

  let {
    points = [],
    change = 0,
    trendTone,
    ariaLabel = "Explore trend by date",
    chartLabel = "Value over time",
    emptyLabel = "A longer date range is needed to chart this trend.",
    valueFormatter = (value) => String(value),
    onPointFocus = () => {},
  }: {
    points?: readonly DashboardLinePoint[];
    /** The change across the selected range, used for comparison detail and the default tone. */
    change?: number;
    trendTone?: DashboardTrendTone;
    ariaLabel?: string;
    chartLabel?: string;
    emptyLabel?: string;
    valueFormatter?: (value: number) => string;
    /** Reports the currently explored point without owning application navigation. */
    onPointFocus?: (point: DashboardLinePoint) => void;
  } = $props();

  const width = 820;
  const height = 250;
  const inset = { top: 18, right: 18, bottom: 34, left: 18 };
  const chartId = `dashboard-line-${nextDashboardLineId++}`;
  const areaGradientId = `${chartId}-area`;
  const activeClipId = `${chartId}-active-clip`;

  let activeIndex = $state<number | undefined>(undefined);
  let chartContainer = $state<HTMLDivElement>();
  let chartSvg = $state<SVGSVGElement>();
  let keyboardActive = $state(false);
  let tooltipX = $state(0);
  let tooltipY = $state(0);

  const orderedPoints = $derived(
    [...points]
      .filter(
        (point) =>
          Number.isFinite(point.value) && Number.isFinite(point.date.getTime()),
      )
      .sort((left, right) => left.date.getTime() - right.date.getTime()),
  );
  const values = $derived(orderedPoints.map((point) => point.value));
  const valueMin = $derived(values.length ? Math.min(...values) : 0);
  const valueMax = $derived(values.length ? Math.max(...values) : 0);
  const rawSpan = $derived(valueMax - valueMin);
  const valuePadding = $derived(
    rawSpan ? rawSpan * 0.09 : Math.max(Math.abs(valueMax) * 0.05, 1),
  );
  const xScale = $derived(
    scaleUtc()
      .domain([
        orderedPoints[0]?.date ?? new Date(),
        orderedPoints.at(-1)?.date ?? new Date(),
      ])
      .range([inset.left, width - inset.right]),
  );
  const yScale = $derived(
    scaleLinear()
      .domain([valueMin - valuePadding, valueMax + valuePadding])
      .range([height - inset.bottom, inset.top]),
  );
  const lineGenerator = $derived(
    line<DashboardLinePoint>()
      .x((point) => xScale(point.date))
      .y((point) => yScale(point.value))
      .curve(curveMonotoneX),
  );
  const areaGenerator = $derived(
    area<DashboardLinePoint>()
      .x((point) => xScale(point.date))
      .y0(height - inset.bottom)
      .y1((point) => yScale(point.value))
      .curve(curveMonotoneX),
  );
  const linePath = $derived(lineGenerator(orderedPoints) ?? "");
  const areaPath = $derived(areaGenerator(orderedPoints) ?? "");
  const activePoint = $derived(
    activeIndex === undefined ? undefined : orderedPoints[activeIndex],
  );
  const activeX = $derived(activePoint ? xScale(activePoint.date) : inset.left);
  const activeY = $derived(activePoint ? yScale(activePoint.value) : inset.top);
  const startValue = $derived(orderedPoints[0]?.value ?? 0);
  const activeChange = $derived(
    activePoint ? activePoint.value - startValue : 0,
  );
  const activePercent = $derived(
    activePoint && startValue
      ? (activeChange / Math.abs(startValue)) * 100
      : null,
  );
  const activeDetail = $derived(
    activePoint
      ? `${activeChange >= 0 ? "↗" : "↘"} ${valueFormatter(activeChange)}${activePercent === null ? "" : ` (${activePercent.toFixed(1)}%)`}`
      : "",
  );
  const latest = $derived(orderedPoints.at(-1)?.value ?? 0);
  const resolvedTrendTone = $derived(
    trendTone ??
      (change > 0 ? "positive" : change < 0 ? "negative" : "neutral"),
  );

  $effect(() => {
    if (activeIndex !== undefined && activeIndex >= orderedPoints.length) {
      activeIndex = orderedPoints.length ? orderedPoints.length - 1 : undefined;
    }
  });

  function formatDate(point: DashboardLinePoint) {
    return (
      point.label ??
      point.date.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    );
  }

  function displayValue(point: DashboardLinePoint) {
    return point.valueLabel ?? valueFormatter(point.value);
  }

  function nearestIndex(time: number) {
    let result = 0;
    let distance = Number.POSITIVE_INFINITY;
    orderedPoints.forEach((point, index) => {
      const nextDistance = Math.abs(point.date.getTime() - time);
      if (nextDistance < distance) {
        distance = nextDistance;
        result = index;
      }
    });
    return result;
  }

  function positionTooltip(index: number) {
    const point = orderedPoints[index];
    if (!point || !chartContainer || !chartSvg) return;
    const containerRect = chartContainer.getBoundingClientRect();
    const svgRect = chartSvg.getBoundingClientRect();
    const scaleX = svgRect.width / width;
    const scaleY = svgRect.height / height;
    const x = svgRect.left - containerRect.left + xScale(point.date) * scaleX;
    const y = svgRect.top - containerRect.top + yScale(point.value) * scaleY;
    tooltipX = Math.max(112, Math.min(x, containerRect.width - 112));
    tooltipY = Math.max(80, y);
  }

  function setActive(index: number) {
    const boundedIndex = Math.max(0, Math.min(index, orderedPoints.length - 1));
    const point = orderedPoints[boundedIndex];
    if (!point) return;
    activeIndex = boundedIndex;
    positionTooltip(boundedIndex);
    onPointFocus(point);
  }

  function handlePointer(event: PointerEvent) {
    if (!orderedPoints.length || !chartSvg) return;
    keyboardActive = false;
    const rect = chartSvg.getBoundingClientRect();
    const viewX =
      ((event.clientX - rect.left) / Math.max(rect.width, 1)) * width;
    const boundedX = Math.max(inset.left, Math.min(viewX, width - inset.right));
    setActive(nearestIndex(xScale.invert(boundedX).getTime()));
  }

  function handleFocus() {
    keyboardActive = true;
    setActive(activeIndex ?? orderedPoints.length - 1);
  }

  function handleBlur() {
    keyboardActive = false;
    activeIndex = undefined;
  }

  function handlePointerLeave() {
    if (!keyboardActive) activeIndex = undefined;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (!orderedPoints.length) return;
    keyboardActive = true;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setActive((activeIndex ?? orderedPoints.length) - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      setActive((activeIndex ?? -1) + 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActive(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActive(orderedPoints.length - 1);
    } else if (event.key === "Escape") {
      chartContainer?.blur();
    }
  }
</script>

{#if orderedPoints.length > 1}
  <div
    class:positive={resolvedTrendTone === "positive"}
    class:negative={resolvedTrendTone === "negative"}
    class:neutral={resolvedTrendTone === "neutral"}
    class="focus-visible:ring-ring relative rounded-md px-5 pt-3 pb-4 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
    bind:this={chartContainer}
    role="slider"
    tabindex="0"
    aria-label={ariaLabel}
    aria-orientation="horizontal"
    aria-valuemin="0"
    aria-valuemax={orderedPoints.length - 1}
    aria-valuenow={activeIndex ?? orderedPoints.length - 1}
    aria-valuetext={`${formatDate(activePoint ?? orderedPoints.at(-1)!)}: ${displayValue(activePoint ?? orderedPoints.at(-1)!)}`}
    data-dashboard-line
    onpointerdown={handlePointer}
    onpointermove={handlePointer}
    onpointerleave={handlePointerLeave}
    onfocus={handleFocus}
    onblur={handleBlur}
    onkeydown={handleKeydown}
  >
    <svg
      bind:this={chartSvg}
      viewBox={`0 0 ${width} ${height}`}
      class="w-full"
      role="img"
      aria-label={chartLabel}
    >
      <defs>
        <linearGradient id={areaGradientId} x1="0" x2="0" y1="0" y2="1">
          <stop
            offset="0"
            stop-color="var(--dashboard-series)"
            stop-opacity="0.2"
          />
          <stop
            offset="1"
            stop-color="var(--dashboard-series)"
            stop-opacity="0.01"
          />
        </linearGradient>
        <clipPath id={activeClipId}>
          <rect
            x={inset.left}
            y="0"
            width={Math.max(0, activeX - inset.left)}
            {height}
          />
        </clipPath>
      </defs>

      <path d={areaPath} fill={`url(#${areaGradientId})`} />
      <path
        d={linePath}
        class:muted-line={Boolean(activePoint)}
        class:series-line={!activePoint}
        class="line"
        data-dashboard-line-base
      />
      {#if activePoint}
        <path
          d={linePath}
          class="line series-line"
          clip-path={`url(#${activeClipId})`}
          data-dashboard-line-active
        />
        <line
          x1={activeX}
          x2={activeX}
          y1={inset.top}
          y2={height - inset.bottom}
          class="crosshair"
          data-dashboard-crosshair
        />
        <circle
          cx={activeX}
          cy={activeY}
          r="4.5"
          class="active-dot"
          data-dashboard-active-point
        />
      {/if}

      <text
        x={inset.left}
        y={height - 7}
        class="axis"
        data-dashboard-date-label
      >
        {formatDate(orderedPoints[0])}
      </text>
      <text
        x={width - inset.right}
        y={height - 7}
        text-anchor="end"
        class="axis"
        data-dashboard-date-label
      >
        {formatDate(orderedPoints.at(-1)!)}
      </text>
    </svg>

    <DashboardChartTooltip
      visible={Boolean(activePoint)}
      x={tooltipX}
      y={tooltipY}
      title={activePoint ? formatDate(activePoint) : ""}
      value={activePoint ? displayValue(activePoint) : ""}
      detail={activeDetail}
    />
  </div>
{:else}
  <div
    class="text-muted-foreground grid min-h-52 place-items-center px-6 text-center text-sm"
  >
    {emptyLabel}
    {#if orderedPoints.length}
      <span class="text-foreground mt-1 block font-mono text-xs"
        >{displayValue(orderedPoints[0])}</span
      >
    {/if}
  </div>
{/if}

<style>
  .positive {
    --dashboard-series: var(--chart-2);
  }

  .negative {
    --dashboard-series: var(--destructive);
  }

  .neutral {
    --dashboard-series: var(--primary);
  }

  .line {
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2.25;
    transition:
      stroke 140ms ease,
      opacity 140ms ease;
  }

  .series-line {
    stroke: var(--dashboard-series);
  }

  .muted-line {
    stroke: color-mix(in oklch, var(--muted-foreground) 62%, transparent);
  }

  .crosshair {
    stroke: color-mix(in oklch, var(--muted-foreground) 45%, transparent);
    stroke-dasharray: 3 4;
    stroke-width: 1;
  }

  .active-dot {
    fill: var(--dashboard-series);
    stroke: var(--background);
    stroke-width: 2.5;
  }

  .axis {
    fill: var(--muted-foreground);
    font-family: "Source Code Pro", monospace;
    font-size: 10px;
  }

  @media (prefers-reduced-motion: reduce) {
    .line {
      transition: none;
    }
  }
</style>
