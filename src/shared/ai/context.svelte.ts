import { getContext, setContext } from "svelte";
import type { Density, ComposerInputHandle } from "./types.js";
import type { StreamScrollController } from "./stream-scroll.svelte.js";
import type { NewMessagesController } from "./new-messages.svelte.js";

const LAYOUT_CONTEXT = Symbol.for("@lapismd/design-core/ai/layout");
const COMPOSER_CONTEXT = Symbol.for("@lapismd/design-core/ai/composer");
const LIST_CONTEXT = Symbol.for("@lapismd/design-core/ai/list");
const MESSAGE_CONTEXT = Symbol.for("@lapismd/design-core/ai/message");

export type LayoutContextValue = {
  getScrollContainer: () => HTMLElement | null;
  setScrollContainer: (element: HTMLElement | null) => void;
  setContent: (element: HTMLElement | null) => void;
  streamScroll: StreamScrollController;
  newMessages: NewMessagesController;
};

export type ComposerContextValue = {
  getValue: () => string;
  setValue: (value: string) => void;
  submit: () => void;
  stop: () => void;
  getDisabled: () => boolean;
  getStopShown: () => boolean;
  getCanSend: () => boolean;
  getPlaceholder: () => string;
  setInputHandle: (handle: ComposerInputHandle | null) => void;
  getInputHandle: () => ComposerInputHandle | null;
};

export type ListContextValue = {
  getDensity: () => Density;
};

export type MessageContextValue = {
  sender: "user" | "assistant" | "system";
  density: Density;
};

export function setLayoutContext(
  value: LayoutContextValue,
): LayoutContextValue {
  return setContext(LAYOUT_CONTEXT, value);
}

/**
 * Access the nearest chat layout. Must be called during component setup.
 */
export function useLayoutContext(): LayoutContextValue | null {
  return getContext<LayoutContextValue | null>(LAYOUT_CONTEXT) ?? null;
}

export function setComposerContext(
  value: ComposerContextValue,
): ComposerContextValue {
  return setContext(COMPOSER_CONTEXT, value);
}

/**
 * Access the nearest rich composer. Must be called during component setup.
 */
export function useComposerContext(): ComposerContextValue | null {
  return getContext<ComposerContextValue | null>(COMPOSER_CONTEXT) ?? null;
}

export function setListContext(value: ListContextValue): ListContextValue {
  return setContext(LIST_CONTEXT, value);
}

export function useListContext(): ListContextValue | null {
  return getContext<ListContextValue | null>(LIST_CONTEXT) ?? null;
}

export function setMessageContext(
  value: MessageContextValue,
): MessageContextValue {
  return setContext(MESSAGE_CONTEXT, value);
}

export function useMessageContext(): MessageContextValue | null {
  return getContext<MessageContextValue | null>(MESSAGE_CONTEXT) ?? null;
}
