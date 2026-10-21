<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import MessageMetadata from "./MessageMetadata.svelte";
  import "../../../themes/lapis.css";
  const { Story } = defineMeta({
    title: "AI/Chat/Message Metadata",
    component: MessageMetadata,
    tags: ["visual-pending", "!autodocs"],
  });
</script>

<Story
  name="Dark Lapis error status on the conversation surface"
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("alert", { name: "Failed to send" }),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <div
      class="dark"
      data-ui-theme="lapis"
      style="padding: 1rem; background: var(--background); color: var(--foreground)"
    >
      <MessageMetadata timestamp="14:30" status="error" />
    </div>
  {/snippet}
</Story>

<Story
  name="Dark Lapis error status on the muted surface"
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("alert", { name: "Failed to send" }),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <div
      class="dark"
      data-ui-theme="lapis"
      style="padding: 1rem; background: var(--muted); color: var(--foreground)"
    >
      <MessageMetadata timestamp="14:30" status="error" />
    </div>
  {/snippet}
</Story>
