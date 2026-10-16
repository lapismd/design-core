import { describe, expect, it, vi } from "vitest";
import {
  createDefaultWorkspaceLayout,
  createWorkspaceTab,
  createWorkspaceTabs,
  findWorkspaceTab,
} from "./layout.js";
import { WorkspaceShellController } from "./workspace-controller.svelte.js";

function fixture() {
  const layout = createDefaultWorkspaceLayout();
  layout.main = createWorkspaceTabs(
    [
      createWorkspaceTab({ id: "note", title: "Note" }),
      createWorkspaceTab({ id: "other", title: "Other" }),
    ],
    { id: "main" },
  );
  const controller = new WorkspaceShellController({ layout });
  const close = vi.fn();
  const open = vi.fn(() => ({
    window: {} as Window,
    document: {} as Document,
    focus: vi.fn(),
    close,
    onClose: () => () => {},
  }));
  controller.setPopoutHost({ open });
  return { controller, open, close };
}

describe("session popout transfers", () => {
  it("emits only the final transfer with exactly one copy of the note", () => {
    const { controller } = fixture();
    const snapshots: string[][] = [];
    controller.on("layout-change", () => {
      const ids: string[] = [];
      const visit = (node: typeof controller.layout.main) => {
        if (node.kind === "split") node.children.forEach(visit);
        else
          node.items.forEach((item) =>
            ids.push(
              ...(item.kind === "tab"
                ? [item.id]
                : item.tabs.map((tab) => tab.id)),
            ),
          );
      };
      visit(controller.layout.main);
      controller.layout.windows.forEach((win) => visit(win.root));
      snapshots.push(ids);
    });
    controller.popoutTab("note");
    expect(snapshots).toHaveLength(1);
    expect(snapshots[0]?.filter((id) => id === "note")).toHaveLength(1);
  });

  it("retains the source when a host throws during opening", () => {
    const { controller, open } = fixture();
    open.mockImplementation(() => {
      throw new Error("creation failed");
    });
    expect(() => controller.popoutTab("note")).not.toThrow();
    expect(findWorkspaceTab(controller.layout, "note")?.hostId).toBe("root");
  });

  it("keeps the window and tab reachable when close admission rejects", async () => {
    const { controller, close } = fixture();
    const win = controller.popoutTab("note")!;
    controller.setCloseGuard(async () => {
      throw new Error("save failed");
    });
    await expect(controller.requestCloseWindow(win.id)).rejects.toThrow(
      "save failed",
    );
    expect(findWorkspaceTab(controller.layout, "note")?.hostId).toBe(win.id);
    expect(close).not.toHaveBeenCalled();
    controller.setCloseGuard(async (_ids, remove) => {
      remove();
    });
    expect(await controller.requestCloseWindow(win.id)).toBe(true);
    expect(close).toHaveBeenCalledTimes(1);
  });

  it("guards last-tab close and returns a tab to the last main pane", async () => {
    const { controller, close } = fixture();
    controller.selectTab("note");
    controller.popoutTab("note");
    expect(controller.moveTabToMain("note")).toBe(true);
    expect(findWorkspaceTab(controller.layout, "note")?.pane.id).toBe("main");
    expect(close).toHaveBeenCalledTimes(1);
    const win = controller.popoutTab("note")!;
    controller.setCloseGuard(async () => {
      throw new Error("save failed");
    });
    await expect(controller.requestCloseTab("note")).rejects.toThrow(
      "save failed",
    );
    expect(findWorkspaceTab(controller.layout, "note")?.hostId).toBe(win.id);
  });
});
