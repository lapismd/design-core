<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor } from "storybook/test";
  import MessageSquarePlusIcon from "@lucide/svelte/icons/message-square-plus";
  import { Button } from "../../shadcn/button/index.js";
  import { Textarea } from "../../shadcn/textarea/index.js";
  import {
    Basic,
    DarkMarkdown,
    NamedSplit,
    Composer,
    Fill,
    LineAnnotation,
    Split,
    Wrap,
  } from "./FileDiff.example-sources.js";
  import FileDiff from "./FileDiff.svelte";
  import FileDiffComposer from "./FileDiffComposer.svelte";
  import type {
    FileDiffComposerFileContext,
    FileDiffFileScrollTarget,
    FileDiffLineContext,
  } from "./types.js";

  const { Story } = defineMeta({
    title: "Diff/File Diff",
    component: FileDiff,
    tags: ["visual-pending"],
    parameters: {
      docs: {
        description: {
          component:
            "Unified or split textual file comparison with collapsed unchanged context. Hosts own file bytes.",
        },
        source: { code: Basic, language: "tsx", type: "code" },
      },
    },
  });

  const oldGreet = `export function greet(name: string) {
  return "Hello, " + name;
}
`;
  const newGreet = `export function greet(name: string) {
  return \`Hello, \${name}!\`;
}
`;

  function paddedChange(beforeCount: number): {
    oldText: string;
    newText: string;
  } {
    const before = Array.from(
      { length: beforeCount },
      (_, index) => `unchanged ${index + 1}`,
    ).join("\n");
    return {
      oldText: `${before}\nold value\n${before}\n`,
      newText: `${before}\nnew value\n${before}\n`,
    };
  }

  const largeChange = paddedChange(24);
  const splitContext = Array.from(
    { length: 64 },
    (_, i) => `retained ${i + 1}`,
  ).join("\n");
  const splitChange = {
    oldText: `old value\n${splitContext}\nold tail\n`,
    newText: `new value\ninserted line\n${splitContext}\nnew tail\n`,
  };
  const wrapOld = `export const note = "${"alpha ".repeat(24).trim()}";\n`;
  const wrapNew = `export const note = "${"beta ".repeat(24).trim()}";\n`;
  const fillOld = Array.from(
    { length: 5 },
    (_, index) => `old ${index + 1} ${"alpha ".repeat(20).trim()}`,
  ).join("\n");
  const fillNew = Array.from(
    { length: 5 },
    (_, index) => `new ${index + 1} ${"beta ".repeat(20).trim()}`,
  ).join("\n");

  function paneViewport(root: ParentNode, side: "left" | "right") {
    return root.querySelector<HTMLElement>(
      `[data-ui-part='file-diff-pane'][data-side='${side}'] [data-ui-part='scroll-area-viewport']`,
    );
  }

  function expectFilledScrollArea(
    root: HTMLElement,
    host: HTMLElement,
    options?: { above?: HTMLElement },
  ) {
    const areas = root.querySelectorAll(
      '[data-ui-component="scroll-area"][data-ui-part="scroll-area"]',
    );
    expect(areas.length).toBeGreaterThan(0);
    expect(
      Math.abs(root.getBoundingClientRect().height - host.clientHeight),
    ).toBeLessThan(2);
    const bars = [
      ...root.querySelectorAll<HTMLElement>(
        '[data-ui-part="scroll-area-scrollbar"][data-orientation="horizontal"]',
      ),
    ];
    const limit =
      options?.above?.getBoundingClientRect().top ??
      root.getBoundingClientRect().bottom;
    for (const bar of bars) {
      const box = bar.getBoundingClientRect();
      expect(box.bottom).toBeLessThanOrEqual(limit + 2);
      expect(box.bottom).toBeGreaterThan(limit - 16);
    }
  }

  function cssAlpha(color: string): number {
    const normalized = color.trim().toLowerCase();
    if (normalized === "transparent") return 0;
    const slash = normalized.match(/\/\s*([0-9.]+%?)\s*\)/);
    if (slash) {
      const raw = slash[1];
      return raw.endsWith("%") ? Number.parseFloat(raw) / 100 : Number(raw);
    }
    const rgba = normalized.match(
      /rgba\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*,\s*([\d.]+)\s*\)/,
    );
    if (rgba) return Number(rgba[1]);
    return 1;
  }

  function expectOpaqueStickyGutters(root: ParentNode) {
    const gutters = [
      ...root.querySelectorAll<HTMLElement>(".ui-diff-file-diff__gutter"),
    ];
    expect(gutters.length).toBeGreaterThan(0);
    for (const gutter of gutters) {
      expect(cssAlpha(getComputedStyle(gutter).backgroundColor)).toBe(1);
    }
  }

  function expectGutterFills(root: HTMLElement) {
    const hosts = [
      ...root.querySelectorAll<HTMLElement>(
        "[data-ui-part='file-diff-pane'], [data-ui-part='merge-view']",
      ),
    ];
    expect(hosts.length).toBeGreaterThan(0);
    for (const host of hosts) {
      const viewport = host.querySelector<HTMLElement>(
        "[data-ui-part='scroll-area-viewport']",
      );
      const fill = host.querySelector<HTMLElement>(
        ".ui-diff-file-diff__pane-stack, .ui-diff-merge-editor__gutter",
      );
      expect(viewport).not.toBeNull();
      expect(fill).not.toBeNull();
      const viewportBox = viewport!.getBoundingClientRect();
      expect(fill!.getBoundingClientRect().bottom).toBeGreaterThanOrEqual(
        viewportBox.bottom - 16,
      );
      const rail = getComputedStyle(host, "::before");
      expect(rail.content).not.toBe("none");
      expect(Number.parseFloat(rail.width)).toBeGreaterThan(0);
    }
  }

  function diffText(expected: string) {
    return (_content: string, element: Element | null) =>
      Boolean(
        element?.classList.contains("ui-diff-file-diff__text") &&
          (element.textContent ?? "").replace(/\s+/g, " ").trim() === expected,
      );
  }
</script>

<script lang="ts">
  let annotationContext = $state<FileDiffLineContext>();
  let annotationDraft = $state("");
  let savedAnnotation = $state("");
  let composerCollapsedPaths = $state<string[]>(["src/a.ts"]);
  let composerScrollRequest = $state<FileDiffFileScrollTarget>({
    path: "src/b.ts",
    requestId: 0,
  });

  function annotationMatches(context: FileDiffLineContext): boolean {
    return (
      annotationContext?.path === context.path &&
      annotationContext.lineNumber === context.lineNumber &&
      annotationContext.variant === context.variant
    );
  }

  function toggleComposerFile(path: string, collapsed: boolean): void {
    composerCollapsedPaths = collapsed
      ? [...new Set([...composerCollapsedPaths, path])]
      : composerCollapsedPaths.filter((candidate) => candidate !== path);
  }
</script>

<Story
  name="Dark unchanged Markdown keeps readable syntax"
  globals={{ colorMode: "dark" }}
  tags={["visual-pending"]}
  args={{
    path: "README.md",
    oldText: "# Notes\nOld title\n",
    newText: "# Notes\nHistory is retained\n",
    viewMode: "unified",
  }}
  parameters={{
    docs: {
      description: {
        story:
          "Unchanged Markdown headings retain syntax highlighting on the dark diff surface alongside readable changed rows.",
      },
      source: { code: DarkMarkdown, language: "tsx", type: "code" },
      story: { inline: false, height: "280px" },
    },
  }}
  play={async ({ canvasElement }) => {
    const context = canvasElement.querySelector<HTMLElement>(
      '.ui-diff-file-diff__row[data-variant="context"] .ui-code-token-keyword',
    );
    await expect(context).toBeVisible();
    await expect(context).toHaveTextContent("# Notes");
    await expect(getComputedStyle(context!).color).not.toBe(
      getComputedStyle(context!.closest('[data-ui-component="file-diff"]')!)
        .color,
    );
  }}
/>

<Story
  name="Named split panes"
  tags={["visual-pending"]}
  parameters={{
    docs: { source: { code: NamedSplit, language: "tsx", type: "code" } },
  }}
  play={async ({ canvas }) => {
    for (const label of ["Stack A · first hunk", "Stack A · second hunk"])
      for (const side of ["Previous revision", "Later revision"])
        expect(
          canvas.getByRole("region", { name: `${label} · ${side}` }),
        ).toBeVisible();
  }}
>
  {#snippet template()}
    {#each ["Stack A · first hunk", "Stack A · second hunk"] as label}
      <FileDiff
        path="src/note.ts"
        {label}
        viewMode="split"
        oldText="previous"
        newText="later"
      />
    {/each}
  {/snippet}
</Story>

<Story
  name="Composes a host-owned inline annotation"
  play={async ({ canvas }) => {
    const action = canvas.getByRole("button", {
      name: "Comment on project.conf line 2",
    });
    const accessory = action.closest("[data-ui-part='diff-row-accessory']");
    const row = action.closest("[data-ui-part='diff-row']");
    await expect(accessory).not.toBeNull();
    await expect(row).not.toBeNull();
    await expect(getComputedStyle(accessory as HTMLElement).opacity).toBe("0");
    (action as HTMLElement).focus();
    await expect(action).toHaveFocus();
    await waitFor(() =>
      expect(getComputedStyle(accessory as HTMLElement).opacity).toBe("1"),
    );
    await userEvent.click(action);
    const composer = canvas.getByRole("region", {
      name: "Comment on project.conf line 2",
    });
    await expect(composer).toBeVisible();
    await userEvent.type(
      canvas.getByRole("textbox", { name: "Comment" }),
      "Keep the project flag documented.",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Comment" }));
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Keep the project flag documented.",
    );
    await expect(composer).not.toBeInTheDocument();
  }}
  tags={["visual-pending"]}
  parameters={{
    docs: {
      source: { code: LineAnnotation, language: "tsx", type: "code" },
    },
  }}
>
  {#snippet template()}
    {#snippet lineAction(context: FileDiffLineContext)}
      {#if context.lineNumber === 2 && context.variant === "added"}
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label="Comment on project.conf line 2"
          onclick={() => {
            annotationContext = context;
            annotationDraft = "";
          }}><MessageSquarePlusIcon aria-hidden="true" /></Button
        >
      {/if}
    {/snippet}
    {#snippet lineComment(context: FileDiffLineContext)}
      {#if annotationMatches(context)}
        <section
          class="bg-background mx-2 my-1 rounded-md border p-2"
          aria-label="Comment on project.conf line 2"
        >
          <Textarea
            bind:value={annotationDraft}
            aria-label="Comment"
            placeholder="Add a comment…"
          />
          <div class="mt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onclick={() => (annotationContext = undefined)}>Cancel</Button
            >
            <Button
              type="button"
              size="sm"
              disabled={!annotationDraft.trim()}
              onclick={() => {
                savedAnnotation = annotationDraft.trim();
                annotationContext = undefined;
              }}>Comment</Button
            >
          </div>
        </section>
      {/if}
    {/snippet}
    <div class="max-w-3xl p-4">
      <FileDiff
        path="project.conf"
        oldText={"app=lapis\nprojects=off\n"}
        newText={"app=lapis\nprojects=on\n"}
        lineAccessory={lineAction}
        lineAnnotation={lineComment}
      />
      <output class="sr-only">{savedAnnotation}</output>
    </div>
  {/snippet}
</Story>

<Story
  name="Renders a unified file diff"
  play={async ({ canvas }) => {
    await expect(
      canvas.getByText(diffText('return "Hello, " + name;')),
    ).toBeVisible();
    const added = canvas
      .getByText(diffText("return `Hello, ${name}!`;"))
      .closest("[data-diff-line-variant]");
    await expect(added).toHaveAttribute("data-diff-line-variant", "added");
  }}
  tags={["visual-pending"]}
>
  {#snippet template()}
    <div class="max-w-3xl p-4">
      <FileDiff path="src/greet.ts" oldText={oldGreet} newText={newGreet} />
    </div>
  {/snippet}
</Story>

<Story
  name="Renders a split file diff"
  play={async ({ canvas }) => {
    await expect(
      canvas
        .getByText(diffText('return "Hello, " + name;'))
        .closest("[data-side]"),
    ).toHaveAttribute("data-side", "left");
    await expect(
      canvas
        .getByText(diffText("return `Hello, ${name}!`;"))
        .closest("[data-side]"),
    ).toHaveAttribute("data-side", "right");
    const leftRow = canvas
      .getByText(diffText('return "Hello, " + name;'))
      .closest("[data-ui-part='diff-row']");
    const gutter = leftRow?.querySelector(".ui-diff-file-diff__gutter");
    const text = leftRow?.querySelector(".ui-diff-file-diff__text");
    await expect(gutter).not.toBeNull();
    await expect(text).not.toBeNull();
    await expect(gutter?.getBoundingClientRect().top).toBe(
      text?.getBoundingClientRect().top,
    );
    const omegaRows = canvas
      .getAllByText(diffText("omega"))
      .map((node) => node.closest("[data-ui-part='diff-row']"));
    const omegaLeft = omegaRows
      .find((row) => row?.getAttribute("data-side") === "left")
      ?.querySelector(".ui-diff-file-diff__gutter");
    const omegaRight = omegaRows
      .find((row) => row?.getAttribute("data-side") === "right")
      ?.querySelector(".ui-diff-file-diff__gutter");
    await expect(omegaLeft).toHaveTextContent("5");
    await expect(omegaRight).toHaveTextContent("4");
    const root = canvas
      .getByLabelText("Previous revision")
      .closest("[data-ui-component='file-diff']") as HTMLElement | null;
    await expect(root).not.toBeNull();
    expectGutterFills(root!);
    expectOpaqueStickyGutters(root!);
  }}
  tags={["visual-pending"]}
>
  {#snippet template()}
    <div class="max-w-5xl p-4" style="height: 16rem">
      <FileDiff
        path="src/greet.ts"
        oldText={`${oldGreet}remove-me\nomega\n`}
        newText={`${newGreet}omega\n`}
        viewMode="split"
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Synchronizes unwrapped split panes"
  play={async ({ canvas }) => {
    const leftPane = canvas.getByLabelText("Previous revision");
    const rightPane = canvas.getByLabelText("Later revision");
    const left = paneViewport(leftPane, "left");
    const right = paneViewport(rightPane, "right");
    await expect(left).not.toBeNull();
    await expect(right).not.toBeNull();
    await expect(left!.getBoundingClientRect().right).toBeLessThanOrEqual(
      right!.getBoundingClientRect().left + 1,
    );
    await expect(left!.scrollWidth).toBeGreaterThan(left!.clientWidth);
    left!.scrollLeft = 48;
    left!.dispatchEvent(new Event("scroll"));
    await expect(right!.scrollLeft).toBe(48);
    const gutter = leftPane.querySelector<HTMLElement>(
      ".ui-diff-file-diff__gutter",
    );
    const text = leftPane.querySelector<HTMLElement>(
      ".ui-diff-file-diff__text",
    );
    await expect(gutter).not.toBeNull();
    await expect(text).not.toBeNull();
    await expect(text!.getBoundingClientRect().left).toBeLessThan(
      gutter!.getBoundingClientRect().right,
    );
    expectOpaqueStickyGutters(leftPane);
  }}
  tags={["visual-pending"]}
  parameters={{
    docs: { source: { code: Split, language: "tsx", type: "code" } },
  }}
>
  {#snippet template()}
    <div class="p-4" style="width: 20rem">
      <FileDiff
        path="src/note.ts"
        oldText={wrapOld}
        newText={wrapNew}
        viewMode="split"
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Expands collapsed unchanged context"
  play={async ({ canvas }) => {
    const [reveal] = canvas.getAllByRole("button", {
      name: /Show \d+ unmodified lines/,
    });
    await userEvent.click(reveal);
    await expect(canvas.getByText(diffText("unchanged 5"))).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: /Hide \d+ unmodified lines/ }),
    );
    await expect(canvas.queryByText(diffText("unchanged 5"))).toBeNull();
  }}
  tags={["visual-pending"]}
>
  {#snippet template()}
    <div class="max-w-3xl p-4">
      <FileDiff
        path="src/padded.ts"
        oldText={largeChange.oldText}
        newText={largeChange.newText}
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Expands collapsed context in split panes"
  tags={["visual-pending"]}
  parameters={{
    docs: { source: { code: Split, language: "tsx", type: "code" } },
  }}
  play={async ({ canvas, canvasElement }) => {
    await expect(canvas.queryAllByText(diffText("retained 32"))).toHaveLength(
      0,
    );
    await userEvent.click(
      canvas.getAllByRole("button", { name: /↓ 20 lines/ })[1],
    );
    await expect(canvas.getAllByText(diffText("retained 5"))).toHaveLength(2);
    await expect(canvas.queryAllByText(diffText("retained 32"))).toHaveLength(
      0,
    );
    await userEvent.click(
      canvas.getAllByRole("button", { name: /Show \d+ unmodified lines/ })[0],
    );
    await expect(canvas.getAllByText(diffText("retained 32"))).toHaveLength(2);
    const left = canvasElement.querySelector(
      "[data-side='left'][data-ui-part='file-diff-pane']",
    )!;
    const right = canvasElement.querySelector(
      "[data-side='right'][data-ui-part='file-diff-pane']",
    )!;
    await expect(
      left.querySelector("[data-diff-line-number='34']"),
    ).toHaveTextContent("retained 32");
    await expect(
      left.querySelector(
        "[data-diff-line-number='34'] .ui-diff-file-diff__gutter",
      ),
    ).toHaveTextContent("33");
    await expect(
      right.querySelector("[data-diff-line-number='34']"),
    ).toHaveTextContent("retained 32");
    await expect(
      right.querySelector(
        "[data-diff-line-number='34'] .ui-diff-file-diff__gutter",
      ),
    ).toHaveTextContent("34");
    await userEvent.click(
      canvas.getAllByRole("button", { name: /Hide \d+ unmodified lines/ })[1],
    );
    await expect(canvas.queryAllByText(diffText("retained 5"))).toHaveLength(0);
    await expect(canvas.queryAllByText(diffText("retained 32"))).toHaveLength(
      0,
    );
    const viewport = paneViewport(left, "left")!;
    expect(viewport.scrollWidth).toBeGreaterThan(viewport.clientWidth);
    viewport.scrollLeft = 48;
    viewport.dispatchEvent(new Event("scroll"));
    await waitFor(() =>
      expect(paneViewport(right, "right")!.scrollLeft).toBe(48),
    );
    for (const pane of [left, right]) {
      const fold = pane.querySelector<HTMLElement>(
        "[data-ui-part='collapsed-context']",
      )!;
      const paneBox = pane.getBoundingClientRect();
      const foldBox = fold.getBoundingClientRect();
      const front = pane.ownerDocument.elementFromPoint(
        paneBox.left + 20,
        foldBox.top + 16,
      );
      expect(front).toHaveClass("ui-diff-file-diff__gutter");
      expect(cssAlpha(getComputedStyle(front!).backgroundColor)).toBe(1);
    }
  }}
>
  {#snippet template()}
    <div style="height:24rem;width:50rem;max-width:100%">
      <FileDiff
        path="src/padded.ts"
        oldText={splitChange.oldText}
        newText={splitChange.newText}
        viewMode="split"
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Shows binary and empty states"
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Binary file not shown")).toBeVisible();
    await expect(canvas.getByText("No textual changes")).toBeVisible();
  }}
  tags={["visual-pending"]}
>
  {#snippet template()}
    <div class="flex max-w-3xl flex-col gap-4 p-4">
      <FileDiff path="assets/logo.png" oldText={null} newText="" />
      <FileDiff path="src/empty.ts" patch="" />
    </div>
  {/snippet}
</Story>

<Story
  name="Fills the host through ScrollArea"
  play={async ({ canvas, canvasElement }) => {
    const root = canvasElement.querySelector<HTMLElement>(
      "[data-ui-component='file-diff']",
    );
    const host = root?.parentElement;
    await expect(root).not.toBeNull();
    await expect(host).not.toBeNull();
    expectFilledScrollArea(root!, host!);
    const areas = root!.querySelectorAll<HTMLElement>("[data-scroll-strategy]");
    expect(areas.length).toBe(2);
    for (const area of areas)
      expect(area.dataset.scrollStrategy).toBe("styled");
    expectGutterFills(root!);
    await expect(
      canvas.getByText(diffText(`new 1 ${"beta ".repeat(20).trim()}`)),
    ).toBeVisible();
  }}
  tags={["visual-pending"]}
  parameters={{
    docs: { source: { code: Fill, language: "tsx", type: "code" } },
  }}
>
  {#snippet template()}
    <div style="height: 16rem; width: 24rem">
      <FileDiff
        path="src/fill.ts"
        oldText={fillOld}
        newText={fillNew}
        viewMode="split"
        scrollStrategy="styled"
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Wraps long lines"
  play={async ({ canvas }) => {
    const root = canvas
      .getByText(
        diffText(`export const note = "${"beta ".repeat(24).trim()}";`),
      )
      .closest("[data-ui-component='file-diff']");
    await expect(root).toHaveAttribute("data-wrap", "true");
    const text = root?.querySelector(".ui-diff-file-diff__text");
    await expect(text).not.toBeNull();
    const style = getComputedStyle(text as HTMLElement);
    await expect(style.whiteSpace).toBe("pre-wrap");
    await expect((text as HTMLElement).clientHeight).toBeGreaterThan(20);
    await expect((text as HTMLElement).scrollWidth).toBeLessThanOrEqual(
      (text as HTMLElement).clientWidth + 1,
    );
  }}
  tags={["visual-pending"]}
  parameters={{
    docs: { source: { code: Wrap, language: "tsx", type: "code" } },
  }}
>
  {#snippet template()}
    <div class="p-4" style="width: 16rem">
      <FileDiff path="src/note.ts" oldText={wrapOld} newText={wrapNew} wrap />
    </div>
  {/snippet}
</Story>

<Story
  name="Stacks multiple files and scrolls to a line"
  play={async ({ canvas }) => {
    await expect(canvas.getByTitle("src/a.ts")).toBeVisible();
    await expect(canvas.getByTitle("src/b.ts")).toBeVisible();
    await expect(
      canvas.getByTitle("src/b.ts").closest("[data-ui-part='file-section']"),
    ).toHaveAttribute("data-selected", "true");
    await expect(
      canvas.getByRole("button", {
        name: "Toggle related file list for src/a.ts",
      }),
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "Expand src/a.ts" }),
    );
    await expect(canvas.getByText(diffText("const a = 2;"))).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "Collapse src/b.ts" }),
    );
    await expect(canvas.queryByText(diffText("const b = 3;"))).toBeNull();
    await userEvent.click(
      canvas.getByRole("button", { name: "Expand src/b.ts" }),
    );
    const scrollAction = canvas.getByRole("button", {
      name: "Scroll to src/b.ts",
    });
    await userEvent.click(scrollAction);
    await userEvent.click(scrollAction);
    const target = canvas
      .getByText(diffText("const b = 3;"))
      .closest("[data-diff-line-number]");
    await expect(target).toHaveAttribute("data-diff-line-number", "1");
  }}
  tags={["visual-pending"]}
  parameters={{
    docs: { source: { code: Composer, language: "tsx", type: "code" } },
  }}
>
  {#snippet template()}
    {#snippet fileHeader(context: FileDiffComposerFileContext)}
      <span>{context.selected ? "Selected" : "Not selected"}</span>
    {/snippet}
    {#snippet fileHeaderLeading(context: FileDiffComposerFileContext)}
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label={`Toggle related file list for ${context.path}`}>L</Button
      >
    {/snippet}
    <div class="max-w-3xl p-4">
      <Button
        class="mb-3"
        type="button"
        variant="outline"
        onclick={() => {
          composerScrollRequest = {
            path: "src/b.ts",
            requestId: Number(composerScrollRequest.requestId) + 1,
          };
        }}>Scroll to src/b.ts</Button
      >
      <FileDiffComposer
        selectedPath="src/b.ts"
        collapsedFilePaths={composerCollapsedPaths}
        scrollToFile={composerScrollRequest}
        stickyHeaders
        onFileToggle={toggleComposerFile}
        {fileHeaderLeading}
        fileHeaderTrailing={fileHeader}
        scrollTo={{ path: "src/b.ts", lineNumber: 1, variant: "added" }}
        files={[
          {
            path: "src/a.ts",
            oldText: "const a = 1;\n",
            newText: "const a = 2;\n",
          },
          {
            path: "src/b.ts",
            oldText: "const b = 1;\n",
            newText: "const b = 3;\n",
          },
        ]}
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Highlighted intraline numbers retain readable contrast"
  tags={["visual-pending"]}
  args={{
    path: "example.ts",
    oldText: "export const answer = 41;\n",
    newText: "export const answer = 42;\n",
  }}
  play={async ({ canvasElement }) => {
    await waitFor(() => {
      const tokens = [
        ...canvasElement.querySelectorAll<HTMLElement>(
          "[data-tone] .ui-code-token-number",
        ),
      ];
      expect(tokens).toHaveLength(2);
      for (const token of tokens)
        expect(getComputedStyle(token).color).toBe(
          getComputedStyle(token.closest('[data-ui-component="file-diff"]')!)
            .color,
        );
      const keywords = [
        ...canvasElement.querySelectorAll<HTMLElement>(
          '.ui-diff-file-diff__row:is([data-variant="added"], [data-variant="removed"]) .ui-code-token-keyword',
        ),
      ];
      expect(keywords).toHaveLength(4);
      for (const token of keywords)
        expect(getComputedStyle(token).color).toBe(
          getComputedStyle(token.closest('[data-ui-component="file-diff"]')!)
            .color,
        );
    });
  }}
/>
