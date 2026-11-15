import { JSDOM } from "jsdom";
import { afterEach, describe, expect, it } from "vitest";
import { AppShellController } from "./app-shell-controller.svelte.js";

const windows: JSDOM[] = [];
function fixture() {
  const dom = new JSDOM(
    '<div id="root" tabindex="-1"><main><input id="draft"></main><aside><input id="panel"></aside></div><input id="dialog">',
  );
  windows.push(dom);
  const document = dom.window.document;
  const root = document.querySelector<HTMLDivElement>("#root")!;
  const draft = document.querySelector<HTMLInputElement>("#draft")!;
  const panel = document.querySelector<HTMLInputElement>("#panel")!;
  const dialog = document.querySelector<HTMLInputElement>("#dialog")!;
  const controller = new AppShellController();
  controller.mobile.setRootElement(root);
  controller.mobile.setMainElement(draft.parentElement);
  controller.mobile.registerPanel({
    id: "files",
    side: "left",
    label: "Files",
    kind: "sidebar",
    element: panel.parentElement,
  });
  return { document, root, draft, panel, dialog, controller };
}

describe("responsive shell focus ownership", () => {
  afterEach(() => {
    for (const dom of windows.splice(0)) dom.window.close();
  });
  it("keeps a main draft focused through both mode changes", () => {
    const f = fixture();
    f.draft.value = "retained draft";
    f.draft.focus();
    for (const mode of ["mobile", "desktop"] as const) {
      f.controller.mobile.setResolvedMode(mode);
      expect(f.document.activeElement).toBe(f.draft);
      expect(f.draft.value).toBe("retained draft");
      expect(f.controller.mobile.stage).toBe("main");
    }
  });
  it("preserves portalled dialog focus while resetting the mobile stage", async () => {
    const f = fixture();
    f.controller.mobile.setResolvedMode("mobile");
    f.controller.mobile.show("left");
    await Promise.resolve();
    f.dialog.focus();
    f.controller.mobile.setResolvedMode("desktop");
    expect(f.document.activeElement).toBe(f.dialog);
    expect(f.controller.mobile.stage).toBe("main");
  });
  it("moves focus out of the registered panel when changing mode", async () => {
    const f = fixture();
    f.controller.mobile.setResolvedMode("mobile");
    f.controller.mobile.show("left");
    await Promise.resolve();
    f.panel.focus();
    f.controller.mobile.setResolvedMode("desktop");
    expect(f.document.activeElement).toBe(f.root);
    expect(f.controller.mobile.stage).toBe("main");
  });
});
