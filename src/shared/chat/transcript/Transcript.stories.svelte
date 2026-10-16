<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor } from "storybook/test";
  import Transcript from "./Transcript.svelte";
  import Fixture from "./Transcript.stories.fixture.svelte";
  import { Basic, Inspector } from "./Transcript.example-sources.js";
  const { Story } = defineMeta({
    title: "Chat/Transcript",
    component: Transcript,
    tags: ["visual-pending"],
    parameters: {
      docs: { source: { code: Basic, language: "tsx", type: "code" } },
    },
  });
</script>

<Story
  name="Continuous document"
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("log", { name: "Conversation messages" }),
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", {
        name: /^Show\ details\ for\ Read\ src\/settings\.ts$/,
      }),
    );
    await expect(
      canvas.getByRole("textbox", { name: /^src\/settings\.ts$/ }),
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: /^Stream\ update$/ }),
    );
    await waitFor(() =>
      expect(
        canvas.getByText("A streamed update retains the same reader."),
      ).toBeVisible(),
    );
  }}>{#snippet template()}<Fixture />{/snippet}</Story
>
<Story name="Classic messages"
  >{#snippet template()}<Fixture scenario="classic" />{/snippet}</Story
>
<Story
  name="Inline comments and queue"
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("group", { name: /^Pending\ comments$/ }),
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", {
        name: /^Send\ message\ and\ comments$/,
      }),
    );
    await waitFor(() =>
      expect(canvas.getByTestId("transcript-result")).toHaveTextContent(
        "1 comments submitted",
      ),
    );
  }}>{#snippet template()}<Fixture scenario="comments" />{/snippet}</Story
>
<Story name="Changed source retains quote"
  >{#snippet template()}<Fixture scenario="stale" />{/snippet}</Story
>
<Story name="Large folded capture"
  >{#snippet template()}<Fixture scenario="large" />{/snippet}</Story
>
<Story name="Narrow document"
  >{#snippet template()}<Fixture scenario="narrow" />{/snippet}</Story
>
<Story name="Loading retained history"
  >{#snippet template()}<Fixture scenario="loading" />{/snippet}</Story
>
<Story
  name="Retry history"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", {
        name: /^Retry\ loading\ history$/,
      }),
    );
    await waitFor(() =>
      expect(
        canvas.getByRole("textbox", { name: /^Earlier message$/ }),
      ).toBeVisible(),
    );
  }}>{#snippet template()}<Fixture scenario="retry" />{/snippet}</Story
>
<Story name="Empty history"
  >{#snippet template()}<Fixture scenario="empty" />{/snippet}</Story
>
<Story name="Rejected submission retains drafts"
  >{#snippet template()}<Fixture scenario="rejected" />{/snippet}</Story
>
<Story name="Unknown submission retains identity"
  >{#snippet template()}<Fixture scenario="unknown" />{/snippet}</Story
>

<Story
  name="Queued delivery"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", {
        name: "Send message and comments",
      }),
    );
    await waitFor(() =>
      expect(canvas.getAllByText("Queued")[0]!).toBeVisible(),
    );
  }}>{#snippet template()}<Fixture scenario="queued" />{/snippet}</Story
>
<Story name="Reply destinations"
  >{#snippet template()}<Fixture scenario="replies" />{/snippet}</Story
>
<Story name="Custom section comments"
  >{#snippet template()}<Fixture scenario="custom" />{/snippet}</Story
>

<Story
  name="Inspector reader lifecycle"
  parameters={{
    docs: { source: { code: Inspector, language: "tsx", type: "code" } },
  }}>{#snippet template()}<Fixture scenario="inspector" />{/snippet}</Story
>
