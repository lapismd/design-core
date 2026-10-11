import { JSDOM } from "jsdom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { appShellTeleport } from "./app-shell-teleport.js";

function createTeleportFixture() {
  const dom = new JSDOM(`
    <main>
      <span id="before"></span>
      <div id="node"></div>
      <span id="after"></span>
    </main>
    <aside id="target"></aside>
  `);
  vi.stubGlobal("document", dom.window.document);
  const root = dom.window.document.querySelector("main");
  const node = dom.window.document.querySelector("#node");
  const target = dom.window.document.querySelector("#target");
  if (!root || !node || !target) throw new Error("Invalid teleport fixture");
  return { root, node: node as HTMLElement, target: target as HTMLElement };
}

describe("appShellTeleport", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("restores a live node to its original anchor when disabled", () => {
    const { root, node, target } = createTeleportFixture();
    const action = appShellTeleport(node, { enabled: true, target });

    expect(node.parentElement).toBe(target);

    action.update({ enabled: false, target: null });

    expect(node.parentElement).toBe(root);
    expect(node.nextElementSibling?.id).toBe("after");
    action.destroy();
  });

  it("does not reattach a removed node during destroy", () => {
    const { root, node, target } = createTeleportFixture();
    const action = appShellTeleport(node, { enabled: true, target });

    expect(node.parentElement).toBe(target);

    node.remove();
    action.destroy();

    expect(root.contains(node)).toBe(false);
    expect(target.contains(node)).toBe(false);
  });
});
