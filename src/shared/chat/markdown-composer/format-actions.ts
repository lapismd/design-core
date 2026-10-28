import BoldIcon from "@lucide/svelte/icons/bold";
import ItalicIcon from "@lucide/svelte/icons/italic";
import StrikeIcon from "@lucide/svelte/icons/strikethrough";
import CodeIcon from "@lucide/svelte/icons/code";
import ListIcon from "@lucide/svelte/icons/list";
import OrderedListIcon from "@lucide/svelte/icons/list-ordered";
import QuoteIcon from "@lucide/svelte/icons/quote";

/** Shared presentation for Mira's public Markdown commands. */
export const formatActions = [
  { id: "bold", label: "Bold", Icon: BoldIcon },
  { id: "italic", label: "Italic", Icon: ItalicIcon },
  { id: "strikethrough", label: "Strikethrough", Icon: StrikeIcon },
  { id: "inlineCode", label: "Inline code", Icon: CodeIcon },
  { id: "bulletList", label: "Bulleted list", Icon: ListIcon },
  { id: "numberedList", label: "Numbered list", Icon: OrderedListIcon },
  { id: "quote", label: "Quote", Icon: QuoteIcon },
] as const;
