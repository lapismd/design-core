<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import ToolCallDetail from "./ToolCallDetail.svelte";
  import Fixture from "./ToolCallDetail.stories.fixture.svelte";
  import * as sources from "./ToolCallDetail.example-sources.js";

  const { Story } = defineMeta({
    title: "AI/Chat/Tool Call Detail",
    component: ToolCallDetail,
    tags: ["visual-pending"],
    parameters: {
      docs: {
        description: {
          component:
            "Shared formatted/raw tool details: shell command and output in one panel, file reads, edits, searches and honest incomplete capture. Hosts supply normalized presentation data and retain the original raw payload. Available through /chat and /ai/chat.",
        },
        source: { code: sources.Shell, language: "tsx", type: "code" },
      },
    },
  });
</script>

<Story
  name="Tool type gallery"
  parameters={{
    docs: {
      source: {
        code: [sources.Shell, sources.Files, sources.Search].join("\n\n"),
        language: "tsx",
        type: "code",
      },
    },
  }}
>
  {#snippet template()}<Fixture />{/snippet}
</Story>
<Story
  name="Completed command"
  play={async ({ canvas }) => {
    const panel = canvas.getByRole("region", {
      name: "Shell command and output",
    });
    await expect(panel).toHaveTextContent("$ pnpm test");
    await expect(panel).toHaveTextContent("Tests: 42 passed");
    await userEvent.click(
      canvas.getByRole("button", { name: "Show raw capture" }),
    );
    await expect(
      canvas.getByRole("group", { name: /^json$/ }),
    ).toHaveTextContent('"exitCode": 0');
    await userEvent.click(
      canvas.getByRole("button", { name: "Show formatted output" }),
    );
    await expect(
      canvas.getByRole("region", { name: "Shell command and output" }),
    ).toBeVisible();
  }}
>
  {#snippet template()}<Fixture scenario="shell" />{/snippet}
</Story>
<Story name="Failed command">
  {#snippet template()}<Fixture scenario="failed" />{/snippet}
</Story>
<Story
  name="File read"
  parameters={{
    docs: { source: { code: sources.Files, language: "tsx", type: "code" } },
  }}
>
  {#snippet template()}<Fixture scenario="read" />{/snippet}
</Story>
<Story
  name="File edits and patches"
  parameters={{
    docs: { source: { code: sources.Files, language: "tsx", type: "code" } },
  }}
>
  {#snippet template()}<Fixture scenario="edit" />{/snippet}
</Story>
<Story
  name="Search results"
  parameters={{
    docs: { source: { code: sources.Search, language: "tsx", type: "code" } },
  }}
>
  {#snippet template()}<Fixture scenario="search" />{/snippet}
</Story>
<Story
  name="Incomplete and redacted"
  parameters={{
    docs: {
      source: { code: sources.Incomplete, language: "tsx", type: "code" },
    },
  }}
>
  {#snippet template()}<Fixture scenario="partial" />{/snippet}
</Story>
<Story
  name="Missing file path"
  parameters={{
    docs: { source: { code: sources.Files, language: "tsx", type: "code" } },
  }}
>
  {#snippet template()}<Fixture scenario="missingPath" />{/snippet}
</Story>
<Story
  name="Unavailable output"
  parameters={{
    docs: { source: { code: sources.Generic, language: "tsx", type: "code" } },
  }}
>
  {#snippet template()}<Fixture scenario="unavailable" />{/snippet}
</Story>
<Story
  name="Generic tool compatibility"
  parameters={{
    docs: { source: { code: sources.Generic, language: "tsx", type: "code" } },
  }}
>
  {#snippet template()}<Fixture scenario="generic" />{/snippet}
</Story>
