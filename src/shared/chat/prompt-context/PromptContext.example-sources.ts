export const Basic = `<script lang="ts">
  import { PromptContext } from "@lapismd/design-core/chat";
  const content = '<acp_context source="host">\\n## Workspace\\n\\nCaptured context with **Markdown**.\\n\\n<file path="src/settings.ts" />\\n</acp_context>';
</script>
<PromptContext {content} />`;
