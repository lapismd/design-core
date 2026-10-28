<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import WorkspaceExplorer from "./WorkspaceExplorer.svelte";
  import { ExplorerController } from "./explorer-controller.svelte.js";
  import { createMemoryExplorerAdapter } from "./memory-adapter.js";
  import { Basic } from "./WorkspaceExplorer.example-sources.js";
  const { Story } = defineMeta({
    title: "Workspace/Panels/Explorer",
    component: WorkspaceExplorer,
    tags: ["!autodocs", "visual-pending"],
    parameters: {
      docs: { source: { code: Basic, language: "tsx", type: "code" } },
    },
  });
</script>

<script lang="ts">
  const memory = createMemoryExplorerAdapter([
    { path: "paper.pdf", name: "paper.pdf", kind: "file" },
    { path: "host.md", name: "host.md", kind: "file" },
    { path: "plain.md", name: "plain.md", kind: "file" },
  ]);
  const controller = new ExplorerController({
    ...memory,
    getIcon: (node) =>
      node.path === "host.md"
        ? "star"
        : node.path === "plain.md"
          ? "file"
          : undefined,
  });
</script>

<Story
  name="File icons preserve host overrides and rename"
  play={async ({ canvasElement }) => {
    const paper = await within(canvasElement).findByText("paper.pdf");
    const row = paper.closest("button")!;
    await expect(
      row.querySelector("[data-file-type-icon='pdf']"),
    ).toBeVisible();
    for (const path of ["host.md", "plain.md"]) {
      const host = canvasElement.querySelector(`[data-path='${path}']`)!;
      expect(
        host.querySelector("[data-ui-component='file-type-icon']"),
      ).toBeNull();
      await expect(
        host.querySelector("[data-ui-component='workspace-icon']"),
      ).toBeVisible();
    }
    row.focus();
    await userEvent.keyboard("{Enter}");
    const input = await within(canvasElement).findByRole("textbox", {
      name: "Rename...",
    });
    await expect(
      input
        .closest(".ui-workspace-explorer__row")
        ?.querySelector("[data-file-type-icon='pdf']"),
    ).toBeVisible();
    await userEvent.keyboard("{Escape}");
  }}
  >{#snippet template()}<div style="height:26rem;width:22rem;padding:1rem">
      <WorkspaceExplorer {controller} />
    </div>{/snippet}</Story
>
