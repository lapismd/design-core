<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor } from "storybook/test";
  import { promptElementsExtension } from "../prompt-context/prompt-elements-extension.js";
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
  name="Read-only highlighted captures"
  args={{
    view: "document",
    items: [
      {
        id: "read",
        kind: "tools",
        label: "Captured file read",
        blocks: [],
        tools: [
          {
            id: "read/tool",
            revision: "1",
            title: "read_file",
            status: "unknown",
            raw: "Captured file contents",
            blocks: [
              {
                id: "read/body",
                revision: "1",
                kind: "code",
                path: "src/license.ts",
                label: "src/license.ts",
                text: 'export const license = "MIT";\nexport function isOpenSource() {\n  return license === "MIT";\n}',
                commentable: false,
              },
            ],
          },
        ],
      },
      {
        ...items[0],
        blocks: [
          {
            ...items[0].blocks[0],
            text: "Updated the license reference.\n\n```diff\n--- a/README.md\n+++ b/README.md\n@@ -1,2 +1,2 @@\n # Project\n-All rights reserved.\n+Licensed under the MIT License.\n```",
          },
        ],
      },
    ],
  }}
/>

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

<Story
  name="Classic prompts retain their highlighted surface"
  args={{
    view: "classic",
    items: [
      {
        ...items[0],
        id: "prompt",
        role: "user",
        author: { id: "user", name: "You" },
        blocks: [
          {
            ...items[0].blocks[0],
            id: "prompt/body",
            text: "Explain the captured changes.",
          },
        ],
      },
      items[0],
    ],
  }}
  play={async ({ canvas }) => {
    const prompt = await canvas.findByRole("article", {
      name: "Message from You",
    });
    const answer = canvas.getByRole("article", { name: "Message from Codex" });
    const background = getComputedStyle(prompt).backgroundColor;
    expect(background).not.toBe("rgba(0, 0, 0, 0)");
    expect(background).not.toBe(getComputedStyle(answer).backgroundColor);
    await userEvent.hover(prompt);
    await waitFor(() =>
      expect(getComputedStyle(prompt).backgroundColor).toBe(background),
    );
    expect(getComputedStyle(prompt).color).not.toBe(background);
  }}
/>

<Story
  name="Read-only XML message context"
  args={{
    markdown: { extensions: [promptElementsExtension] },
    items: [
      {
        ...items[0]!,
        blocks: [
          {
            ...items[0]!.blocks[0]!,
            text: "<environment_context>\n## Captured workspace\n\nKeep **this exact context**.\n</environment_context>\n\nThe authored request remains outside.\n\n```xml\n<literal />\n```",
          },
        ],
      },
    ],
  }}
  play={async ({ canvas, canvasElement }) => {
    const context = await canvas.findByRole("button", {
      name: "<environment_context>",
    });
    await userEvent.click(context);
    await expect(
      canvas.getByRole("heading", { name: "Captured workspace" }),
    ).toBeVisible();
    await expect(canvas.getByText("this exact context")).toBeVisible();
    await expect(
      canvas.getByText("The authored request remains outside."),
    ).toBeVisible();
    await expect(
      canvasElement.querySelector('[data-chat-reader="captured/body"]'),
    ).toHaveAttribute("aria-readonly", "true");
    await expect(
      canvas.queryByRole("button", { name: "<literal />" }),
    ).toBeNull();
  }}
/>
