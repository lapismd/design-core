<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor } from "storybook/test";
  import AppShellRoot from "../app-shell/AppShellRoot.svelte";
  import AppShellStatusBar from "../app-shell/AppShellStatusBar.svelte";
  import { AppShellController } from "../core/app-shell-controller.svelte.js";
  import { APP_SHELL_SETTING_IDS } from "../core/built-in-settings.svelte.js";
  import * as exampleSources from "./WorkspaceAboutDialog.example-sources.js";
  import WorkspaceAboutDialog from "./WorkspaceAboutDialog.svelte";
  import "../command-palette/WorkspaceCommandPalette.stories.css";

  const aboutApp = new AppShellController({
    application: {
      name: "Workspace Studio",
      version: "1.12.3",
      icon: "blocks",
      buildTime: "2026-07-26T10:30:00.000Z",
      commitHash: "a371198e495d9e4e",
      copyright: "Copyright 2026 Workspace Studio contributors.",
    },
    configuration: {
      values: { [APP_SHELL_SETTING_IDS.mobileMode]: "never" },
    },
  });

  const { Story } = defineMeta({
    title: "Workspace/Components/About Dialog",
    component: WorkspaceAboutDialog,
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
  name="Application information"
  tags={["visual-pending"]}
  play={async ({ canvas }) => {
    await waitFor(() => expect(aboutApp.ready).toBe(true));
    await userEvent.click(
      canvas.getByRole("button", { name: "About Workspace Studio" }),
    );
    const dialog = canvas.getByRole("dialog", { name: "Workspace Studio" });
    await expect(dialog).toBeVisible();
    await expect(canvas.getByText("Version 1.12.3")).toBeVisible();

    const ok = canvas.getByRole("button", { name: "OK" });
    const copy = canvas.getByRole("button", { name: "Copy" });
    await expect(canvas.queryByText("Copy Version")).not.toBeInTheDocument();
    const restingBackground = getComputedStyle(copy).backgroundColor;
    await expect(restingBackground).not.toBe("rgba(0, 0, 0, 0)");
    await expect(getComputedStyle(ok).backgroundColor).not.toBe(
      restingBackground,
    );
    await expect(getComputedStyle(ok).color).toBe(getComputedStyle(copy).color);
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/about-dialog/application-information-chromium.png",
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
        <AppShellRoot controller={aboutApp} theme="inherit">
          <div class="ui-workspace-overlay-story__shell">
            <div class="ui-workspace-overlay-story__content">
              Configurable application metadata
            </div>
            <AppShellStatusBar />
          </div>
        </AppShellRoot>
      </div>
    </div>
  {/snippet}
</Story>
