import { describe, expect, it } from "vitest";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  interactionSnapshotUpdateMode,
  interactionScreenshotRelativePath,
  slugifyStepLabel,
  stepIdFromInteractionSnapshotName,
} from "storybook-addon-visual-delta/src/shared/interaction-capture.js";
import { mergeInteractionRows } from "storybook-addon-visual-delta/src/panel/usePlaySteps.js";
import {
  patchStoryOpenTagWithInteraction,
  patchStoryVisualDeltaInteraction,
} from "./patch-story-visual-delta.js";

describe("mergeInteractionRows", () => {
  it("always surfaces CSF-wired interactions even with no live steps", () => {
    const rows = mergeInteractionRows(
      [],
      [
        {
          id: "opens-chooser",
          label: "Opens chooser",
          src: "/visual-baselines/x--opens-chooser-chromium-darwin.png",
        },
      ],
    );
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

  it("preserves existing snapshots during create-only interaction capture", () => {
    expect(interactionSnapshotUpdateMode(true)).toBe("missing");
    expect(interactionSnapshotUpdateMode(false)).toBe("all");
    expect(interactionSnapshotUpdateMode(undefined)).toBe("all");
  });
});

describe("patchStoryOpenTagWithInteraction", () => {
  const interaction = {
    id: "interaction-5-toHaveAttribute",
    label: 'toHaveAttribute("data-state", "open")',
    src: "/visual-baselines/shadcn/dialog/opens-and-closes--interaction-5-toHaveAttribute-chromium-darwin.png",
  };

  it("inserts visualDelta interactions when parameters are missing", () => {
    const open = `<Story
  name="Opens and closes"
  play={async () => {}}
  tags={["visual-failed"]}
>`;
    const next = patchStoryOpenTagWithInteraction(open, interaction);
    expect(next).toContain("parameters={{");
    expect(next).toContain("visualDelta:");
    expect(next).toContain('"interaction-5-toHaveAttribute"');
    expect(next).toContain('tags={["visual-failed"]}');
  });

  it("inserts visualDelta interactions into existing parameters", () => {
    const open = `<Story
  name="Opens and closes"
  parameters={{
    docs: { description: { story: "Dialog flow" } },
  }}
>`;
    const next = patchStoryOpenTagWithInteraction(open, interaction);
    expect(next).toContain("visualDelta:");
    expect(next).toContain('"interaction-5-toHaveAttribute"');
    expect(next).toContain('story: "Dialog flow"');
  });

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

  it("patches existing interactions whose labels use single-quoted JS strings", () => {
    const open = `<Story
  name="Opens and closes"
  parameters={{
    visualDelta: {
      interactions: [
        {
          id: "interaction-5-toHaveAttribute",
          label: 'toHaveAttribute("data-state", "open")',
          src: "/visual-baselines/shadcn/dialog/opens-and-closes--interaction-5-toHaveAttribute-chromium-darwin.png",
        },
        {
          id: "interaction-6-keyboard",
          label: 'userEvent.keyboard("{Escape}")',
          src: "/visual-baselines/shadcn/dialog/opens-and-closes--interaction-6-keyboard-chromium-darwin.png",
        },
      ],
    },
  }}
>`;
    const next = patchStoryOpenTagWithInteraction(open, {
      id: "interaction-1-click",
      label: "userEvent.click",
      src: "/visual-baselines/shadcn/dialog/opens-and-closes--interaction-1-click-chromium-darwin.png",
    });

    expect(next).toContain('"interaction-1-click"');
    expect(next).toContain('"interaction-5-toHaveAttribute"');
    expect(next).toContain('toHaveAttribute(\\"data-state\\", \\"open\\")');
    expect(next).toContain('userEvent.keyboard(\\"{Escape}\\")');
  });

  it("leaves an already-wired prettier interaction unchanged", () => {
    const open = `<Story
  name="Opens and closes"
  parameters={{
    visualDelta: {
      interactions: [
        {
          id: "interaction-1-click",
          label: "userEvent.click",
          src: "/visual-baselines/shadcn/dialog/opens-and-closes--interaction-1-click-chromium-darwin.png",
        },
      ],
    },
  }}
>`;
    const next = patchStoryOpenTagWithInteraction(open, {
      id: "interaction-1-click",
      label: "userEvent.click",
      src: "/visual-baselines/shadcn/dialog/opens-and-closes--interaction-1-click-chromium-darwin.png",
    });

    expect(next).toBe(open);
  });

  it("does not execute or rewrite dynamic visualDelta expressions", () => {
    const open = `<Story
  name="Dynamic"
  parameters={{
    visualDelta: {
      interactions: getVisualInteractions(),
    },
  }}
>`;
    const next = patchStoryOpenTagWithInteraction(open, {
      id: "interaction-1-click",
      label: "userEvent.click",
      src: "/visual-baselines/dynamic--interaction-1-click-chromium-darwin.png",
    });

    expect(next).toBe(open);
  });

  it("patches the matching Story file when the story has no parameters", () => {
    const root = mkdtempSync(path.join(tmpdir(), "visual-interaction-patch-"));
    const storiesPath = path.join(root, "src/Dialog.stories.svelte");
    mkdirSync(path.dirname(storiesPath), { recursive: true });
    mkdirSync(path.join(root, "storybook-static"), { recursive: true });
    writeFileSync(
      storiesPath,
      `<Story
  name="Opens and closes"
  tags={["visual-failed"]}
>
  Dialog
</Story>
`,
    );
    writeFileSync(
      path.join(root, "storybook-static/index.json"),
      JSON.stringify({
        entries: {
          "shadcn-overlays-dialog--opens-and-closes": {
            id: "shadcn-overlays-dialog--opens-and-closes",
            type: "story",
            name: "Opens and closes",
            importPath: "./src/Dialog.stories.svelte",
            tags: ["visual-failed"],
          },
        },
      }),
    );

    expect(
      patchStoryVisualDeltaInteraction({
        packageRoot: root,
        storyId: "shadcn-overlays-dialog--opens-and-closes",
        interaction,
      }),
    ).toEqual({ ok: true, changed: true });
    const source = readFileSync(storiesPath, "utf8");
    expect(source).toContain("visualDelta:");
    expect(source).toContain('"interaction-5-toHaveAttribute"');
    expect(source).toContain('tags={["visual-failed"]}');
  });

  it("patches a matching Story file that already has prettier interactions", () => {
    const root = mkdtempSync(path.join(tmpdir(), "visual-interaction-patch-"));
    const storiesPath = path.join(root, "src/Dialog.stories.svelte");
    mkdirSync(path.dirname(storiesPath), { recursive: true });
    mkdirSync(path.join(root, "storybook-static"), { recursive: true });
    writeFileSync(
      storiesPath,
      `<Story
  name="Opens and closes"
  parameters={{
    visualDelta: {
      interactions: [
        {
          id: "interaction-5-toHaveAttribute",
          label: 'toHaveAttribute("data-state", "open")',
          src: "/visual-baselines/shadcn/dialog/opens-and-closes--interaction-5-toHaveAttribute-chromium-darwin.png",
        },
      ],
    },
  }}
>
  Dialog
</Story>
`,
    );
    writeFileSync(
      path.join(root, "storybook-static/index.json"),
      JSON.stringify({
        entries: {
          "shadcn-overlays-dialog--opens-and-closes": {
            id: "shadcn-overlays-dialog--opens-and-closes",
            type: "story",
            name: "Opens and closes",
            importPath: "./src/Dialog.stories.svelte",
            tags: [],
          },
        },
      }),
    );

    expect(
      patchStoryVisualDeltaInteraction({
        packageRoot: root,
        storyId: "shadcn-overlays-dialog--opens-and-closes",
        interaction: {
          id: "interaction-1-click",
          label: "userEvent.click",
          src: "/visual-baselines/shadcn/dialog/opens-and-closes--interaction-1-click-chromium-darwin.png",
        },
      }),
    ).toEqual({ ok: true, changed: true });
    const source = readFileSync(storiesPath, "utf8");
    expect(source).toContain('"interaction-1-click"');
    expect(source).toContain('"interaction-5-toHaveAttribute"');
    expect(source).toContain('toHaveAttribute(\\"data-state\\", \\"open\\")');
  });
});
