import { afterEach, expect, it, vi } from "vitest";
import {
  autocompletion,
  CompletionContext,
  type CompletionSource,
} from "@codemirror/autocomplete";
import { EditorState } from "@codemirror/state";
import { ViewPlugin, type EditorView } from "@codemirror/view";
import { composerSuggestions } from "./composer-suggestions.js";

vi.mock("@codemirror/autocomplete", async (original) => ({
  ...(await original<typeof import("@codemirror/autocomplete")>()),
  autocompletion: vi.fn(() => []),
}));
afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function fixture(search = async () => [{ id: "alex", label: "Alex" }]) {
  const view = {
    composing: false,
    dispatch: vi.fn(),
    focus: vi.fn(),
  };
  let disposed = false;
  const disabled = vi.fn(() => {
    if (disposed) throw new Error("Destroyed owner's reactive state was read");
    return false;
  });
  const onSelect = vi.fn(() => "@Alex ");
  const triggers = vi.fn(() => [
    { character: "@", menuLabel: "People", searchSource: search, onSelect },
  ]);
  vi.stubGlobal("document", { body: {} });
  const create = vi.spyOn(ViewPlugin, "fromClass");
  const extension = composerSuggestions({ disabled, triggers });
  const Plugin = create.mock.calls.at(-1)![0];
  const plugin = new Plugin(view as unknown as EditorView, undefined);
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  extension.codeMirror?.({ mode: "source", readonly: false });
  const source = vi.mocked(autocompletion).mock.calls.at(-1)![0]!
    .override![0] as CompletionSource;
  const state = EditorState.create({ doc: "@a", selection: { anchor: 2 } });
  const context = new CompletionContext(
    state,
    2,
    true,
    view as unknown as EditorView,
  );
  return {
    view,
    disabled,
    triggers,
    onSelect,
    source,
    context,
    retire() {
      disposed = true;
      plugin.destroy?.();
    },
  };
}

it("rejects a queued source call from a destroyed editor before reading owner callbacks", async () => {
  const f = fixture();
  f.retire();
  await expect(f.source(f.context)).resolves.toBeNull();
  expect(f.disabled).not.toHaveBeenCalled();
  expect(f.triggers).not.toHaveBeenCalled();
});

it("rejects a result completed after editor destruction without reading disposed state", async () => {
  let release!: (items: { id: string; label: string }[]) => void;
  const f = fixture(
    () =>
      new Promise((resolve) => {
        release = resolve;
      }),
  );
  const pending = f.source(f.context);
  f.retire();
  release([{ id: "alex", label: "Alex" }]);
  await expect(pending).resolves.toBeNull();
  expect(f.disabled).toHaveBeenCalledTimes(1);
});

it("refuses a retained completion application after its editor is destroyed", async () => {
  const f = fixture();
  const result = await f.source(f.context);
  expect(result).not.toBeNull();
  const completion = result!.options[0]!;
  expect(completion.apply).toBeTypeOf("function");
  f.retire();
  const apply = completion.apply;
  if (typeof apply !== "function")
    throw new Error("Expected completion action");
  expect(() =>
    apply(f.view as unknown as EditorView, completion, 0, 2),
  ).not.toThrow();
  expect(f.onSelect).not.toHaveBeenCalled();
  expect(f.view.dispatch).not.toHaveBeenCalled();
  expect(f.view.focus).not.toHaveBeenCalled();
});
