import { describe, expect, it } from "vitest";
import {
  allocateColumnCanvasPair,
  allocateColumnCanvasWidth,
} from "./column-canvas-layout.js";

describe("allocateColumnCanvasPair", () => {
  it("fills the stage using the configured-width ratio", () => {
    expect(
      allocateColumnCanvasPair(
        800,
        { preferredWidth: 300, minWidth: 200, maxWidth: 600 },
        { preferredWidth: 500, minWidth: 200, maxWidth: 700 },
      ),
    ).toMatchObject({
      leadingWidth: 300,
      trailingWidth: 500,
      usedWidth: 800,
      overflow: 0,
      slack: 0,
    });
  });

  it("restores a supplied pair ratio", () => {
    expect(
      allocateColumnCanvasPair(
        1_000,
        { preferredWidth: 400, minWidth: 200, maxWidth: null },
        { preferredWidth: 400, minWidth: 200, maxWidth: null },
        0.62,
      ),
    ).toMatchObject({ leadingWidth: 620, trailingWidth: 380 });
  });

  it("redistributes width when either member reaches a bound", () => {
    const leadingBound = allocateColumnCanvasPair(
      900,
      { preferredWidth: 400, minWidth: 240, maxWidth: 360 },
      { preferredWidth: 400, minWidth: 240, maxWidth: null },
      0.8,
    );
    expect(leadingBound).toMatchObject({
      leadingWidth: 360,
      trailingWidth: 540,
      slack: 0,
    });

    const trailingBound = allocateColumnCanvasPair(
      900,
      { preferredWidth: 400, minWidth: 300, maxWidth: null },
      { preferredWidth: 400, minWidth: 350, maxWidth: null },
      0.8,
    );
    expect(trailingBound).toMatchObject({
      leadingWidth: 550,
      trailingWidth: 350,
      slack: 0,
    });
  });

  it("retains minimum overflow when the pair cannot fit", () => {
    expect(
      allocateColumnCanvasPair(
        500,
        { preferredWidth: 400, minWidth: 320, maxWidth: null },
        { preferredWidth: 400, minWidth: 280, maxWidth: null },
      ),
    ).toMatchObject({
      leadingWidth: 320,
      trailingWidth: 280,
      overflow: 100,
      slack: 0,
    });
  });

  it("retains explicit slack when finite maximums cannot fill the stage", () => {
    expect(
      allocateColumnCanvasPair(
        1_000,
        { preferredWidth: 300, minWidth: 200, maxWidth: 350 },
        { preferredWidth: 300, minWidth: 200, maxWidth: 400 },
      ),
    ).toMatchObject({
      leadingWidth: 350,
      trailingWidth: 400,
      overflow: 0,
      slack: 250,
    });
  });
});

describe("allocateColumnCanvasWidth", () => {
  it("fills a single-member stage up to its maximum", () => {
    expect(
      allocateColumnCanvasWidth(900, {
        preferredWidth: 320,
        minWidth: 240,
        maxWidth: null,
      }),
    ).toBe(900);
    expect(
      allocateColumnCanvasWidth(900, {
        preferredWidth: 320,
        minWidth: 240,
        maxWidth: 600,
      }),
    ).toBe(600);
  });
});
