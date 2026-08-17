<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import * as exampleSources from "./WorkspaceIcon.example-sources.js";
  import WorkspaceIcon from "./WorkspaceIcon.svelte";
  import WorkspaceIconPicker from "./WorkspaceIconPicker.svelte";

  const { Story } = defineMeta({
    title: "Workspace/Components/Icon",
    component: WorkspaceIcon,
    parameters: {
      docs: {
        description: {
          component:
            "Serializable Lucide icon renderer and searchable picker used by tabs, views, sidebars, commands, ribbon items, status items, and Settings.",
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
  let pickerValue = $state("notebook-tabs");
</script>

<Story
  name="Serializable icon names"
  tags={["visual-approved"]}
  play={async ({ canvas }) => {
    await expect(canvas.getByTestId("workspace-icon-gallery")).toBeVisible();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/icon/serializable-icon-names-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div
      class="flex items-center gap-4 text-2xl"
      data-testid="workspace-icon-gallery"
    >
      <WorkspaceIcon name="file" />
      <WorkspaceIcon name="search" />
      <WorkspaceIcon name="panel-left" />
      <WorkspaceIcon name="settings" />
    </div>
  {/snippet}
</Story>

<Story
  name="Unknown icon falls back to file"
  tags={["skip-visual"]}
  parameters={{
    docs: {
      description: {
        story:
          "Unknown serializable names render the stable file fallback. Tagged skip-visual because the named gallery is the visual baseline.",
      },
    },
  }}
  play={async ({ canvas, canvasElement }) => {
    const fallback = canvas.getByTestId("workspace-icon-fallback");
    const graphic = canvasElement.querySelector<SVGElement>(".lucide-file");
    await expect(graphic).not.toBeNull();
    await expect(getComputedStyle(graphic!).color).toBe(
      getComputedStyle(fallback).color,
    );
  }}
>
  {#snippet template()}
    <span data-testid="workspace-icon-fallback" style="color: rgb(196, 30, 52)">
      <WorkspaceIcon name="not-a-real-icon" />
    </span>
  {/snippet}
</Story>

<Story
  name="Icon picker"
  tags={["visual-pending"]}
  play={async ({ canvas }) => {
    const trigger = canvas.getByRole("combobox", { name: "Workspace icon" });
    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveTextContent("notebook-tabs");
    await expect(getComputedStyle(trigger).borderTopWidth).not.toBe("0px");
    await userEvent.click(trigger);
    const popover = await waitFor(() => {
      const content = document.body.querySelector<HTMLElement>(
        '[data-ui-component="workspace-icon-picker"][data-ui-part="content"]',
      );
      expect(content).not.toBeNull();
      expect(
        content!.querySelector(
          '[data-ui-component="command-view"][data-ui-part="root"]',
        ),
      ).not.toBeNull();
      return content!;
    });
    const search = await waitFor(() =>
      within(popover).getByPlaceholderText("Search icon..."),
    );
    await userEvent.type(search, "panel-left");
    await userEvent.click(
      within(document.body).getByRole("option", { name: /^panel-left$/i }),
    );
    await expect(trigger).toHaveTextContent("panel-left");
  }}
  parameters={{
    docs: {
      description: {
        story:
          "Searchable popover that writes a serializable Lucide icon name. Tagged visual-pending until the picker baseline is reviewed.",
      },
      source: {
        code: exampleSources.Picker,
        language: "ts",
        type: "code",
      },
    },
  }}
>
  {#snippet template()}
    <WorkspaceIconPicker
      value={pickerValue}
      ariaLabel="Workspace icon"
      onValueChange={(next) => {
        pickerValue = next;
      }}
    />
  {/snippet}
</Story>
