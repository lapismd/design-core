import type { HTMLAttributes } from "svelte/elements";
import type { MarkdownContentProps } from "../markdown-content/markdown-content.types.js";

/** Explicit host acknowledgement; rendering a disclosure never implies delivery. */
export type ContextDelivery =
  | "prepared"
  | "queued"
  | "sent"
  | "failed"
  | "unknown";

/** Presentation data only. Hosts normalize their receipts and context schemas. */
export interface SentContextData {
  /** Exact captured Markdown/XML. Blank content suppresses the disclosure. */
  content: string;
  delivery?: ContextDelivery | undefined;
  /** Exact host-supplied raw capture; omitted captures show content as plain text. */
  rawContent?: string | undefined;
  rawLanguage?: string | undefined;
}

export interface SentContextProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children">,
    SentContextData {
  open?: boolean | undefined;
  raw?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
  onRawChange?: ((raw: boolean) => void) | undefined;
  markdown?: Omit<MarkdownContentProps, "content"> | undefined;
}
