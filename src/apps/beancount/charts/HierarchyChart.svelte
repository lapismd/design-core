<script lang="ts">
  import CircleAlert from "@lucide/svelte/icons/circle-alert";

  export type HierarchyChartNode = {
    id: string;
    label: string;
    /** A display-ready value supplied by the application. */
    value?: number;
    valueLabel?: string;
    color: string;
    children?: readonly HierarchyChartNode[];
  };

  export type HierarchyChartMode = "treemap" | "sunburst";

  type TreemapTile = {
    node: HierarchyChartNode;
    x: number;
    y: number;
    width: number;
    height: number;
  };

  type ArcSegment = {
    node: HierarchyChartNode;
    start: number;
    end: number;
    depth: number;
  };

  let {
    root,
    mode = "treemap",
    ariaLabel = "Hierarchy chart",
    emptyLabel = "No hierarchy data is available.",
    onNodeFocus = () => {},
  }: {
    root: HierarchyChartNode;
    mode?: HierarchyChartMode;
    ariaLabel?: string;
    emptyLabel?: string;
    /** Report a hovered, focused, or activated hierarchy node to the application. */
    onNodeFocus?: (node: HierarchyChartNode) => void;
  } = $props();

  const width = 800;
  const height = 320;
  const padding = 3;
  const radius = Math.min(width, height) / 2 - 12;

  let activeNode = $state<HierarchyChartNode | null>(null);

  const rootValue = $derived(totalValue(root));
  const hasData = $derived(rootValue > 0);
  const treemapTiles = $derived.by(() => buildTreemap(root));
  const maxDepth = $derived(treeDepth(root));
  const arcs = $derived.by(() => buildArcs(root));
  const ringWidth = $derived(radius / Math.max(maxDepth, 1));

  function childrenOf(node: HierarchyChartNode) {
    return (node.children ?? []).filter((child) => totalValue(child) > 0);
  }

  function totalValue(node: HierarchyChartNode): number {
    if (Number.isFinite(node.value) && (node.value ?? 0) > 0)
      return node.value!;
    return childrenOf(node).reduce(
      (total, child) => total + totalValue(child),
      0,
    );
  }

  function treeDepth(node: HierarchyChartNode): number {
    const children = childrenOf(node);
    return children.length
      ? 1 + Math.max(...children.map((child) => treeDepth(child)))
      : 0;
  }

  function buildTreemap(rootNode: HierarchyChartNode): TreemapTile[] {
    const tiles: TreemapTile[] = [];
    function layout(
      node: HierarchyChartNode,
      x: number,
      y: number,
      tileWidth: number,
      tileHeight: number,
      splitHorizontally: boolean,
    ) {
      const children = childrenOf(node);
      if (!children.length) {
        tiles.push({ node, x, y, width: tileWidth, height: tileHeight });
        return;
      }
      const total = children.reduce((sum, child) => sum + totalValue(child), 0);
      let offset = 0;
      for (const child of children) {
        const proportion = totalValue(child) / total;
        if (splitHorizontally) {
          const childWidth = tileWidth * proportion;
          layout(child, x + offset, y, childWidth, tileHeight, false);
          offset += childWidth;
        } else {
          const childHeight = tileHeight * proportion;
          layout(child, x, y + offset, tileWidth, childHeight, true);
          offset += childHeight;
        }
      }
    }
    layout(rootNode, 0, 0, width, height, true);
    return tiles.filter((tile) => tile.width > 0 && tile.height > 0);
  }

  function buildArcs(rootNode: HierarchyChartNode): ArcSegment[] {
    const segments: ArcSegment[] = [];
    function partition(
      node: HierarchyChartNode,
      start: number,
      end: number,
      depth: number,
    ) {
      const children = childrenOf(node);
      if (!children.length) {
        if (depth > 0) segments.push({ node, start, end, depth });
        return;
      }
      const total = children.reduce((sum, child) => sum + totalValue(child), 0);
      let cursor = start;
      for (const child of children) {
        const next = cursor + ((end - start) * totalValue(child)) / total;
        partition(child, cursor, next, depth + 1);
        cursor = next;
      }
    }
    partition(rootNode, 0, 2 * Math.PI, 0);
    return segments;
  }

  function polar(angle: number, currentRadius: number) {
    const adjusted = angle - Math.PI / 2;
    return [
      width / 2 + Math.cos(adjusted) * currentRadius,
      height / 2 + Math.sin(adjusted) * currentRadius,
    ] as const;
  }

  function arcPath(segment: ArcSegment) {
    const inner = Math.max((segment.depth - 1) * ringWidth, 0);
    const outer = segment.depth * ringWidth - padding;
    const span = segment.end - segment.start;
    const [outerStartX, outerStartY] = polar(segment.start, outer);
    const [outerEndX, outerEndY] = polar(segment.end, outer);
    const [innerEndX, innerEndY] = polar(segment.end, inner);
    const [innerStartX, innerStartY] = polar(segment.start, inner);
    const largeArc = span > Math.PI ? 1 : 0;
    if (span >= 2 * Math.PI - 0.001) {
      const [middleX, middleY] = polar(segment.start + Math.PI, outer);
      return `M${outerStartX},${outerStartY} A${outer},${outer} 0 1 1 ${middleX},${middleY} A${outer},${outer} 0 1 1 ${outerStartX},${outerStartY} Z`;
    }
    return `M${outerStartX},${outerStartY} A${outer},${outer} 0 ${largeArc} 1 ${outerEndX},${outerEndY} L${innerEndX},${innerEndY} A${inner},${inner} 0 ${largeArc} 0 ${innerStartX},${innerStartY} Z`;
  }

  function activateNode(node: HierarchyChartNode) {
    activeNode = node;
    onNodeFocus(node);
  }

  function handleNodeKeydown(event: KeyboardEvent, node: HierarchyChartNode) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    activateNode(node);
  }

  function nodeLabel(node: HierarchyChartNode) {
    const value = totalValue(node);
    return `${node.label}: ${node.valueLabel ?? String(value)}`;
  }
</script>

<section class="bc-hierarchy-chart" aria-label={ariaLabel}>
  {#if hasData}
    <div class="bc-hierarchy-chart__canvas">
      <svg
        class="bc-hierarchy-chart__svg"
        viewBox={`0 0 ${width} ${height}`}
        role="group"
        aria-label={ariaLabel}
      >
        {#if mode === "treemap"}
          {#each treemapTiles as tile (tile.node.id)}
            <g transform={`translate(${tile.x + padding},${tile.y + padding})`}>
              <rect
                width={Math.max(tile.width - 2 * padding, 0)}
                height={Math.max(tile.height - 2 * padding, 0)}
                fill={tile.node.color}
                class="bc-hierarchy-chart__node"
                role="button"
                tabindex="0"
                aria-label={nodeLabel(tile.node)}
                onmouseenter={() => activateNode(tile.node)}
                onfocus={() => activateNode(tile.node)}
                onclick={() => activateNode(tile.node)}
                onkeydown={(event) => handleNodeKeydown(event, tile.node)}
              />
              {#if tile.width > 110 && tile.height > 34}
                <text
                  x={(tile.width - 2 * padding) / 2}
                  y={(tile.height - 2 * padding) / 2}
                  text-anchor="middle"
                  fill="var(--foreground)"
                  class="bc-hierarchy-chart__treemap-label"
                >
                  {tile.node.label}
                </text>
              {/if}
            </g>
          {/each}
        {:else}
          {#each arcs as segment (segment.node.id)}
            <path
              d={arcPath(segment)}
              fill={segment.node.color}
              class="bc-hierarchy-chart__node"
              role="button"
              tabindex="0"
              aria-label={nodeLabel(segment.node)}
              onmouseenter={() => activateNode(segment.node)}
              onfocus={() => activateNode(segment.node)}
              onclick={() => activateNode(segment.node)}
              onkeydown={(event) => handleNodeKeydown(event, segment.node)}
            />
          {/each}
          <text
            x={width / 2}
            y={height / 2 - 4}
            text-anchor="middle"
            fill="var(--foreground)"
            class="bc-hierarchy-chart__sunburst-label"
          >
            {(activeNode ?? root).label}
          </text>
          <text
            x={width / 2}
            y={height / 2 + 16}
            text-anchor="middle"
            fill="var(--muted-foreground)"
            class="bc-hierarchy-chart__sunburst-value"
          >
            {(activeNode ?? root).valueLabel ?? totalValue(activeNode ?? root)}
          </text>
        {/if}
      </svg>
    </div>
    <output class="bc-hierarchy-chart__summary" aria-live="polite">
      {#if activeNode}
        {nodeLabel(activeNode)}
      {:else}
        Focus an allocation to inspect its value.
      {/if}
    </output>
  {:else}
    <div class="bc-hierarchy-chart__empty">
      <CircleAlert class="bc-hierarchy-chart__empty-icon" aria-hidden="true" />
      <p>{emptyLabel}</p>
    </div>
  {/if}
</section>

<style>
  .bc-hierarchy-chart {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: var(--ui-beancount-space-3);
  }

  .bc-hierarchy-chart__canvas {
    overflow-x: auto;
    border: 1px solid color-mix(in srgb, var(--ui-beancount-border) 80%, transparent);
    border-radius: var(--ui-beancount-radius-panel);
    background-color: var(--ui-beancount-surface);
    padding: var(--ui-beancount-space-3);
    box-shadow: var(--ui-beancount-shadow-panel);
  }

  .bc-hierarchy-chart__svg {
    display: block;
    min-width: 36rem;
  }

  .bc-hierarchy-chart__node {
    cursor: pointer;
    outline: none;
  }

  .bc-hierarchy-chart__node:focus {
    stroke: var(--ui-beancount-foreground);
    stroke-width: 2;
  }

  .bc-hierarchy-chart__treemap-label {
    pointer-events: none;
    font-size: 0.8125rem;
    font-weight: 600;
  }

  .bc-hierarchy-chart__sunburst-label {
    font-size: 0.8125rem;
    font-weight: 600;
  }

  .bc-hierarchy-chart__sunburst-value {
    font-size: 0.6875rem;
  }

  .bc-hierarchy-chart__summary {
    min-height: var(--ui-beancount-space-5);
    color: var(--ui-beancount-muted-foreground);
    font-size: 0.875rem;
  }

  .bc-hierarchy-chart__empty {
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

  :global(.bc-hierarchy-chart__empty-icon) {
    width: var(--ui-beancount-space-5);
    height: var(--ui-beancount-space-5);
  }
</style>
