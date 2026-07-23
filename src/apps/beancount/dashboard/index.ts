/** Beancount Studio dashboard primitives: the financial dashboard page and its sections. */
export { default as DashboardChartTooltip } from "./DashboardChartTooltip.svelte";
export {
  default as DashboardDonut,
  type DashboardDonutCategory,
} from "./DashboardDonut.svelte";
export {
  default as DashboardFlow,
  type DashboardFlowCategory,
} from "./DashboardFlow.svelte";
export {
  default as DashboardLine,
  type DashboardLinePoint,
  type DashboardTrendTone,
} from "./DashboardLine.svelte";
export { default as DashboardSection } from "./DashboardSection.svelte";
export {
  default as DashboardTreeRow,
  type DashboardTreeNode,
} from "./DashboardTreeRow.svelte";
export {
  default as DashboardTreeTable,
  type DashboardTreeContribution,
} from "./DashboardTreeTable.svelte";
export {
  default as FinancialDashboard,
  type FinancialDashboardAccountGroup,
  type FinancialDashboardMetric,
  type FinancialDashboardNetWorth,
  type FinancialDashboardOption,
  type FinancialDashboardOutflow,
  type FinancialDashboardSectionId,
} from "./FinancialDashboard.svelte";
