import { describe, expect, test } from "vitest";
import {
  dashboardTreeCollapsibleIds,
  dashboardTreeContributions,
  dashboardTreeTotal,
  type DashboardTreeNode,
} from "./dashboard-tree-table";

const nodes: DashboardTreeNode[] = [
  {
    id: "assets",
    label: "Assets",
    value: 1510,
    children: [
      { id: "assets-cash", label: "Cash", value: 510, color: "#059669" },
      { id: "assets-bank", label: "Bank", value: 1000, color: "#2563eb" },
    ],
  },
];

describe("dashboard tree table model", () => {
  test("uses direct children as the balanced contribution legend", () => {
    expect(dashboardTreeTotal(nodes)).toBe(1510);
    expect(dashboardTreeContributions(nodes)).toEqual([
      {
        id: "assets-cash",
        label: "Cash",
        value: 510,
        color: "#059669",
        percentage: expect.closeTo(33.77483443708609),
      },
      {
        id: "assets-bank",
        label: "Bank",
        value: 1000,
        color: "#2563eb",
        percentage: expect.closeTo(66.2251655629139),
      },
    ]);
  });

  test("collects every expandable branch for collapse-all", () => {
    expect(
      dashboardTreeCollapsibleIds([
        {
          ...nodes[0],
          children: [
            {
              ...nodes[0].children![0],
              children: [
                { id: "assets-cash-wallet", label: "Wallet", value: 40 },
              ],
            },
          ],
        },
      ]),
    ).toEqual(["assets", "assets-cash"]);
  });
});
