import type { HTMLAttributes } from "svelte/elements";
import type {
  MiraAssetResolver,
  MiraExtension,
  MiraLinkResolver,
  MiraRendererComponents,
} from "@lapismd/mira/extensions";
export type MarkdownContentProps = HTMLAttributes<HTMLDivElement> & {
  content: string;
  compact?: boolean;
  fullWidth?: boolean;
  sourcePath?: string;
  extensions?: readonly MiraExtension[];
  components?: MiraRendererComponents;
  linkResolver?: MiraLinkResolver;
  assetResolver?: MiraAssetResolver;
  highlight?: boolean;
};
