<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor } from "storybook/test";
  import AppShellRoot from "../app-shell/AppShellRoot.svelte";
  import { AppShellController } from "../core/app-shell-controller.svelte.js";
  import { APP_SHELL_SETTING_IDS } from "../core/built-in-settings.svelte.js";
  import WorkspaceCommandPalette from "./WorkspaceCommandPalette.svelte";
  import "./WorkspaceCommandPalette.stories.css";

  function createPaletteApp(): AppShellController {
    return new AppShellController({
      configuration: {
        values: { [APP_SHELL_SETTING_IDS.mobileMode]: "never" },
      },
      commands: [
        {
          id: "workspace:split-right",
          title: "Split pane right",
          category: "Workspace",
          icon: "columns-2",
          hotkeys: [{ modifiers: ["Mod"], key: "\\" }],
          callback: () => true,
        },
        {
          id: "workspace:toggle-sidebar",
          title: "Toggle right sidebar",
          category: "Workspace",
          icon: "panel-right",
          callback: () => true,
        },
      ],
    });
  }

  const searchApp = createPaletteApp();
  const previewApp = createPaletteApp();
  const emptyApp = createPaletteApp();

  const { Story } = defineMeta({
    title: "Workspace/Components/Command Palette",
    component: WorkspaceCommandPalette,
    parameters: { layout: "fullscreen" },
  });
</script>

<Story
  name="Open palette"
  tags={["visual-pending"]}
  play={async ({ canvas }) => {
    await waitFor(() => expect(previewApp.ready).toBe(true));
    previewApp.commands.openPalette();
    await expect(
      await canvas.findByRole("dialog", { name: "Command Palette" }),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="ui-workspace-overlay-story">
      <div class="ui-workspace-overlay-story__frame">
        <AppShellRoot controller={previewApp} theme="inherit">
          <div class="ui-workspace-overlay-story__content">
            Open commands with ⌘P
          </div>
        </AppShellRoot>
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Searches and runs commands"
  tags={["visual-pending"]}
  play={async ({ canvas }) => {
    await waitFor(() => expect(searchApp.ready).toBe(true));
    searchApp.commands.openPalette();
    const input = await canvas.findByRole("textbox", {
      name: "Search commands",
    });
    await userEvent.type(input, "split");
    await expect(canvas.getByText("Split pane right")).toBeVisible();
    await userEvent.click(canvas.getByText("Split pane right"));
    await waitFor(() => {
      expect(
        canvas.queryByRole("dialog", { name: "Command Palette" }),
      ).not.toBeInTheDocument();
    });
  }}
>
  {#snippet template()}
    <div class="ui-workspace-overlay-story">
      <div class="ui-workspace-overlay-story__frame">
        <AppShellRoot controller={searchApp} theme="inherit">
          <div class="ui-workspace-overlay-story__content">
            Open commands with ⌘P
          </div>
        </AppShellRoot>
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Empty search"
  tags={["visual-pending"]}
  play={async ({ canvas }) => {
    await waitFor(() => expect(emptyApp.ready).toBe(true));
    emptyApp.commands.openPalette();
    const input = await canvas.findByRole("textbox", {
      name: "Search commands",
    });
    await userEvent.clear(input);
    await userEvent.type(input, "No matching command");
    await expect(canvas.getByText("No results found.")).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="ui-workspace-overlay-story">
      <div class="ui-workspace-overlay-story__frame">
        <AppShellRoot controller={emptyApp} theme="inherit">
          <div class="ui-workspace-overlay-story__content">
            Search application commands
          </div>
        </AppShellRoot>
      </div>
    </div>
  {/snippet}
</Story>
