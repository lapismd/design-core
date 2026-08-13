import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  APP_SHELL_DEFAULT_SIDEBAR_MAX_WIDTH,
  APP_SHELL_DEFAULT_SIDEBAR_MIN_WIDTH,
  APP_SHELL_DEFAULT_SIDEBAR_WIDTH,
  APP_SHELL_DEFAULT_STORAGE_KEY,
  APP_SHELL_LAYOUT_VERSION,
  AppShell,
  AppShellBody,
  AppShellBodyContent,
  AppShellBodySidebar,
  AppShellBodyToggle,
  AppShellMain,
  AppShellRoot,
  AppShellSidebar,
  AppShellSidebarBody,
  AppShellSidebarClose,
  AppShellSidebarFooter,
  AppShellSidebarHeader,
  AppShellSidebarToggle,
  AppShellToolbar,
  Body,
  BodyContent,
  BodySidebar,
  BodyToggle,
  Main,
  Root,
  Sidebar,
  SidebarBody,
  SidebarClose,
  SidebarFooter,
  SidebarHeader,
  SidebarToggle,
  Toolbar,
  createLocalStorageAppShellLayoutPersistence,
  shellTokenDefaults,
  shellTokenNames,
} from "./index.js";

describe("@lapismd/design-core/shell public API", () => {
  it("keeps namespace and named compound exports aligned", () => {
    expect(AppShell.Root).toBe(AppShellRoot);
    expect(AppShell.Sidebar).toBe(AppShellSidebar);
    expect(AppShell.Sidebar.Header).toBe(AppShellSidebarHeader);
    expect(AppShell.Sidebar.Body).toBe(AppShellSidebarBody);
    expect(AppShell.Sidebar.Footer).toBe(AppShellSidebarFooter);
    expect(AppShell.Sidebar.Close).toBe(AppShellSidebarClose);
    expect(AppShell.Sidebar.Toggle).toBe(AppShellSidebarToggle);
    expect(AppShell.Main).toBe(AppShellMain);
    expect(AppShell.Toolbar).toBe(AppShellToolbar);
    expect(AppShell.Body).toBe(AppShellBody);
    expect(AppShell.Body.Content).toBe(AppShellBodyContent);
    expect(AppShell.Body.Sidebar).toBe(AppShellBodySidebar);
    expect(AppShell.Body.Toggle).toBe(AppShellBodyToggle);
    expect(Root).toBe(AppShellRoot);
    expect(Sidebar).toBe(AppShellSidebar);
    expect(SidebarHeader).toBe(AppShellSidebarHeader);
    expect(SidebarBody).toBe(AppShellSidebarBody);
    expect(SidebarClose).toBe(AppShellSidebarClose);
    expect(SidebarFooter).toBe(AppShellSidebarFooter);
    expect(SidebarToggle).toBe(AppShellSidebarToggle);
    expect(Main).toBe(AppShellMain);
    expect(Toolbar).toBe(AppShellToolbar);
    expect(Body).toBe(AppShellBody);
    expect(Body.Content).toBe(AppShellBodyContent);
    expect(Body.Sidebar).toBe(AppShellBodySidebar);
    expect(Body.Toggle).toBe(AppShellBodyToggle);
    expect(BodyContent).toBe(AppShellBodyContent);
    expect(BodySidebar).toBe(AppShellBodySidebar);
    expect(BodyToggle).toBe(AppShellBodyToggle);
  });

  it("publishes the shell subpaths and documented token defaults", () => {
    const packageJson = JSON.parse(
      readFileSync(
        new URL("../../../../package.json", import.meta.url),
        "utf8",
      ),
    ) as {
      exports: Record<string, string>;
    };

    expect(packageJson.exports).toMatchObject({
      "./shell": "./src/shared/shell/index.ts",
      "./shell/tokens": "./src/shared/shell/shell.tokens.ts",
      "./shell/shell.tokens.css": "./src/shared/shell/shell.tokens.css",
    });
    expect(shellTokenNames.collapsedSidebarWidth).toBe(
      "--ui-shell-collapsed-sidebar-width",
    );
    expect(shellTokenNames.sidebarToggleIndicatorWidth).toBe(
      "--ui-shell-sidebar-toggle-indicator-width",
    );
    expect(shellTokenNames.bodySidebarWidth).toBe(
      "--ui-shell-body-sidebar-width",
    );
    expect(shellTokenNames.mobileSidebarWidth).toBe(
      "--ui-shell-mobile-sidebar-width",
    );
    expect(shellTokenNames.desktopMinMainWidth).toBe(
      "--ui-shell-desktop-min-main-width",
    );
    expect(APP_SHELL_DEFAULT_SIDEBAR_WIDTH).toBe(288);
    expect(APP_SHELL_DEFAULT_SIDEBAR_MIN_WIDTH).toBe(220);
    expect(APP_SHELL_DEFAULT_SIDEBAR_MAX_WIDTH).toBe(520);
    expect(APP_SHELL_LAYOUT_VERSION).toBe(1);
    expect(APP_SHELL_DEFAULT_STORAGE_KEY).toBe(
      "@lapismd/design-core/app-shell-layout",
    );
    expect(createLocalStorageAppShellLayoutPersistence).toBeTypeOf("function");
    expect(shellTokenDefaults).toEqual({
      height: "100vh",
      leftSidebarWidth: "18rem",
      rightSidebarWidth: "18rem",
      rightSidebarGap: "0.5rem",
      collapsedSidebarWidth: "3rem",
      bodySidebarWidth: "14rem",
      mobileSidebarWidth: "min(22rem, 86cqw)",
      desktopMinMainWidth: "36rem",
      sidebarToggleIndicatorWidth: "24%",
      toolbarHeight: "3rem",
      mainBlockInset: "0.5rem",
      mainRadius: "0.875rem",
      mainShadow:
        "0 1px 3px color-mix(in srgb, var(--foreground) 10%, transparent), 0 1px 2px -1px color-mix(in srgb, var(--foreground) 10%, transparent)",
      mainBorder: "1px solid var(--border)",
    });
  });
});
