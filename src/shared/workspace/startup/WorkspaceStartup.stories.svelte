<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import * as exampleSources from "./WorkspaceStartup.example-sources.js";
  import WorkspaceStartup from "./WorkspaceStartup.svelte";

  const { Story } = defineMeta({
    title: "Workspace/Components/Startup",
    component: WorkspaceStartup,
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "Application-independent startup progress and bounded failure presentation. Consumers own and execute every task.",
        },
        source: {
          code: exampleSources.Loading,
          language: "ts",
          type: "code",
        },
      },
    },
  });
</script>

<script lang="ts">
  let result = $state("No recovery action selected");

  const loadingTasks = [
    { id: "vault", label: "Loading file system", status: "complete" as const },
    {
      id: "configuration",
      label: "Loading configuration",
      status: "complete" as const,
    },
    {
      id: "plugins",
      label: "Loading core plugins",
      status: "active" as const,
    },
    { id: "layout", label: "Loading layout", status: "pending" as const },
  ];

  const failedTasks = loadingTasks.map((task) =>
    task.id === "plugins"
      ? { ...task, status: "failed" as const }
      : task.id === "layout"
        ? task
        : { ...task, status: "complete" as const },
  );
</script>

<Story
  name="Loading plugins"
  tags={["visual-pending"]}
  play={async ({ canvas }) => {
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Loading core plugins",
    );
    await expect(canvas.getByText("Step 3 of 4")).toBeVisible();
    await expect(
      canvas.getByRole("progressbar", { name: "Startup progress" }),
    ).toHaveAttribute("aria-valuenow", "75");
    await expect(canvas.getByText("Now")).toBeVisible();
    const startup = canvas.getByRole("region", {
      name: "Starting Lapis Notes",
    });
    await expect(startup).toHaveAttribute("data-desktop-drag-region", "");
    await expect(
      getComputedStyle(startup).getPropertyValue("-webkit-app-region").trim(),
    ).toBe("drag");
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/startup/loading-plugins-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div style="position: relative; min-height: 32rem;">
      <WorkspaceStartup title="Starting Lapis Notes" tasks={loadingTasks} />
    </div>
  {/snippet}
</Story>

<Story
  name="Loading plugin detail"
  tags={["visual-pending", "test"]}
  parameters={{
    docs: {
      description: {
        story:
          "An active task may set detail so the live status names the current plugin while the task list keeps the stable label.",
      },
      source: {
        code: exampleSources.LoadingDetail,
        language: "ts",
        type: "code",
      },
    },
  }}
  play={async ({ canvas }) => {
    await expect(canvas.getByRole("status")).toHaveTextContent("Loading AI");
    await expect(canvas.getByText("Loading core plugins")).toBeVisible();
    await expect(canvas.getByText("Step 3 of 4")).toBeVisible();
  }}
>
  {#snippet template()}
    <div style="position: relative; min-height: 32rem;">
      <WorkspaceStartup
        title="Starting Lapis Notes"
        tasks={loadingTasks.map((task) =>
          task.id === "plugins" ? { ...task, detail: "Loading AI" } : task,
        )}
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Startup failure"
  tags={["visual-pending"]}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/startup/startup-failure-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
    docs: {
      source: {
        code: exampleSources.Failure,
        language: "ts",
        type: "code",
      },
    },
  }}
  play={async ({ canvas }) => {
    await expect(canvas.getByRole("alert")).toBeVisible();
    await expect(
      canvas.getByRole("heading", { name: "App startup failed" }),
    ).toBeVisible();
    const details = canvas.getByText("Error details").closest("details");
    await expect(details).toHaveAttribute("data-desktop-drag-region", "false");
    await userEvent.click(canvas.getByText("Error details"));
    await expect(
      canvas.getByText("Error: Required plugin source-editor failed to load"),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Retry" }));
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Retry selected",
    );
    await expect(canvas.getByRole("button", { name: "Retry" })).toHaveAttribute(
      "data-desktop-drag-region",
      "false",
    );
  }}
>
  {#snippet template()}
    <div style="position: relative; min-height: 32rem;">
      <WorkspaceStartup
        title="Starting Lapis Notes"
        tasks={failedTasks}
        failure={{
          title: "App startup failed",
          description:
            "The workspace stopped while loading core plugins. The error is shown so startup failures never look like a stalled spinner.",
          detail: "Error: Required plugin source-editor failed to load",
          actions: [
            {
              id: "retry",
              label: "Retry",
              onSelect: () => {
                result = "Retry selected";
              },
            },
            {
              id: "dismiss",
              label: "Dismiss",
              onSelect: () => {
                result = "Dismiss selected";
              },
            },
          ],
        }}
      />
    </div>
    <output class="sr-only">{result}</output>
  {/snippet}
</Story>
