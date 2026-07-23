export interface DashboardTreeNode {
  /** Stable identity used for disclosure state and application callbacks. */
  id: string;
  /** Display-ready account or category name. */
  label: string;
  /** Aggregate amount for this branch in the displayed unit. */
  value: number;
  /** An optional display-ready accent for this branch and its descendants. */
  color?: string;
  children?: readonly DashboardTreeNode[];
}

export interface DashboardTreeContribution {
  id: string;
  label: string;
  value: number;
  color: string;
  percentage: number;
}

export function dashboardTreeTotal(
  nodes: readonly DashboardTreeNode[],
): number {
  return nodes.reduce(
    (total, node) => total + (Number.isFinite(node.value) ? node.value : 0),
    0,
  );
}

/**
 * Build the top-level contribution legend. A root with children contributes
 * its immediate categories; an ungrouped root contributes itself.
 */
export function dashboardTreeContributions(
  nodes: readonly DashboardTreeNode[],
): DashboardTreeContribution[] {
  const candidates = nodes.flatMap((node) =>
    node.children?.length ? node.children : [node],
  );
  const total = candidates.reduce(
    (sum, node) =>
      sum + (Number.isFinite(node.value) ? Math.abs(node.value) : 0),
    0,
  );

  return candidates
    .filter((node) => Number.isFinite(node.value) && node.value !== 0)
    .map((node) => ({
      id: node.id,
      label: node.label,
      value: node.value,
      color: node.color ?? "var(--primary)",
      percentage: total ? (Math.abs(node.value) / total) * 100 : 0,
    }));
}

export function dashboardTreeCollapsibleIds(
  nodes: readonly DashboardTreeNode[],
): string[] {
  return nodes.flatMap((node) => {
    const children = node.children ?? [];
    return children.length
      ? [node.id, ...dashboardTreeCollapsibleIds(children)]
      : [];
  });
}
