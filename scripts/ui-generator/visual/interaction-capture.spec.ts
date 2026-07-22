import { describe, expect, it } from "vitest";
import {
  interactionScreenshotRelativePath,
  slugifyStepLabel,
  stepIdFromInteractionSnapshotName,
} from "../../../packages/storybook-addon-visual-delta/src/shared/interaction-capture.js";
import { mergeInteractionRows } from "../../../packages/storybook-addon-visual-delta/src/panel/usePlaySteps.js";
import { patchStoryOpenTagWithInteraction } from "./patch-story-visual-delta.js";

describe("mergeInteractionRows", () => {
  it("always surfaces CSF-wired interactions even with no live steps", () => {
    const rows = mergeInteractionRows([], [
      {
        id: "opens-chooser",
        label: "Opens chooser",
        src: "/visual-baselines/x--opens-chooser-chromium-darwin.png",
      },
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.stepId).toBe("opens-chooser");
    expect(rows[0]?.fromCsf).toBe(true);
  });

  it("prefers live callId when merging with CSF", () => {
    const rows = mergeInteractionRows(
      [{ callId: "call-1", label: "Opens chooser", stepId: "opens-chooser" }],
      [
        {
          id: "opens-chooser",
          label: "Opens chooser",
          src: "/visual-baselines/x.png",
        },
      ],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]?.callId).toBe("call-1");
    expect(rows[0]?.fromCsf).toBe(true);
  });
});

describe("interaction capture helpers", () => {
  it("slugifies step labels", () => {
    expect(slugifyStepLabel("Opens chooser")).toBe("opens-chooser");
    expect(slugifyStepLabel("  Chooses Projects! ")).toBe("chooses-projects");
  });

  it("builds interaction screenshot paths", () => {
    expect(
      interactionScreenshotRelativePath(
        "forms/add-section-chooser/chooses-a-section.png",
        "opens-chooser",
      ),
    ).toBe("forms/add-section-chooser/chooses-a-section--opens-chooser.png");
  });

  it("parses step ids from on-disk names", () => {
    expect(
      stepIdFromInteractionSnapshotName(
        "chooses-a-section--opens-chooser-chromium-darwin.png",
        "chooses-a-section",
      ),
    ).toBe("opens-chooser");
    expect(
      stepIdFromInteractionSnapshotName(
        "chooses-a-section-chromium-darwin.png",
        "chooses-a-section",
      ),
    ).toBeNull();
  });
});

describe("patchStoryOpenTagWithInteraction", () => {
  it("appends interactions onto an existing visualDelta JSON object", () => {
    const open =
      `<Story name="Chooses a section" parameters={{\n` +
      `    visualDelta: {"images":["/visual-baselines/forms/add-section-chooser/chooses-a-section-chromium-darwin.png"],"opacity":0.5},\n` +
      `  }}\n>`;
    const next = patchStoryOpenTagWithInteraction(open, {
      id: "opens-chooser",
      label: "Opens chooser",
      src: "/visual-baselines/forms/add-section-chooser/chooses-a-section--opens-chooser-chromium-darwin.png",
    });
    expect(next).toContain('"interactions"');
    expect(next).toContain('"opens-chooser"');
    expect(next).toContain("Opens chooser");
  });

  it("parses prettier JS object literals for visualDelta", () => {
    const open = `<Story
  name="Chooses a section"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/forms/add-section-chooser/chooses-a-section-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
>`;
    const next = patchStoryOpenTagWithInteraction(open, {
      id: "opens-chooser",
      label: "Opens chooser",
      src: "/visual-baselines/forms/add-section-chooser/chooses-a-section--opens-chooser-chromium-darwin.png",
    });
    expect(next).toContain('"interactions"');
    expect(next).toContain('"opens-chooser"');
    expect(next).toContain('"align":"canvas"');
  });
});
