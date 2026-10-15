import type { Component } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { BadgeVariant } from "../badge/index.js";

export type TagListItem = {
  /** Stable, unique identity; input order determines display priority. */
  id: string;
  label: string;
  icon?: Component;
  variant?: BadgeVariant;
  tone?: "neutral" | "accent" | "success" | "warning" | "danger";
  tooltip?: string;
  disabled?: boolean;
  /** Controlled presentation; clicking does not change it. */
  active?: boolean;
  onClick?: (tag: TagListItem, event: MouseEvent) => void;
};

export type TagListProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  tags: readonly TagListItem[];
  size?: "sm" | "md" | "lg";
  /** Accessible list name and overflow heading. */
  label?: string;
};
