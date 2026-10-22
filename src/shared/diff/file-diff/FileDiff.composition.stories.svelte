<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within, userEvent } from "storybook/test";
  import FileDiffComposer from "./FileDiffComposer.svelte";
  import { HostContent } from "./FileDiff.example-sources.js";
  const { Story } = defineMeta({
    title: "Diff/File Diff",
    component: FileDiffComposer,
    tags: ["!autodocs", "visual-pending"],
    parameters: {
      docs: { source: { code: HostContent, language: "tsx", type: "code" } },
    },
  });
</script>

<script lang="ts">
  import { Button } from "../../shadcn/button/index.js";
  import FileDiff from "./FileDiff.svelte";
  let collapsed = $state<string[]>([]);
  const oldText = Array.from({ length: 40 }, (_, i) => `old line ${i}`).join(
    "\n",
  );
  const newText = Array.from({ length: 40 }, (_, i) => `new line ${i}`).join(
    "\n",
  );
</script>

<Story
  name="Host content in expanding file sections"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Host-owned binary state")).toBeVisible();
    const toggle = canvas.getByRole("button", { name: /^Collapse image\.png/ });
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(canvas.getByText("Modified"));
    await expect(
      canvas.queryByText("Host-owned binary state"),
    ).not.toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole("button", { name: /^Expand image\.png/ }),
    );
    await userEvent.click(canvas.getByRole("button", { name: "File actions" }));
    await expect(canvas.getByText("Host-owned binary state")).toBeVisible();
  }}
>
  {#snippet template()}
    <FileDiffComposer
      expandOnHeaderClick
      files={[{ path: "image.png" }]}
      collapsedFilePaths={collapsed}
      onFileToggle={(path, value) => (collapsed = value ? [path] : [])}
    >
      {#snippet fileHeaderMeta()}<span>Modified</span>{/snippet}
      {#snippet fileHeaderTrailing()}<Button aria-label="File actions"
          >Actions</Button
        >{/snippet}
      {#snippet fileContent()}<p>Host-owned binary state</p>{/snippet}
    </FileDiffComposer>
  {/snippet}
</Story>

<Story
  name="Content-sized split panes in a scrolling collection"
  play={async ({ canvasElement }) => {
    const diff = canvasElement.querySelector(
      "[data-ui-component='file-diff']",
    )!;
    await expect(diff.getBoundingClientRect().height).toBeGreaterThan(600);
    for (const viewport of diff.querySelectorAll<HTMLElement>(
      "[data-ui-part='scroll-area-viewport']",
    )) {
      await expect(
        viewport.scrollHeight - viewport.clientHeight,
      ).toBeLessThanOrEqual(2);
    }
  }}
>
  {#snippet template()}
    <div style="height:15rem;overflow:auto">
      <FileDiff
        path="long.ts"
        {oldText}
        {newText}
        viewMode="split"
        sizing="content"
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Selected collection frame and header hover"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const selected = canvasElement.querySelector<HTMLElement>(
      '[data-ui-part="file-section"][data-selected="true"]',
    )!;
    await expect(getComputedStyle(selected, "::after").content).toBe('""');
    const other = canvas.getByRole("button", { name: /^Expand other\.ts/ });
    const header = other.closest("header")!;
    const before = getComputedStyle(header).backgroundColor;
    // Native focus exercises the shared hover/focus background in regular
    // Storybook too; browser acceptance additionally drives a real pointer hover.
    other.focus();
    await expect(getComputedStyle(header).backgroundColor).not.toBe(before);
  }}
>
  {#snippet template()}
    <div
      style="--ui-diff-file-selection-outline:2px solid rgb(12,106,222);--ui-diff-file-selection-outline-offset:-2px"
    >
      <FileDiffComposer
        expandOnHeaderClick
        sizing="content"
        selectedPath="selected.ts"
        files={[
          { path: "selected.ts", oldText: "old value", newText: "new value" },
          { path: "other.ts", oldText: "before", newText: "after" },
        ]}
        collapsedFilePaths={["other.ts"]}
        onFileToggle={() => {}}
      />
    </div>
  {/snippet}
</Story>
