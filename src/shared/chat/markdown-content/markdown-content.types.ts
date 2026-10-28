import type { HTMLAttributes } from "svelte/elements";
import type {
  MiraAssetResolver,
  MiraExtension,
  MiraLinkResolver,
  MiraRendererComponents,
} from "@lapismd/mira/extensions";
export type MarkdownContentProps = HTMLAttributes<HTMLDivElement> & {
  content: string;
  /** Shared reference codec; navigation and lookup remain host-owned. */
  references?: import("../inline-reference/inline-reference.types.js").ChatReferenceOptions;
  compact?: boolean;
  fullWidth?: boolean;
  sourcePath?: string;
  extensions?: readonly MiraExtension[];
  components?: MiraRendererComponents;
  linkResolver?: MiraLinkResolver;
  assetResolver?: MiraAssetResolver;
  highlight?: boolean;
};
