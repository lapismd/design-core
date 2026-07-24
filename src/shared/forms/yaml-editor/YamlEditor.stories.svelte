<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, waitFor } from "storybook/test";
  import { clickYamlReviewButton } from "../core/yaml-review-play";
  import YamlEditor, { type YamlReviewDiff } from "./YamlEditor.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Editors/YAML Editor",
    component: YamlEditor,
    parameters: {
      docs: {
        description: {
          component: "CodeMirror YAML editor with optional review diffs.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let value = $state("name: Northstar\nenabled: true\n");

  let reviewValue = $state("name: Original Name\nheadline: Engineer\n");
  let reviewDiffs = $state<YamlReviewDiff[]>([
    {
      id: "proposal-1",
      title: "Update name",
      before: "name: Original Name\nheadline: Engineer\n",
      after: "name: AI Name\nheadline: Engineer\n",
      paths: ["/name"],
      status: "pending",
    },
  ]);
  let reviewStatus = $state("pending");

  let undoDiffs = $state<YamlReviewDiff[]>([
    {
      id: "proposal-undo",
      title: "Update name",
      before: "name: Original Name\nheadline: Engineer\n",
      after: "name: AI Name\nheadline: Engineer\n",
      paths: ["/name"],
      status: "pending",
    },
  ]);
  let undoStatus = $state("pending");
</script>

<Story
  name="Renders YAML source"
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("textbox", { name: "YAML editor" }),
    ).toBeVisible();
  }}

  tags={["visual-ready"]}
>
  {#snippet template()}
    <div class="max-w-2xl">
      <YamlEditor bind:value ariaLabel="YAML editor" minHeight="10rem" />
    </div>
  {/snippet}
</Story>

<Story
  name="Keeps a review hunk"
  play={async ({ canvas, canvasElement }) => {
    await waitFor(() => {
      expect(canvasElement.querySelector(".cm-ai-review-block")).not.toBeNull();
    });
    await clickYamlReviewButton(canvasElement, "keep");
    await waitFor(() =>
      expect(canvas.getByRole("status")).toHaveTextContent("accepted"),
    );
  }}
  tags={["skip-visual"]}
>
  {#snippet template()}
    <div class="flex max-w-2xl flex-col gap-2">
      <YamlEditor
        bind:value={reviewValue}
        ariaLabel="YAML editor with review"
        minHeight="10rem"
        {reviewDiffs}
        onKeepReview={(id) => {
          reviewDiffs = reviewDiffs.filter((diff) => diff.id !== id);
          reviewValue = "name: AI Name\nheadline: Engineer\n";
          reviewStatus = "accepted";
        }}
        onUndoReview={(id) => {
          reviewDiffs = reviewDiffs.filter((diff) => diff.id !== id);
          reviewStatus = "rejected";
        }}
      />
      <output class="text-muted-foreground text-sm">{reviewStatus}</output>
    </div>
  {/snippet}
</Story>

<Story
  name="Undoes a review hunk"
  play={async ({ canvas, canvasElement }) => {
    await waitFor(() => {
      expect(canvasElement.querySelector(".cm-ai-review-block")).not.toBeNull();
    });
    await clickYamlReviewButton(canvasElement, "undo");
    await waitFor(() =>
      expect(canvas.getByRole("status")).toHaveTextContent("rejected"),
    );
  }}
  tags={["skip-visual"]}
>
  {#snippet template()}
    <div class="flex max-w-2xl flex-col gap-2">
      <YamlEditor
        value={"name: Original Name\nheadline: Engineer\n"}
        ariaLabel="YAML editor undo review"
        minHeight="10rem"
        reviewDiffs={undoDiffs}
        onKeepReview={(id) => {
          undoDiffs = undoDiffs.filter((diff) => diff.id !== id);
          undoStatus = "accepted";
        }}
        onUndoReview={(id) => {
          undoDiffs = undoDiffs.filter((diff) => diff.id !== id);
          undoStatus = "rejected";
        }}
      />
      <output class="text-muted-foreground text-sm">{undoStatus}</output>
    </div>
  {/snippet}
</Story>
