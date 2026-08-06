<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, fireEvent, waitFor } from "storybook/test";
  import AppShellRoot from "../../app-shell/AppShellRoot.svelte";
  import { AppShellController } from "../../core/app-shell-controller.svelte.js";
  import { APP_SHELL_SETTING_IDS } from "../../core/built-in-settings.svelte.js";
  import ReusableFrameworkDemo from "../../demo/ReusableFrameworkDemo.svelte";
  import { createFrameworkDemo } from "../../demo/framework-demo.js";
  import { fModePlugin } from "./f-mode-plugin.js";
  import { FMODE_SETTING_IDS } from "./settings.js";
  import "./FMode.stories.css";

  const invalid = createFrameworkDemo({
    includeFloating: false,
    includeFMode: true,
    includeNotifications: false,
    mobileMode: "never",
    initialConfiguration: {
      [FMODE_SETTING_IDS.alphabet]: "ab",
      [FMODE_SETTING_IDS.invalidInputBehavior]: "flash",
    },
  });
  const noTargetsApp = new AppShellController({
    plugins: [fModePlugin()],
    configuration: {
      values: {
        [APP_SHELL_SETTING_IDS.mobileMode]: "never",
      },
    },
  });

  async function openFMode(
    app: AppShellController,
    canvasElement: HTMLElement,
  ): Promise<void> {
    await waitFor(() => {
      expect(app.ready).toBe(true);
      expect(app.commands.getCommand("toggle-fmode")).not.toBeNull();
    });
    if (canvasElement.querySelector("[data-fmode-root]")) {
      await app.commands.execute("toggle-fmode");
      await waitFor(() =>
        expect(canvasElement.querySelector("[data-fmode-root]")).toBeNull(),
      );
    }
    await app.commands.execute("toggle-fmode");
  }

  const { Story } = defineMeta({
    title: "Workspace/Plugins/F-Mode/Edge cases",
    component: ReusableFrameworkDemo,
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "Error and empty-target behavior for the optional F-Mode plugin. Invalid input runs inside the complete Workspace shell; the no-target fixture is intentionally isolated.",
        },
      },
    },
  });
</script>

<Story
  name="Invalid query"
  tags={["visual-approved"]}
  play={async ({ canvasElement }) => {
    await openFMode(invalid.app, canvasElement);
    const root = canvasElement.querySelector<HTMLElement>(
      "[data-app-shell-root]",
    );
    await expect(root).not.toBeNull();
    await fireEvent.keyDown(root!, { key: "z" });
    await waitFor(() =>
      expect(
        canvasElement.querySelector(".ui-workspace-fmode--invalid"),
      ).not.toBeNull(),
    );
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/plugins/f-mode/fmode-edge-cases/invalid-query-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="ui-workspace-fmode-story">
      <ReusableFrameworkDemo app={invalid.app} />
    </div>
  {/snippet}
</Story>

<Story
  name="No targets"
  tags={["visual-approved"]}
  play={async ({ canvas, canvasElement }) => {
    await openFMode(noTargetsApp, canvasElement);
    await expect(canvas.getByText("No hint targets available")).toBeVisible();
    await expect(canvasElement.querySelector("[data-fmode-root]")).toBeNull();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/plugins/f-mode/fmode-edge-cases/no-targets-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="ui-workspace-fmode-story ui-workspace-fmode-story--no-targets">
      <AppShellRoot controller={noTargetsApp} theme="inherit">
        <main class="ui-workspace-fmode-no-targets">
          <h1>No registered hint targets</h1>
          <p>
            Consumer content participates only when it opts into the public
            <code>data-hint-*</code> contract.
          </p>
        </main>
      </AppShellRoot>
    </div>
  {/snippet}
</Story>
