import type { HTMLAttributes } from "svelte/elements";
import type { ScrollArea } from "bits-ui";

/** Native viewport semantics and handlers, shared by both scrolling strategies. */
export type ScrollAreaViewportProps = Omit<
  ScrollArea.ViewportProps,
  "children" | "child" | "ref" | "style"
> & { style?: HTMLAttributes<HTMLDivElement>["style"] };
