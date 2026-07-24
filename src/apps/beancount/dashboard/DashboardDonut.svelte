<script lang="ts">
  export type DashboardDonutCategory = {
    id: string;
    label: string;
    value: number;
    /** Display-ready amount supplied by the application. */
    valueLabel?: string;
    color: string;
  };

  type DonutArc = {
    category: DashboardDonutCategory;
    start: number;
    end: number;
  };

  let {
    categories = [],
    title = "Outflows",
    ariaLabel = `${title} by category`,
    emptyLabel = "No outflows in this period.",
    valueFormatter = (value) => String(value),
    onCategoryFocus = () => {},
  }: {
    categories?: readonly DashboardDonutCategory[];
    title?: string;
    ariaLabel?: string;
    emptyLabel?: string;
    valueFormatter?: (value: number) => string;
    /** Report a hovered, focused, or activated category to the application. */
    onCategoryFocus?: (category: DashboardDonutCategory) => void;
  } = $props();

  const innerRadius = 64;
  const outerRadius = 98;
  const padAngle = 0.018;
  let activeCategory = $state<DashboardDonutCategory | null>(null);

  const visibleCategories = $derived(
    categories.filter(
      (category) => Number.isFinite(category.value) && category.value > 0,
    ),
  );
  const total = $derived(
    visibleCategories.reduce((sum, category) => sum + category.value, 0),
  );
  const arcs = $derived.by(() => {
    let cursor = 0;
    return visibleCategories.map((category) => {
      const span = (category.value / total) * 2 * Math.PI;
      const arc = {
        category,
        start: cursor + padAngle / 2,
        end: cursor + span - padAngle / 2,
      };
      cursor += span;
      return arc;
    });
  });

  function polar(angle: number, radius: number) {
    const adjusted = angle - Math.PI / 2;
    return [Math.cos(adjusted) * radius, Math.sin(adjusted) * radius] as const;
  }

  function pathFor(arc: DonutArc) {
    const [outerStartX, outerStartY] = polar(arc.start, outerRadius);
    const [outerEndX, outerEndY] = polar(arc.end, outerRadius);
    const [innerEndX, innerEndY] = polar(arc.end, innerRadius);
    const [innerStartX, innerStartY] = polar(arc.start, innerRadius);
    const largeArc = arc.end - arc.start > Math.PI ? 1 : 0;
    return `M${outerStartX},${outerStartY} A${outerRadius},${outerRadius} 0 ${largeArc} 1 ${outerEndX},${outerEndY} L${innerEndX},${innerEndY} A${innerRadius},${innerRadius} 0 ${largeArc} 0 ${innerStartX},${innerStartY} Z`;
  }

  function activateCategory(category: DashboardDonutCategory) {
    activeCategory = category;
    onCategoryFocus(category);
  }

  function handleKeydown(
    event: KeyboardEvent,
    category: DashboardDonutCategory,
  ) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    activateCategory(category);
  }

  function categoryLabel(category: DashboardDonutCategory) {
    return `${category.label}: ${category.valueLabel ?? valueFormatter(category.value)}`;
  }
</script>

<section class="bc-dashboard-donut" aria-label={ariaLabel} data-dashboard-donut>
  {#if total}
    <svg
      viewBox="-116 -116 232 232"
      class="bc-dashboard-donut__svg"
      role="group"
      aria-label={ariaLabel}
    >
      {#each arcs as arc (arc.category.id)}
        <path
          d={pathFor(arc)}
          fill={arc.category.color}
          stroke={activeCategory?.id === arc.category.id
            ? "var(--ui-beancount-foreground)"
            : "transparent"}
          stroke-width={activeCategory?.id === arc.category.id ? 2 : 0}
          opacity={activeCategory && activeCategory.id !== arc.category.id
            ? "0.2"
            : "1"}
          class="bc-dashboard-donut__arc"
          role="button"
          tabindex="0"
          aria-label={categoryLabel(arc.category)}
          onmouseenter={() => activateCategory(arc.category)}
          onfocus={() => activateCategory(arc.category)}
          onclick={() => activateCategory(arc.category)}
          onkeydown={(event) => handleKeydown(event, arc.category)}
        />
      {/each}
      <text
        text-anchor="middle"
        y="-7"
        fill="var(--ui-beancount-muted-foreground)"
        class="bc-dashboard-donut__label"
      >
        {activeCategory?.label ?? title}
      </text>
      <text
        text-anchor="middle"
        y="16"
        fill="var(--ui-beancount-foreground)"
        class="bc-dashboard-donut__value"
      >
        {activeCategory?.valueLabel ??
          valueFormatter(activeCategory?.value ?? total)}
      </text>
    </svg>
  {:else}
    <p class="bc-dashboard-donut__empty">{emptyLabel}</p>
  {/if}
</section>

<style>
  .bc-dashboard-donut {
    display: grid;
    min-height: 16rem;
    place-items: center;
    padding: var(--ui-beancount-space-4);
  }
  .bc-dashboard-donut__svg {
    width: 14rem;
    height: 14rem;
  }
  .bc-dashboard-donut__arc {
    cursor: pointer;
    outline: none;
    transition: opacity 150ms ease;
  }
  .bc-dashboard-donut__label {
    font-size: 0.8125rem;
    font-weight: 600;
  }
  .bc-dashboard-donut__value {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    font-weight: 600;
  }
  .bc-dashboard-donut__empty {
    color: var(--ui-beancount-muted-foreground);
    font-size: 0.875rem;
  }
</style>
