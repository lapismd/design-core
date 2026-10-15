<script lang="ts">
  import { MarkdownContent } from "../index.js";
  import type { MiraExtension } from "@lapismd/mira/extensions";
  import { Button } from "../../shadcn/button/index.js";
  let content = $state(
    "# Project update\n\nA **shared** message with _formatting_, `inline code` and a [reference](https://example.test/issues/42).\n\n- Searchable documents\n- Reusable controls\n\n| Component | State |\n| --- | --- |\n| Avatar | Ready |\n\n```ts\nconst shared = true;\n```\n\n![Project badge](/badge.svg)",
  );
  let opened = $state("");
  const extensions: MiraExtension[] = [
    {
      name: "example-issue-references",
      postProcessors: [
        (element) => {
          for (const link of element.querySelectorAll(
            'a[href="https://example.test/issues/42"]',
          )) {
            link.setAttribute("data-example-reference", "issue");
            link.setAttribute("title", "Injected issue reference");
          }
        },
      ],
      styles: ['[data-example-reference="issue"] { font-weight: 600; }'],
    },
  ];
  const badge =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 24'%3E%3Crect width='80' height='24' fill='%235568e8'/%3E%3C/svg%3E";
</script>

<Button
  variant="outline"
  onclick={() => (content += "\n\nStreamed **update** received.")}
  >Append streamed content</Button
>
<MarkdownContent
  {content}
  {extensions}
  fullWidth
  assetResolver={({ src }) => (src === "/badge.svg" ? badge : undefined)}
  linkResolver={({ href }) => href}
  onclick={(event) => {
    const anchor = (event.target as Element).closest("a");
    if (anchor) {
      event.preventDefault();
      opened = anchor.getAttribute("href") || "";
    }
  }}
/>
<output data-testid="opened-reference">{opened}</output>
