<script module lang="ts">
  import { jsonLanguage } from "@codemirror/lang-json";
  import { yamlLanguage } from "@codemirror/lang-yaml";
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import CodeHighlighter from "./CodeHighlighter.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Editors/Code Highlighter",
    component: CodeHighlighter,
    parameters: {
      docs: {
        description: {
          component:
            "A read-only syntax renderer for compact source previews. Supply a Lezer parser and display-ready source; use Code Editor or YAML Backed Form for editable source. It uses the same accessible shared syntax palette as the editor. See the [Form guidance](?path=/docs/ui-forms-guidance--docs).",
        },
      },
    },
  });

  const jsonSource = `{
  "ledger": "personal-2026.ledger",
  "enabled": true,
  "sources": 3
}`;

  const yamlSource = `# Imported source configuration
provider: northstar
currency: GBP
enabled: true`;
</script>

<Story
  name="Renders a read-only JSON preview"
  tags={["skip-visual"]}
  play={async ({ canvas }) => {
    const source = canvas.getByRole("region", {
      name: "Ledger source preview",
    });
    await expect(source).toHaveTextContent("personal-2026.ledger");
    await expect(source).toHaveTextContent("enabled");
  }}
>
  {#snippet template()}
    <div class="max-w-3xl p-5">
      <CodeHighlighter
        code={jsonSource}
        parser={jsonLanguage.parser}
        ariaLabel="Ledger source preview"
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Uses the shared palette for YAML"
  tags={["skip-visual"]}
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("region", { name: "Source configuration preview" }),
    ).toHaveTextContent("northstar");
  }}
>
  {#snippet template()}
    <div class="max-w-3xl p-5">
      <CodeHighlighter
        code={yamlSource}
        parser={yamlLanguage.parser}
        ariaLabel="Source configuration preview"
      />
    </div>
  {/snippet}
</Story>
