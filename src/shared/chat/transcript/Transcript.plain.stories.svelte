<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import Transcript from "./Transcript.svelte";
  const { Story } = defineMeta({
    title: "Chat/Transcript",
    component: Transcript,
    tags: ["visual-pending", "!autodocs"],
  });
</script>

<Story
  name="Unframed host result"
  args={{
    canComment: false,
    items: [
      {
        id: "report",
        kind: "message",
        role: "assistant",
        label: "Local report",
        blocks: [
          {
            id: "report/body",
            revision: "1",
            kind: "custom",
            surface: "plain",
            label: "Command result",
            text: "Exact local output",
          },
        ],
      },
    ],
  }}
  play={async ({ canvas }) => {
    const block = canvas.getByRole("group", { name: "Command result" });
    expect(getComputedStyle(block).paddingTop).toBe("0px");
    expect(getComputedStyle(block).borderTopWidth).toBe("0px");
    expect(block).toHaveTextContent("Exact local output");
  }}
/>
