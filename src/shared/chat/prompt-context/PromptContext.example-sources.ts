export const Basic = `<script lang="ts">
  import { PromptContext } from "@lapismd/design-core/chat";
  const content = '<acp_context source="host">\\n## Workspace\\n\\nCaptured context with **Markdown**.\\n\\n<file path="src/settings.ts" />\\n</acp_context>';
</script>
<PromptContext {content} />`;

export const Extension = `<script lang="ts">
  import { MarkdownContent, promptElementsExtension } from "@lapismd/design-core/chat";
</script>
<MarkdownContent
  content={"## Root heading\\n\\nRoot prose without XML."}
  extensions={[promptElementsExtension]}
/>`;
