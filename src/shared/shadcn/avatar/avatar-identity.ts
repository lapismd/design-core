import type { AvatarProps } from "./avatar.types.js";
/** Display-only identity; profile lookup and routing belong to the host. */
export type AvatarIdentity = Pick<
  AvatarProps,
  "name" | "src" | "emoji" | "initials" | "shape" | "background" | "presence"
> & { id: string; name: string };
export function avatarIdentityProps(identity: AvatarIdentity): AvatarProps {
  const { id: _id, ...props } = identity;
  return Object.fromEntries(
    Object.entries(props).filter(([, value]) => value !== undefined),
  );
}
