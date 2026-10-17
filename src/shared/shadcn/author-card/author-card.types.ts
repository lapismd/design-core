import type { Component, Snippet } from "svelte";
import type { AvatarIdentity, AvatarSize } from "../avatar/index.js";
export type AuthorCardAction = {
  id: string;
  label: string;
  icon?: Component;
  disabled?: boolean;
  onSelect: (author: AvatarIdentity) => void;
};
export type AuthorCardProps = {
  author: AvatarIdentity;
  description?: string;
  handle?: string;
  role?: string;
  actions?: readonly AuthorCardAction[];
  details?: Snippet<[AvatarIdentity]>;
  trigger?: "avatar" | "mention";
  interaction?: "hover" | "popover";
  size?: AvatarSize;
  open?: boolean;
  disabled?: boolean;
  label?: string;
  class?: string;
};
