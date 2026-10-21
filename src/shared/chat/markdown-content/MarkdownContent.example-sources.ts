export const Basic = `<script lang="ts">
  import { MarkdownContent, Message, MessageBubble } from "@lapismd/design-core/chat";
  let content = $state("Hello **Markdown**");
</script>
<Message sender="assistant"><MessageBubble><MarkdownContent {content} /></MessageBubble></Message>`;
export const Hooks = `<script lang="ts">
  import { MarkdownContent } from "@lapismd/design-core/chat";
  import type { MiraExtension } from "@lapismd/mira/extensions";
  const extensions: MiraExtension[] = [{ name: "app-references", postProcessors: [(element) => {
    for (const link of element.querySelectorAll('a[href^="https://example.test/issues/"]')) link.setAttribute("title", "Issue reference");
  }] }];
</script>
<MarkdownContent content="[Issue 42](https://example.test/issues/42)" {extensions} fullWidth
  linkResolver={({ href }) => href} assetResolver={({ src }) => src} />`;

export const Spoilers = `<script lang="ts">
  import { MarkdownContent, spoilerExtension } from "@lapismd/design-core/chat";
</script>
<MarkdownContent content="The answer is ||forty-two||." extensions={[spoilerExtension]} />`;
