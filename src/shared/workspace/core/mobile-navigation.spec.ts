import { describe, expect, it } from "vitest";
import { WorkspaceMobileNavigation } from "./mobile-navigation.svelte.js";

describe("mobile navigation", () => {
  it("keeps a single controller-owned page and mutually exclusive overlays", () => {
    const navigation = new WorkspaceMobileNavigation();
    navigation.initialize("tabs");
    expect(navigation.page).toBe("tabs");
    navigation.openSidebar("right");
    expect(navigation.page).toBe("editor");
    expect(navigation.reveal).toBe("right");
    navigation.openMenu();
    expect(navigation.reveal).toBe("center");
    expect(navigation.menuOpen).toBe(true);
    navigation.openTabs();
    expect(navigation.menuOpen).toBe(false);
    navigation.initialize("editor");
    expect(navigation.page).toBe("tabs");
  });

  it("hides on downward scroll and reveals upward, at the top, and during navigation", () => {
    const navigation = new WorkspaceMobileNavigation();
    navigation.updateScroll(100);
    expect(navigation.chromeHidden).toBe(true);
    navigation.updateScroll(80);
    expect(navigation.chromeHidden).toBe(false);
    navigation.updateScroll(200);
    expect(navigation.chromeHidden).toBe(true);
    navigation.updateScroll(4);
    expect(navigation.chromeHidden).toBe(false);
    navigation.updateScroll(100);
    navigation.openSidebar("left");
    expect(navigation.chromeHidden).toBe(false);
    navigation.updateScroll(200);
    expect(navigation.chromeHidden).toBe(false);
    navigation.closeOverlays();
    navigation.updateScroll(100);
    expect(navigation.chromeHidden).toBe(true);
    navigation.openMenu();
    expect(navigation.chromeHidden).toBe(false);
  });
});
