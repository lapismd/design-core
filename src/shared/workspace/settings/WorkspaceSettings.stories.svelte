<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import AppShellRoot from "../app-shell/AppShellRoot.svelte";
  import { AppShellController } from "../core/app-shell-controller.svelte.js";
  import { APP_SHELL_SETTING_IDS } from "../core/built-in-settings.svelte.js";
  import { AppShellPlugin } from "../core/plugin-manager.svelte.js";
  import AppSettingsContent from "./AppSettingsContent.svelte";
  import AppSettingsNavigation from "./AppSettingsNavigation.svelte";
  import AppSettingsRoot from "./AppSettingsRoot.svelte";
  import AppSettingsSearch from "./AppSettingsSearch.svelte";
  import WorkspaceSettingsStoryCustomField from "./WorkspaceSettingsStoryCustomField.svelte";
  import WorkspaceSettingsSurface from "./WorkspaceSettingsSurface.svelte";
  import * as exampleSources from "./WorkspaceSettings.example-sources.js";
  import { WorkspaceSettingsController } from "./settings-controller.svelte.js";
  import type { WorkspaceSettingsSection } from "./types.js";
  import "./WorkspaceSettings.stories.css";

  class RequiredWorkspacePlugin extends AppShellPlugin {}
  class OptionalWorkspacePlugin extends AppShellPlugin {}

  function createSettingsApp() {
    return new AppShellController({
      application: {
        name: "Workspace UI",
        version: "1.0.0",
      },
      configuration: {
        values: {
          [APP_SHELL_SETTING_IDS.mobileMode]: "never",
          [APP_SHELL_SETTING_IDS.editorAssociations]: {
            "*.md": "markdown",
          },
        },
      },
      editorViews: [
        {
          id: "markdown",
          label: "Markdown editor",
          description: "Rich Markdown document view",
          filenamePatterns: ["*.md"],
          priority: "default",
        },
        {
          id: "text",
          label: "Text editor",
          description: "Plain text resource view",
          filenamePatterns: ["*.txt"],
          priority: "option",
        },
      ],
      plugins: [
        {
          id: "workspace-core",
          name: "Workspace",
          description: "Core workspace layout and navigation.",
          icon: "panels-top-left",
          plugin: RequiredWorkspacePlugin,
          required: true,
        },
        {
          id: "backlinks",
          name: "Backlinks",
          description: "Contributes linked-resource navigation.",
          icon: "link",
          plugin: OptionalWorkspacePlugin,
          enabled: true,
        },
      ],
    });
  }

  const allControlSections: WorkspaceSettingsSection[] = [
    {
      id: "essentials",
      title: "Essential controls",
      description:
        "Primitive values, choices, validation, and action affordances.",
      icon: "sliders-horizontal",
      navigationGroupId: "options",
      fields: [
        {
          id: "demo.enabled",
          type: "boolean",
          title: "Enabled",
          description: "A persisted boolean toggle.",
          default: true,
        },
        {
          id: "demo.name",
          type: "string",
          title: "Workspace name",
          description: "A single-line text value.",
          default: "Research workspace",
          placeholder: "Name this workspace",
        },
        {
          id: "demo.summary",
          type: "string",
          presentation: "textarea",
          title: "Summary",
          description: "A longer multi-line text value.",
          default: "A reusable application shell.",
        },
        {
          id: "demo.email",
          type: "string",
          presentation: "email",
          title: "Notification email",
          default: "team@example.com",
        },
        {
          id: "demo.url",
          type: "string",
          presentation: "url",
          title: "Project URL",
          default: "https://example.com",
        },
        {
          id: "demo.ip",
          type: "string",
          presentation: "ip",
          title: "Sync address",
          default: "127.0.0.1",
        },
        {
          id: "demo.date",
          type: "string",
          presentation: "date",
          title: "Archive date",
          default: "2026-07-26",
        },
        {
          id: "demo.time",
          type: "string",
          presentation: "time",
          title: "Daily reminder",
          default: "09:30",
        },
        {
          id: "demo.icon",
          type: "string",
          presentation: "icon",
          title: "Workspace icon",
          default: "notebook-tabs",
        },
        {
          id: "demo.color",
          type: "string",
          presentation: "color",
          title: "Accent colour",
          default: "#7c3aed",
        },
        {
          id: "demo.density",
          type: "enum",
          title: "Density",
          default: "comfortable",
          options: [
            { value: "compact", label: "Compact" },
            { value: "comfortable", label: "Comfortable" },
            { value: "spacious", label: "Spacious" },
          ],
        },
        {
          id: "demo.sources",
          type: "multi-enum",
          title: "Enabled surfaces",
          default: ["left", "status"],
          options: [
            { value: "left", label: "Left sidebar" },
            { value: "right", label: "Right sidebar" },
            { value: "status", label: "Status bar" },
          ],
        },
        {
          id: "demo.retries",
          type: "integer",
          title: "Retry limit",
          default: 3,
          minimum: 0,
          maximum: 10,
        },
        {
          id: "demo.zoom",
          type: "number",
          title: "Zoom level",
          default: 16,
          minimum: 10,
          maximum: 30,
          step: 1,
        },
        {
          id: "demo.reset",
          type: "action",
          title: "Reset demo",
          description: "Actions execute without storing a setting value.",
          label: "Reset now",
          icon: "rotate-ccw",
          run: () => undefined,
        },
      ],
    },
    {
      id: "collections",
      title: "Host integration",
      description:
        "Lists, structured values, associations, custom renderers, and fallbacks.",
      icon: "list-plus",
      navigationGroupId: "advanced",
      fields: [
        {
          id: "demo.tags",
          type: "list",
          title: "Tags",
          default: ["framework", "workspace"],
          itemType: "string",
          maximumItems: 5,
        },
        {
          id: "demo.columns",
          type: "object-array",
          title: "Table columns",
          default: [{ id: "title", width: 240 }],
          properties: [
            {
              id: "id",
              title: "ID",
              type: "string",
              required: true,
            },
            { id: "width", title: "Width", type: "integer", default: 160 },
          ],
        },
        {
          id: "demo.cards",
          type: "object-grid",
          title: "Dashboard cards",
          default: [{ title: "Activity", visible: true }],
          properties: [
            { id: "title", title: "Title", type: "string", required: true },
            {
              id: "visible",
              title: "Visible",
              type: "boolean",
              default: true,
            },
          ],
        },
        {
          id: "demo.profiles",
          type: "object-map",
          title: "Named profiles",
          default: { default: { label: "Default", enabled: true } },
          properties: [
            { id: "label", title: "Label", type: "string", required: true },
            {
              id: "enabled",
              title: "Enabled",
              type: "boolean",
              default: true,
            },
          ],
        },
        {
          id: "demo.associations",
          type: "key-value",
          title: "Editor associations",
          default: { "*.md": "markdown" },
          keyLabel: "Pattern",
          valueLabel: "View",
          addLabel: "Add association",
          valueOptions: [
            { value: "markdown", label: "Markdown editor" },
            { value: "text", label: "Text editor" },
          ],
        },
        {
          id: "demo.custom",
          type: "custom",
          title: "Custom renderer",
          description: "Applications can supply a typed field component.",
          default: "Application value",
          component: WorkspaceSettingsStoryCustomField,
        },
        {
          id: "demo.unsupported",
          type: "unsupported",
          title: "Future schema value",
          description:
            "Unknown schemas remain visible instead of silently disappearing.",
          schemaType: "binary-resource",
        },
      ],
    },
  ];

  const builtInApp = createSettingsApp();
  const interactionApp = createSettingsApp();
  const searchInteractionApp = createSettingsApp();
  const compoundApp = createSettingsApp();
  const allControls = new WorkspaceSettingsController({
    sections: allControlSections,
    navigationGroups: [
      { id: "options", title: "Options", order: 0 },
      { id: "advanced", title: "Advanced", order: 10 },
    ],
  });
  const collectionControls = new WorkspaceSettingsController({
    sections: allControlSections,
    navigationGroups: [
      { id: "options", title: "Options", order: 0 },
      { id: "advanced", title: "Advanced", order: 10 },
    ],
  });
  const toggleTableControls = new WorkspaceSettingsController({
    sections: [
      {
        id: "feature-controls",
        title: "Feature settings",
        description: "Compact groups of independently persisted flags.",
        icon: "list-checks",
        fields: [
          {
            id: "demo.features",
            type: "group",
            presentation: "toggle-table",
            title: "Features",
            description: "Choose which authoring capabilities are available.",
            fields: [
              {
                id: "demo.features.formatting",
                type: "boolean",
                title: "Formatting",
                description: "Show formatting actions in the editor.",
                default: true,
              },
              {
                id: "demo.features.slash-commands",
                type: "boolean",
                title: "Slash commands",
                description: "Show the slash command menu while authoring.",
                default: true,
              },
              {
                id: "demo.features.block-controls",
                type: "boolean",
                title: "Block controls",
                description: "Show handles for moving document blocks.",
                default: false,
              },
            ],
          },
        ],
      },
    ],
  });

  const { Story } = defineMeta({
    title: "Workspace/Components/Settings",
    component: WorkspaceSettingsSurface,
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "Native-token settings presentation for controller-owned schemas, application commands, and static plugins. The AppSettings compound parts can be assembled independently.",
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

<Story
  name="Controller-owned workspace settings"
  tags={["visual-approved"]}
  play={async ({ canvas }) => {
    const search = canvas.getByRole("searchbox", {
      name: "Search settings",
    });
    await userEvent.type(search, "colour");
    await expect(search).toHaveValue("colour");
    await expect(
      canvas.getByRole("heading", { name: "Settings Search Results" }),
    ).toBeVisible();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/settings/controller-owned-workspace-settings-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="ui-workspace-settings-story-canvas">
      <div class="ui-workspace-settings-story-frame">
        <AppShellRoot controller={builtInApp} theme="inherit">
          <WorkspaceSettingsSurface
            controller={builtInApp.settings}
            app={builtInApp}
          />
        </AppShellRoot>
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Toggle table feature group"
  tags={["visual-pending"]}
  play={async ({ canvas, canvasElement }) => {
    await expect(
      canvas.getByRole("heading", { name: "Features" }),
    ).toBeVisible();
    await expect(
      canvas.getByText("Show the slash command menu while authoring."),
    ).toBeVisible();

    const formatting = canvas.getByRole("switch", { name: "Formatting" });
    await expect(formatting).toBeChecked();
    await userEvent.click(formatting);
    await expect(formatting).not.toBeChecked();
    await expect(toggleTableControls.get("demo.features.formatting")).toBe(
      false,
    );
    await expect(toggleTableControls.get("demo.features")).toBeUndefined();

    const search = canvas.getByRole("searchbox", {
      name: "Search settings",
    });
    await userEvent.type(search, "slash command menu");
    await userEvent.click(
      canvas.getByRole("button", { name: "Open Slash commands" }),
    );
    await waitFor(() =>
      expect(
        canvasElement.querySelector(
          '[data-setting-id="demo.features.slash-commands"]',
        ),
      ).toHaveClass("ui-workspace-settings__search-hit"),
    );
  }}
  parameters={{
    docs: {
      source: {
        code: exampleSources.ToggleTable,
        language: "svelte",
        type: "code",
      },
    },
    visualDelta: {
      images: [
        "/visual-baselines/workspace/settings/toggle-table-feature-group-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="ui-workspace-settings-story-canvas">
      <div class="ui-workspace-settings-story-frame">
        <AppSettingsRoot controller={toggleTableControls}>
          <aside
            class="ui-workspace-settings__sidebar"
            data-ui-part="settings-sidebar"
            aria-label="Settings navigation"
          >
            <AppSettingsSearch />
            <AppSettingsNavigation />
          </aside>
          <AppSettingsContent />
        </AppSettingsRoot>
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Updates appearance and mobile configuration"
  tags={["visual-approved"]}
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Appearance" }));
    const scheme = canvas.getByRole("combobox", {
      name: "Base colour scheme",
    });
    await userEvent.click(scheme);
    await userEvent.click(
      within(document.body).getByRole("option", { name: "Dark" }),
    );
    await waitFor(() => {
      expect(
        within(document.body).queryByRole("option", { name: "Dark" }),
      ).not.toBeInTheDocument();
    });
    await expect(scheme).toHaveTextContent("Dark");
    await expect(
      interactionApp.configuration.get(APP_SHELL_SETTING_IDS.appearanceTheme),
    ).toBe("dark");
    const workspaceNavigation = canvas.getByRole("button", {
      name: "Workspace",
    });
    await waitFor(() => {
      expect(getComputedStyle(workspaceNavigation).pointerEvents).not.toBe(
        "none",
      );
    });
    await userEvent.click(workspaceNavigation);
    const mobileLayout = canvas.getByRole("combobox", {
      name: "Mobile layout",
    });
    await userEvent.click(mobileLayout);
    await userEvent.click(
      within(document.body).getByRole("option", { name: "Always" }),
    );
    await expect(mobileLayout).toHaveTextContent("Always");
    await expect(interactionApp.mobile.requestedDisplayMode).toBe("mobile");
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/settings/updates-appearance-and-mobile-configuration-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="ui-workspace-settings-story-canvas">
      <div class="ui-workspace-settings-story-frame">
        <AppShellRoot controller={interactionApp} theme="inherit">
          <WorkspaceSettingsSurface
            controller={interactionApp.settings}
            app={interactionApp}
          />
        </AppShellRoot>
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Search navigation and transient highlight interaction"
  tags={["skip-visual"]}
  play={async ({ canvas, canvasElement }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Appearance" }));
    const viewport = canvasElement.querySelector<HTMLElement>(
      ".ui-workspace-settings__content-viewport",
    );
    await expect(viewport).not.toBeNull();
    if (!viewport) return;
    viewport.scrollTop = viewport.scrollHeight;
    await expect(viewport.scrollTop).toBeGreaterThan(0);

    const search = canvas.getByRole("searchbox", {
      name: "Search settings",
    });
    await userEvent.type(search, "accent colour");
    await waitFor(() => expect(viewport.scrollTop).toBe(0));

    await userEvent.click(
      canvas.getByRole("button", { name: "Open Accent colour" }),
    );
    let target: HTMLElement | null = null;
    await waitFor(() => {
      target = canvasElement.querySelector<HTMLElement>(
        '[data-setting-id="appearence.accentColor"]',
      );
      expect(target).toHaveClass("ui-workspace-settings__search-hit");
    });
    await waitFor(
      () => expect(target).not.toHaveClass("ui-workspace-settings__search-hit"),
      { timeout: 2_000 },
    );
  }}
>
  {#snippet template()}
    <div class="ui-workspace-settings-story-canvas">
      <div class="ui-workspace-settings-story-frame">
        <AppShellRoot controller={searchInteractionApp} theme="inherit">
          <WorkspaceSettingsSurface
            controller={searchInteractionApp.settings}
            app={searchInteractionApp}
          />
        </AppShellRoot>
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="All supported controls"
  tags={["visual-approved"]}
  play={async ({ canvas }) => {
    const workspaceName = canvas.getByLabelText("Workspace name");
    await userEvent.clear(workspaceName);
    await userEvent.type(workspaceName, "Composable shell");
    await expect(workspaceName).toHaveValue("Composable shell");
    await expect(allControls.get("demo.name")).toBe("Composable shell");

    const search = canvas.getByRole("searchbox", {
      name: "Search settings",
    });
    await userEvent.type(search, "custom renderer");
    await expect(
      canvas.getByRole("heading", { name: "Settings Search Results" }),
    ).toBeVisible();
    await userEvent.clear(search);
    await userEvent.click(
      canvas.getByRole("button", { name: "Host integration" }),
    );
    await expect(
      canvas.getByRole("heading", { name: "Host integration" }),
    ).toBeVisible();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/settings/all-supported-controls-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="ui-workspace-settings-story-canvas">
      <div class="ui-workspace-settings-story-frame">
        <AppSettingsRoot controller={allControls}>
          <aside
            class="ui-workspace-settings__sidebar"
            data-ui-part="settings-sidebar"
            aria-label="Settings navigation"
          >
            <AppSettingsSearch />
            <AppSettingsNavigation />
          </aside>
          <AppSettingsContent />
        </AppSettingsRoot>
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Collections and extension controls"
  tags={["visual-approved"]}
  play={async ({ canvas, canvasElement }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Host integration" }),
    );
    await expect(canvas.getByLabelText("Tags item 1")).toHaveValue("framework");
    await expect(canvas.getByRole("alert")).toHaveTextContent(
      "Unsupported setting",
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Add association" }),
    );
    const associations = canvas.getAllByRole("textbox", {
      name: "Association pattern",
    });
    await expect(associations).toHaveLength(2);
    await expect(associations[1]).toHaveValue("*.txt");

    const associationSetting = canvasElement.querySelector<HTMLElement>(
      '[data-setting-id="demo.associations"]',
    );
    const associationInfo = associationSetting?.querySelector<HTMLElement>(
      ".ui-workspace-setting-item__info",
    );
    const associationControl = associationSetting?.querySelector<HTMLElement>(
      ".ui-workspace-setting-item__control",
    );
    await expect(associationSetting).toHaveAttribute(
      "data-setting-layout",
      "stacked",
    );
    await expect(associationInfo).not.toBeNull();
    await expect(associationControl).not.toBeNull();
    await expect(
      associationControl!.getBoundingClientRect().top,
    ).toBeGreaterThanOrEqual(associationInfo!.getBoundingClientRect().bottom);
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/settings/collections-and-extension-controls-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="ui-workspace-settings-story-canvas">
      <div class="ui-workspace-settings-story-frame">
        <AppSettingsRoot controller={collectionControls}>
          <aside
            class="ui-workspace-settings__sidebar"
            data-ui-part="settings-sidebar"
            aria-label="Settings navigation"
          >
            <AppSettingsSearch />
            <AppSettingsNavigation />
          </aside>
          <AppSettingsContent />
        </AppSettingsRoot>
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Composable AppShell settings surface"
  tags={["visual-pending"]}
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Core plugins" }));
    await expect(
      canvas.getByRole("heading", { name: "Core plugins" }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("switch", { name: "Enable Workspace" }),
    ).toBeDisabled();
    await expect(
      canvas.getByRole("switch", { name: "Enable Backlinks" }),
    ).toBeChecked();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/settings/composable-app-shell-settings-surface-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="ui-workspace-settings-story-canvas">
      <div class="ui-workspace-settings-story-frame">
        <AppShellRoot controller={compoundApp} theme="inherit">
          <AppSettingsRoot controller={compoundApp.settings} app={compoundApp}>
            <aside
              class="ui-workspace-settings__sidebar"
              data-ui-part="settings-sidebar"
              aria-label="Settings navigation"
            >
              <AppSettingsSearch />
              <AppSettingsNavigation />
            </aside>
            <AppSettingsContent />
          </AppSettingsRoot>
        </AppShellRoot>
      </div>
    </div>
  {/snippet}
</Story>
