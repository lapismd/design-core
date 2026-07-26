<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor } from "storybook/test";
  import AppShellRoot from "../../app-shell/AppShellRoot.svelte";
  import { AppShellController } from "../../core/app-shell-controller.svelte.js";
  import { APP_SHELL_SETTING_IDS } from "../../core/built-in-settings.svelte.js";
  import FModeStorySurface from "./FModeStorySurface.svelte";
  import { fModePlugin } from "./f-mode-plugin.js";
  import { FMODE_SETTING_IDS } from "./settings.js";
  import "./FMode.stories.css";

  function createFModeApp(
    values: Record<string, unknown> = {},
  ): AppShellController {
    return new AppShellController({
      plugins: [fModePlugin()],
      configuration: {
        values: {
          [APP_SHELL_SETTING_IDS.mobileMode]: "never",
          [FMODE_SETTING_IDS.alphabet]: "ab",
          [FMODE_SETTING_IDS.showTargetDescriptions]: true,
          ...values,
        },
      },
    });
  }

  const idleApp = createFModeApp();
  const activeApp = createFModeApp();
  const activationApp = createFModeApp();
  const partialApp = createFModeApp();
  const filteredApp = createFModeApp({
    [FMODE_SETTING_IDS.enabledSurfaces]: ["tabs"],
  });
  const minimalApp = createFModeApp({
    [FMODE_SETTING_IDS.hudMode]: "minimal",
  });

  async function openFMode(app: AppShellController) {
    await waitFor(() => {
      expect(app.commands.getCommand("toggle-fmode")).not.toBeNull();
    });
    await app.commands.execute("toggle-fmode");
  }

  const { Story } = defineMeta({
    title: "Workspace/Plugins/F-Mode",
    component: FModeStorySurface,
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "Optional keyboard-hint plugin built on the public AppShell overlay, hint-target, command, settings, and modal keymap contracts.",
        },
      },
    },
  });
</script>

<Story
  name="Idle target surface"
  tags={["visual-pending"]}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/plugins/f-mode/idle-target-surface-chromium-darwin.png",
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
    <div class="ui-workspace-fmode-story">
      <div class="ui-workspace-fmode-story__frame">
        <AppShellRoot controller={idleApp} theme="inherit">
          <FModeStorySurface />
        </AppShellRoot>
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Active hints"
  tags={["visual-pending"]}
  play={async ({ canvas, canvasElement }) => {
    canvas.getByRole("button", { name: "Open note" }).focus();
    await openFMode(activeApp);
    await expect(
      canvasElement.querySelectorAll("[data-fmode-hint]"),
    ).toHaveLength(4);
    await expect(canvas.getByText("4 targets")).toBeVisible();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/plugins/f-mode/active-hints-chromium-darwin.png",
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
    <div class="ui-workspace-fmode-story">
      <div class="ui-workspace-fmode-story__frame">
        <AppShellRoot controller={activeApp} theme="inherit">
          <FModeStorySurface />
        </AppShellRoot>
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Keyboard activation"
  tags={["visual-pending"]}
  play={async ({ canvas, canvasElement }) => {
    canvas.getByRole("button", { name: "Open note" }).focus();
    await openFMode(activationApp);
    await userEvent.keyboard("aa");
    await expect(canvas.getByText("Open note activated")).toBeVisible();
    await expect(canvasElement.querySelector("[data-fmode-root]")).toBeNull();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/plugins/f-mode/keyboard-activation-chromium-darwin.png",
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
    <div class="ui-workspace-fmode-story">
      <div class="ui-workspace-fmode-story__frame">
        <AppShellRoot controller={activationApp} theme="inherit">
          <FModeStorySurface />
        </AppShellRoot>
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Partial query"
  tags={["visual-pending"]}
  play={async ({ canvas, canvasElement }) => {
    canvas.getByRole("button", { name: "Open note" }).focus();
    await openFMode(partialApp);
    await userEvent.keyboard("b");
    await expect(canvas.getByText("2 matches")).toBeVisible();
    await expect(
      Array.from(
        canvasElement.querySelectorAll<HTMLElement>("[data-fmode-hint]"),
      ).filter((hint) => !hint.hidden),
    ).toHaveLength(2);
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/plugins/f-mode/partial-query-chromium-darwin.png",
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
    <div class="ui-workspace-fmode-story">
      <div class="ui-workspace-fmode-story__frame">
        <AppShellRoot controller={partialApp} theme="inherit">
          <FModeStorySurface />
        </AppShellRoot>
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Filtered target groups"
  tags={["visual-pending"]}
  play={async ({ canvas, canvasElement }) => {
    canvas.getByRole("button", { name: "Open note" }).focus();
    await openFMode(filteredApp);
    await expect(
      canvasElement.querySelectorAll("[data-fmode-hint]"),
    ).toHaveLength(2);
    await expect(canvas.getByText("2 targets")).toBeVisible();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/plugins/f-mode/filtered-target-groups-chromium-darwin.png",
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
    <div class="ui-workspace-fmode-story">
      <div class="ui-workspace-fmode-story__frame">
        <AppShellRoot controller={filteredApp} theme="inherit">
          <FModeStorySurface />
        </AppShellRoot>
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Minimal HUD"
  tags={["visual-pending"]}
  play={async ({ canvas, canvasElement }) => {
    canvas.getByRole("button", { name: "Open note" }).focus();
    await openFMode(minimalApp);
    await expect(
      canvasElement.querySelector("[data-fmode-hud-mode='minimal']"),
    ).not.toBeNull();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/plugins/f-mode/minimal-hud-chromium-darwin.png",
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
    <div class="ui-workspace-fmode-story">
      <div class="ui-workspace-fmode-story__frame">
        <AppShellRoot controller={minimalApp} theme="inherit">
          <FModeStorySurface />
        </AppShellRoot>
      </div>
    </div>
  {/snippet}
</Story>
