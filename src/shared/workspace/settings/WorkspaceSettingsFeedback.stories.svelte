<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor } from "storybook/test";
  import AppShellRoot from "../app-shell/AppShellRoot.svelte";
  import { AppShellController } from "../core/app-shell-controller.svelte.js";
  import WorkspaceSettingsSurface from "./WorkspaceSettingsSurface.svelte";
  import "./WorkspaceSettings.stories.css";

  function createApp() {
    const app = new AppShellController({
      configuration: {
        values: {
          encryption:
            "End-to-end encryption is required. Only enrolled endpoints can read vault content.",
        },
      },
    });
    app.settings.registerSection({
      id: "feedback",
      title: "Connection settings",
      fields: [
        {
          id: "encryption",
          type: "output",
          title: "Encryption",
          presentation: "status",
        },
        {
          id: "tags",
          type: "boolean",
          title: "Publish opaque file-index tags",
          description:
            "Include keyed path tags without exposing plaintext paths.",
          default: false,
        },
        ...(["success", "warning", "error"] as const).map((tone) => ({
          id: `test-${tone}`,
          type: "action" as const,
          title: `Test connection ${tone}`,
          label: `Test connection ${tone}`,
          run: () => ({
            tone,
            message: `${tone}: Connection test completed for the configured server and managed vault.`,
          }),
        })),
      ],
    });
    app.settings.selectSection("feedback");
    app.settings.open();
    return app;
  }
  const feedbackApp = createApp();
  const responsiveApp = createApp();
  const { Story } = defineMeta({
    title: "Workspace/Components/Settings",
    component: WorkspaceSettingsSurface,
    tags: ["!autodocs", "test", "visual-pending"],
    parameters: { layout: "fullscreen" },
  });
</script>

<Story
  name="Full-width action feedback"
  play={async ({ canvas }) => {
    await userEvent.click(
      await canvas.findByRole("button", {
        name: "Connection settings",
      }),
    );
    for (const tone of ["success", "warning", "error"]) {
      const button = canvas.getByRole("button", {
        name: `Test connection ${tone}`,
      });
      await userEvent.click(button);
      const message = await canvas.findByText(
        `${tone}: Connection test completed for the configured server and managed vault.`,
      );
      const row = button.closest<HTMLElement>('[data-ui-part="setting-item"]')!;
      const controls = button.parentElement!;
      expect(controls).not.toContainElement(message);
      expect(message.parentElement).toBe(row);
      expect(message.getBoundingClientRect().top).toBeGreaterThanOrEqual(
        controls.getBoundingClientRect().bottom,
      );
      expect(message.getBoundingClientRect().width).toBeCloseTo(
        row.getBoundingClientRect().width,
        0,
      );
      expect(message).toHaveAttribute(
        "role",
        tone === "error" ? "alert" : "status",
      );
    }
  }}
>
  {#snippet template()}
    <div class="ui-workspace-settings-story-canvas">
      <div class="ui-workspace-settings-story-frame">
        <AppShellRoot controller={feedbackApp} theme="inherit"
          ><WorkspaceSettingsSurface
            controller={feedbackApp.settings}
            app={feedbackApp}
          /></AppShellRoot
        >
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Responsive label columns"
  play={async ({ canvas }) => {
    await userEvent.click(
      await canvas.findByRole("button", {
        name: "Connection settings",
      }),
    );
    const label = canvas.getByText("Publish opaque file-index tags", {
      exact: true,
    });
    const row = label.closest<HTMLElement>('[data-ui-part="setting-item"]')!;
    const frame = row.closest<HTMLElement>(
      ".ui-workspace-settings-story-frame",
    )!;
    try {
      for (const width of ["58rem", "48rem", "28rem"]) {
        frame.style.width = width;
        await waitFor(() => {
          const info = row.firstElementChild!;
          expect(info.getBoundingClientRect().width).toBeGreaterThanOrEqual(
            row.clientWidth * 0.5,
          );
          expect(row.scrollWidth).toBeLessThanOrEqual(row.clientWidth + 1);
        });
      }
    } finally {
      frame.style.removeProperty("width");
    }
  }}
>
  {#snippet template()}
    <div class="ui-workspace-settings-story-canvas">
      <div class="ui-workspace-settings-story-frame">
        <AppShellRoot controller={responsiveApp} theme="inherit"
          ><WorkspaceSettingsSurface
            controller={responsiveApp.settings}
            app={responsiveApp}
          /></AppShellRoot
        >
      </div>
    </div>
  {/snippet}
</Story>
