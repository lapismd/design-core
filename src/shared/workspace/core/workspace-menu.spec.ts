import { describe, expect, it, vi } from "vitest";
import { WorkspaceMenu } from "./workspace-menu.js";

describe("WorkspaceMenu", () => {
  it("builds groups, submenus, checked state, and close callbacks", async () => {
    const action = vi.fn();
    const hidden = vi.fn();
    const menu = new WorkspaceMenu()
      .setOnHide(hidden)
      .addGroups([
        (group) =>
          group.addItem((item) =>
            item
              .setTitle("Enabled")
              .setIcon("check")
              .setChecked(true)
              .onClick(action),
          ),
        (group) =>
          group.addMenu("More", (submenu) =>
            submenu.addItem((item) =>
              item.setTitle("Nested").setDisabled(true),
            ),
          ),
      ]);

    expect(menu.entries.map((entry) => entry.kind)).toEqual([
      "item",
      "separator",
      "submenu",
    ]);
    const item = menu.entries[0];
    expect(item?.kind).toBe("item");
    if (item?.kind === "item") await item.callback?.();
    expect(action).toHaveBeenCalledOnce();
    menu.hide();
    expect(hidden).toHaveBeenCalledOnce();
  });
});
