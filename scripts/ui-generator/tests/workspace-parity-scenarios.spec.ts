import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  getWorkspaceDropOverlayGeometry,
  workspaceDropOverlayStyle,
} from "../../../packages/workspace/src/lib/components/drop-geometry.js";
import { runWorkspaceParityHarness } from "../visual/workspace-parity-harness.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(dirname, "../../..");
const lapisReferenceRoot = path.join(
  packageRoot,
  "packages/workspace/reference/lapis/97518d8158a12ade0f9b1a35aa051ffcf5dfe8ac",
);

function reportDir(name: string) {
  return path.join(
    tmpdir(),
    `workspace-parity-scenarios-${name}-${Date.now()}`,
  );
}

function readWorkspaceComponentCss(component: string) {
  const source = readFileSync(
    path.join(packageRoot, "packages/workspace/src/lib/components", component),
    "utf8",
  );
  const match = source.match(/<style>([\s\S]*)<\/style>/);
  if (!match?.[1]) throw new Error(`${component} style not found`);
  return match[1]
    .replace(/:global\(([^()]*)\)/g, "$1")
    .replace(/:global\(([^()]*)\)/g, "$1");
}

const candidateTheme = `
:root {
  --background: #ffffff;
  --foreground: #18181b;
  --muted: #f4f4f5;
  --muted-foreground: #71717a;
  --accent: #e4e4e7;
  --border: #d4d4d8;
  --primary: #2563eb;
  --sidebar-border: #d4d4d8;
  --ui-workspace-tab-height: 40px;
  --ui-workspace-tab-width: 200px;
  --ui-workspace-tab-min-width: 0px;
  --ui-workspace-tab-max-width: 320px;
  --ui-workspace-tab-container-background: #f4f4f5;
  --ui-workspace-tab-active-background: #ffffff;
  --ui-workspace-tab-hover: #e4e4e7;
  --ui-workspace-divider: #d4d4d8;
  --ui-workspace-tab-radius: 4px;
}
button {
  font: inherit;
}
`;

function referenceTabsHtml() {
  return `
<div data-workspace-theme="lapis-reference">
  <div data-parity-root class="workspace-reference-shell" style="width:720px;height:40px">
    <div class="workspace-reference-tab-bar">
      <div class="workspace-reference-tab-list">
        <button class="workspace-reference-tab" type="button">
          <span class="workspace-reference-tab-title">Notes</span>
          <span class="workspace-reference-tab-close">x</span>
        </button>
        <button class="workspace-reference-tab" data-active="true" type="button">
          <span class="workspace-reference-tab-title">Details with a long title</span>
          <span class="workspace-reference-tab-close">x</span>
        </button>
        <button class="workspace-reference-tab" type="button">
          <span class="workspace-reference-tab-title">Graph</span>
          <span class="workspace-reference-tab-close">x</span>
        </button>
      </div>
      <div class="workspace-reference-tab-action">+</div>
      <div class="workspace-reference-tab-spacer"></div>
    </div>
  </div>
</div>`;
}

function candidateTabsHtml() {
  return `
<div data-parity-root data-ui-component="workspace" data-ui-part="tabs" style="width:720px;height:40px">
  <div data-ui-component="workspace" data-ui-part="tab-bar">
    <div data-ui-component="workspace" data-ui-part="tab-strip" style="--workspace-tab-count:3">
      <div data-workspace-part="tab-list">
        ${["Notes", "Details with a long title", "Graph"]
          .map(
            (title, index) => `
          <div data-ui-component="workspace" data-ui-part="tab" data-active="${index === 1}">
            <button data-workspace-part="tab-trigger" type="button">
              <span data-ui-component="workspace" data-ui-part="tab-title">${title}</span>
            </button>
            <button data-workspace-part="tab-close" type="button">x</button>
          </div>`,
          )
          .join("")}
      </div>
    </div>
    <div data-ui-component="workspace" data-ui-part="tab-new-action">+</div>
    <div data-ui-component="workspace" data-ui-part="tab-spacer"></div>
  </div>
</div>`;
}

function referenceDropHtml(position: "right" | "bottom" | "center") {
  const size =
    position === "right"
      ? "width:130px;height:320px;left:390px;top:0"
      : position === "bottom"
        ? "width:520px;height:112px;left:0;top:208px"
        : "width:520px;height:320px;left:0;top:0";
  return `
<div data-workspace-theme="lapis-reference">
  <div data-parity-root class="workspace-reference-drop-target">
    <div class="workspace-reference-drop-overlay" style="${size}"></div>
  </div>
</div>`;
}

function candidateDropHtml(position: "right" | "bottom" | "center") {
  const point =
    position === "right"
      ? { x: 500, y: 160 }
      : position === "bottom"
        ? { x: 260, y: 304 }
        : { x: 260, y: 160 };
  const geometry = getWorkspaceDropOverlayGeometry({
    width: 520,
    height: 320,
    ...point,
  });
  if (!geometry) throw new Error("drop geometry was not calculated");
  return `
<div data-parity-root data-ui-component="workspace" data-ui-part="tab-drop-zone" style="width:520px;height:320px;position:relative;background:#ffffff">
  <div data-ui-component="workspace" data-ui-part="tab-drop-overlay" data-drop-position="${geometry.position}" style="${workspaceDropOverlayStyle(geometry)}"></div>
</div>`;
}

describe("workspace parity scenarios", () => {
  it("checks top-tab and drop-overlay geometry against the Lapis reference", async () => {
    const referenceCss = readFileSync(
      path.join(lapisReferenceRoot, "workspace-reference.css"),
      "utf8",
    );
    const candidateCss = `${candidateTheme}\n${readWorkspaceComponentCss(
      "WorkspaceTabs.svelte",
    )}\n${readWorkspaceComponentCss("WorkspaceDropOverlay.svelte")}`;
    const result = await runWorkspaceParityHarness({
      reportDir: reportDir("workspace"),
      scenarios: [
        {
          id: "top-tabs",
          viewport: { width: 760, height: 80 },
          maxDiffPixels: 20000,
          reference: { css: referenceCss, html: referenceTabsHtml() },
          candidate: { css: candidateCss, html: candidateTabsHtml() },
        },
        ...(["right", "bottom", "center"] as const).map((position) => ({
          id: `drop-${position}`,
          viewport: { width: 560, height: 360 },
          maxDiffPixels: 120000,
          reference: {
            css: referenceCss,
            html: referenceDropHtml(position),
          },
          candidate: {
            css: candidateCss,
            html: candidateDropHtml(position),
          },
        })),
      ],
    });

    expect(result.scenarios.map((scenario) => scenario.id)).toEqual([
      "top-tabs",
      "drop-right",
      "drop-bottom",
      "drop-center",
    ]);
    expect(result.scenarios[0]).toMatchObject({ width: 720, height: 40 });
    expect(result.scenarios.slice(1)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ width: 520, height: 320 }),
      ]),
    );
  }, 30_000);
});
