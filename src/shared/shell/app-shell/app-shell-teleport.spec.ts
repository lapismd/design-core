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

  it("removes a live teleported node from its mobile host during destroy", () => {
    const { root, node, target } = createTeleportFixture();
    const action = appShellTeleport(node, { enabled: true, target });

    action.destroy();

    expect(root.contains(node)).toBe(false);
    expect(target.contains(node)).toBe(false);
    expect(node.isConnected).toBe(false);
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

  it("preserves the mounted input, draft, selection and focus across fallback moves", () => {
    const { root, node, target } = createTeleportFixture();
    const input = document.createElement("input");
    node.append(input);
    input.value = "Retained draft";
    input.focus();
    input.setSelectionRange(2, 6);
    const action = appShellTeleport(node, { enabled: true, target });
    expect(document.activeElement).toBe(input);
    expect(input.value).toBe("Retained draft");
    expect([input.selectionStart, input.selectionEnd]).toEqual([2, 6]);
    action.update({ enabled: false, target: null });
    expect(node.parentElement).toBe(root);
    expect(document.activeElement).toBe(input);
    expect([input.selectionStart, input.selectionEnd]).toEqual([2, 6]);
    action.destroy();
  });

  it("does not move the node again when its destination has not changed", () => {
    const { node, target } = createTeleportFixture();
    const action = appShellTeleport(node, { enabled: true, target });
    const insert = vi.spyOn(target, "insertBefore");
    action.update({ enabled: true, target });
    expect(insert).not.toHaveBeenCalled();
    action.destroy();
  });
});
