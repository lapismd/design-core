<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor } from "storybook/test";
  import AppShellRoot from "../app-shell/AppShellRoot.svelte";
  import { AppShellController } from "../core/app-shell-controller.svelte.js";
  import WorkspaceSettingsSurface from "./WorkspaceSettingsSurface.svelte";
  import WorkspaceSettingsStoryHeader from "./WorkspaceSettingsStoryHeader.svelte";
  import WorkspaceSettingsStoryFileField from "./WorkspaceSettingsStoryFileField.svelte";
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
  function createHeaderApp() {
    const app = new AppShellController();
    let value: unknown = "idle";
    const listeners = new Set<() => void>();
    app.settings.registerDefinition({
      section: {
        id: "custom-header",
        title: "Custom field settings",
        fields: [
          {
            id: "custom-file",
            type: "custom",
            title: "Invitation attachment",
            presentation: "full-width",
            adapter: "custom-file",
          },
        ],
      },
      source: {
        get: () => value,
        set: async (_id, next) => {
          value = next;
          for (const listener of listeners) listener();
          return next;
        },
        subscribe: (listener) => {
          listeners.add(listener);
          return () => listeners.delete(listener);
        },
      },
      adapters: [
        {
          id: "custom-file",
          component: WorkspaceSettingsStoryFileField,
          headerComponent: WorkspaceSettingsStoryHeader,
        },
      ],
    });
    app.settings.selectSection("custom-header");
    app.settings.open();
    return app;
  }
  const headerApp = createHeaderApp();
  const fileApp = createHeaderApp();
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

<Story
  name="Custom field header actions"
  play={async ({ canvas }) => {
    await userEvent.click(
      await canvas.findByRole("button", { name: "Custom field settings" }),
    );
    const label = canvas.getByText("Invitation attachment", { exact: true });
    const action = canvas.getByRole("button", { name: "Create invitation" });
    const file = canvas.getByLabelText("Invitation attachment");
    const labelRect = label.getBoundingClientRect();
    const actionRect = action.getBoundingClientRect();
    expect(actionRect.left).toBeGreaterThan(labelRect.right);
    expect(actionRect.top).toBeLessThan(labelRect.bottom);
    expect(actionRect.bottom).toBeGreaterThan(labelRect.top);
    expect(file.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      actionRect.bottom,
    );
    await userEvent.click(action);
    expect(
      await canvas.findByRole("button", { name: "Cancel invitation" }),
    ).toBeEnabled();
    const frame = file.closest<HTMLElement>(
      ".ui-workspace-settings-story-frame",
    )!;
    try {
      frame.style.width = "28rem";
      await waitFor(() => {
        const row = file.closest<HTMLElement>('[data-ui-part="setting-item"]')!;
        expect(row.scrollWidth).toBeLessThanOrEqual(row.clientWidth + 1);
        expect(
          canvas
            .getByRole("button", { name: "Cancel invitation" })
            .getBoundingClientRect().right,
        ).toBeLessThanOrEqual(row.getBoundingClientRect().right + 1);
      });
    } finally {
      frame.style.removeProperty("width");
    }
  }}
>
  {#snippet template()}
    <div class="ui-workspace-settings-story-canvas">
      <div class="ui-workspace-settings-story-frame">
        <AppShellRoot controller={headerApp} theme="inherit"
          ><WorkspaceSettingsSurface
            controller={headerApp.settings}
            app={headerApp}
          /></AppShellRoot
        >
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="File input sizing"
  play={async ({ canvas }) => {
    await userEvent.click(
      await canvas.findByRole("button", { name: "Custom field settings" }),
    );
    const file = canvas.getByLabelText("Invitation attachment");
    const style = getComputedStyle(file);
    const inner = getComputedStyle(file, "::file-selector-button");
    expect(
      parseFloat(inner.height) +
        parseFloat(style.paddingTop) +
        parseFloat(style.paddingBottom) +
        parseFloat(style.borderTopWidth) +
        parseFloat(style.borderBottomWidth),
    ).toBeLessThanOrEqual(file.getBoundingClientRect().height + 1);
    expect(parseFloat(style.paddingLeft)).toBeGreaterThan(0);
  }}
>
  {#snippet template()}
    <div class="ui-workspace-settings-story-canvas">
      <div class="ui-workspace-settings-story-frame">
        <AppShellRoot controller={fileApp} theme="inherit"
          ><WorkspaceSettingsSurface
            controller={fileApp.settings}
            app={fileApp}
          /></AppShellRoot
        >
      </div>
    </div>
  {/snippet}
</Story>
