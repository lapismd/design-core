import { describe, expect, it } from "vitest";
import { resolveWorkspaceDropOverlay } from "./workspace-tabs-drop.js";

const rect = { x: 100, y: 50, width: 800, height: 600 };

describe("resolveWorkspaceDropOverlay", () => {
  it("matches the Lapis centre and proportional edge geometry", () => {
    expect(resolveWorkspaceDropOverlay(500, 350, rect)).toEqual({
      position: "center",
      style: "width: 800px; height: 600px; top: 0px; left: 0px",
    });
    expect(resolveWorkspaceDropOverlay(110, 350, rect)).toEqual({
      position: "left",
      style: "width: 200px; height: 600px; left: 0px; top: 0px;",
    });
    expect(resolveWorkspaceDropOverlay(890, 350, rect)).toEqual({
      position: "right",
      style:
        "width: 200px; height: 600px; right: 0px; top: 0px; margin-left: auto;",
    });
    expect(resolveWorkspaceDropOverlay(500, 60, rect)).toEqual({
      position: "top",
      style: "width: 800px; height: 150px; top: 0px; left: 0px;",
    });
    expect(resolveWorkspaceDropOverlay(500, 640, rect)).toEqual({
      position: "bottom",
      style: "width: 800px; height: 210px; bottom: 0px; left: 0px",
    });
  });

  it("uses centre when the nearest edge is not allowed", () => {
    expect(resolveWorkspaceDropOverlay(110, 350, rect, ["right"])).toEqual({
      position: "center",
      style: "width: 800px; height: 600px; top: 0px; left: 0px",
    });
    expect(resolveWorkspaceDropOverlay(110, 350, rect, [])).toEqual({
      position: "center",
      style: "width: 800px; height: 600px; top: 0px; left: 0px",
    });
  });

  it("uses centre at the exact twenty-five percent threshold", () => {
    expect(resolveWorkspaceDropOverlay(300, 350, rect).position).toBe("center");
  });
});
