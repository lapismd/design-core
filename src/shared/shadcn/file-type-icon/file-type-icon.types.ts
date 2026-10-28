import type { HTMLAttributes } from "svelte/elements";

export type FileTypeIconSize = "xs" | "s" | "md" | "lg";

export type FileTypeIconProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  "children" | "role" | "aria-hidden" | "aria-label"
> & {
  /** A filename or path; matching uses its basename and performs no I/O. */
  path: string;
  /** 12, 14, 16 or 24px by default; explicit CSS size tokens take precedence. */
  size?: FileTypeIconSize;
  /** Omit beside a visible filename; provide when the icon needs its own name. */
  title?: string;
};
