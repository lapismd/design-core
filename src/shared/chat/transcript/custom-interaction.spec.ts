import { expect, it, vi } from "vitest";
import { customInteraction } from "./custom-interaction.js";
import { TranscriptController } from "./comments.svelte.js";

for (const type of ["paste", "keydown"] as const) {
  it(`does not recapture ${type} already handled by a nested editor`, () => {
    class Element {
      closest() {
        return null;
      }
    }
    vi.stubGlobal("Element", Element);
    const listeners = new Map<string, (event: unknown) => void>();
    const node = Object.assign(new Element(), {
      tabIndex: -1,
      addEventListener: (name: string, handler: (event: unknown) => void) =>
        listeners.set(name, handler),
      removeEventListener() {},
    }) as unknown as HTMLElement;
    const block = {
      id: "tool-result",
      revision: "1",
      kind: "custom" as const,
      label: "Tool result",
      text: "Captured result",
    };
    const state = new TranscriptController(() => ({
      items: [{ id: "tool", kind: "tools", label: "Tool", blocks: [block] }],
    }));
    state.open(block, { from: 0, to: 0 }, "Original draft");
    const action = customInteraction(node, { block, state });
    const preventDefault = vi.fn();
    try {
      listeners.get(type)!({
        defaultPrevented: true,
        target: node,
        key: "x",
        clipboardData: { getData: () => "Pasted once" },
        preventDefault,
      });
      expect(state.pending).toHaveLength(1);
      expect(state.draft).toBe("Original draft");
      expect(preventDefault).not.toHaveBeenCalled();
    } finally {
      action.destroy();
      vi.unstubAllGlobals();
    }
  });
}
