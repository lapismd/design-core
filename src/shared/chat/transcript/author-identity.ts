import type { AvatarIdentity } from "../../shadcn/avatar/avatar-identity.js";
import type { TranscriptAuthor } from "./model.js";

/** Project neutral display fields while preserving the host's original author for callbacks. */
export function transcriptAuthorIdentity(
  author: TranscriptAuthor,
): AvatarIdentity {
  const identity: AvatarIdentity = { id: author.id, name: author.name };
  if (author.image !== undefined) identity.src = author.image;
  if (author.emoji !== undefined) identity.emoji = author.emoji;
  if (author.initials !== undefined) identity.initials = author.initials;
  if (author.shape !== undefined) identity.shape = author.shape;
  if (author.background !== undefined) identity.background = author.background;
  return identity;
}
