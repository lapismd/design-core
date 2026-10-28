import type { Component, Snippet } from "svelte";
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
  /** Mention keeps the original jj-store inline author geometry. */
  appearance?: "reference" | "mention";
  /** Optional host-owned profile/context preview; omitted means no hover card. */
  preview?: Snippet;
  class?: string;
};
