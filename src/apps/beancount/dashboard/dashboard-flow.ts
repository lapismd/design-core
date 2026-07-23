export const dashboardFlowSurplusId = "__dashboard-flow-surplus";
export const dashboardFlowDeficitId = "__dashboard-flow-deficit";

export interface DashboardFlowCategory {
  id: string;
  label: string;
  value: number;
  color: string;
}

export interface DashboardFlowBalance {
  cashFlow: number;
  sources: DashboardFlowCategory[];
  targets: DashboardFlowCategory[];
}

export interface PositionedDashboardFlow extends DashboardFlowCategory {
  centerY: number;
  height: number;
  y: number;
}

export interface DashboardFlowLayout {
  centerHeight: number;
  centerY: number;
  scale: number;
  sources: PositionedDashboardFlow[];
  targets: PositionedDashboardFlow[];
  totalIn: number;
  totalOut: number;
}

/**
 * Balance a source → cash-flow → target topology. Positive cash flow becomes
 * a surplus target and a shortfall becomes a deficit source, preserving value
 * on both sides of the visual.
 */
export function balanceDashboardFlow(
  inflows: readonly DashboardFlowCategory[],
  outflows: readonly DashboardFlowCategory[],
): DashboardFlowBalance {
  const sources = inflows.filter((entry) => entry.value > 0);
  const targets = outflows.filter((entry) => entry.value > 0);
  const totalIn = sources.reduce((sum, entry) => sum + entry.value, 0);
  const totalOut = targets.reduce((sum, entry) => sum + entry.value, 0);
  const cashFlow = totalIn - totalOut;

  if (cashFlow > 0) {
    return {
      cashFlow,
      sources,
      targets: [
        ...targets,
        {
          id: dashboardFlowSurplusId,
          color: "var(--chart-2)",
          label: "Surplus",
          value: cashFlow,
        },
      ],
    };
  }

  if (cashFlow < 0) {
    return {
      cashFlow,
      sources: [
        ...sources,
        {
          id: dashboardFlowDeficitId,
          color: "var(--destructive)",
          label: "Deficit",
          value: -cashFlow,
        },
      ],
      targets,
    };
  }

  return { cashFlow, sources, targets };
}

/**
 * Position a fixed source → cash-flow → target topology. Stream thickness is
 * proportional to value, while only side-node gaps consume vertical space.
 */
export function layoutDashboardFlow(
  inflows: readonly DashboardFlowCategory[],
  outflows: readonly DashboardFlowCategory[],
  height: number,
  padding = 16,
  gap = 8,
): DashboardFlowLayout {
  const sources = inflows.filter((entry) => entry.value > 0);
  const targets = outflows.filter((entry) => entry.value > 0);
  const totalIn = sources.reduce((sum, entry) => sum + entry.value, 0);
  const totalOut = targets.reduce((sum, entry) => sum + entry.value, 0);
  const maximumTotal = Math.max(totalIn, totalOut);
  const maximumCount = Math.max(sources.length, targets.length);
  const availableHeight = Math.max(
    0,
    height - padding * 2 - Math.max(maximumCount - 1, 0) * gap,
  );
  const scale = maximumTotal ? availableHeight / maximumTotal : 0;
  const centerHeight = maximumTotal * scale;
  const centerY = (height - centerHeight) / 2;

  function position(
    entries: readonly DashboardFlowCategory[],
  ): PositionedDashboardFlow[] {
    const total = entries.reduce((sum, entry) => sum + entry.value, 0);
    const linksHeight = total * scale;
    const nodesHeight = linksHeight + Math.max(entries.length - 1, 0) * gap;
    let y = (height - nodesHeight) / 2;
    let centerOffset = centerY + (centerHeight - linksHeight) / 2;

    return entries.map((entry) => {
      const flowHeight = entry.value * scale;
      const positioned = {
        ...entry,
        centerY: centerOffset,
        height: flowHeight,
        y,
      };
      y += flowHeight + gap;
      centerOffset += flowHeight;
      return positioned;
    });
  }

  return {
    centerHeight,
    centerY,
    scale,
    sources: position(sources),
    targets: position(targets),
    totalIn,
    totalOut,
  };
}
