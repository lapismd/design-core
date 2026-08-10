import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createOverlayPortalContext,
  resolveOverlayPortalProps,
} from "./overlay-portal-context.js";

describe("resolveOverlayPortalProps", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("prefers explicit portal properties", () => {
    const context = createOverlayPortalContext();
    context.portalTarget = { nodeType: 1 } as Element;

    expect(
      resolveOverlayPortalProps(context, { to: "#overlays" }, true),
    ).toEqual({ to: "#overlays" });
  });

  it("disables portals for inline overlay hosts", () => {
    expect(
      resolveOverlayPortalProps(createOverlayPortalContext(), undefined, true),
    ).toEqual({ disabled: true });
  });

  it("uses a same-realm trigger target", () => {
    class TestElement {}
    vi.stubGlobal("Element", TestElement);
    const target = new TestElement() as Element;
    const context = createOverlayPortalContext();
    context.portalTarget = target;

    expect(resolveOverlayPortalProps(context)).toEqual({ to: target });
  });

  it("falls back to inline rendering for a cross-realm target", () => {
    class CurrentRealmElement {}
    vi.stubGlobal("Element", CurrentRealmElement);
    const context = createOverlayPortalContext();
    context.portalTarget = { nodeType: 1 } as Element;

    expect(resolveOverlayPortalProps(context)).toEqual({ disabled: true });
  });

  it("leaves the primitive default intact before a trigger is known", () => {
    expect(
      resolveOverlayPortalProps(createOverlayPortalContext()),
    ).toBeUndefined();
  });
});
