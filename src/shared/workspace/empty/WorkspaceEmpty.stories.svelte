<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import { withLapisStorybookReference } from "../reference/lapis-visual-delta.js";
  import WorkspaceEmpty from "./WorkspaceEmpty.svelte";

  const { Story } = defineMeta({
    title: "Workspace/Components/Empty View",
    component: WorkspaceEmpty,
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "Source-aligned empty leaf and unresolved-view fallback rendered without shadcn or Tailwind primitives.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let result = $state("No action selected");
  const actions = [
    {
      id: "new",
      label: "Create new note (⌘ N)",
      onSelect: () => {
        result = "Create new note selected";
      },
    },
    {
      id: "open",
      label: "Go to file (⌘ O)",
      onSelect: () => {
        result = "Go to file selected";
      },
    },
    {
      id: "recent",
      label: "See recent files",
      onSelect: () => {
        result = "Recent files selected";
      },
    },
  ];
</script>

<Story
  name="Empty leaf actions"
  tags={["visual-pending", "lapis-reference-visual"]}
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Create new note (⌘ N)" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Create new note selected",
    );
  }}
  parameters={{
    visualDelta: withLapisStorybookReference(
      "/visual-baselines/workspace/empty/empty-leaf-actions-chromium-darwin.png",
      "workspace-shell-components-empty-and-missing-views--empty-view-chromium-darwin.png",
    ),
  }}
>
  {#snippet template()}
    <div class="bg-background relative h-[28rem] min-h-0">
      <WorkspaceEmpty {actions} />
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
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/empty/missing-registered-view-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
>
  {#snippet template()}
    <div class="bg-background relative h-[28rem] min-h-0">
      <WorkspaceEmpty
        missingViewType="demo.missing"
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
