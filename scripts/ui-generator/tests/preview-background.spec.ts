import { describe, expect, it } from "vitest";
import { resolvePaintedBackground } from "@lapismd/storybook-addon-visual-delta/src/shared/preview-background.js";

describe("resolvePaintedBackground", () => {
  it("prefers an opaque preferred element over body", () => {
    class Element {
      style: { backgroundColor?: string } = {};
    }
    const preferred = new Element();
    const body = new Element();
    const html = new Element();

    const styles = new Map<Element, { backgroundColor: string }>([
      [preferred, { backgroundColor: "rgb(10, 20, 30)" }],
      [body, { backgroundColor: "rgb(255, 255, 255)" }],
      [html, { backgroundColor: "rgba(0, 0, 0, 0)" }],
    ]);

    const doc = {
      body,
      documentElement: html,
      defaultView: {
        getComputedStyle: (el: Element) =>
          styles.get(el) ?? { backgroundColor: "transparent" },
      },
    } as unknown as Document;

    expect(resolvePaintedBackground(doc, preferred)).toBe("rgb(10, 20, 30)");
  });

  it("falls back through transparent layers to body", () => {
    class Element {}
    const preferred = new Element();
    const body = new Element();
    const html = new Element();
    const styles = new Map<Element, { backgroundColor: string }>([
      [preferred, { backgroundColor: "rgba(0, 0, 0, 0)" }],
      [body, { backgroundColor: "rgb(40, 50, 60)" }],
      [html, { backgroundColor: "rgb(1, 2, 3)" }],
    ]);
    const doc = {
      body,
      documentElement: html,
      defaultView: {
        getComputedStyle: (el: Element) => {
          if (el === html) {
            return {
              backgroundColor: styles.get(html)!.backgroundColor,
              getPropertyValue: () => "",
            };
          }
          return styles.get(el) ?? { backgroundColor: "transparent" };
        },
      },
    } as unknown as Document;

    expect(resolvePaintedBackground(doc, preferred)).toBe("rgb(40, 50, 60)");
  });
});
