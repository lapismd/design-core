import type { HTMLAttributes } from "svelte/elements";
export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
export type AvatarShape = "circle" | "rounded";
export type AvatarPresence = "online" | "away" | "busy" | "offline";
export type AvatarProps = HTMLAttributes<HTMLSpanElement> & {
  src?: string;
  emoji?: string;
  name?: string;
  initials?: string;
  shape?: AvatarShape;
  size?: AvatarSize;
  background?: string;
  presence?: AvatarPresence;
  decorative?: boolean;
};
export function avatarInitials(name: string): string {
  const words = name
    .trim()
    .split(/[\s_-]+/u)
    .filter(Boolean);
  return (
    words.length > 1
      ? `${Array.from(words[0]!)[0] ?? ""}${Array.from(words.at(-1)!)[0] ?? ""}`
      : Array.from(words[0] ?? "")
          .slice(0, 2)
          .join("")
  ).toUpperCase();
}
