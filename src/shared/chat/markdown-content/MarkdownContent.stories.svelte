<script module lang="ts">
  import { spoilerExtension } from "./spoiler-extension.js";
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import { MarkdownContent } from "../index.js";
  import Fixture from "./MarkdownContent.stories.fixture.svelte";
  import * as sources from "./MarkdownContent.example-sources.js";
  const { Story } = defineMeta({
    title: "Chat/Markdown Content",
    component: MarkdownContent,
    tags: ["visual-pending"],
    parameters: {
      docs: { source: { code: sources.Basic, language: "tsx", type: "code" } },
    },
  });
</script>

<Story
  name="Rich content and streaming"
  parameters={{
    docs: { source: { code: sources.Hooks, language: "tsx", type: "code" } },
  }}
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { name: "Project update" }),
    ).toBeVisible();
    await expect(canvas.getByRole("table")).toBeVisible();
    await expect(
      canvas.getByRole("img", { name: "Project badge" }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("link", { name: "reference" }),
    ).toHaveAttribute("title", "Injected issue reference");
    await userEvent.click(canvas.getByRole("link", { name: "reference" }));
    await expect(canvas.getByTestId("opened-reference")).toHaveTextContent(
      "https://example.test/issues/42",
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Append streamed content" }),
    );
    await expect(canvas.getByText("update", { exact: true })).toBeVisible();
  }}>{#snippet template()}<Fixture />{/snippet}</Story
>
<Story
  name="Readable document"
  args={{
    compact: false,
    content:
      "# A readable document\n\nParagraphs retain the public Mira presentation.\n\n> A quoted observation.\n\n1. First step\n2. Second step",
  }}
/>
<Story
  name="Safe HTML"
  args={{
    content:
      '<script>alert(1);</script>\n\n[Unsafe](javascript:alert(1))\n\n<img src="/missing" onerror="alert(1)" alt="Untrusted image" />',
  }}
  play={async ({ canvasElement }) => {
    await expect(canvasElement.querySelector("script")).toBeNull();
    await expect(
      canvasElement.querySelector('[onerror],a[href^="javascript:"]'),
    ).toBeNull();
  }}
/>

<Story
  name="Inline spoilers"
  play={async ({ canvas }) => {
    const spoiler = canvas.getByRole("button", { name: "Reveal spoiler" });
    await userEvent.click(spoiler);
    await expect(spoiler).toHaveAccessibleName("forty-two");
    await expect(canvas.getByText("||Code stays literal||")).toBeVisible();
  }}
  args={{
    content: "The answer is ||forty-two||.\n\n`||Code stays literal||`",
    extensions: [spoilerExtension],
  }}
  parameters={{
    docs: {
      source: {
        code: sources.Spoilers,
        language: "tsx",
        type: "code",
      },
    },
  }}
/>
