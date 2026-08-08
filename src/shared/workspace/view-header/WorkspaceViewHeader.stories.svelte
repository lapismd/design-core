<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import { createDefaultWorkspaceLayout } from "../core/layout.js";
  import { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
  import * as exampleSources from "./WorkspaceViewHeader.example-sources.js";
  import WorkspaceViewHeader from "./WorkspaceViewHeader.svelte";
  import "./WorkspaceViewHeader.stories.css";

  const { Story } = defineMeta({
    title: "Workspace/Components/View Header",
    component: WorkspaceViewHeader,
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "Source-shaped view header with history, breadcrumbs, view actions, and the shared declarative pane menu.",
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
  const layout = createDefaultWorkspaceLayout();
  const pane = layout.main.kind === "tabs" ? layout.main : null;
  if (!pane) throw new Error("Expected a tabs fixture");
  const tab = pane.items[0];
  if (!tab || tab.kind !== "tab") throw new Error("Expected a tab fixture");
  tab.title = "Workspace framework";
  tab.view = { type: "header-story" };

  let result = $state("No action selected");
  let title = $state("Framework overview");
  const controller = new WorkspaceShellController({ layout });
  controller.registry.register({
    kind: "svelte",
    type: "header-story",
    component: {} as never,
    getChrome: () => ({
      title,
      titleEditable: true,
      onTitleCommit: (nextTitle) => {
        title = nextTitle;
        result = nextTitle;
      },
      breadcrumbs: [
        { id: "workspace", label: "Workspace" },
        { id: "guides", label: "Guides" },
      ],
      canGoBack: true,
      canGoForward: false,
      onGoBack: () => {
        result = "Back selected";
      },
      actions: [
        {
          id: "refresh",
          label: "Refresh view",
          icon: "refresh-cw",
          onSelect: () => {
            result = "Refresh selected";
          },
        },
      ],
      buildPaneMenu: (menu) => {
        menu.addItem((item) =>
          item.setTitle("Example view action").onClick(() => {
            result = "Example view action selected";
          }),
        );
      },
    }),
  });
</script>

<Story
  name="Breadcrumbs, actions, and pane menu"
  tags={["visual-approved"]}
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Refresh view" }));
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Refresh selected",
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Rename Framework overview" }),
    );
    const titleEditor = canvas.getByRole("textbox", {
      name: "Rename Framework overview",
    });
    await userEvent.clear(titleEditor);
    await userEvent.type(titleEditor, "Renamed overview{Enter}");
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Renamed overview",
    );
    await userEvent.click(canvas.getByRole("button", { name: "More options" }));
    const page = within(document.body);
    await expect(
      page.getByRole("menuitem", { name: "Split right" }),
    ).toBeVisible();
    await expect(
      page.getByRole("menuitem", { name: "Example view action" }),
    ).toBeVisible();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/view-header/breadcrumbs-actions-and-pane-menu-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="ui-workspace-view-header-story-frame">
      <WorkspaceViewHeader {controller} {tab} hostId="root" paneId={pane.id} />
    </div>
    <output class="sr-only">{result}</output>
  {/snippet}
</Story>
