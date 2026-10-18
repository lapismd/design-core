<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, waitFor } from "storybook/test";
  import { CodeBlock, dracula } from "./index.js";
  import { Basic, DarkDefaults } from "./CodeBlock.example-sources.js";

  const { Story } = defineMeta({
    title: "Shadcn/Content/Code Block",
    component: CodeBlock,
    parameters: {
      docs: {
        description: {
          component:
            "Fenced code block with syntax highlighting, optional line numbers, copy, collapse, and syntax themes. Prefer over UI Forms Code Highlighter when you have a language string rather than a Lezer parser. See spec/records/code-and-code-block.md.",
        },
      },
    },
  });

  const sampleTsx = `import { Button } from '@lapismd/design-core/shadcn/button';

export function App() {
  return <Button>Hello</Button>;
}`;

  const sampleLong = Array.from(
    { length: 16 },
    (_, i) => `const line${i + 1} = ${i + 1};`,
  ).join("\n");

  const repeatedText = 'export const greeting: string = "Hello from JJ";';
</script>

<script lang="ts">
  let copiedCount = $state(0);
</script>

<Story
  name="Default TSX"
  tags={["skip-visual"]}
  parameters={{
    docs: { source: { code: Basic, language: "tsx", type: "code" } },
  }}
  play={async ({ canvas }) => {
    await expect(canvas.getByRole("group", { name: "tsx" })).toBeVisible();
    await expect(canvas.getByText(/import \{ Button \}/)).toBeVisible();
  }}
>
  {#snippet template()}
    <CodeBlock code={sampleTsx} language="tsx" />
  {/snippet}
</Story>

<Story
  name="Dark defaults preserve custom syntax themes"
  globals={{ colorMode: "dark" }}
  tags={["visual-pending"]}
  parameters={{
    docs: {
      story: { inline: false, height: "240px" },
      description: {
        story:
          "The default span palette stays readable in dark mode, while an explicit syntax theme retains its own colors.",
      },
      source: { code: DarkDefaults, language: "tsx", type: "code" },
    },
  }}
  play={async ({ canvas }) => {
    const normal = canvas
      .getByRole("region", { name: "Default syntax" })
      .querySelector(".ui-code-token-keyword");
    const custom = canvas
      .getByRole("region", { name: "Custom syntax" })
      .querySelector(".ui-code-token-keyword");
    await expect(normal).toBeVisible();
    await expect(custom).toBeVisible();
    await expect(getComputedStyle(normal!).color).not.toBe(
      getComputedStyle(normal!.closest("code")!).color,
    );
    await expect(getComputedStyle(custom!).color).toBe("rgb(255, 121, 198)");
  }}
>
  {#snippet template()}
    <section aria-label="Default syntax">
      <CodeBlock
        code="const answer = 42;"
        language="javascript"
        highlightMode="spans"
      />
    </section>
    <section aria-label="Custom syntax">
      <CodeBlock
        code="const answer = 42;"
        language="javascript"
        highlightMode="spans"
        syntaxTheme={dracula}
      />
    </section>
  {/snippet}
</Story>

<Story
  name="Repeated plain text segments"
  tags={["skip-visual"]}
  play={async ({ canvas }) => {
    const content = canvas
      .getByRole("group", { name: "typescript" })
      .querySelector('[data-ui-part="code-block-line-content"]');
    await expect(content).toBeVisible();
    await expect(content?.textContent).toBe(repeatedText);
    await expect(content?.querySelectorAll("span").length).toBeGreaterThan(1);
  }}
>
  {#snippet template()}
    <CodeBlock
      code={repeatedText}
      language="typescript"
      highlightMode="spans"
      hasLineNumbers
    />
  {/snippet}
</Story>

<Story
  name="Titled file with line numbers"
  tags={["skip-visual"]}
  play={async ({ canvas }) => {
    await expect(canvas.getByText(/App.tsx/)).toBeVisible();
    const lines = canvas
      .getByRole("group", { name: "tsx" })
      .querySelectorAll('[data-ui-part="code-block-line"]');
    await expect(lines.length).toBeGreaterThan(2);
    await expect(lines[0]).toHaveAttribute("data-numbered", "true");
  }}
>
  {#snippet template()}
    <CodeBlock code={sampleTsx} language="tsx" title="App.tsx" hasLineNumbers />
  {/snippet}
</Story>

<Story
  name="Highlighted lines"
  tags={["skip-visual"]}
  play={async ({ canvas }) => {
    const highlighted = canvas
      .getByRole("group", { name: "tsx" })
      .querySelector('[data-line="3"]');
    await expect(highlighted).toHaveAttribute("data-highlighted", "true");
  }}
>
  {#snippet template()}
    <CodeBlock
      code={sampleTsx}
      language="tsx"
      title="App.tsx"
      hasLineNumbers
      highlightLines={[3]}
    />
  {/snippet}
</Story>

<Story
  name="Copy announces"
  tags={["skip-visual"]}
  play={async ({ canvas, userEvent: ue }) => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          /* Storybook browser may deny clipboard; stub success. */
        },
      },
    });
    const button = canvas.getByRole("button", { name: "Copy code" });
    await ue.click(button);
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: "Copied" })).toBeVisible(),
    );
    await expect(
      canvas.getByText("Copied", { selector: "[aria-live='polite']" }),
    ).toBeVisible();
    await expect(copiedCount).toBeGreaterThan(0);
  }}
>
  {#snippet template()}
    <CodeBlock
      code="const x = 1;"
      language="javascript"
      hasCopyButton
      onCopy={() => {
        copiedCount += 1;
      }}
    />
  {/snippet}
</Story>

<Story
  name="Collapsible"
  tags={["skip-visual"]}
  play={async ({ canvas, userEvent: ue }) => {
    const header = canvas.getByRole("button", { name: /snippet\.ts/ });
    await expect(header).toHaveAttribute("aria-expanded", "true");
    const regionId = header.getAttribute("aria-controls");
    await expect(regionId).toBeTruthy();
    const region = document.getElementById(regionId!);
    await expect(region).toBeTruthy();
    await ue.click(header);
    await expect(header).toHaveAttribute("aria-expanded", "false");
    await expect(region).toHaveAttribute("inert");
    await ue.click(canvas.getByRole("button", { name: "Copy code" }));
    await expect(header).toHaveAttribute("aria-expanded", "false");
  }}
>
  {#snippet template()}
    <CodeBlock
      code={sampleLong}
      language="typescript"
      title="snippet.ts"
      isCollapsible
      collapsibleThreshold={10}
    />
  {/snippet}
</Story>

<Story
  name="Container section and wrap"
  tags={["skip-visual"]}
  play={async ({ canvas }) => {
    const root = canvas.getByText(/very_long_identifier/).closest("pre");
    await expect(root).toHaveAttribute("data-container", "section");
  }}
>
  {#snippet template()}
    <div style="padding: 1rem; background: var(--muted); border-radius: 8px">
      <CodeBlock
        code={'const very_long_identifier_that_should_wrap = "value";'}
        language="javascript"
        container="section"
        isWrapped
        width="100%"
        hasLanguageLabel={false}
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Size sm and maxHeight"
  tags={["skip-visual"]}
  play={async ({ canvas }) => {
    const root = canvas
      .getByRole("group", { name: "typescript" })
      .closest("pre");
    await expect(root).toHaveAttribute("data-size", "sm");
  }}
>
  {#snippet template()}
    <CodeBlock
      code={sampleLong}
      language="typescript"
      size="sm"
      maxHeight={120}
      hasLineNumbers
    />
  {/snippet}
</Story>

<Story
  name="Syntax theme Dracula"
  tags={["skip-visual"]}
  play={async ({ canvas }) => {
    const themed = canvas
      .getByRole("group", { name: "javascript" })
      .closest("[data-ui-syntax-theme]");
    await expect(themed).toHaveAttribute("data-ui-syntax-theme", "dracula");
  }}
>
  {#snippet template()}
    <CodeBlock
      code={"const answer = 42; // ultimate\nconsole.log(answer);"}
      language="javascript"
      syntaxTheme={dracula}
      title="theme.js"
    />
  {/snippet}
</Story>

<Story
  name="Force spans mode"
  tags={["skip-visual"]}
  play={async ({ canvas }) => {
    const token = canvas
      .getByRole("group", { name: "python" })
      .querySelector(".ui-code-token-keyword");
    await expect(token).toBeTruthy();
    await expect(token!).toHaveTextContent("def");
    // Simulate a host that rejects injected style elements. Bundled CSS must
    // still paint tokens, independent of earlier range-mode stories.
    const injected = Array.from(
      document.querySelectorAll<HTMLStyleElement>(
        "style[data-ui-code-highlight-styles]",
      ),
    ).map((element) => ({
      sheet: element.sheet!,
      disabled: element.sheet!.disabled,
    }));
    try {
      for (const { sheet } of injected) sheet.disabled = true;
      await expect(getComputedStyle(token!).color).not.toBe(
        getComputedStyle(token!.closest("code")!).color,
      );
    } finally {
      for (const { sheet, disabled } of injected) sheet.disabled = disabled;
    }
  }}
>
  {#snippet template()}
    <CodeBlock
      code={'def greet(name):\n  return f"hi {name}"'}
      language="python"
      highlightMode="spans"
      hasLineNumbers
    />
  {/snippet}
</Story>
