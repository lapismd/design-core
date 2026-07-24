import { describe, expect, test } from "vitest";
import {
  balanceDashboardFlow,
  dashboardFlowDeficitId,
  dashboardFlowSurplusId,
  layoutDashboardFlow,
  type DashboardFlowCategory,
} from "./dashboard-flow";

function category(label: string, value: number): DashboardFlowCategory {
  return {
    id: `account-${label}`,
    color: "var(--ui-beancount-dashboard-series-orange)",
    label,
    value,
  };
}

describe("dashboard flow geometry", () => {
  test("keeps stream thickness proportional and preserves source order", () => {
    const layout = layoutDashboardFlow(
      [category("Salary", 75), category("Refund", 25)],
      [category("Bills", 50), category("Food", 20), category("Other", 10)],
      340,
    );

    expect(layout.sources.map((entry) => entry.label)).toEqual([
      "Salary",
      "Refund",
    ]);
    expect(layout.sources[0].height / layout.sources[1].height).toBeCloseTo(3);
    expect(
      layout.sources.reduce((sum, entry) => sum + entry.height, 0),
    ).toBeCloseTo(layout.totalIn * layout.scale);
    expect(
      layout.targets.reduce((sum, entry) => sum + entry.height, 0),
    ).toBeCloseTo(layout.totalOut * layout.scale);
  });

  test("adds a surplus or deficit leaf to conserve the visual totals", () => {
    const surplus = balanceDashboardFlow(
      [category("Salary", 100)],
      [category("Bills", 80)],
    );
    const deficit = balanceDashboardFlow(
      [category("Salary", 80)],
      [category("Bills", 100)],
    );

    expect(surplus.targets.at(-1)).toMatchObject({
      id: dashboardFlowSurplusId,
      label: "Surplus",
      value: 20,
    });
    expect(deficit.sources.at(-1)).toMatchObject({
      id: dashboardFlowDeficitId,
      label: "Deficit",
      value: 20,
    });
  });

  test("returns a finite empty layout when no activity is present", () => {
    const layout = layoutDashboardFlow([], [], 340);

    expect(layout.sources).toEqual([]);
    expect(layout.targets).toEqual([]);
    expect(layout.scale).toBe(0);
    expect(Number.isFinite(layout.centerY)).toBe(true);
  });
});
