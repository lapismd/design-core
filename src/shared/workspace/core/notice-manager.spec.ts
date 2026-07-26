import { afterEach, describe, expect, it, vi } from "vitest";
import { AppShellController } from "./app-shell-controller.svelte.js";
import { Notice, NoticeManager } from "./notice-manager.svelte.js";

afterEach(() => {
  vi.useRealTimers();
});

describe("Notice", () => {
  it("shows, updates, and automatically hides a timed notice", () => {
    vi.useFakeTimers();
    const manager = new NoticeManager();
    const notice = new Notice(manager, "Loading", 1000);

    expect(manager.items).toEqual([notice]);
    expect(notice.message).toBe("Loading");

    notice.setMessage("Saved");
    expect(notice.message).toBe("Saved");

    vi.advanceTimersByTime(1000);
    expect(manager.items).toEqual([]);
  });

  it("supports persistent notices and explicit dismissal", () => {
    vi.useFakeTimers();
    const app = new AppShellController();
    const notice = app.notices.show("Needs attention", 0);

    vi.advanceTimersByTime(60_000);
    expect(app.notices.items).toEqual([notice]);

    notice.hide();
    expect(app.notices.items).toEqual([]);
  });

  it("clears controller-owned notices during disposal", async () => {
    const app = new AppShellController();
    new Notice(app, "Controller owned", 0);

    await app.dispose();
    expect(app.notices.items).toEqual([]);
  });
});
