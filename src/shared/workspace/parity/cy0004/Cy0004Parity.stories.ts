import type { Meta, StoryObj } from "@storybook/svelte-vite";
import { withCy0004ParityReference } from "../../reference/lapis-visual-delta.js";
import Cy0004ParitySurface from "./Cy0004ParitySurface.svelte";

const meta = {
  title: "Workspace/Parity/CY-0004",
  component: Cy0004ParitySurface,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "One-to-one, public-API-only fixtures for the corrected CY-0004 visual reference catalog. Focused component stories remain the primary documentation surface.",
      },
    },
  },
} satisfies Meta<typeof Cy0004ParitySurface>;

export default meta;
type Story = StoryObj<typeof meta>;

function parity(sourceStoryId: string): Story {
  const sourceFile = `${sourceStoryId}-chromium-darwin.png`;
  const candidate = `/visual-baselines/workspace/parity/cy0004/${sourceFile}`;
  return {
    args: { sourceStoryId },
    tags: ["visual-pending", "lapis-reference-visual"],
    parameters: {
      visualDelta: withCy0004ParityReference(candidate, sourceFile, "viewport"),
    },
  };
}

export const ComponentsComposableSettingsComposition = parity(
  "workspace-shell-components-composable-settings--composition",
);
export const ComponentsDeclarativeSettingsAllSupportedControls = parity(
  "workspace-shell-components-declarative-settings--all-supported-controls",
);
export const ComponentsDeclarativeSettingsSettings = parity(
  "workspace-shell-components-declarative-settings--settings",
);
export const ComponentsDeclarativeSettingsSettingsMobile = parity(
  "workspace-shell-components-declarative-settings--settings-mobile",
);
export const ComponentsDragAndDropOverlaysBottom = parity(
  "workspace-shell-components-drag-and-drop-overlays--bottom",
);
export const ComponentsDragAndDropOverlaysCanceledOverlay = parity(
  "workspace-shell-components-drag-and-drop-overlays--canceled-overlay",
);
export const ComponentsDragAndDropOverlaysCentre = parity(
  "workspace-shell-components-drag-and-drop-overlays--centre",
);
export const ComponentsDragAndDropOverlaysDisallowedEdgeFallsBackToCentre =
  parity(
    "workspace-shell-components-drag-and-drop-overlays--disallowed-edge-falls-back-to-centre",
  );
export const ComponentsDragAndDropOverlaysEmptyTarget = parity(
  "workspace-shell-components-drag-and-drop-overlays--empty-target",
);
export const ComponentsDragAndDropOverlaysFloatingFallback = parity(
  "workspace-shell-components-drag-and-drop-overlays--floating-fallback",
);
export const ComponentsDragAndDropOverlaysInsertionMarker = parity(
  "workspace-shell-components-drag-and-drop-overlays--insertion-marker",
);
export const ComponentsDragAndDropOverlaysLeft = parity(
  "workspace-shell-components-drag-and-drop-overlays--left",
);
export const ComponentsDragAndDropOverlaysRight = parity(
  "workspace-shell-components-drag-and-drop-overlays--right",
);
export const ComponentsDragAndDropOverlaysTop = parity(
  "workspace-shell-components-drag-and-drop-overlays--top",
);
export const ComponentsEmptyAndMissingViewsEmptySidebars = parity(
  "workspace-shell-components-empty-and-missing-views--empty-sidebars",
);
export const ComponentsEmptyAndMissingViewsEmptyView = parity(
  "workspace-shell-components-empty-and-missing-views--empty-view",
);
export const ComponentsEmptyAndMissingViewsMissingView = parity(
  "workspace-shell-components-empty-and-missing-views--missing-view",
);
export const ComponentsFloatingWindowsMaximized = parity(
  "workspace-shell-components-floating-windows--maximized",
);
export const ComponentsFloatingWindowsStates = parity(
  "workspace-shell-components-floating-windows--states",
);
export const ComponentsPublicFrameworkAbout = parity(
  "workspace-shell-components-public-framework--about",
);
export const ComponentsPublicFrameworkCommandPalette = parity(
  "workspace-shell-components-public-framework--command-palette",
);
export const ComponentsPublicFrameworkCorePluginsSettings = parity(
  "workspace-shell-components-public-framework--core-plugins-settings",
);
export const ComponentsPublicFrameworkFloatingLayer = parity(
  "workspace-shell-components-public-framework--floating-layer",
);
export const ComponentsPublicFrameworkHotkeySettings = parity(
  "workspace-shell-components-public-framework--hotkey-settings",
);
export const ComponentsPublicFrameworkLeftSidebar = parity(
  "workspace-shell-components-public-framework--left-sidebar",
);
export const ComponentsPublicFrameworkNotices = parity(
  "workspace-shell-components-public-framework--notices",
);
export const ComponentsPublicFrameworkRibbon = parity(
  "workspace-shell-components-public-framework--ribbon",
);
export const ComponentsPublicFrameworkRightSidebar = parity(
  "workspace-shell-components-public-framework--right-sidebar",
);
export const ComponentsPublicFrameworkSettings = parity(
  "workspace-shell-components-public-framework--settings",
);
export const ComponentsPublicFrameworkStatusBar = parity(
  "workspace-shell-components-public-framework--status-bar",
);
export const ComponentsPublicFrameworkTabs = parity(
  "workspace-shell-components-public-framework--tabs",
);
export const ComponentsPublicFrameworkWorkspace = parity(
  "workspace-shell-components-public-framework--workspace",
);
export const ComponentsRibbonAndStatusBarChrome = parity(
  "workspace-shell-components-ribbon-and-status-bar--chrome",
);
export const ComponentsSidebarGroupsFullyCollapsed = parity(
  "workspace-shell-components-sidebar-groups--fully-collapsed",
);
export const ComponentsSidebarGroupsGroupAndUngroup = parity(
  "workspace-shell-components-sidebar-groups--group-and-ungroup",
);
export const ComponentsSidebarGroupsGrouped = parity(
  "workspace-shell-components-sidebar-groups--grouped",
);
export const ComponentsSidebarGroupsPartiallyCollapsed = parity(
  "workspace-shell-components-sidebar-groups--partially-collapsed",
);
export const ComponentsTabsCloseHover = parity(
  "workspace-shell-components-tabs--close-hover",
);
export const ComponentsTabsConstrained = parity(
  "workspace-shell-components-tabs--constrained",
);
export const ComponentsTabsEmptySplitIsPruned = parity(
  "workspace-shell-components-tabs--empty-split-is-pruned",
);
export const ComponentsTabsRightSidebarToggleUsesTopRightPane = parity(
  "workspace-shell-components-tabs--right-sidebar-toggle-uses-top-right-pane",
);
export const ComponentsTabsSingle = parity(
  "workspace-shell-components-tabs--single",
);
export const ComponentsTabsStacked = parity(
  "workspace-shell-components-tabs--stacked",
);
export const ComponentsTabsTop = parity("workspace-shell-components-tabs--top");
export const ComponentsViewHeaderAndMenusHeaderAndMenu = parity(
  "workspace-shell-components-view-header-and-menus--header-and-menu",
);
export const DemoReusableFrameworkOverview = parity(
  "workspace-shell-demo-reusable-framework--overview",
);
export const PluginsFModeActive = parity(
  "workspace-shell-plugins-f-mode--active",
);
export const PluginsNotificationsPopulatedHistory = parity(
  "workspace-shell-plugins-notifications--populated-history",
);
export const PluginsNotificationsToastSeverities = parity(
  "workspace-shell-plugins-notifications--toast-severities",
);
export const ReferenceParityShell = parity(
  "workspace-shell-reference-parity--shell",
);
export const ShellFullShellDesktop = parity(
  "workspace-shell-shell-full-shell--desktop",
);
export const ShellFullShellMobile = parity(
  "workspace-shell-shell-full-shell--mobile",
);
