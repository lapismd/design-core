import { describe, expect, it } from "vitest";
import {
  AppShellController,
  AppShellSidebarController,
} from "./app-shell-controller.svelte.js";

describe("AppShellController", () => {
  it("starts both sidebars expanded", () => {
    const controller = new AppShellController();

    expect(controller.left.collapsed).toBe(false);
    expect(controller.left.closed).toBe(false);
    expect(controller.left.state).toBe("expanded");
    expect(controller.right.collapsed).toBe(false);
    expect(controller.right.closed).toBe(false);
    expect(controller.right.state).toBe("expanded");
  });

  it("honors configured initial sidebar state", () => {
    const controller = new AppShellController({
      leftCollapsed: true,
      rightCollapsed: false,
      rightClosed: true,
      leftWidth: 320,
      rightWidth: 420,
    });

    expect(controller.left.state).toBe("collapsed");
    expect(controller.right.state).toBe("closed");
    expect(controller.left.width).toBe(320);
    expect(controller.right.width).toBe(420);
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

    controller.right.close();
    expect(controller.right.state).toBe("closed");
    expect(controller.left.state).toBe("expanded");

    controller.right.toggle();
    expect(controller.right.state).toBe("expanded");
    expect(controller.right.closed).toBe(false);

    controller.right.collapse();
    controller.right.close();
    controller.right.open();
    expect(controller.right.state).toBe("collapsed");
  });

  it("resizes independently and clamps to shared bounds", () => {
    const controller = new AppShellController({
      sidebarMinWidth: 240,
      sidebarMaxWidth: 480,
    });

    expect(controller.left.width).toBeUndefined();
    expect(controller.right.width).toBeUndefined();

    controller.left.setWidth(360);
    controller.right.setWidth(900);
    expect(controller.left.width).toBe(360);
    expect(controller.right.width).toBe(480);

    controller.left.resizeBy(-200);
    expect(controller.left.width).toBe(240);
    expect(controller.right.width).toBe(480);

    controller.left.resetWidth();
    expect(controller.left.width).toBeUndefined();
    expect(controller.right.width).toBe(480);
  });

  it("returns the stable controller for each side", () => {
    const controller = new AppShellController();

    expect(controller.getSidebar("left")).toBe(controller.left);
    expect(controller.getSidebar("right")).toBe(controller.right);
    expect(controller.left).toBeInstanceOf(AppShellSidebarController);
    expect(controller.right).toBeInstanceOf(AppShellSidebarController);
  });
});
