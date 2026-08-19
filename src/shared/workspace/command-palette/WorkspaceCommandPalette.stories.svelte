<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor } from "storybook/test";
  import AppShellRoot from "../app-shell/AppShellRoot.svelte";
  import AppShellSettingsDialog from "../app-shell/AppShellSettingsDialog.svelte";
  import { AppShellController } from "../core/app-shell-controller.svelte.js";
  import { APP_SHELL_SETTING_IDS } from "../core/built-in-settings.svelte.js";
  import * as exampleSources from "./WorkspaceCommandPalette.example-sources.js";
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

  function createGroupedPaletteApp(): AppShellController {
    return new AppShellController({
      configuration: {
        values: { [APP_SHELL_SETTING_IDS.mobileMode]: "never" },
      },
      commands: [
        {
          id: "alpha:one",
          title: "Alpha one",
          sourcePlugin: "alpha",
          callback: () => true,
        },
        {
          id: "beta:one",
          title: "Beta one",
          sourcePlugin: "beta",
          callback: () => true,
        },
      ],
    });
  }

  function createOverflowPaletteApp(): AppShellController {
    return new AppShellController({
      configuration: {
        values: { [APP_SHELL_SETTING_IDS.mobileMode]: "never" },
      },
      commands: Array.from({ length: 24 }, (_, index) => ({
        id: `workspace:overflow-${index + 1}`,
        title: `Overflow command ${index + 1}`,
        category: "Workspace",
        callback: () => true,
      })),
    });
  }

  function expectPaletteCommandView(canvasElement: HTMLElement): HTMLElement {
    const commandView = canvasElement.querySelector<HTMLElement>(
      '[data-ui-component="workspace-command-palette"] [data-ui-component="command-view"][data-ui-part="root"]',
    );
    expect(commandView).not.toBeNull();
    expect(commandView).toBeVisible();
    return commandView!;
  }

  function expectPaletteScrollArea(canvasElement: HTMLElement): HTMLElement {
    const scrollArea = canvasElement.querySelector<HTMLElement>(
      '[data-ui-component="workspace-command-palette"] [data-ui-component="command-view"] [data-ui-component="scroll-area"][data-ui-part="scroll-area"]',
    );
    expect(scrollArea).not.toBeNull();
    expect(scrollArea).toBeVisible();
    return scrollArea!;
  }

  const searchApp = createPaletteApp();
  const previewApp = createPaletteApp();
  const emptyApp = createPaletteApp();
  const overflowApp = createOverflowPaletteApp();
  const groupedApp = createGroupedPaletteApp();
  const settingsApp = createPaletteApp();

  const { Story } = defineMeta({
    title: "Workspace/Components/Command Palette",
    component: WorkspaceCommandPalette,
    parameters: {
      layout: "fullscreen",
      docs: {
        source: {
          code: exampleSources.Basic,
          language: "ts",
          type: "code",
        },
      },
    },
  });
</script>

<Story
  name="Open palette"
  tags={["visual-pending"]}
  play={async ({ canvas, canvasElement }) => {
    await waitFor(() => expect(previewApp.ready).toBe(true));
    previewApp.commands.openPalette({ tab: "all" });
    await expect(
      await canvas.findByRole("dialog", { name: "Command Palette" }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("combobox", { name: "Search commands" }),
    ).toBeVisible();
    expectPaletteCommandView(canvasElement);
    expectPaletteScrollArea(canvasElement);
    await expect(canvas.getByRole("tab", { name: "All" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(canvas.getByRole("tab", { name: "Actions" })).toBeVisible();
    await expect(canvas.getByRole("tab", { name: "Settings" })).toBeVisible();
  }}
  parameters={{
    docs: {
      description: {
        story:
          "The open palette shows filter tabs under search and a keyboard footer.",
      },
    },
    visualDelta: {
      images: [
        "/visual-baselines/workspace/command-palette/open-palette-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
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
  name="Overflowing results"
  tags={["visual-pending"]}
  play={async ({ canvas, canvasElement }) => {
    await waitFor(() => expect(overflowApp.ready).toBe(true));
    overflowApp.commands.openPalette({ tab: "actions" });
    await expect(
      await canvas.findByRole("dialog", { name: "Command Palette" }),
    ).toBeVisible();
    expectPaletteCommandView(canvasElement);
    const scrollArea = expectPaletteScrollArea(canvasElement);
    const viewport = scrollArea.querySelector<HTMLElement>(
      '[data-ui-part="scroll-area-viewport"]',
    );
    expect(viewport).not.toBeNull();
    await waitFor(() => {
      expect(viewport!.scrollHeight).toBeGreaterThan(viewport!.clientHeight);
    });
    await expect(canvas.getByText("Overflow command 1")).toBeVisible();
    await expect(canvas.getByText("Overflow command 24")).toBeInTheDocument();
  }}
  parameters={{
    docs: {
      description: {
        story:
          "The Actions tab scrolls long command lists through the Command View viewport.",
      },
    },
    visualDelta: {
      images: [
        "/visual-baselines/workspace/command-palette/overflowing-results-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="ui-workspace-overlay-story">
      <div class="ui-workspace-overlay-story__frame">
        <AppShellRoot controller={overflowApp} theme="inherit">
          <div class="ui-workspace-overlay-story__content">
            Scroll long command lists
          </div>
        </AppShellRoot>
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Searches and runs commands"
  tags={["visual-pending"]}
  play={async ({ canvas, canvasElement }) => {
    await waitFor(() => expect(searchApp.ready).toBe(true));
    searchApp.commands.openPalette({ tab: "all" });
    await canvas.findByRole("dialog", { name: "Command Palette" });
    expectPaletteCommandView(canvasElement);
    const input = await canvas.findByRole("combobox", {
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
  parameters={{
    docs: {
      description: {
        story: "Typing a query filters commands and selecting one runs it.",
      },
    },
    visualDelta: {
      images: [
        "/visual-baselines/workspace/command-palette/searches-and-runs-commands-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
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
  play={async ({ canvas, canvasElement }) => {
    await waitFor(() => expect(emptyApp.ready).toBe(true));
    emptyApp.commands.openPalette({ tab: "all" });
    await canvas.findByRole("dialog", { name: "Command Palette" });
    expectPaletteCommandView(canvasElement);
    const input = await canvas.findByRole("combobox", {
      name: "Search commands",
    });
    await userEvent.clear(input);
    await userEvent.type(input, "No matching command");
    await expect(
      canvas.getByRole("option", { name: "No results found." }),
    ).toBeVisible();
  }}
  parameters={{
    docs: {
      description: {
        story: "A query with no matches keeps the empty-result listbox option.",
      },
    },
    visualDelta: {
      images: [
        "/visual-baselines/workspace/command-palette/empty-search-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
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

<Story
  name="Grouped actions"
  tags={["visual-pending"]}
  play={async ({ canvas, canvasElement }) => {
    await waitFor(() => expect(groupedApp.ready).toBe(true));
    groupedApp.commands.openPalette({ tab: "actions" });
    await canvas.findByRole("dialog", { name: "Command Palette" });
    expectPaletteCommandView(canvasElement);
    await expect(canvas.getByRole("tab", { name: "Actions" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(canvas.getByText("alpha")).toBeVisible();
    await expect(canvas.getByText("beta")).toBeVisible();
    await expect(canvas.getByText("Alpha one")).toBeVisible();
    await expect(canvas.getByText("Beta one")).toBeVisible();
  }}
  parameters={{
    docs: {
      description: {
        story:
          "The Actions tab groups commands by sourcePlugin, then category.",
      },
    },
    visualDelta: {
      images: [
        "/visual-baselines/workspace/command-palette/grouped-actions-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="ui-workspace-overlay-story">
      <div class="ui-workspace-overlay-story__frame">
        <AppShellRoot controller={groupedApp} theme="inherit">
          <div class="ui-workspace-overlay-story__content">
            Grouped command contributions
          </div>
        </AppShellRoot>
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Reveals a setting"
  tags={["visual-pending"]}
  play={async ({ canvas, canvasElement }) => {
    await waitFor(() => expect(settingsApp.ready).toBe(true));
    settingsApp.commands.openPalette({ tab: "settings" });
    await canvas.findByRole("dialog", { name: "Command Palette" });
    expectPaletteCommandView(canvasElement);
    const input = await canvas.findByRole("combobox", {
      name: "Search commands",
    });
    await userEvent.type(input, "show ribbon");
    await userEvent.click(await canvas.findByText("Show ribbon"));
    await waitFor(() => {
      expect(settingsApp.settings.dialogOpen).toBe(true);
    });
    await waitFor(() => {
      const field = canvasElement.ownerDocument.querySelector(
        '[data-setting-id="appearence.interface.showRibbon"]',
      );
      expect(field).not.toBeNull();
      expect(field).toHaveClass("ui-workspace-settings__search-hit");
    });
  }}
  parameters={{
    docs: {
      description: {
        story:
          "A Settings palette row opens the settings dialog and highlights the field.",
      },
    },
    visualDelta: {
      images: [
        "/visual-baselines/workspace/command-palette/reveals-a-setting-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="ui-workspace-overlay-story">
      <div class="ui-workspace-overlay-story__frame">
        <AppShellRoot controller={settingsApp} theme="inherit">
          <div class="ui-workspace-overlay-story__content">
            Jump to a setting
          </div>
          <AppShellSettingsDialog
            bind:open={
              () => settingsApp.settings.dialogOpen,
              (next) => {
                settingsApp.settings.dialogOpen = next;
                if (!next) settingsApp.settings.revealFieldId = null;
              }
            }
          />
        </AppShellRoot>
      </div>
    </div>
  {/snippet}
</Story>
