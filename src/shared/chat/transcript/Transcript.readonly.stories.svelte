<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import Transcript from "./Transcript.svelte";
  import type { TranscriptItem } from "./model.js";
  const items: TranscriptItem[] = [
    {
      id: "captured",
      kind: "message",
      role: "assistant",
      label: "Captured answer",
      author: { id: "codex", name: "Codex" },
      blocks: [
        {
          id: "captured/body",
          revision: "1",
          kind: "markdown",
          label: "Captured answer",
          text: "A read-only captured answer.\n\n```ts\nconst snapshot = true;\n```",
          commentable: false,
        },
      ],
    },
  ];
  const { Story } = defineMeta({
    title: "Chat/Transcript",
    component: Transcript,
    tags: ["visual-pending", "!autodocs"],
    args: { items, canComment: false, reactionsDisabled: true },
  });
</script>

<Story
  name="Read-only document omits comment actions"
  args={{ view: "document" }}
  play={async ({ canvas }) => {
    await expect(
      canvas.findByText("A read-only captured answer."),
    ).resolves.toBeVisible();
    await expect(
      canvas.queryByRole("button", { name: /^Comment on/ }),
    ).toBeNull();
    await expect(
      canvas.queryByRole("group", { name: /^Actions for/ }),
    ).toBeNull();
  }}
/>
<Story
  name="Read-only classic omits comment actions"
  args={{ view: "classic" }}
  play={async ({ canvas }) => {
    await expect(
      canvas.findByText("A read-only captured answer."),
    ).resolves.toBeVisible();
    await expect(
      canvas.queryByRole("button", { name: /^Comment on/ }),
    ).toBeNull();
    await expect(
      canvas.queryByRole("group", { name: /^Actions for/ }),
    ).toBeNull();
  }}
/>
