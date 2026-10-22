import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import { syncAttachedSurfaces } from "./app-shell-attached-surfaces.js";

function fixture() {
  const document = new JSDOM(`<div id="composition">
    <aside id="nav" data-ui-part="sidebar" data-variant="default" data-presentation="inline"></aside>
    <main id="main" data-ui-part="main"></main>
    <aside id="first" data-ui-part="sidebar" data-variant="attached" data-presentation="inline"></aside>
    <aside id="second" data-ui-part="sidebar" data-variant="attached" data-presentation="inline"></aside>
    <aside id="rail" data-ui-part="sidebar" data-variant="rail" data-presentation="inline"></aside>
  </div>`).window.document;
  const element = (id: string) => document.getElementById(id)!;
  const sync = () => syncAttachedSurfaces(element("composition"));
  return { element, sync };
}

describe("attached surfaces", () => {
  it("joins only adjacent attached panels and retains the independent rail", () => {
    const { element, sync } = fixture();
    sync();
    expect(element("main").hasAttribute("data-joined-end")).toBe(true);
    expect(element("first").hasAttribute("data-joined-start")).toBe(true);
    expect(element("first").hasAttribute("data-joined-end")).toBe(true);
    expect(element("second").hasAttribute("data-joined-end")).toBe(false);
    expect(element("rail").hasAttribute("data-joined-start")).toBe(false);
  });

  it("restores exposed edges when panels close, hide or move to overlays", () => {
    const { element, sync } = fixture();
    sync();
    element("first").hidden = true;
    sync();
    expect(element("first").hasAttribute("data-joined-start")).toBe(false);
    expect(element("second").hasAttribute("data-joined-start")).toBe(true);
    element("second").dataset.presentation = "overlay";
    sync();
    expect(element("main").hasAttribute("data-joined-end")).toBe(false);
    element("second").dataset.presentation = "inline";
    element("second").dataset.state = "closed";
    sync();
    expect(element("main").hasAttribute("data-joined-end")).toBe(false);
  });

  it("does not attach across an intervening independently styled panel", () => {
    const { element, sync } = fixture();
    element("first").dataset.variant = "default";
    sync();
    expect(element("main").hasAttribute("data-joined-end")).toBe(false);
    expect(element("second").hasAttribute("data-joined-start")).toBe(false);
  });

  it("does not join across the retained inline space of a previewed collapsed panel", () => {
    const { element, sync } = fixture();
    const first = element("first");
    const placeholder = first.ownerDocument.createElement("div");
    placeholder.dataset.uiPart = "sidebar-placeholder";
    first.before(placeholder);
    first.setAttribute("data-previewed", "");
    first.dataset.presentation = "overlay";
    sync();
    expect(element("main").hasAttribute("data-joined-end")).toBe(false);
    expect(element("second").hasAttribute("data-joined-start")).toBe(false);
    expect(first.hasAttribute("data-joined-start")).toBe(false);
  });

  it("uses logical edges for left attachments and outside insets", () => {
    const { element, sync } = fixture();
    element("nav").dataset.variant = "attached";
    element("rail").hidden = true;
    sync();
    expect(element("nav").hasAttribute("data-attached-outer-start")).toBe(true);
    expect(element("main").hasAttribute("data-joined-start")).toBe(true);
    expect(element("second").hasAttribute("data-attached-outer-end")).toBe(
      true,
    );
  });

  it("projects the main edge treatment onto a constrained replacement", () => {
    const { element, sync } = fixture();
    element("first").dataset.presentation = "replace-main";
    sync();
    expect(element("first").hasAttribute("data-joined-end")).toBe(true);
    expect(element("first").hasAttribute("data-joined-start")).toBe(false);
    element("second").hidden = true;
    sync();
    expect(element("first").hasAttribute("data-joined-end")).toBe(false);
  });
});
