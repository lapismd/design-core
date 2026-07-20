import { describe, expect, it } from "vitest";
import { getWorkspaceDropOverlayGeometry } from "./drop-geometry.js";

describe("getWorkspaceDropOverlayGeometry", () => {
  it("uses the Lapis 25 percent edge threshold and center fallback", () => {
    expect(
      getWorkspaceDropOverlayGeometry({
        width: 1000,
        height: 800,
        x: 249,
        y: 400,
      }),
    ).toMatchObject({ position: "left", width: 250, height: 800 });

    expect(
      getWorkspaceDropOverlayGeometry({
        width: 1000,
        height: 800,
        x: 250,
        y: 400,
      }),
    ).toMatchObject({ position: "center", width: 1000, height: 800 });
  });

  it("matches Lapis overlay dimensions for all five positions", () => {
    expect(
      getWorkspaceDropOverlayGeometry({
        width: 1000,
        height: 800,
        x: 100,
        y: 400,
      }),
    ).toEqual({ position: "left", left: 0, top: 0, width: 250, height: 800 });

    expect(
      getWorkspaceDropOverlayGeometry({
        width: 1000,
        height: 800,
        x: 900,
        y: 400,
      }),
    ).toEqual({
      position: "right",
      left: 750,
      top: 0,
      width: 250,
      height: 800,
    });

    expect(
      getWorkspaceDropOverlayGeometry({
        width: 1000,
        height: 800,
        x: 500,
        y: 100,
      }),
    ).toEqual({ position: "top", left: 0, top: 0, width: 1000, height: 200 });

    expect(
      getWorkspaceDropOverlayGeometry({
        width: 1000,
        height: 800,
        x: 500,
        y: 720,
      }),
    ).toEqual({
      position: "bottom",
      left: 0,
      top: 520,
      width: 1000,
      height: 280,
    });

    expect(
      getWorkspaceDropOverlayGeometry({
        width: 1000,
        height: 800,
        x: 500,
        y: 400,
      }),
    ).toEqual({
      position: "center",
      left: 0,
      top: 0,
      width: 1000,
      height: 800,
    });
  });

  it("selects the nearest enabled edge", () => {
    expect(
      getWorkspaceDropOverlayGeometry({
        width: 1000,
        height: 800,
        x: 200,
        y: 40,
      }),
    ).toMatchObject({ position: "top" });

    expect(
      getWorkspaceDropOverlayGeometry({
        width: 1000,
        height: 800,
        x: 200,
        y: 40,
        dropZones: ["left", "right"],
      }),
    ).toMatchObject({ position: "left" });
  });

  it("returns null for unusable dimensions", () => {
    expect(
      getWorkspaceDropOverlayGeometry({
        width: 0,
        height: 800,
        x: 10,
        y: 10,
      }),
    ).toBeNull();
  });
});
