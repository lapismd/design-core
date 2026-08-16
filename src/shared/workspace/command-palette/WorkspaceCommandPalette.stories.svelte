<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor } from "storybook/test";
  import AppShellRoot from "../app-shell/AppShellRoot.svelte";
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

  function expectPaletteScrollArea(canvasElement: HTMLElement): HTMLElement {
    const scrollArea = canvasElement.querySelector<HTMLElement>(
      '[data-ui-component="workspace-command-palette"] [data-ui-component="scroll-area"][data-ui-part="scroll-area"]',
    );
    expect(scrollArea).not.toBeNull();
    expect(scrollArea).toBeVisible();
    return scrollArea!;
  }

  const searchApp = createPaletteApp();
  const previewApp = createPaletteApp();
  const emptyApp = createPaletteApp();
  const overflowApp = createOverflowPaletteApp();

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
    previewApp.commands.openPalette();
    await expect(
      await canvas.findByRole("dialog", { name: "Command Palette" }),
    ).toBeVisible();
    expectPaletteScrollArea(canvasElement);
  }}
  parameters={{
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
    overflowApp.commands.openPalette();
    await expect(
      await canvas.findByRole("dialog", { name: "Command Palette" }),
    ).toBeVisible();
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
  parameters={{
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
  parameters={{
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
