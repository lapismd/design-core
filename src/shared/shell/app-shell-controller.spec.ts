import { describe, expect, it } from "vitest";
import {
  AppShellController,
  AppShellSidebarController,
} from "./app-shell-controller.svelte.js";

describe("AppShellController", () => {
  it("starts both sidebars expanded", () => {
    const controller = new AppShellController();

    expect(controller.left.collapsed).toBe(false);
    expect(controller.left.state).toBe("expanded");
    expect(controller.right.collapsed).toBe(false);
    expect(controller.right.state).toBe("expanded");
  });

  it("honors configured initial sidebar state", () => {
    const controller = new AppShellController({
      leftCollapsed: true,
      rightCollapsed: false,
    });

    expect(controller.left.state).toBe("collapsed");
    expect(controller.right.state).toBe("expanded");
  });

  it("mutates the two sidebars independently", () => {
    const controller = new AppShellController();

    controller.left.collapse();
    expect(controller.left.state).toBe("collapsed");
    expect(controller.right.state).toBe("expanded");

    controller.right.toggle();
    expect(controller.right.state).toBe("collapsed");

    controller.left.expand();
    controller.right.setCollapsed(false);
    expect(controller.left.state).toBe("expanded");
    expect(controller.right.state).toBe("expanded");
  });

  it("returns the stable controller for each side", () => {
    const controller = new AppShellController();

    expect(controller.getSidebar("left")).toBe(controller.left);
    expect(controller.getSidebar("right")).toBe(controller.right);
    expect(controller.left).toBeInstanceOf(AppShellSidebarController);
    expect(controller.right).toBeInstanceOf(AppShellSidebarController);
  });
});
