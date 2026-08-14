<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import { Basic } from "./MergeEditor.example-sources.js";
  import MergeEditor from "./MergeEditor.svelte";
  import type { MergeResolvedChange } from "./types.js";

  const { Story } = defineMeta({
    title: "Diff/Merge Editor",
    component: MergeEditor,
    parameters: {
      docs: {
        description: {
          component:
            "One-way or three-way merge blocks with host-triggered accept, delete, and resolve actions.",
        },
        source: { code: Basic, language: "tsx", type: "code" },
      },
    },
  });
</script>

<script lang="ts">
  let oneWayResolved = $state("");
  let threeWayState = $state<MergeResolvedChange | null>(null);
</script>

<Story
  name="Merges a one-way change from the left"
  play={async ({ canvas }) => {
    await expect(canvas.getByLabelText("Left")).toBeVisible();
    await expect(canvas.getByLabelText("Right")).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", {
        name: "Accept All Incoming Changes from Left",
      }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent("hello world");
  }}
  tags={["visual-pending"]}
>
  {#snippet template()}
    <div class="max-w-5xl p-4">
      <MergeEditor
        mode="one-way"
        path="src/hello.ts"
        left={"hello\nworld\n"}
        right={"hello\nthere\n"}
        onResolvedChange={(state) => {
          oneWayResolved = state.content;
        }}
      />
      <output class="sr-only">{oneWayResolved}</output>
    </div>
  {/snippet}
</Story>

<Story
  name="Resolves a three-way conflict"
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Conflicts: 1/1")).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", {
        name: "Accept All Incoming Changes from Left",
      }),
    );
    await expect(canvas.getByText("Conflicts: 0/1")).toBeVisible();
    await expect(canvas.getByRole("status")).toHaveTextContent(
      'const name = "Grace";',
    );
  }}
  tags={["visual-pending"]}
>
  {#snippet template()}
    <div class="max-w-5xl p-4">
      <MergeEditor
        mode="three-way"
        path="src/name.ts"
        left={'const name = "Grace";\n'}
        base={'const name = "Ada";\n'}
        right={'const name = "Alan";\n'}
        onResolvedChange={(state) => {
          threeWayState = state;
        }}
      />
      <output class="sr-only">{threeWayState?.content ?? ""}</output>
    </div>
  {/snippet}
</Story>

<Story
  name="Draws connector bands between merge sides"
  play={async ({ canvas }) => {
    const editor = canvas
      .getByLabelText("Left")
      .closest("[data-ui-component='merge-editor']");
    await expect(editor).not.toBeNull();
    const lanes = editor?.querySelectorAll("[data-ui-part='merge-connector']");
    await expect(lanes?.length).toBe(2);
  }}
  tags={["visual-pending"]}
>
  {#snippet template()}
    <div class="max-w-5xl p-4">
      <MergeEditor
        mode="three-way"
        path="src/name.ts"
        left={'const name = "Grace";\n'}
        base={'const name = "Ada";\n'}
        right={'const name = "Alan";\n'}
      />
    </div>
  {/snippet}
</Story>
