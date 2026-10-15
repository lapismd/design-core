export const Basic = `<script lang="ts">
  import { MarkdownComposer } from "@lapismd/design-core/chat";
  import { Button } from "@lapismd/design-core/shadcn/button";
  let value = $state("Draft a **shared** message.");
  let submitted = $state("");
</script>
<MarkdownComposer bind:value onSubmit={(snapshot) => { submitted = snapshot; }} />
<!-- Your delivery adapter decides when to acknowledge this exact snapshot. -->
<Button disabled={!submitted} onclick={() => { if (value === submitted) value = ""; }}>Acknowledge delivery</Button>`;
export const Document = `<script lang="ts">
  import { MarkdownComposer, type MarkdownComposerReply } from "@lapismd/design-core/chat";
  import { Avatar } from "@lapismd/design-core/shadcn/avatar";
  let draft = $state("");
  let submitted = $state("");
  let reply = $state<MarkdownComposerReply | undefined>({
    authorName: "Sam",
    content: "Please share the project update before Friday."
  });
</script>
<MarkdownComposer bind:value={draft} presentation="document" name="reply"
  {...reply === undefined ? {} : { reply }} onCancelReply={() => { reply = undefined; }}
  onSubmit={(snapshot) => { submitted = snapshot; }}>
  {#snippet avatar()}<Avatar name="Alex Morgan" size="sm" decorative />{/snippet}
</MarkdownComposer>
<output>{submitted}</output>`;
export const Custom = `<script lang="ts">
  import { MarkdownComposer } from "@lapismd/design-core/chat";
  let value = $state("");
  let submitted = $state("");
  const customEmojis = [{ id: "team", shortcode: "team", label: "Team", url: "https://example.test/team.png" }];
</script>
<MarkdownComposer bind:value {customEmojis} emojiText={(emoji, custom) => custom ? ":" + custom.shortcode + ":" : emoji}
  onSubmit={(snapshot) => { submitted = snapshot; }} />
<output>{submitted}</output>`;

export const Form = `<script lang="ts">
  import { MarkdownComposer } from "@lapismd/design-core/chat";
  import { Button } from "@lapismd/design-core/shadcn/button";
  let value = $state("");
  let submitted = $state("");
</script>
<form onsubmit={(event) => { event.preventDefault(); submitted = String(new FormData(event.currentTarget).get("message") ?? ""); }}>
  <MarkdownComposer bind:value name="message" onSubmit={(snapshot) => { submitted = snapshot; }} />
  <Button type="submit">Submit form</Button>
</form>
<output>{submitted}</output>`;
