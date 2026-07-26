import { describe, expect, it, vi } from "vitest";
import {
  createComposerHistory,
  shouldSubmitComposerKey,
} from "./composer-behavior.js";
import {
  createPasteAsToken,
  serializeComposerValue,
} from "./composer-tokens.js";
import { createNewMessages } from "./new-messages.svelte.js";
import { createSpeechRecognition } from "./speech-recognition.svelte.js";
import { createStreamScroll } from "./stream-scroll.svelte.js";
import { createTriggerSearch } from "./trigger-menu.js";
import type {
  ComposerInputHandle,
  ComposerTrigger,
  SpeechRecognitionInstance,
  SpeechRecognitionResultEvent,
} from "./types.js";

function fakeElement(properties: Partial<HTMLElement> = {}): HTMLElement & {
  emitScroll: () => void;
} {
  let scroll: (() => void) | undefined;
  return {
    scrollHeight: 600,
    clientHeight: 200,
    scrollTop: 0,
    addEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
    ) {
      if (type === "scroll") {
        scroll =
          typeof listener === "function"
            ? (listener as () => void)
            : () => listener.handleEvent(new Event("scroll"));
      }
    },
    removeEventListener() {
      scroll = undefined;
    },
    querySelector: () => null,
    querySelectorAll: () => [] as unknown as NodeListOf<HTMLElement>,
    getBoundingClientRect: () => ({ top: 0 }) as DOMRect,
    emitScroll: () => scroll?.(),
    ...properties,
  } as unknown as HTMLElement & { emitScroll: () => void };
}

describe("createStreamScroll", () => {
  it("locks to the bottom on attach and unlocks beyond the threshold", () => {
    const frames: FrameRequestCallback[] = [];
    const element = fakeElement();
    const scroll = createStreamScroll({
      requestAnimationFrame(callback) {
        frames.push(callback);
        return frames.length;
      },
      cancelAnimationFrame: () => {},
    });

    scroll.attach(element);
    frames.shift()?.(0);
    expect(element.scrollTop).toBe(400);
    expect(scroll.isLocked).toBe(true);

    element.scrollTop = 200;
    element.emitScroll();
    expect(scroll.isLocked).toBe(false);
    expect(scroll.isScrolledUp).toBe(true);
  });

  it("uses an instant scroll when reduced motion is requested", () => {
    const element = fakeElement();
    const scroll = createStreamScroll({
      requestAnimationFrame: () => 1,
      cancelAnimationFrame: () => {},
      prefersReducedMotion: () => true,
    });
    scroll.attach(element);
    scroll.scrollToBottom({ behavior: "spring" });
    expect(element.scrollTop).toBe(400);
  });
});

describe("createNewMessages", () => {
  it("deduplicates message ids while unlocked", () => {
    const controller = createNewMessages({ isLocked: () => false });
    controller.notify("message-1");
    controller.dismiss();
    controller.notify("message-1");
    expect(controller.hasNewMessages).toBe(false);
    controller.notify("message-2");
    expect(controller.hasNewMessages).toBe(true);
  });

  it("ignores the initial resize observation", () => {
    let resize: ((entries: ResizeObserverEntry[]) => void) | undefined;
    const controller = createNewMessages({
      isLocked: () => false,
      createResizeObserver(callback) {
        resize = (entries) => callback(entries, {} as ResizeObserver);
        return { observe: () => {}, disconnect: () => {} };
      },
    });
    const element = fakeElement();
    controller.attach(element);
    resize?.([{ target: element } as unknown as ResizeObserverEntry]);
    expect(controller.hasNewMessages).toBe(false);
    resize?.([{ target: element } as unknown as ResizeObserverEntry]);
    expect(controller.hasNewMessages).toBe(true);
  });
});

describe("composer behavior", () => {
  it("does not submit Shift+Enter or an IME composition commit", () => {
    expect(shouldSubmitComposerKey({ key: "Enter" })).toBe(true);
    expect(shouldSubmitComposerKey({ key: "Enter", shiftKey: true })).toBe(
      false,
    );
    expect(shouldSubmitComposerKey({ key: "Enter", isComposing: true })).toBe(
      false,
    );
    expect(shouldSubmitComposerKey({ key: "Enter", keyCode: 229 })).toBe(false);
  });

  it("preserves the current draft around history navigation", () => {
    const history = createComposerHistory();
    history.record("first");
    history.record("second");
    expect(history.previous("draft")).toBe("second");
    expect(history.previous("ignored")).toBe("first");
    expect(history.next()).toBe("second");
    expect(history.next()).toBe("draft");
  });
});

describe("composer token helpers", () => {
  it("serializes tokens and text deterministically", () => {
    const text = {
      nodeType: 3,
      data: "Hello ",
      childNodes: [],
    } as unknown as Text;
    const token = {
      nodeType: 1,
      tagName: "SPAN",
      dataset: { uiChatTokenValue: "@ada" },
      matches: (selector: string) =>
        selector === '[data-ui-part="inline-token"]',
      childNodes: [],
    } as unknown as HTMLElement;
    const space = {
      nodeType: 3,
      data: "\u00a0",
      childNodes: [],
    } as unknown as Text;
    const root = {
      childNodes: [text, token, space],
    } as unknown as HTMLElement;
    expect(serializeComposerValue(root)).toBe("Hello @ada ");
  });

  it("converts only pastes at or above the configured threshold", () => {
    const insertToken = vi.fn(() => "token-1");
    const input = { insertToken } as unknown as ComposerInputHandle;
    const paste = createPasteAsToken({ input: () => input, threshold: 5 });
    expect(paste.insert("four")).toBe(false);
    expect(paste.insert("five!")).toBe(true);
    expect(insertToken).toHaveBeenCalledWith(
      expect.objectContaining({ value: "five!" }),
    );
  });
});

describe("createTriggerSearch", () => {
  it("aborts stale async search results", async () => {
    vi.useFakeTimers();
    const resolvers: Array<
      (items: Array<{ id: string; label: string }>) => void
    > = [];
    const trigger: ComposerTrigger = {
      character: "@",
      searchSource: () =>
        new Promise((resolve) => {
          resolvers.push(resolve);
        }),
      onSelect: (item) => item.label,
    };
    const states: string[] = [];
    const search = createTriggerSearch(10);
    search.search(trigger, "a", (state) => {
      if (!state.loading) states.push(state.query);
    });
    await vi.advanceTimersByTimeAsync(10);
    search.search(trigger, "ab", (state) => {
      if (!state.loading) states.push(state.query);
    });
    await vi.advanceTimersByTimeAsync(10);
    resolvers[0]?.([{ id: "a", label: "A" }]);
    resolvers[1]?.([{ id: "ab", label: "AB" }]);
    await Promise.resolve();
    expect(states).toEqual(["ab"]);
    vi.useRealTimers();
  });
});

class MockRecognition implements SpeechRecognitionInstance {
  lang = "";
  continuous = false;
  interimResults = false;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null = null;
  onspeechstart: (() => void) | null = null;
  onspeechend: (() => void) | null = null;
  onerror: SpeechRecognitionInstance["onerror"] = null;
  onnomatch: (() => void) | null = null;
  start = () => this.onstart?.();
  stop = () => this.onend?.();
  abort = () => this.onend?.();
}

describe("createSpeechRecognition", () => {
  it("supports injected recognition and releases state on stop", async () => {
    const results: string[] = [];
    const controller = createSpeechRecognition({
      recognitionConstructor: MockRecognition,
      getUserMedia: null,
      createAudioContext: null,
      onResult: (result) => results.push(result),
    });
    expect(controller.isSupported).toBe(true);
    await controller.start();
    expect(controller.isListening).toBe(true);
    controller.stop();
    expect(controller.isListening).toBe(false);
    controller.cleanup();
    expect(controller.bands).toEqual([0, 0, 0, 0, 0]);
  });

  it("reports unsupported adapters without throwing", async () => {
    const controller = createSpeechRecognition({
      recognitionConstructor: null,
      getUserMedia: null,
      createAudioContext: null,
    });
    expect(controller.isSupported).toBe(false);
    await expect(controller.start()).resolves.toBeUndefined();
  });
});
