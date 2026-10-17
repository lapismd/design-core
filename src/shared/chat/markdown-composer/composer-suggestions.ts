import { mount, unmount, type Component } from "svelte";
import {
  autocompletion,
  type Completion,
  type CompletionContext,
} from "@codemirror/autocomplete";
import { syntaxTree } from "@codemirror/language";
import type { EditorState } from "@codemirror/state";
import { ViewPlugin, type EditorView, type ViewUpdate } from "@codemirror/view";
import type { MiraExtension } from "@lapismd/mira/extensions";
import type { ComposerTrigger, ComposerTriggerItem } from "../../ai/types.js";
import {
  Avatar,
  avatarIdentityProps,
  type AvatarIdentity,
} from "../../shadcn/avatar/index.js";

export type MarkdownSuggestionItem = ComposerTriggerItem & {
  avatar?: AvatarIdentity;
  icon?: Component;
};
export type MarkdownComposerTrigger = Omit<ComposerTrigger, "searchSource"> & {
  searchSource: (
    query: string,
    signal: AbortSignal,
  ) => MarkdownSuggestionItem[] | Promise<MarkdownSuggestionItem[]>;
};
/** Match only a boundary-prefixed trigger; returned offsets are UTF-16. */
export function suggestionQuery(
  text: string,
  characters: readonly string[],
): { character: string; query: string; from: number } | undefined {
  for (let index = text.length - 1; index >= 0; index--) {
    if (/\s/u.test(text[index]!)) break;
    const character = characters.find(
      (value) => value && text.slice(index, index + value.length) === value,
    );
    if (!character || (index > 0 && !/[\s([{]/u.test(text[index - 1]!)))
      continue;
    return {
      character,
      query: text.slice(index + character.length),
      from: index,
    };
  }
  return undefined;
}
/** Shared source/keyboard boundary: completion must belong to a configured text trigger. */
export function composerTriggerQuery(
  state: EditorState,
  characters: readonly string[],
  position = state.selection.main.head,
): ReturnType<typeof suggestionQuery> {
  let node = syntaxTree(state).resolveInner(position, -1);
  for (;;) {
    if (/^(?:FencedCode|CodeBlock|InlineCode|CodeText)$/u.test(node.name))
      return;
    if (!node.parent) break;
    node = node.parent;
  }
  const line = state.doc.lineAt(position);
  const query = suggestionQuery(
    line.text.slice(0, position - line.from),
    characters,
  );
  return query ? { ...query, from: line.from + query.from } : undefined;
}
/** Public Mira contribution; supplied search owns authorization and application syntax. */
export function composerSuggestions(options: {
  triggers: () => readonly MarkdownComposerTrigger[];
  disabled: () => boolean;
}): MiraExtension {
  let version = 0;
  let pending: AbortController | undefined;
  const mounts = ViewPlugin.fromClass(
    class {
      entries = new Map<HTMLElement, ReturnType<typeof mount>>();
      frame = 0;
      constructor(readonly view: EditorView) {}
      schedule() {
        cancelAnimationFrame(this.frame);
        this.frame = requestAnimationFrame(() => {
          for (const [node, instance] of this.entries)
            if (!node.isConnected) {
              void unmount(instance);
              this.entries.delete(node);
            }
        });
      }
      update(_update: ViewUpdate) {
        this.schedule();
      }
      destroy() {
        cancelAnimationFrame(this.frame);
        for (const instance of this.entries.values()) void unmount(instance);
        this.entries.clear();
      }
    },
  );
  async function source(context: CompletionContext) {
    if (options.disabled() || context.view?.composing) return null;
    const query = composerTriggerQuery(
      context.state,
      options.triggers().map((t) => t.character),
      context.pos,
    );
    if (!query) return null;
    const trigger = options
      .triggers()
      .find((t) => t.character === query.character)!;
    pending?.abort();
    const controller = new AbortController();
    pending = controller;
    const request = ++version;
    context.addEventListener("abort", () => controller.abort(), {
      onDocChange: true,
    });
    let items: MarkdownSuggestionItem[];
    try {
      items = await trigger.searchSource(query.query, controller.signal);
    } catch {
      return null;
    }
    if (
      controller.signal.aborted ||
      context.aborted ||
      request !== version ||
      options.disabled()
    )
      return null;
    return {
      from: query.from,
      to: context.pos,
      filter: false,
      options: items.map((item) => ({
        label: item.label,
        detail: item.description ?? "",
        item,
        apply(
          view: EditorView,
          _completion: Completion,
          from: number,
          to: number,
        ) {
          if (options.disabled() || view.composing) return;
          const selected = trigger.onSelect(item);
          const text = typeof selected === "string" ? selected : selected.value;
          view.dispatch({
            changes: { from, to, insert: text },
            selection: { anchor: from + text.length },
            userEvent: "input.complete",
          });
          view.focus();
        },
      })),
    };
  }
  return {
    name: "design-core-composer-suggestions",
    codeMirror: () => [
      mounts,
      autocompletion({
        override: [source],
        activateOnTypingDelay: 75,
        interactionDelay: 0,
        aboveCursor: true,
        icons: false,
        tooltipClass: () => "ui-composer-suggestions",
        addToOptions: [
          {
            position: 20,
            render(completion, _state, view) {
              const item = (
                completion as Completion & { item?: MarkdownSuggestionItem }
              ).item;
              if (!item?.avatar && !item?.icon) return null;
              const host = document.createElement("span");
              host.className = "ui-composer-suggestions__icon";
              const instance = item.avatar
                ? mount(Avatar, {
                    target: host,
                    props: {
                      ...avatarIdentityProps(item.avatar),
                      size: "sm",
                      decorative: true,
                    },
                  })
                : mount(item.icon!, {
                    target: host,
                    props: { "aria-hidden": true },
                  });
              view.plugin(mounts)?.entries.set(host, instance);
              view.plugin(mounts)?.schedule();
              return host;
            },
          },
        ],
      }),
    ],
    onMount() {
      return () => {
        version++;
        pending?.abort();
        pending = undefined;
      };
    },
  };
}
