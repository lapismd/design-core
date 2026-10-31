<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, waitFor } from "storybook/test";
  import Transcript from "./Transcript.svelte";
  import type { TranscriptItem } from "./model.js";
  const text = '{"greeting":"café 👩🏽‍💻","count":42}';
  const items: TranscriptItem[] = [
    {
      id: "json-capture",
      kind: "message",
      role: "assistant",
      label: "Captured JSON",
      blocks: [
        {
          id: "json-capture/body",
          revision: "capture-1",
          kind: "code",
          label: "Raw captured JSON",
          path: "tool.json",
          text,
          commentable: false,
        },
      ],
    },
  ];
  const { Story } = defineMeta({
    title: "Chat/Transcript",
    component: Transcript,
    tags: ["!autodocs", "visual-pending"],
  });
  async function verify({ canvasElement }: { canvasElement: HTMLElement }) {
    await waitFor(() =>
      expect(
        [...canvasElement.querySelectorAll(".cm-property")].map(
          (node) => node.textContent,
        ),
      ).toEqual(['"greeting"', '"count"']),
    );
    await expect(canvasElement.querySelector(".cm-string")?.textContent).toBe(
      '"café 👩🏽‍💻"',
    );
    await expect(canvasElement.querySelector(".cm-content")?.textContent).toBe(
      text,
    );
  }
</script>

{#snippet captured(view: "document" | "classic")}
  <div style="height: 24rem"><Transcript {items} {view} /></div>
{/snippet}

<Story name="Captured JSON properties" play={verify}>
  {#snippet template()}{@render captured("document")}{/snippet}
</Story>
<Story
  name="Captured JSON properties dark"
  globals={{ colorMode: "dark" }}
  play={verify}
>
  {#snippet template()}{@render captured("document")}{/snippet}
</Story>
<Story name="Classic captured JSON properties" play={verify}>
  {#snippet template()}{@render captured("classic")}{/snippet}
</Story>
<Story
  name="Classic captured JSON properties dark"
  globals={{ colorMode: "dark" }}
  play={verify}
>
  {#snippet template()}{@render captured("classic")}{/snippet}
</Story>
