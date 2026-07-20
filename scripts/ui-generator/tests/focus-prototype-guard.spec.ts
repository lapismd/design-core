import { afterEach, describe, expect, it } from "vitest";
import { installFocusPrototypeGuard } from "../../../.storybook/focus-prototype-guard.js";

describe("focus prototype guard", () => {
  const prevHTMLElement = globalThis.HTMLElement;
  const prevDocument = globalThis.document;

  afterEach(() => {
    globalThis.HTMLElement = prevHTMLElement;
    // @ts-expect-error restore test shim
    globalThis.document = prevDocument;
  });

  it("makes Storybook-style focus accessors safe to read off the prototype", () => {
    class Element {}
    class HTMLElement extends Element {
      #doc: { defaultView: object } | null = { defaultView: {} };
      focus(_options?: FocusOptions) {
        return undefined;
      }
      getDoc() {
        return this.#doc;
      }
    }

    // Mirror DOM brand-check: reading ownerDocument on the prototype throws.
    Object.defineProperty(HTMLElement.prototype, "ownerDocument", {
      configurable: true,
      get() {
        if (this === HTMLElement.prototype) {
          throw new TypeError("Illegal invocation");
        }
        return (this as HTMLElement).getDoc();
      },
    });

    const original = HTMLElement.prototype.focus;
    let current = original;
    Object.defineProperty(HTMLElement.prototype, "focus", {
      configurable: true,
      get() {
        return this.ownerDocument?.defaultView ? current : () => {};
      },
      set(fn: typeof original) {
        current = fn;
      },
    });

    expect(() => HTMLElement.prototype.focus).toThrow(/Illegal invocation/);

    // @ts-expect-error test shim
    globalThis.HTMLElement = HTMLElement;
    globalThis.document = {
      createElement: () => new HTMLElement(),
    } as unknown as Document;

    installFocusPrototypeGuard();

    expect(() => HTMLElement.prototype.focus).not.toThrow();
    expect(typeof HTMLElement.prototype.focus).toBe("function");
  });
});
