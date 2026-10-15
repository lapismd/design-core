import type { Component, Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
export type ResponsiveTab = {
  value: string;
  label: string;
  disabled?: boolean;
  Icon?: Component;
};
export type ResponsiveTabsProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  value: string;
  items: readonly ResponsiveTab[];
  onValueChange?: (value: string) => void;
  label?: string;
  disabled?: boolean;
  leading?: Snippet;
  trailing?: Snippet;
  /** Compose inside an owning Tabs.Root bound to the same value. */
  inheritContext?: boolean;
  presentation?: "pill" | "line";
};
