<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import type { WorkspaceStatusItem as WorkspaceStatusItemModel } from "../core/types.js";
  import * as exampleSources from "./WorkspaceStatusItem.example-sources.js";
  import WorkspaceStatusItem from "./WorkspaceStatusItem.svelte";
  import "./WorkspaceStatusItem.stories.css";

  const { Story } = defineMeta({
    title: "Workspace/Components/Status Item",
    component: WorkspaceStatusItem,
    parameters: {
      layout: "centered",
      docs: {
        description: {
          component:
            "Compact status contribution supporting icons, segments, progress, actions, and declarative menus.",
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
  let result = $state("Nothing selected");
  const actionItem: WorkspaceStatusItemModel = {
    id: "ready",
    icon: "circle-check",
    label: "Framework ready",
    tooltip: "Workspace framework ready",
    onSelect: () => {
      result = "Ready selected";
    },
  };
  const menuItem: WorkspaceStatusItemModel = {
    id: "plugins",
    icon: "puzzle",
    label: "Plugins",
    buildMenu(menu) {
      menu.addItem((item) =>
        item.setTitle("Manage plugins").onClick(() => {
          result = "Manage plugins selected";
        }),
      );
    },
  };
</script>

<Story
  name="Action and menu items"
  tags={["visual-approved"]}
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Workspace framework ready" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Ready selected",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Plugins" }));
    const page = within(document.body);
    await userEvent.click(
      page.getByRole("menuitem", { name: "Manage plugins" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Manage plugins selected",
    );
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/status-item/action-and-menu-items-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="ui-workspace-status-item-story-frame">
      <WorkspaceStatusItem item={actionItem} />
      <WorkspaceStatusItem item={menuItem} />
    </div>
    <output class="sr-only">{result}</output>
  {/snippet}
</Story>

<Story
  name="Segment and tooltip accessible names"
  tags={["visual-pending"]}
  play={async ({ canvas }) => {
    const version = canvas.getByRole("button", { name: /About Atlas/ });
    await expect(version).toHaveAccessibleName(/v1\.2\.3/);
    const menu = canvas.getByRole("button", { name: /Manage plugins/ });
    await expect(menu).toHaveAccessibleName(/3 plugins/);
    await userEvent.click(menu);
    await expect(within(document.body).getByRole("menu")).toBeVisible();
    await userEvent.keyboard("{Escape}");
  }}
  parameters={{
    docs: {
      source: { code: exampleSources.Segments, language: "tsx", type: "code" },
    },
    visualDelta: {
      images: [
        "/visual-baselines/workspace/status-item/segment-and-tooltip-accessible-names-chromium.png",
      ],
    },
  }}
>
  {#snippet template()}
    <div class="ui-workspace-status-item-story-frame">
      <WorkspaceStatusItem
        item={{
          id: "version",
          segments: ["v1.2.3"],
          tooltip: "About Atlas",
          onSelect: () => {},
        }}
      />
      <WorkspaceStatusItem
        item={{ ...menuItem, label: "3 plugins", tooltip: "Manage plugins" }}
      />
    </div>
  {/snippet}
</Story>
