<script module lang="ts">
  export type { DashboardFlowCategory } from "./dashboard-flow";

  let nextDashboardFlowId = 0;
</script>

<script lang="ts">
  import DashboardChartTooltip from "./DashboardChartTooltip.svelte";
  import {
    balanceDashboardFlow,
    dashboardFlowDeficitId,
    dashboardFlowSurplusId,
    layoutDashboardFlow,
    type DashboardFlowCategory,
  } from "./dashboard-flow";

  type FlowSide = "in" | "out";
  type ActiveFlow = DashboardFlowCategory & { side: FlowSide };

  let {
    inflows = [],
    outflows = [],
    ariaLabel,
    emptyLabel = "No cash-flow activity matches this period.",
    valueFormatter = (value) => String(value),
    onCategoryFocus = () => {},
    onCategorySelect = () => {},
  }: {
    inflows?: readonly DashboardFlowCategory[];
    outflows?: readonly DashboardFlowCategory[];
    ariaLabel?: string;
    emptyLabel?: string;
    valueFormatter?: (value: number) => string;
    /** Report the category being explored without owning a route. */
    onCategoryFocus?: (category: DashboardFlowCategory, side: FlowSide) => void;
    /** Report explicit category activation so the application can navigate. */
    onCategorySelect?: (
      category: DashboardFlowCategory,
      side: FlowSide,
    ) => void;
  } = $props();

  const width = 1000;
  const sideX = 14;
  const centerX = 472;
  const rightX = 814;
  const barWidth = 14;
  const chartHeight = 480;
  const instanceId = `dashboard-flow-${nextDashboardFlowId++}`;

  let active = $state<ActiveFlow | undefined>(undefined);
  let chartContainer = $state<HTMLDivElement>();
  let tooltipX = $state(0);
  let tooltipY = $state(0);

  const flow = $derived(balanceDashboardFlow(inflows, outflows));
  const layout = $derived(
    layoutDashboardFlow(flow.sources, flow.targets, chartHeight, 16, 32),
  );
  const cashFlowColor = $derived(
    flow.cashFlow > 0
      ? "var(--chart-2)"
      : flow.cashFlow < 0
        ? "var(--destructive)"
        : "var(--primary)",
  );
  const flowAriaLabel = $derived(
    ariaLabel ??
      (flow.cashFlow > 0
        ? "Cash flow from income and refunds to outflows and surplus"
        : flow.cashFlow < 0
          ? "Cash flow from income, refunds, and deficit to outflows"
          : "Cash flow from income and refunds to outflows"),
  );
  const isEmpty = $derived(!layout.sources.length && !layout.targets.length);
  const activeTotal = $derived(
    active?.side === "in" ? layout.totalIn : layout.totalOut,
  );
  const tooltipTitle = $derived(
    active
      ? active.side === "in"
        ? `${active.label} → Cash flow`
        : `Cash flow → ${active.label}`
      : "",
  );
  const tooltipDetail = $derived(
    active
      ? `(${activeTotal ? ((active.value / activeTotal) * 100).toFixed(1) : "0.0"}%)`
      : "",
  );

  function flowPath(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    height: number,
  ) {
    const bend = (toX - fromX) * 0.46;
    return `M ${fromX} ${fromY} C ${fromX + bend} ${fromY}, ${toX - bend} ${toY}, ${toX} ${toY} L ${toX} ${toY + height} C ${toX - bend} ${toY + height}, ${fromX + bend} ${fromY + height}, ${fromX} ${fromY + height} Z`;
  }

  function gradientId(side: FlowSide, id: string) {
    return `${instanceId}-${side}-${id.replaceAll(/[^a-z0-9]/gi, "-")}`;
  }

  function positionTooltip(event: MouseEvent | FocusEvent | PointerEvent) {
    if (!chartContainer) return;
    const containerRect = chartContainer.getBoundingClientRect();
    const targetRect = (event.currentTarget as Element).getBoundingClientRect();
    const hasPointerCoordinates = "clientX" in event && event.clientX !== 0;
    const clientX = hasPointerCoordinates
      ? event.clientX
      : targetRect.left + targetRect.width / 2;
    const clientY = hasPointerCoordinates
      ? event.clientY
      : targetRect.top + targetRect.height / 2;
    tooltipX = Math.max(
      104,
      Math.min(clientX - containerRect.left, containerRect.width - 104),
    );
    tooltipY = Math.max(72, clientY - containerRect.top);
  }

  function focusCategory(
    category: DashboardFlowCategory,
    side: FlowSide,
    event: MouseEvent | FocusEvent | PointerEvent,
  ) {
    active = { ...category, side };
    positionTooltip(event);
    onCategoryFocus(category, side);
  }

  function selectCategory(
    category: DashboardFlowCategory,
    side: FlowSide,
    event: MouseEvent | FocusEvent | PointerEvent,
  ) {
    focusCategory(category, side, event);
    onCategorySelect(category, side);
  }

  function clearActive() {
    active = undefined;
  }

  function handleKeydown(
    event: KeyboardEvent,
    category: DashboardFlowCategory,
    side: FlowSide,
  ) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectCategory(category, side, event as unknown as FocusEvent);
    } else if (event.key === "Escape") {
      clearActive();
      (event.currentTarget as SVGPathElement).blur();
    }
  }

  function isActive(category: DashboardFlowCategory, side: FlowSide) {
    return active?.side === side && active.id === category.id;
  }

  function isDimmed(category: DashboardFlowCategory, side: FlowSide) {
    return Boolean(active && !isActive(category, side));
  }

  function isSynthetic(category: DashboardFlowCategory) {
    return ["Other", dashboardFlowDeficitId, dashboardFlowSurplusId].includes(
      category.id,
    );
  }
</script>

{#if isEmpty}
  <div
    class="text-muted-foreground grid min-h-60 place-items-center px-6 text-center text-sm"
  >
    {emptyLabel}
  </div>
{:else}
  <div class="overflow-x-auto px-3 py-4">
    <div class="relative min-w-[720px]" bind:this={chartContainer}>
      <svg
        class="w-full"
        viewBox={`0 0 ${width} ${chartHeight}`}
        role="group"
        aria-label={flowAriaLabel}
        data-dashboard-flow
        onpointerleave={clearActive}
      >
        <defs>
          {#each layout.sources as source (source.id)}
            <linearGradient id={gradientId("in", source.id)} x1="0" x2="1">
              <stop offset="0" stop-color={source.color} stop-opacity="0.5" />
              <stop offset="1" stop-color={cashFlowColor} stop-opacity="0.48" />
            </linearGradient>
          {/each}
          {#each layout.targets as target (target.id)}
            <linearGradient id={gradientId("out", target.id)} x1="0" x2="1">
              <stop offset="0" stop-color={cashFlowColor} stop-opacity="0.48" />
              <stop offset="1" stop-color={target.color} stop-opacity="0.72" />
            </linearGradient>
          {/each}
        </defs>

        {#each layout.sources as source (source.id)}
          <path
            d={flowPath(
              sideX + barWidth,
              source.y,
              centerX,
              source.centerY,
              source.height,
            )}
            fill={`url(#${gradientId("in", source.id)})`}
            class:dimmed={isDimmed(source, "in")}
            class:active={isActive(source, "in")}
            class="flow-stream"
            role="button"
            tabindex="0"
            aria-label={`${source.label} to Cash flow: ${valueFormatter(source.value)}`}
            data-dashboard-flow-stream
            data-side="in"
            data-category={source.id}
            data-active={isActive(source, "in")}
            onpointerenter={(event) => focusCategory(source, "in", event)}
            onpointermove={positionTooltip}
            onfocus={(event) => focusCategory(source, "in", event)}
            onblur={clearActive}
            onclick={(event) => selectCategory(source, "in", event)}
            onkeydown={(event) => handleKeydown(event, source, "in")}
          />
        {/each}
        {#each layout.targets as target (target.id)}
          <path
            d={flowPath(
              centerX + barWidth,
              target.centerY,
              rightX,
              target.y,
              target.height,
            )}
            fill={`url(#${gradientId("out", target.id)})`}
            class:dimmed={isDimmed(target, "out")}
            class:active={isActive(target, "out")}
            class="flow-stream"
            role="button"
            tabindex="0"
            aria-label={`Cash flow to ${target.label}: ${valueFormatter(target.value)}`}
            data-dashboard-flow-stream
            data-side="out"
            data-category={target.id}
            data-active={isActive(target, "out")}
            onpointerenter={(event) => focusCategory(target, "out", event)}
            onpointermove={positionTooltip}
            onfocus={(event) => focusCategory(target, "out", event)}
            onblur={clearActive}
            onclick={(event) => selectCategory(target, "out", event)}
            onkeydown={(event) => handleKeydown(event, target, "out")}
          />
        {/each}

        {#each layout.sources as source (source.id)}
          <g
            class:dimmed={isDimmed(source, "in")}
            class:synthetic={isSynthetic(source)}
            class="flow-node"
            aria-hidden="true"
          >
            <rect
              x={sideX}
              y={source.y}
              width={barWidth}
              height={Math.max(source.height, 1.5)}
              rx="3"
              fill={source.color}
            />
            <text
              x={sideX + 22}
              y={source.y + Math.min(source.height / 2 + 4, 15)}
              class="label">{source.label}</text
            >
            <text
              x={sideX + 22}
              y={source.y + Math.min(source.height / 2 + 19, 30)}
              class="amount">{valueFormatter(source.value)}</text
            >
          </g>
        {/each}

        <g aria-hidden="true">
          <rect
            x={centerX}
            y={layout.centerY}
            width={barWidth}
            height={layout.centerHeight}
            rx="3"
            fill={cashFlowColor}
          />
          <text
            x={centerX + 22}
            y={layout.centerY + layout.centerHeight / 2 - 4}
            class="label">Cash flow</text
          >
          <text
            x={centerX + 22}
            y={layout.centerY + layout.centerHeight / 2 + 12}
            class="amount">{valueFormatter(flow.cashFlow)}</text
          >
        </g>

        {#each layout.targets as target (target.id)}
          <g
            class:dimmed={isDimmed(target, "out")}
            class:synthetic={isSynthetic(target)}
            class="flow-node"
            aria-hidden="true"
          >
            <rect
              x={rightX}
              y={target.y}
              width={barWidth}
              height={Math.max(target.height, 1.5)}
              rx="3"
              fill={target.color}
            />
            <text
              x={rightX + 22}
              y={target.y + Math.min(target.height / 2 + 4, 15)}
              class="label">{target.label}</text
            >
            <text
              x={rightX + 22}
              y={target.y + Math.min(target.height / 2 + 19, 30)}
              class="amount">{valueFormatter(target.value)}</text
            >
          </g>
        {/each}
      </svg>

      <DashboardChartTooltip
        visible={Boolean(active)}
        x={tooltipX}
        y={tooltipY}
        title={tooltipTitle}
        value={active ? valueFormatter(active.value) : ""}
        detail={tooltipDetail}
      />
    </div>
  </div>
{/if}

<style>
  .label {
    fill: var(--foreground);
    font-family: "DM Sans Variable", sans-serif;
    font-size: 13px;
    font-weight: 600;
  }

  .amount {
    fill: var(--muted-foreground);
    font-family: "Source Code Pro", monospace;
    font-size: 11px;
  }

  .flow-stream,
  .flow-node {
    opacity: 1;
    transition:
      filter 140ms ease,
      opacity 140ms ease;
  }

  .flow-stream {
    cursor: pointer;
    outline: none;
  }

  .flow-stream:focus,
  .flow-stream.active {
    filter: brightness(0.94) saturate(1.08);
  }

  .flow-stream.dimmed,
  .flow-node.dimmed {
    opacity: 0.14;
  }

  @media (prefers-reduced-motion: reduce) {
    .flow-stream,
    .flow-node {
      transition: none;
    }
  }
</style>
