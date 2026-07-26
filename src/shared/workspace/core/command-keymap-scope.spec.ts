import { describe, expect, it, vi } from "vitest";
import { CommandKeymapScope } from "./command-manager.svelte.js";

function keyboardEvent(key: string): KeyboardEvent {
  return {
    key,
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    shiftKey: false,
  } as KeyboardEvent;
}

describe("CommandKeymapScope modal capture", () => {
  it("runs the newest catch-all handler before concrete bindings", async () => {
    const scope = new CommandKeymapScope();
    const binding = vi.fn();
    const capture = vi.fn(() => true);
    scope.register({ modifiers: [], key: "a" }, binding);
    const dispose = scope.registerAny(capture);

    expect(await scope.handle(keyboardEvent("a"))).toBe(true);
    expect(capture).toHaveBeenCalledOnce();
    expect(binding).not.toHaveBeenCalled();

    dispose();
    expect(await scope.handle(keyboardEvent("a"))).toBe(true);
    expect(binding).toHaveBeenCalledOnce();
  });
});
