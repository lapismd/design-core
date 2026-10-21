<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor } from "storybook/test";
  import PromptContext from "./PromptContext.svelte";
  import { Basic } from "./PromptContext.example-sources.js";
  import recording from "../transcript/reference/capture.stories.fixture.json";
  import { byteSlice } from "../transcript/reference/offsets.stories.fixture.js";
  const response = recording.records.find(
    (record) => record.kind === "AgentMessage",
  )!;
  const responseRange = response.layout!.result_range!;
  const recordedContext = byteSlice(
    recording.buffer,
    responseRange.start,
    responseRange.end,
  );
  const content =
    '<acp_context source="host">\n## Workspace\n\nCaptured context with **Markdown**, not live instructions.\n\n<file path="src/settings.ts" />\n\n<references>\n- [Settings](#settings)\n- Retain exact source\n</references>\n</acp_context>\n\n<command name="review">Queued by the host</command>';
  const { Story } = defineMeta({
    title: "Chat/Prompt Context",
    component: PromptContext,
    tags: ["visual-pending"],
    parameters: {
      docs: { source: { code: Basic, language: "tsx", type: "code" } },
    },
  });
</script>

<Story
  name="Recorded agent context"
  args={{ content: recordedContext }}
  play={async ({ canvas, canvasElement }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: /^<subagent-completion / }),
    );
    await expect(
      canvas.getByText(
        "No actionable regressions found in the current changes.",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(canvasElement.querySelector("strong")).toHaveTextContent(
      "Policy gating:",
    );
    await expect(canvasElement.querySelector("ul > li")).toBeVisible();
  }}
/>

<Story
  name="ACP context and nested Markdown"
  exportName="AcpContextAndNestedMarkdown"
  args={{ content }}
  play={async ({ canvas, canvasElement }) => {
    await userEvent.click(
      canvas.getByRole("button", {
        name: /^<acp_context source="host">$/,
      }),
    );
    await expect(
      canvas.getByRole("heading", { name: "Workspace" }),
    ).toBeVisible();
    await expect(
      Array.from(canvasElement.querySelectorAll("[data-prompt-element]")).find(
        (el) =>
          el.getAttribute("data-prompt-element") ===
          '<file path="src/settings.ts" />',
      ),
    ).toHaveTextContent('<file path="src/settings.ts" />');
    const parentTag = canvas
      .getByRole("button", {
        name: /^<acp_context source="host">$/,
      })
      .querySelector(".ui-prompt-context-tag")!;
    const heading = canvas.getByRole("heading", { name: "Workspace" });
    await waitFor(() =>
      expect(heading.getBoundingClientRect().left).toBeGreaterThan(
        parentTag.getBoundingClientRect().left,
      ),
    );
    const nested = canvas.getByRole("button", { name: "<references>" });
    await userEvent.click(nested);
    const nestedTag = nested.querySelector(".ui-prompt-context-tag")!;
    const list = canvas.getByText("Retain exact source", { exact: true });
    await waitFor(() => {
      expect(nestedTag.getBoundingClientRect().left).toBeGreaterThan(
        parentTag.getBoundingClientRect().left,
      );
      expect(list.getBoundingClientRect().left).toBeGreaterThan(
        nestedTag.getBoundingClientRect().left,
      );
    });
  }}
/>
<Story
  name="Literal and malformed input"
  args={{
    content:
      'Examples stay literal: `<example />`\n\n```xml\n<context>not an interactive block</context>\n```\n\n<unclosed>All retained text remains visible.\n\n<unsafe onclick="alert(1)" />',
  }}
/>
