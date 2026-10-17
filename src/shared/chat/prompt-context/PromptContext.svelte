<script lang="ts">
  import MarkdownContent from "../markdown-content/MarkdownContent.svelte";
  import type { MarkdownContentProps } from "../markdown-content/markdown-content.types.js";
  import { promptElementsExtension } from "./prompt-elements-extension.js";
  let { extensions = [], ...props }: MarkdownContentProps = $props();
</script>

<div class="ui-prompt-context" data-ui-component="prompt-context">
  <MarkdownContent
    fullWidth
    {...props}
    extensions={[
      promptElementsExtension,
      ...extensions.filter(
        (extension) => extension !== promptElementsExtension,
      ),
    ]}
  />
</div>

<style>
  .ui-prompt-context {
    --ui-chat-markdown-padding: 0;
    min-width: 0;
  }
</style>
