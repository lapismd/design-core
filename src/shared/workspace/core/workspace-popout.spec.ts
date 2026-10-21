import { describe, expect, it, vi } from "vitest";
import {
  createDefaultWorkspaceLayout,
  createWorkspaceTab,
  createWorkspaceTabs,
  findWorkspaceTab,
} from "./layout.js";
import { WorkspaceShellController } from "./workspace-controller.svelte.js";
import { AppWorkspace } from "./app-workspace.js";
import {
  workspaceLayoutFromJson,
  workspaceLayoutToJson,
} from "./workspace-json.js";

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
  it.each(["canonical", "legacy"])(
    "retains owned popup handles through a live %s layout change and guarded close",
    async (encoding) => {
      const { controller, open, close } = fixture();
      const popup = controller.popoutTab("note")!;
      const handle = controller.getPopoutHandle(popup.id);
      const value =
        encoding === "canonical"
          ? workspaceLayoutToJson(controller.layout)
          : controller.layout;
      new AppWorkspace(controller).changeLayout(value);
      expect(findWorkspaceTab(controller.layout, "note")?.hostId).toBe(
        popup.id,
      );
      expect(controller.getPopoutHandle(popup.id)).toBe(handle);
      expect(open).toHaveBeenCalledTimes(1);
      expect(workspaceLayoutFromJson(value, controller.layout).windows).toEqual(
        [],
      );
      controller.setCloseGuard(async () => {
        throw new Error("Unsaved note");
      });
      await expect(controller.requestCloseWindow(popup.id)).rejects.toThrow(
        "Unsaved note",
      );
      expect(close).not.toHaveBeenCalled();
      controller.setCloseGuard(async (_ids, remove) => remove());
      expect(await controller.requestCloseWindow(popup.id)).toBe(true);
      expect(close).toHaveBeenCalledTimes(1);
    },
  );

  it("a live change cannot invent a popup window from serialized data", () => {
    const { controller, open } = fixture();
    const popup = controller.popoutTab("note")!;
    const json = workspaceLayoutToJson(controller.layout);
    json.floating!.push({ ...json.floating![0]!, id: "unowned-popup" });
    new AppWorkspace(controller).changeLayout(json);
    expect(controller.layout.windows.map((win) => win.id)).toEqual([popup.id]);
    expect(open).toHaveBeenCalledTimes(1);
  });

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
