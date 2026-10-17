import type { Component } from "svelte";
import type { AvatarIdentity } from "../avatar/index.js";
import type { BadgeVariant } from "../badge/index.js";
export type ReferenceChipProps = {
  label: string;
  description?: string;
  icon?: Component;
  avatar?: AvatarIdentity;
  href?: string;
  onClick?: (event: MouseEvent) => void;
  onRemove?: () => void;
  disabled?: boolean;
  variant?: BadgeVariant;
  class?: string;
};
