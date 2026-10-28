export const Basic = `<script lang="ts">
  import { CommentComposer } from "@lapismd/design-core/chat";
  import { Avatar } from "@lapismd/design-core/shadcn/avatar";
  let value = $state("show me contents of this file");
  let submitted = $state("");
  let navigation = $state("");
</script>
<CommentComposer bind:value source={{ label: ".gitignore", quote: ".gitignore", kind: "code" }}
  onSubmit={(snapshot) => { submitted = snapshot; }}
  onNavigateSource={() => { navigation = "Open the captured source in your host"; }}>
  {#snippet avatar()}<Avatar name="Alex Morgan" size="sm" decorative />{/snippet}
</CommentComposer>
<output>{submitted} {navigation}</output>`;
export const Inline = `<script lang="ts">
  import { CommentComposer } from "@lapismd/design-core/chat";
  let value = $state("");
  let submitted = $state("");
</script>
<CommentComposer bind:value onSubmit={(snapshot) => { submitted = snapshot; }} />
<output>{submitted}</output>`;

export const Bare = `<script lang="ts">
  import { CommentComposer } from "@lapismd/design-core/chat";
  let value = $state("Review this capture.");
</script>
<div style="padding: .5rem; border: 1px solid var(--border); border-radius: var(--radius)">
  <CommentComposer presentation="bare" bind:value />
</div>`;

export const EmptyDraft = `<script lang="ts">
  import { CommentComposer } from "@lapismd/design-core/chat";
  let value = $state("");
  let visible = $state(true);
</script>
{#if visible}
  <CommentComposer bind:value onRemove={() => { visible = false; }} />
{/if}`;
