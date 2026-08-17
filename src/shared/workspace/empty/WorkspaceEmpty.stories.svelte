<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import * as exampleSources from "./WorkspaceEmpty.example-sources.js";
  import WorkspaceEmpty from "./WorkspaceEmpty.svelte";

  const { Story } = defineMeta({
    title: "Workspace/Components/Empty View",
    component: WorkspaceEmpty,
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "Workspace empty state composed from design-core's shadcn Empty and Button primitives.",
        },
        source: {
          code: exampleSources.Basic,
          language: "ts",
          type: "code",
        },
      },
    },
  });
</script>

<script lang="ts">
  let result = $state("No action selected");
  const actions = [
    {
      id: "create-tab",
      label: "Create Tab",
      icon: "file-plus",
      onSelect: () => {
        result = "Create Tab selected";
      },
    },
    {
      id: "open-command-palette",
      label: "Open Command Palette",
      icon: "terminal",
      onSelect: () => {
        result = "Open Command Palette selected";
      },
    },
  ];
  const links = [
    {
      id: "files",
      label: "Files",
      icon: "files",
      onSelect: () => {
        result = "Files selected";
      },
    },
    {
      id: "search",
      label: "Search",
      icon: "search",
      onSelect: () => {
        result = "Search selected";
      },
    },
  ];
</script>

<Story
  name="Empty leaf actions"
  tags={["visual-pending"]}
  play={async ({ canvas }) => {
    const createTabButton = canvas.getByRole("button", { name: "Create Tab" });
    await expect(
      canvas
        .getByRole("heading", { name: "No file is open" })
        .closest('[data-ui-component="workspace-empty"]'),
    ).toHaveAttribute("data-workspace-surface", "panel");
    await expect(
      createTabButton.querySelector('[data-icon="inline-start"]'),
    ).toBeInTheDocument();
    await expect(
      canvas
        .getByRole("button", { name: "Open Command Palette" })
        .querySelector('[data-icon="inline-start"]'),
    ).toBeInTheDocument();
    await userEvent.click(createTabButton);
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Create Tab selected",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Files" }));
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Files selected",
    );
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/empty/empty-leaf-actions-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="bg-background relative h-[28rem] min-h-0">
      <WorkspaceEmpty {actions} {links} />
    </div>
    <output class="sr-only">{result}</output>
  {/snippet}
</Story>

<Story
  name="Missing registered view"
  tags={["visual-pending"]}
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { name: "Plugin no longer active" }),
    ).toBeVisible();
    await expect(canvas.getByText(/demo\.missing/)).toBeVisible();
    const missingRoot = canvas
      .getByRole("heading", { name: "Plugin no longer active" })
      .closest('[data-ui-component="workspace-empty"]');
    await expect(missingRoot).toHaveAttribute("data-workspace-surface", "page");
    await expect(
      missingRoot?.querySelector('[data-workspace-icon="ghost"]'),
    ).toBeInTheDocument();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/empty/missing-registered-view-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="bg-background relative h-[28rem] min-h-0">
      <WorkspaceEmpty
        missingViewType="demo.missing"
        surface="page"
        actions={[
          {
            id: "close",
            label: "Close",
            onSelect: () => {
              result = "Missing view closed";
            },
          },
        ]}
      />
    </div>
  {/snippet}
</Story>
