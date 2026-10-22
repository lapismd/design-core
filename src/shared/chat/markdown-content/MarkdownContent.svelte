<script lang="ts">
  import "@lapismd/mira/styles.css";
  import { MarkdownPreview } from "@lapismd/mira/preview";
  import { createChatReferenceExtension } from "../inline-reference/reference-extension.js";
  import type { MarkdownContentProps } from "./markdown-content.types.js";
  import "./markdown-content.css";
  let {
    content,
    references,
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
  const referenceExtension = $derived(
    references ? createChatReferenceExtension(references) : undefined,
  );
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
    extensions={[
      ...extensions,
      ...(referenceExtension ? [referenceExtension] : []),
    ]}
    {...components === undefined ? {} : { components }}
    {...linkResolver === undefined ? {} : { linkResolver }}
    {...assetResolver === undefined ? {} : { assetResolver }}
    {highlight}
    embed
    htmlPolicy="safe"
  />
</div>
