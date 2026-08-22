<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor } from "storybook/test";
  import {
    Basic,
    Demo,
    Editable,
    Fill,
    MatchingSides,
    MismergeQuicksort,
    OneWayEditable,
    Quicksort,
    Wrap,
  } from "./MergeEditor.example-sources.js";
  import MergeEditor from "./MergeEditor.svelte";
  import MergeEditorDemo from "./MergeEditorDemo.svelte";
  import { mismergeQuicksortFixture } from "./mismerge-quicksort-fixture.js";
  import { quicksortFixture } from "./quicksort-fixture.js";
  import type { MergeResolvedChange } from "./types.js";

  const { Story } = defineMeta({
    title: "Diff/Merge Editor",
    component: MergeEditor,
    parameters: {
      docs: {
        description: {
          component:
            "One-way or three-way merge blocks with host-triggered accept, delete, and resolve actions. Optional editable sides overlay a textarea on the highlight stack. Typing in any pane reassembles merge blocks.",
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
  name="Wraps long lines"
  play={async ({ canvas }) => {
    const editor = canvas
      .getByLabelText("Left")
      .closest("[data-ui-component='merge-editor']");
    await expect(editor).toHaveAttribute("data-wrap", "true");
    const line = editor?.querySelector(".ui-diff-merge-editor__line");
    await expect(line).not.toBeNull();
    const style = getComputedStyle(line as HTMLElement);
    await expect(style.whiteSpace).toBe("pre-wrap");
    await expect((line as HTMLElement).clientHeight).toBeGreaterThan(20);
    await expect((line as HTMLElement).scrollWidth).toBeLessThanOrEqual(
      (line as HTMLElement).clientWidth + 1,
    );
  }}
  tags={["visual-pending"]}
  parameters={{
    docs: { source: { code: Wrap, language: "tsx", type: "code" } },
  }}
>
  {#snippet template()}
    <div class="p-4" style="width: 16rem">
      <MergeEditor
        mode="one-way"
        path="src/note.ts"
        wrap
        left={'export const note = "' + "alpha ".repeat(24).trim() + '";\n'}
        right={'export const note = "' + "beta ".repeat(24).trim() + '";\n'}
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Fills the host through ScrollArea"
  play={async ({ canvas, canvasElement }) => {
    const root = canvas
      .getByLabelText("Left")
      .closest("[data-ui-component='merge-editor']") as HTMLElement | null;
    const host = root?.parentElement;
    await expect(root).not.toBeNull();
    await expect(host).not.toBeNull();
    const areas = root!.querySelectorAll(
      '[data-ui-component="scroll-area"][data-ui-part="scroll-area"]',
    );
    await expect(areas.length).toBeGreaterThan(0);
    await expect(
      Math.abs(root!.getBoundingClientRect().height - host!.clientHeight),
    ).toBeLessThan(2);
    const footer = root!.querySelector<HTMLElement>(
      ".ui-diff-merge-editor__footer",
    );
    await expect(footer).not.toBeNull();
    const bars = [
      ...root!.querySelectorAll<HTMLElement>(
        '[data-ui-part="scroll-area-scrollbar"][data-orientation="horizontal"]',
      ),
    ];
    const footerTop = footer!.getBoundingClientRect().top;
    for (const bar of bars) {
      const box = bar.getBoundingClientRect();
      await expect(box.bottom).toBeLessThanOrEqual(footerTop + 2);
      await expect(box.bottom).toBeGreaterThan(footerTop - 16);
    }
    const content = root!.querySelector(".ui-diff-merge-editor__view-content");
    await expect(content).not.toBeNull();
    await expect(getComputedStyle(content as HTMLElement).overflowX).toBe(
      "hidden",
    );
    for (const view of root!.querySelectorAll<HTMLElement>(
      "[data-ui-part='merge-view']",
    )) {
      const viewport = view.querySelector<HTMLElement>(
        "[data-ui-part='scroll-area-viewport']",
      );
      const gutter = view.querySelector<HTMLElement>(
        ".ui-diff-merge-editor__gutter",
      );
      await expect(viewport).not.toBeNull();
      await expect(gutter).not.toBeNull();
      await expect(gutter!.getBoundingClientRect().bottom).toBeGreaterThanOrEqual(
        viewport!.getBoundingClientRect().bottom - 16,
      );
      const gutterColor = getComputedStyle(gutter!).backgroundColor;
      await expect(gutterColor).not.toBe("transparent");
      await expect(gutterColor).not.toBe("rgba(0, 0, 0, 0)");
      const slash = gutterColor.match(/\/\s*([0-9.]+%?)\s*\)/);
      const rgba = gutterColor.match(
        /rgba\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*,\s*([\d.]+)\s*\)/i,
      );
      const alpha = slash
        ? slash[1].endsWith("%")
          ? Number.parseFloat(slash[1]) / 100
          : Number(slash[1])
        : rgba
          ? Number(rgba[1])
          : 1;
      await expect(alpha).toBe(1);
      const rail = getComputedStyle(view, "::before");
      await expect(rail.content).not.toBe("none");
      await expect(Number.parseFloat(rail.width)).toBeGreaterThan(0);
    }
  }}
  tags={["visual-pending"]}
  parameters={{
    docs: { source: { code: Fill, language: "tsx", type: "code" } },
  }}
>
  {#snippet template()}
    <div style="height: 20rem; width: 36rem">
      <MergeEditor
        mode="one-way"
        path="src/fill.ts"
        left={Array.from(
          { length: 5 },
          (_, index) => `left ${index + 1} ${"alpha ".repeat(20).trim()}`,
        ).join("\n")}
        right={Array.from(
          { length: 5 },
          (_, index) => `right ${index + 1} ${"beta ".repeat(20).trim()}`,
        ).join("\n")}
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Hosts can flush the card frame"
  play={async ({ canvas }) => {
    const editor = canvas
      .getByLabelText("Left")
      .closest("[data-ui-component='merge-editor']");
    await expect(editor).not.toBeNull();
    const style = getComputedStyle(editor as HTMLElement);
    await expect(style.borderTopWidth).toBe("0px");
    await expect(style.borderRightWidth).toBe("0px");
    await expect(style.borderLeftWidth).toBe("0px");
    await expect(style.borderRadius).toBe("0px");
  }}
  tags={["visual-pending"]}
>
  {#snippet template()}
    <div
      class="p-4"
      style="--ui-diff-frame-border: none; --ui-diff-frame-radius: 0"
    >
      <MergeEditor
        mode="one-way"
        path="src/hello.ts"
        left={"hello\nworld\n"}
        right={"hello\nthere\n"}
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Resolves a three-way conflict"
  play={async ({ canvas }) => {
    const editor = canvas
      .getByLabelText("Left")
      .closest("[data-ui-component='merge-editor']");
    await expect(editor).not.toBeNull();
    const leftMerge = editor?.querySelector(
      '[data-merge-side="left"] [data-action-kind="merge"]',
    );
    const rightMerge = editor?.querySelector(
      '[data-merge-side="right"] [data-action-kind="merge"]',
    );
    await expect(rightMerge).toHaveAttribute("data-point", "toward-center");
    await expect(leftMerge).not.toHaveAttribute("data-point", "toward-center");
    await expect(leftMerge?.querySelector("svg")).toHaveAttribute(
      "fill",
      "currentColor",
    );
    await expect(canvas.getByText("1 / 1")).toBeVisible();
    await expect(
      editor?.querySelector(
        "[data-ui-part='merge-component'][data-current='true'][data-placeholder='false']",
      ),
    ).not.toBeNull();
    await userEvent.click(canvas.getByRole("button", { name: "Next change" }));
    await expect(canvas.getByText("1 / 1")).toBeVisible();
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
    const editor = field.closest("[data-ui-component='merge-editor']");
    const changedBefore =
      editor?.querySelectorAll('[data-changed="true"]').length ?? 0;
    await userEvent.clear(field);
    await userEvent.type(field, "const edited = true;");
    await expect(field).toHaveValue("const edited = true;");
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "const edited = true;",
    );
    await expect(
      editor?.querySelectorAll('[data-changed="true"]').length ?? 0,
    ).toBeGreaterThan(changedBefore);
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
  name="Draws a new hunk when the center pane is edited"
  parameters={{
    docs: { source: { code: MatchingSides, language: "tsx", type: "code" } },
  }}
  play={async ({ canvas }) => {
    const field = canvas.getByLabelText("Edit Resolved");
    const editor = field.closest("[data-ui-component='merge-editor']");
    await expect(editor).not.toBeNull();
    await expect(canvas.getAllByText("No changes").length).toBeGreaterThan(0);
    await userEvent.clear(field);
    await userEvent.type(field, "hello{Enter}unique center line");
    await expect(field).toHaveValue("hello\nunique center line");
    await expect(canvas.getByText("1 added")).toBeVisible();
    await expect(
      editor?.querySelectorAll(
        "[data-ui-part='merge-component'][data-visual-kind='added'][data-placeholder='false']",
      ).length,
    ).toBeGreaterThan(0);
    await waitFor(() => {
      expect(
        editor?.querySelectorAll(".ui-diff-merge-editor__connector-path")
          .length ?? 0,
      ).toBeGreaterThan(0);
    });
    await userEvent.click(
      canvas.getByRole("button", { name: "Delete merged content" }),
    );
    await expect(canvas.getAllByText("No changes").length).toBeGreaterThan(0);
  }}
  tags={["visual-pending"]}
>
  {#snippet template()}
    <div class="max-w-5xl p-4">
      <MergeEditor
        mode="three-way"
        path="src/hello.ts"
        editable
        left={"hello\n"}
        base={"hello\n"}
        right={"hello\n"}
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Draws a new hunk when a side pane is edited"
  parameters={{
    docs: { source: { code: MatchingSides, language: "tsx", type: "code" } },
  }}
  play={async ({ canvas }) => {
    const field = canvas.getByLabelText("Edit Left");
    const editor = field.closest("[data-ui-component='merge-editor']");
    await expect(editor).not.toBeNull();
    await userEvent.clear(field);
    await userEvent.type(field, "hello{Enter}unique left line");
    await expect(field).toHaveValue("hello\nunique left line");
    await expect(canvas.getByText("1 removed")).toBeVisible();
    await expect(
      editor?.querySelectorAll(
        "[data-ui-part='merge-component'][data-visual-kind='unchanged']",
      ).length,
    ).toBeGreaterThan(0);
    await expect(
      editor?.querySelectorAll(
        "[data-ui-part='merge-component']:not([data-visual-kind='unchanged'])",
      ).length,
    ).toBeGreaterThan(0);
  }}
  tags={["visual-pending"]}
>
  {#snippet template()}
    <div class="max-w-5xl p-4">
      <MergeEditor
        mode="three-way"
        path="src/hello.ts"
        editable
        left={"hello\n"}
        base={"hello\n"}
        right={"hello\n"}
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Draws a new hunk when the one-way resolved pane is edited"
  parameters={{
    docs: { source: { code: OneWayEditable, language: "tsx", type: "code" } },
  }}
  play={async ({ canvas }) => {
    const field = canvas.getByLabelText("Edit Right");
    const editor = field.closest("[data-ui-component='merge-editor']");
    await expect(editor).not.toBeNull();
    await userEvent.clear(field);
    await userEvent.type(field, "hello{Enter}unique right line");
    await expect(field).toHaveValue("hello\nunique right line");
    await expect(canvas.getByText("1 added")).toBeVisible();
    await expect(
      editor?.querySelectorAll(
        "[data-ui-part='merge-component'][data-visual-kind='added'][data-placeholder='false']",
      ).length,
    ).toBeGreaterThan(0);
  }}
  tags={["visual-pending"]}
>
  {#snippet template()}
    <div class="max-w-5xl p-4">
      <MergeEditor
        mode="one-way"
        path="src/hello.ts"
        editable
        left={"hello\n"}
        right={"hello\n"}
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Adds and rejects a side-only change"
  parameters={{
    docs: { source: { code: MatchingSides, language: "tsx", type: "code" } },
  }}
  play={async ({ canvas }) => {
    const editor = canvas
      .getByLabelText("Left")
      .closest("[data-ui-component='merge-editor']");
    await expect(canvas.getByText("1 removed")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Merge Left" }));
    await expect(canvas.getByText("1 added")).toBeVisible();
    await expect(canvas.getByLabelText("Edit Resolved")).toHaveValue(
      "hello\nunique left line\n",
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Delete merged content" }),
    );
    await expect(canvas.getByText("1 removed")).toBeVisible();
    await expect(canvas.getByLabelText("Edit Resolved")).toHaveValue("hello\n");
    await expect(
      editor?.querySelector(
        '[data-merge-side="left"] [data-action-kind="merge"]',
      ),
    ).not.toBeNull();
  }}
  tags={["visual-pending"]}
>
  {#snippet template()}
    <div class="max-w-5xl p-4">
      <MergeEditor
        mode="three-way"
        path="src/hello.ts"
        editable
        left={"hello\nunique left line\n"}
        base={"hello\n"}
        right={"hello\n"}
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Recreates the MisMerge quicksort example"
  parameters={{
    docs: {
      source: { code: MismergeQuicksort, language: "tsx", type: "code" },
    },
  }}
  play={async ({ canvas }) => {
    const editor = canvas
      .getByLabelText("Left")
      .closest("[data-ui-component='merge-editor']");
    await expect(editor).toHaveAttribute("data-path", "quicksort.c");
    await expect(canvas.getByText("1 added")).toBeVisible();
    await expect(canvas.getByText("1 removed")).toBeVisible();
    await expect(canvas.getByText("1 modified")).toBeVisible();
    await expect(canvas.getByText("1 conflict")).toBeVisible();
    await expect(
      editor?.querySelector(
        '[data-merge-side="left"] [data-action-kind="merge"]',
      ),
    ).not.toBeNull();
    await expect(
      editor?.querySelector(
        '[data-merge-side="base"] [data-action-kind="delete"]',
      ),
    ).not.toBeNull();
    for (const side of ["left", "base", "right"]) {
      const numbers = [
        ...(editor?.querySelectorAll<HTMLElement>(
          `[data-merge-side="${side}"] .ui-diff-merge-editor__line-number`,
        ) ?? []),
      ];
      await expect(numbers.length).toBeGreaterThan(0);
      const lineHeight = Number.parseFloat(
        getComputedStyle(numbers[0]!).lineHeight,
      );
      for (const [index, number] of numbers.entries()) {
        await expect(
          Math.abs(number.offsetTop - index * lineHeight),
        ).toBeLessThan(1);
      }
    }
    const labelCells = [
      ...(editor?.querySelectorAll(".ui-diff-merge-editor__label") ?? []),
    ];
    const viewCells = [
      ...(editor?.querySelectorAll(
        ".ui-diff-merge-editor__view, .ui-diff-merge-editor__connector",
      ) ?? []),
    ];
    await expect(labelCells.length).toBe(viewCells.length);
    for (const [index, label] of labelCells.entries()) {
      const view = viewCells[index]!;
      await expect(
        Math.abs(
          label.getBoundingClientRect().left -
            view.getBoundingClientRect().left,
        ),
      ).toBeLessThan(1);
      await expect(
        Math.abs(
          label.getBoundingClientRect().right -
            view.getBoundingClientRect().right,
        ),
      ).toBeLessThan(1);
    }
    const labelsRow = editor?.querySelector(".ui-diff-merge-editor__labels");
    const labelsRowBox = labelsRow?.getBoundingClientRect();
    for (const label of labelCells) {
      const box = label.getBoundingClientRect();
      await expect(Math.abs(box.top - (labelsRowBox?.top ?? 0))).toBeLessThan(
        1,
      );
      await expect(
        Math.abs(box.height - (labelsRow?.clientHeight ?? 0)),
      ).toBeLessThan(1);
    }
    const resolvedLabel = labelCells.find((label) =>
      label.textContent?.includes("Resolved"),
    );
    const resolvedText = resolvedLabel?.querySelector("span");
    const baseLine = editor?.querySelector(
      "[data-merge-side='base'] .ui-diff-merge-editor__line",
    );
    const baseLinePad = Number.parseFloat(
      getComputedStyle(baseLine!).paddingLeft,
    );
    await expect(resolvedText?.textContent).toBe("Resolved");
    await expect(
      Math.abs(
        (resolvedText?.getBoundingClientRect().left ?? 0) -
          ((baseLine?.getBoundingClientRect().left ?? 0) + baseLinePad),
      ),
    ).toBeLessThan(2);
    const rightLabel = labelCells.at(-1);
    await expect(rightLabel).toHaveAttribute("data-align", "end");
    const rightText = [...(rightLabel?.querySelectorAll("span") ?? [])].at(-1);
    await expect(rightText?.textContent).toBe("Right");
    await expect(
      Math.abs(
        (rightText?.getBoundingClientRect().right ?? 0) -
          (rightLabel?.getBoundingClientRect().right ?? 0),
      ),
    ).toBeLessThan(12);
  }}
  tags={["visual-pending"]}
>
  {#snippet template()}
    <div class="max-w-6xl p-4">
      <MergeEditor
        mode="three-way"
        editable
        path={mismergeQuicksortFixture.path}
        language={mismergeQuicksortFixture.language}
        left={mismergeQuicksortFixture.left}
        base={mismergeQuicksortFixture.base}
        right={mismergeQuicksortFixture.right}
        leftLabel={mismergeQuicksortFixture.leftLabel}
        baseLabel={mismergeQuicksortFixture.baseLabel}
        rightLabel={mismergeQuicksortFixture.rightLabel}
      />
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
      editor?.querySelectorAll(
        "[data-visual-kind='added'], [data-visual-kind='modified'], [data-visual-kind='conflict']",
      ).length,
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
      "quicksort-c",
    );
    const quicksortEditor = canvas
      .getByLabelText("Left")
      .closest("[data-ui-component='merge-editor']");
    const pendingBlockIds = new Set<string>();
    for (const button of quicksortEditor?.querySelectorAll(
      '[data-action-kind="merge"]',
    ) ?? []) {
      const blockId = button
        .closest("[data-block-id]")
        ?.getAttribute("data-block-id");
      if (blockId) pendingBlockIds.add(blockId);
    }
    for (const button of quicksortEditor?.querySelectorAll(
      '[data-action-kind="resolve"]',
    ) ?? []) {
      if (button.getAttribute("aria-label") !== "Mark Resolved") continue;
      const blockId = button
        .closest("[data-block-id]")
        ?.getAttribute("data-block-id");
      if (blockId) pendingBlockIds.add(blockId);
    }
    const pendingCount = pendingBlockIds.size;
    await expect(pendingCount).toBeGreaterThan(1);
    await expect(canvas.getByText(`1 / ${pendingCount}`)).toBeVisible();
    const firstCurrent = quicksortEditor?.querySelector(
      "[data-ui-part='merge-component'][data-current='true'][data-placeholder='false']",
    );
    await expect(firstCurrent).not.toBeNull();
    const firstBlockId = firstCurrent?.getAttribute("data-block-id");
    await userEvent.click(canvas.getByRole("button", { name: "Next change" }));
    await expect(canvas.getByText(`2 / ${pendingCount}`)).toBeVisible();
    const laterCurrent = quicksortEditor?.querySelector(
      "[data-ui-part='merge-component'][data-current='true'][data-placeholder='false']",
    );
    await expect(laterCurrent).not.toBeNull();
    await expect(laterCurrent?.getAttribute("data-block-id")).not.toBe(
      firstBlockId,
    );
    const firstGutter = quicksortEditor?.querySelector(
      `[data-block-id="${firstBlockId}"].ui-diff-merge-editor__line-number`,
    );
    await expect(firstGutter).not.toBeNull();
    await userEvent.click(firstGutter as HTMLElement);
    await expect(canvas.getByText(`1 / ${pendingCount}`)).toBeVisible();
    const conflictBlockIds = new Set(
      [
        ...(quicksortEditor?.querySelectorAll('[data-action-kind="resolve"]') ??
          []),
      ]
        .map((button) =>
          button.closest("[data-block-id]")?.getAttribute("data-block-id"),
        )
        .filter((blockId): blockId is string => Boolean(blockId)),
    );
    const mergeButtonsByBlock = new Map<string, HTMLElement[]>();
    for (const button of quicksortEditor?.querySelectorAll(
      '[data-action-kind="merge"]',
    ) ?? []) {
      const blockId = button
        .closest("[data-block-id]")
        ?.getAttribute("data-block-id");
      if (!blockId) continue;
      const buttons = mergeButtonsByBlock.get(blockId) ?? [];
      buttons.push(button as HTMLElement);
      mergeButtonsByBlock.set(blockId, buttons);
    }
    const droppableMerge = [...mergeButtonsByBlock.entries()].find(
      ([blockId, buttons]) =>
        buttons.length === 1 && !conflictBlockIds.has(blockId),
    )?.[1][0];
    await expect(droppableMerge).toBeTruthy();
    await userEvent.click(droppableMerge as HTMLElement);
    await expect(
      canvas.getByText(new RegExp(`\\d+ / ${pendingCount - 1}`)),
    ).toBeVisible();
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
