<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import { Basic } from "./FileDiff.example-sources.js";
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
  }}
  tags={["visual-pending"]}
>
  {#snippet template()}
    <div class="max-w-5xl p-4">
      <FileDiff
        path="src/greet.ts"
        oldText={oldGreet}
        newText={newGreet}
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
