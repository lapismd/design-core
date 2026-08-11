import { afterEach, describe, expect, it, vi } from "vitest";
import { createColumnCanvasController } from "./column-canvas-controller.svelte.js";
import type { ColumnCanvasLayoutPersistence } from "./column-canvas-persistence.js";

describe("createColumnCanvasController", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("keeps the first column visible with an empty path", () => {
    const canvas = createColumnCanvasController({
      columns: {
        categories: { defaultWidth: 260 },
      },
    });
    expect(canvas.path).toEqual([]);
    expect(canvas.visibleDepth).toBe(1);
    expect(canvas.trailingSpacerWidth).toBe(0);
    expect(canvas.isPathVisible("categories")).toBe(true);
    expect(canvas.isColumnVisible("categories")).toBe(true);
  });

  it("keeps trailing canvas space opt-in", () => {
    const canvas = createColumnCanvasController({
      columns: { categories: { defaultWidth: 260 } },
      trailingSpacerWidth: 144,
    });

    expect(canvas.trailingSpacerWidth).toBe(144);
  });

  it("gates cascade columns by pathLevel and closed state", () => {
    const canvas = createColumnCanvasController({
      columns: {
        categories: { defaultWidth: 260, pathLevel: 0 },
        components: { defaultWidth: 300, pathLevel: 1 },
        detail: {
          defaultWidth: 340,
          pathLevel: 2,
          closeable: true,
        },
      },
    });

    expect(canvas.getPathLevel("components")).toBe(1);
    expect(canvas.isColumnVisible("categories")).toBe(true);
    expect(canvas.isColumnVisible("components")).toBe(false);
    expect(canvas.isColumnVisible("detail")).toBe(false);

    canvas.select(0, "stable-chat");
    expect(canvas.pathAt(0)).toBe("stable-chat");
    expect(canvas.isColumnVisible("components")).toBe(true);
    expect(canvas.isColumnVisible("detail")).toBe(false);

    canvas.select(1, "composer");
    expect(canvas.isColumnVisible("detail")).toBe(true);

    canvas.close("detail");
    expect(canvas.isPathVisible("detail")).toBe(true);
    expect(canvas.isColumnVisible("detail")).toBe(false);

    canvas.select(1, "message-bubble");
    expect(canvas.isClosed("detail")).toBe(false);
    expect(canvas.isColumnVisible("detail")).toBe(true);

    canvas.select(0, "stable-chat");
    expect(canvas.isColumnVisible("components")).toBe(false);
    expect(canvas.isColumnVisible("detail")).toBe(false);
  });

  it("skips openOnSelect when disabled", () => {
    const canvas = createColumnCanvasController({
      columns: {
        components: { defaultWidth: 300, pathLevel: 0 },
        detail: {
          defaultWidth: 340,
          pathLevel: 1,
          closeable: true,
          openOnSelect: false,
          closed: true,
        },
      },
    });
    expect(canvas.isClosed("detail")).toBe(true);
    canvas.select(0, "composer");
    expect(canvas.isClosed("detail")).toBe(true);
    expect(canvas.isColumnVisible("detail")).toBe(false);
  });

  it("selects, truncates, and toggle-clears path levels", () => {
    const onPathChange = vi.fn();
    const canvas = createColumnCanvasController({
      columns: { a: { defaultWidth: 200 } },
      initialPath: ["a", "b"],
      onPathChange,
    });
    canvas.select(0, "c");
    expect(canvas.path).toEqual(["c"]);
    canvas.select(1, "item");
    expect(canvas.path).toEqual(["c", "item"]);
    canvas.select(1, "item");
    expect(canvas.path).toEqual(["c"]);
    expect(onPathChange).toHaveBeenLastCalledWith(["c"]);
  });

  it("clamps widths and tracks collapse", () => {
    const canvas = createColumnCanvasController({
      columns: {
        workspace: {
          defaultWidth: 280,
          minWidth: 240,
          maxWidth: 400,
          resizable: true,
          collapsible: true,
        },
      },
    });
    expect(canvas.getWidth("workspace")).toBe(280);
    expect(canvas.getDefaultWidth("workspace")).toBe(280);
    canvas.setWidth("workspace", 900);
    expect(canvas.getWidth("workspace")).toBe(400);
    expect(canvas.getDefaultWidth("workspace")).toBe(280);
    canvas.toggle("workspace");
    expect(canvas.isCollapsed("workspace")).toBe(true);
    canvas.expand("workspace");
    expect(canvas.isCollapsed("workspace")).toBe(false);
  });

  it("persists layout through an injected adapter", async () => {
    vi.useFakeTimers();
    const saved: unknown[] = [];
    const persistence: ColumnCanvasLayoutPersistence = {
      async load() {
        return {
          version: 1,
          columns: {
            workspace: { collapsed: true, width: 320 },
          },
        };
      },
      async save(layout) {
        saved.push(layout);
      },
    };

    const canvas = createColumnCanvasController({
      columns: {
        workspace: {
          defaultWidth: 280,
          resizable: true,
          collapsible: true,
        },
      },
      persistence,
      saveDebounceMs: 50,
    });

    await canvas.restoreLayout();
    expect(canvas.layoutReady).toBe(true);
    expect(canvas.isCollapsed("workspace")).toBe(true);
    expect(canvas.getWidth("workspace")).toBe(320);

    canvas.expand("workspace");
    canvas.setWidth("workspace", 300);
    await vi.advanceTimersByTimeAsync(50);
    await canvas.flushSave();

    expect(saved.length).toBeGreaterThan(0);
    const last = saved.at(-1) as {
      columns: { workspace: { collapsed: boolean; width: number } };
    };
    expect(last.columns.workspace).toEqual({
      collapsed: false,
      closed: false,
      width: 300,
    });
  });

  it("closes and reopens closeable columns", () => {
    const canvas = createColumnCanvasController({
      columns: {
        detail: {
          defaultWidth: 320,
          closeable: true,
          collapsible: true,
        },
      },
    });
    canvas.collapse("detail");
    expect(canvas.isCollapsed("detail")).toBe(true);
    canvas.close("detail");
    expect(canvas.isClosed("detail")).toBe(true);
    expect(canvas.isCollapsed("detail")).toBe(false);
    canvas.open("detail");
    expect(canvas.isClosed("detail")).toBe(false);
  });

  it("ensureColumn registers dynamic columns", () => {
    const canvas = createColumnCanvasController({
      columns: {
        workingCopy: { defaultWidth: 280 },
      },
    });
    canvas.ensureColumn("stack-1", {
      defaultWidth: 300,
      collapsible: true,
    });
    expect(canvas.hasColumn("stack-1")).toBe(true);
    expect(canvas.getWidth("stack-1")).toBe(300);
    canvas.collapse("stack-1");
    expect(canvas.isCollapsed("stack-1")).toBe(true);
  });
});
