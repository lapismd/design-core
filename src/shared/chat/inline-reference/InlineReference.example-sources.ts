export const Basic = `<script lang="ts">
  import { InlineReference } from "@lapismd/design-core/chat";
  import FolderIcon from "@lucide/svelte/icons/folder-git-2";
</script>
<InlineReference reference={{ id: "repo", kind: "repository", label: "Lapis Desktop", href: "/repos/desktop", icon: FolderIcon }} />`;
export const Paired = `<script lang="ts">
  import { MarkdownComposer, MarkdownContent, createChatReferenceExtension, chatReferenceTriggers, type ChatReferenceOptions } from "@lapismd/design-core/chat";
  import { Button } from "@lapismd/design-core/shadcn/button";
  const person = { id: "alex", kind: "person", label: "Alex", href: "/people/alex", avatar: { id: "alex", name: "Alex" } };
  const options: ChatReferenceOptions = { resolve: href => href === person.href ? person : undefined, getPopover: () => profile };
  const extension = createChatReferenceExtension(options);
  const triggers = chatReferenceTriggers([{ character: "@", label: "People", search: (query, signal) => signal.aborted || !person.label.toLowerCase().includes(query.toLowerCase()) ? [] : [person] }], options);
  let value = $state("Review with [Alex](/people/alex).");
</script>
{#snippet profile(reference: import("@lapismd/design-core/chat").ChatReference)}
  <strong>{reference.label}</strong><p>Repository principal</p>
  <Button variant="ghost" size="sm" disabled>Message</Button>
{/snippet}
<MarkdownComposer bind:value {triggers} extensions={[extension]} onSubmit={text => console.log(text)} />
<MarkdownContent content={value} extensions={[extension]} />`;
