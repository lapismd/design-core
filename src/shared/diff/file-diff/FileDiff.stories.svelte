<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import { Basic, Fill, Split, Wrap } from "./FileDiff.example-sources.js";
  import FileDiff from "./FileDiff.svelte";
  import FileDiffComposer from "./FileDiffComposer.svelte";

  const { Story } = defineMeta({
    title: "Diff/File Diff",
    component: FileDiff,
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
    expect(Math.abs(root.getBoundingClientRect().height - host.clientHeight)).toBeLessThan(
      2,
    );
    const bars = [
      ...root.querySelectorAll<HTMLElement>(
        '[data-ui-part="scroll-area-scrollbar"][data-orientation="horizontal"]',
      ),
    ];
    const limit = options?.above?.getBoundingClientRect().top ?? root.getBoundingClientRect().bottom;
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
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Wraps long lines"
  play={async ({ canvas }) => {
    const root = canvas
      .getByText(diffText(`export const note = "${"beta ".repeat(24).trim()}";`))
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
    const target = canvas
      .getByText(diffText("const b = 3;"))
      .closest("[data-diff-line-number]");
    await expect(target).toHaveAttribute("data-diff-line-number", "1");
  }}
  tags={["visual-pending"]}
>
  {#snippet template()}
    <div class="max-w-3xl p-4">
      <FileDiffComposer
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
