<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import Transcript from "./Transcript.svelte";
  import type { TranscriptItem } from "./model.js";
  const items: TranscriptItem[] = [
    {
      id: "answer",
      kind: "message",
      role: "assistant",
      label: "Answer",
      author: { id: "assistant", name: "Assistant" },
      blocks: [
        {
          id: "answer/body",
          revision: "1",
          kind: "markdown",
          label: "Answer",
          text: "See [the note](Notes/Welcome.md) and [the documentation](https://example.com).",
        },
      ],
    },
  ];
  const { Story } = defineMeta({
    title: "Chat/Transcript",
    component: Transcript,
    tags: ["visual-pending", "!autodocs"],
  });
</script>

<Story
  name="Links retain foreground contrast on dark surfaces"
  play={async ({ canvas, canvasElement }) => {
    const note = await canvas.findByRole("link", { name: "the note" });
    const surface = canvasElement.querySelector<HTMLElement>(
      "[data-link-surface]",
    )!;
    for (const link of canvas.getAllByRole("link")) {
      expect(getComputedStyle(link).color).toBe(
        getComputedStyle(surface).color,
      );
      expect(getComputedStyle(link).textDecorationLine).toContain("underline");
    }
    expect(note).toHaveAttribute("tabindex", "0");
  }}
>
  {#snippet template()}
    <div
      data-link-surface
      style="--foreground:#f3f3f3;--background:#1e1e1e;--primary:#6026f2;color:var(--foreground);background:var(--background);height:420px"
    >
      <Transcript
        {items}
        canComment={false}
        reactionsDisabled
        resolveFileLink={() => () => {}}
      />
    </div>
  {/snippet}
</Story>
