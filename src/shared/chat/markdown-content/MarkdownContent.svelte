<script lang="ts">
  import "@lapismd/mira/styles.css";
  import { MarkdownPreview } from "@lapismd/mira/preview";
  import type { MarkdownContentProps } from "./markdown-content.types.js";
  import "./markdown-content.css";
  let {
    content,
    compact = true,
    fullWidth = false,
    sourcePath,
    extensions = [],
    components,
    linkResolver,
    assetResolver,
    highlight = true,
    ...restProps
  }: MarkdownContentProps = $props();
</script>

<div
  {...restProps}
  data-ui-component="chat-markdown"
  data-compact={compact}
  data-full-width={fullWidth}
>
  <MarkdownPreview
    class="ui-chat-markdown-preview"
    value={content}
    {...sourcePath === undefined ? {} : { sourcePath }}
    extensions={[...extensions]}
    {...components === undefined ? {} : { components }}
    {...linkResolver === undefined ? {} : { linkResolver }}
    {...assetResolver === undefined ? {} : { assetResolver }}
    {highlight}
    embed
    htmlPolicy="safe"
  />
</div>
