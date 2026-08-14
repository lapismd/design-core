<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import {
    Basic,
    Demo,
    Editable,
    Quicksort,
  } from "./MergeEditor.example-sources.js";
  import MergeEditor from "./MergeEditor.svelte";
  import MergeEditorDemo from "./MergeEditorDemo.svelte";
  import { quicksortFixture } from "./quicksort-fixture.js";
  import type { MergeResolvedChange } from "./types.js";

  const { Story } = defineMeta({
    title: "Diff/Merge Editor",
    component: MergeEditor,
    parameters: {
      docs: {
        description: {
          component:
            "One-way or three-way merge blocks with host-triggered accept, delete, and resolve actions. Optional editable sides overlay a textarea on the highlight stack.",
        },
        source: { code: Basic, language: "tsx", type: "code" },
      },
    },
  });
</script>

<script lang="ts">
  let oneWayResolved = $state("");
  let threeWayState = $state<MergeResolvedChange | null>(null);
  let editableResolved = $state("");
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

<Story
  name="Edits the resolved pane"
  parameters={{
    docs: { source: { code: Editable, language: "tsx", type: "code" } },
  }}
  play={async ({ canvas }) => {
    const field = canvas.getByLabelText("Edit Resolved");
    await userEvent.clear(field);
    await userEvent.type(field, "const edited = true;");
    await expect(field).toHaveValue("const edited = true;");
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "const edited = true;",
    );
  }}
  tags={["visual-pending"]}
>
  {#snippet template()}
    <div class="max-w-5xl p-4">
      <MergeEditor
        mode="three-way"
        path="src/name.ts"
        editable
        left={'const name = "Grace";\n'}
        base={'const name = "Ada";\n'}
        right={'const name = "Alan";\n'}
        onResolvedChange={(state) => {
          editableResolved = state.content;
        }}
      />
      <output class="sr-only">{editableResolved}</output>
    </div>
  {/snippet}
</Story>

<Story
  name="Overlays the Changeyard quicksort fixture"
  parameters={{
    docs: { source: { code: Quicksort, language: "tsx", type: "code" } },
  }}
  play={async ({ canvas }) => {
    const editor = canvas
      .getByLabelText("Left")
      .closest("[data-ui-component='merge-editor']");
    await expect(editor).not.toBeNull();
    await expect(editor).toHaveAttribute("data-path", "quicksort.c");
    await expect(canvas.getByLabelText("Edit Left")).toBeVisible();
    await expect(canvas.getByLabelText("Edit Base")).toBeVisible();
    await expect(canvas.getByLabelText("Edit Right")).toBeVisible();
    await expect(
      editor?.querySelectorAll("[data-visual-kind='modified']").length,
    ).toBeGreaterThan(0);
    await expect(
      editor?.querySelectorAll("[data-ui-part='merge-connector']").length,
    ).toBe(2);
    await expect(
      editor?.querySelector(".ui-code-token-keyword"),
    ).toHaveTextContent("void");
  }}
  tags={["visual-pending"]}
>
  {#snippet template()}
    <div class="max-w-6xl p-4">
      <MergeEditor
        mode="three-way"
        editable
        path={quicksortFixture.path}
        language={quicksortFixture.language}
        left={quicksortFixture.left}
        base={quicksortFixture.base}
        right={quicksortFixture.right}
        leftLabel={quicksortFixture.leftLabel}
        baseLabel={quicksortFixture.baseLabel}
        rightLabel={quicksortFixture.rightLabel}
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Configures the Changeyard merge demo"
  parameters={{
    docs: { source: { code: Demo, language: "tsx", type: "code" } },
  }}
  play={async ({ canvas }) => {
    const editor = canvas
      .getByLabelText("Left")
      .closest("[data-ui-component='merge-editor']");
    await expect(editor).toHaveAttribute("data-path", "quicksort.c");
    await expect(
      editor?.querySelector(".ui-code-token-keyword"),
    ).toHaveTextContent("void");
    await userEvent.selectOptions(
      canvas.getByLabelText("Fixture"),
      "ignore-options",
    );
    await expect(canvas.getByText("Conflicts: 1/1")).toBeVisible();
    await userEvent.click(canvas.getByLabelText("Ignore whitespace"));
    await userEvent.click(canvas.getByLabelText("Ignore case"));
    await expect(canvas.getByText("Conflicts: 0/0")).toBeVisible();
    await userEvent.click(canvas.getByRole("radio", { name: "2-pane" }));
    await expect(
      canvas
        .getByLabelText("Left")
        .closest("[data-ui-component='merge-editor']")
        ?.querySelectorAll("[data-ui-part='merge-connector']").length,
    ).toBe(1);
  }}
  tags={["visual-pending"]}
>
  {#snippet template()}
    <div class="max-w-6xl p-4">
      <MergeEditorDemo />
    </div>
  {/snippet}
</Story>
