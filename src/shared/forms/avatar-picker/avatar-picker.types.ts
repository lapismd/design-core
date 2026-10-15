import type { AvatarShape, AvatarSize } from "../../shadcn/avatar/index.js";
import type { CustomEmoji } from "../../shadcn/emoji-picker/index.js";
export type AvatarPickerProps = {
  value?: string;
  open?: boolean;
  /** The editor opens beside the avatar or replaces it in the document flow. */
  presentation?: "popover" | "inline";
  /** Uses the shared Avatar size scale; a token can set an exact dimension. */
  size?: AvatarSize;
  mode?: "image" | "emoji";
  label?: string;
  disabled?: boolean;
  name?: string;
  /** Host-supplied fallback; otherwise derived from name. Never an editor selection. */
  initials?: string;
  /** Host-configured presentation; the editor does not expose shape selection. */
  shape?: AvatarShape;
  /** Backing colour for every avatar type, including transparent images. Bind separately from the image URL. */
  background?: string;
  customEmojis?: readonly CustomEmoji[];
  theme?: "light" | "dark" | "auto";
  /** Hosts upload the file and return its display URL. A newer choice aborts this signal. */
  onUploadImage?: (file: File, signal: AbortSignal) => Promise<string>;
  onValueChange?: (value: string) => void;
};
