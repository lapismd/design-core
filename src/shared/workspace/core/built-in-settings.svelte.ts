import type { ConfigurationSchema } from "../settings/configuration.js";
import type {
  WorkspaceSettingsNavigationGroup,
  WorkspaceSettingsSection,
} from "../settings/types.js";
import type { WorkspaceRequestedDisplayMode, WorkspaceTheme } from "./types.js";
import {
  isScrollAreaVisibility,
  type ScrollAreaVisibility,
} from "../../shadcn/scroll-area/scroll-area-model.js";

export const APP_SHELL_SETTING_IDS = {
  appearanceTheme: "appearence.baseColorSchema",
  appearanceAccent: "appearence.accentColor",
  appearanceFontSize: "appearence.font.fontSize",
  appearanceQuickFontSize: "appearence.font.quickFontSizeAdjustment",
  appearanceInlineTitle: "appearence.interface.showInlineTitle",
  appearanceRibbon: "appearence.interface.showRibbon",
  appearanceTabTitleBar: "appearence.interface.showTabTitleBar",
  appearanceScrollbarVisibility: "appearence.interface.scrollbarVisibility",
  appearanceZoom: "appearence.advanced.zoomLevel",
  editorAssociations: "workspace.editorAssociations",
  bottomPanelAlignment: "workspace.bottomPanel.alignment",
  mobileMode: "workspace.mobile.mode",
  mobileDefaultPage: "workspace.mobile.defaultPage",
  mobileShowBottomNav: "workspace.mobile.showBottomNav",
  mobileIncludeSidebars: "workspace.mobile.includeSidebarsInTabs",
  mobileIncludeBottomPanel: "workspace.mobile.includeBottomPanelInTabs",
  mobileIncludeFloating: "workspace.mobile.includeFloatingInTabs",
  mobileBreakpoint: "workspace.mobile.breakpointPx",
} as const;

export type AppShellColorScheme = "dark" | "light" | "system";
export type AppShellMobileMode = "auto" | "always" | "never";
export type AppShellMobilePage = "editor" | "tabs";

function getValue<T>(
  configuration: ConfigurationSchema,
  id: string,
  fallback: T,
): T {
  return configuration.get<T>(id) ?? fallback;
}

export class AppShellAppearanceSettings {
  constructor(readonly configuration: ConfigurationSchema) {}

  get colorScheme(): AppShellColorScheme {
    return getValue(
      this.configuration,
      APP_SHELL_SETTING_IDS.appearanceTheme,
      "system",
    );
  }

  get theme(): WorkspaceTheme {
    return this.colorScheme === "system" ? "inherit" : this.colorScheme;
  }

  get accentColor(): string {
    const value = getValue(
      this.configuration,
      APP_SHELL_SETTING_IDS.appearanceAccent,
      "#9873f7",
    );
    return /^#[\da-f]{6}$/iu.test(value) ? value : "#9873f7";
  }

  get fontSize(): number {
    return getValue(
      this.configuration,
      APP_SHELL_SETTING_IDS.appearanceFontSize,
      16,
    );
  }

  get quickFontSizeAdjustment(): boolean {
    return getValue(
      this.configuration,
      APP_SHELL_SETTING_IDS.appearanceQuickFontSize,
      false,
    );
  }

  get showInlineTitle(): boolean {
    return getValue(
      this.configuration,
      APP_SHELL_SETTING_IDS.appearanceInlineTitle,
      false,
    );
  }

  get showRibbon(): boolean {
    return getValue(
      this.configuration,
      APP_SHELL_SETTING_IDS.appearanceRibbon,
      true,
    );
  }

  get showTabTitleBar(): boolean {
    return getValue(
      this.configuration,
      APP_SHELL_SETTING_IDS.appearanceTabTitleBar,
      false,
    );
  }

  get scrollbarVisibility(): ScrollAreaVisibility {
    const value = this.configuration.get(
      APP_SHELL_SETTING_IDS.appearanceScrollbarVisibility,
    );
    return isScrollAreaVisibility(value) ? value : "scroll";
  }

  get zoomLevel(): number {
    return getValue(
      this.configuration,
      APP_SHELL_SETTING_IDS.appearanceZoom,
      16,
    );
  }

  adjustFontSize(delta: number): boolean {
    const next = Math.min(30, Math.max(10, this.fontSize + delta));
    return this.configuration.set(
      APP_SHELL_SETTING_IDS.appearanceFontSize,
      next,
    );
  }

  resetFontSize(): boolean {
    return this.configuration.restoreDefault(
      APP_SHELL_SETTING_IDS.appearanceFontSize,
    );
  }
}

export class AppShellMobileSettings {
  constructor(readonly configuration: ConfigurationSchema) {}

  get mode(): AppShellMobileMode {
    return getValue(
      this.configuration,
      APP_SHELL_SETTING_IDS.mobileMode,
      "auto",
    );
  }

  get requestedDisplayMode(): WorkspaceRequestedDisplayMode {
    return this.mode === "always"
      ? "mobile"
      : this.mode === "never"
        ? "desktop"
        : "auto";
  }

  get defaultPage(): AppShellMobilePage {
    return getValue(
      this.configuration,
      APP_SHELL_SETTING_IDS.mobileDefaultPage,
      "editor",
    );
  }

  get showBottomNav(): boolean {
    return getValue(
      this.configuration,
      APP_SHELL_SETTING_IDS.mobileShowBottomNav,
      true,
    );
  }

  get includeSidebarsInTabs(): boolean {
    return getValue(
      this.configuration,
      APP_SHELL_SETTING_IDS.mobileIncludeSidebars,
      true,
    );
  }

  get includeFloatingInTabs(): boolean {
    return getValue(
      this.configuration,
      APP_SHELL_SETTING_IDS.mobileIncludeFloating,
      true,
    );
  }

  get includeBottomPanelInTabs(): boolean {
    return getValue(
      this.configuration,
      APP_SHELL_SETTING_IDS.mobileIncludeBottomPanel,
      true,
    );
  }

  get breakpointPx(): number {
    return getValue(
      this.configuration,
      APP_SHELL_SETTING_IDS.mobileBreakpoint,
      768,
    );
  }
}

export function createBuiltInSettingsNavigationGroups(): WorkspaceSettingsNavigationGroup[] {
  return [
    { id: "options", title: "Options", order: 0 },
    { id: "core-plugins", title: "Core plugins", order: 100 },
  ];
}

export function createBuiltInSettingsSections(): WorkspaceSettingsSection[] {
  return [
    {
      id: "workspace",
      title: "Workspace",
      description: "Configure workspace layout and resource routing.",
      icon: "panels-top-left",
      order: 10,
      navigationGroupId: "options",
      fields: [
        {
          id: APP_SHELL_SETTING_IDS.bottomPanelAlignment,
          type: "enum",
          title: "Bottom panel alignment",
          description:
            "Choose which desktop workspace columns the bottom panel spans.",
          default: "center",
          options: [
            { value: "center", label: "Center" },
            { value: "left", label: "Left" },
            { value: "right", label: "Right" },
            { value: "justify", label: "Justify" },
          ],
        },
        {
          id: APP_SHELL_SETTING_IDS.editorAssociations,
          type: "key-value",
          title: "Editor associations",
          description:
            "Override the editor view used for files matching VS Code-style glob patterns.",
          default: {},
          keyLabel: "Pattern",
          valueLabel: "Editor",
          addLabel: "Add association",
          keyPlaceholder: "*.md",
          valuePlaceholder: "Select editor view",
          valueOptionsSource: "workspace.editorViews",
          allowUnknownValues: true,
        },
        {
          id: "workspace.mobile",
          type: "group",
          title: "Mobile",
          description: "Control when and how the mobile shell is rendered.",
          fields: [
            {
              id: APP_SHELL_SETTING_IDS.mobileBreakpoint,
              type: "number",
              title: "Mobile breakpoint",
              description:
                "Viewport width below which Auto mode uses the mobile workspace shell.",
              default: 768,
              minimum: 320,
              maximum: 1280,
              step: 1,
            },
            {
              id: APP_SHELL_SETTING_IDS.mobileDefaultPage,
              type: "enum",
              title: "Default mobile page",
              description:
                "Choose whether mobile mode opens to the current editor or the open-tabs page.",
              default: "editor",
              options: [
                { value: "editor", label: "Editor" },
                { value: "tabs", label: "Tabs" },
              ],
            },
            {
              id: APP_SHELL_SETTING_IDS.mobileIncludeFloating,
              type: "boolean",
              title: "Include floating panes in open tabs",
              description:
                "Show floating and popout leaves in the mobile open-tabs page.",
              default: true,
            },
            {
              id: APP_SHELL_SETTING_IDS.mobileIncludeSidebars,
              type: "boolean",
              title: "Include sidebars in open tabs",
              description:
                "Show left and right sidebar leaves in the mobile open-tabs page.",
              default: true,
            },
            {
              id: APP_SHELL_SETTING_IDS.mobileIncludeBottomPanel,
              type: "boolean",
              title: "Include bottom panel in open tabs",
              description:
                "Show bottom-panel leaves as full-screen views in the mobile open-tabs page.",
              default: true,
            },
            {
              id: APP_SHELL_SETTING_IDS.mobileMode,
              type: "enum",
              title: "Mobile layout",
              description:
                "Choose when the shell should use the phone-friendly single-page workspace.",
              default: "auto",
              options: [
                { value: "auto", label: "Auto" },
                { value: "always", label: "Always" },
                { value: "never", label: "Never" },
              ],
            },
            {
              id: APP_SHELL_SETTING_IDS.mobileShowBottomNav,
              type: "boolean",
              title: "Show bottom navigation",
              description:
                "Show a touch-friendly bottom navigation bar in mobile mode.",
              default: true,
            },
          ],
        },
      ],
    },
    {
      id: "appearance",
      title: "Appearance",
      description: "Customize reusable workspace presentation.",
      icon: "palette",
      order: 20,
      navigationGroupId: "options",
      fields: [
        {
          id: APP_SHELL_SETTING_IDS.appearanceAccent,
          type: "string",
          title: "Accent colour",
          presentation: "color",
          default: "#9873f7",
          description: "Choose the accent colour used throughout the app.",
        },
        {
          id: APP_SHELL_SETTING_IDS.appearanceTheme,
          type: "enum",
          title: "Base colour scheme",
          default: "system",
          description: "Choose the default colour scheme.",
          options: [
            { value: "dark", label: "Dark" },
            { value: "light", label: "Light" },
            { value: "system", label: "Adapt to system" },
          ],
        },
        {
          id: "appearence.advanced",
          type: "group",
          title: "Advanced",
          fields: [
            {
              id: APP_SHELL_SETTING_IDS.appearanceZoom,
              type: "number",
              title: "Zoom level",
              description: "Controls the overall zoom level of the app.",
              default: 16,
              minimum: 10,
              maximum: 30,
              step: 1,
            },
          ],
        },
        {
          id: "appearence.font",
          type: "group",
          title: "Font",
          fields: [
            {
              id: APP_SHELL_SETTING_IDS.appearanceFontSize,
              type: "number",
              title: "Font size",
              description:
                "Font size in pixels that affects editing and reading views.",
              default: 16,
              minimum: 10,
              maximum: 30,
              step: 1,
            },
            {
              id: APP_SHELL_SETTING_IDS.appearanceQuickFontSize,
              type: "boolean",
              title: "Quick font size adjustment",
              description:
                "Adjust the font size using the built-in increase, decrease, and reset commands.",
              default: false,
            },
          ],
        },
        {
          id: "appearence.interface",
          type: "group",
          title: "Interface",
          fields: [
            {
              id: APP_SHELL_SETTING_IDS.appearanceInlineTitle,
              type: "boolean",
              title: "Show inline title",
              description:
                "Displays the resource name as an editable title inline with view content when supported.",
              default: false,
            },
            {
              id: APP_SHELL_SETTING_IDS.appearanceRibbon,
              type: "boolean",
              title: "Show ribbon",
              description:
                "Display the vertical toolbar on the side of the window.",
              default: true,
            },
            {
              id: APP_SHELL_SETTING_IDS.appearanceTabTitleBar,
              type: "boolean",
              title: "Show tab title bar",
              description: "Display the header at the top of every tab.",
              default: false,
            },
            {
              id: APP_SHELL_SETTING_IDS.appearanceScrollbarVisibility,
              type: "enum",
              title: "Scrollbar visibility",
              description: "Choose when scrollable areas show their scrollbar.",
              default: "scroll",
              options: [
                { value: "scroll", label: "Scrollbar on scroll" },
                { value: "hover", label: "Scrollbar on hover" },
                { value: "always", label: "Always show scrollbar" },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "hotkeys",
      title: "Hotkeys",
      description: "Customize application command shortcuts.",
      icon: "keyboard",
      order: 30,
      navigationGroupId: "options",
      surface: "hotkeys",
      fields: [],
    },
    {
      id: "core-plugins",
      title: "Core plugins",
      description: "Manage statically registered application plugins.",
      icon: "puzzle",
      order: 40,
      navigationGroupId: "options",
      surface: "core-plugins",
      fields: [],
    },
  ];
}
