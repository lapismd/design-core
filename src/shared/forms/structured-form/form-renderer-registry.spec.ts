import type { Component } from "svelte";
import { describe, expect, it } from "vitest";
import {
  createFormRendererRegistry,
  FormRendererRegistry,
} from "./form-renderer-registry";

const renderer = { component: (() => {}) as unknown as Component<any> };
const replacement = { component: (() => {}) as unknown as Component<any> };

describe("FormRendererRegistry", () => {
  it("starts with isolated built-in renderers", () => {
    const first = createFormRendererRegistry();
    const second = createFormRendererRegistry();

    expect(first.resolve("text")).not.toBeNull();
    expect(second.resolve("text")).not.toBeNull();
    first.register("custom", renderer, { replace: true });
    expect(first.resolve("custom")).toBe(renderer);
    expect(second.resolve("custom")).not.toBe(renderer);
  });

  it("registers, replaces, and disposes downstream renderers", () => {
    const registry = new FormRendererRegistry({ includeBuiltins: false });
    const dispose = registry.register("custom", renderer);

    expect(registry.resolve("custom")).toBe(renderer);
    expect(() => registry.register("custom", replacement)).toThrow(
      /already registered/,
    );

    const restore = registry.register("custom", replacement, { replace: true });
    expect(registry.resolve("custom")).toBe(replacement);
    restore();
    expect(registry.resolve("custom")).toBe(renderer);
    dispose();
    expect(registry.resolve("custom")).toBeNull();
  });
});
