<script lang="ts">
  import { autocompletion, completionKeymap } from "@codemirror/autocomplete";
  import { historyKeymap, undo } from "@codemirror/commands";
  import {
    StreamLanguage,
    syntaxHighlighting,
    HighlightStyle,
  } from "@codemirror/language";
  import { keymap } from "@codemirror/view";
  import { tags } from "@lezer/highlight";
  import SearchFilterInput from "./SearchFilterInput.svelte";

  let value = $state('description:"rebase" ');
  let alternate = $state(false);
  let input: SearchFilterInput;
  const language = StreamLanguage.define({
    token(stream) {
      if (stream.eatSpace()) return null;
      if (stream.match(/[a-z_]+/)) return "variableName";
      stream.next();
      return null;
    },
  });
  const highlighting = syntaxHighlighting(
    HighlightStyle.define([
      { tag: tags.variableName, class: "custom-query-symbol" },
    ]),
  );
  const extensions = $derived([
    language,
    highlighting,
    autocompletion({
      activateOnTypingDelay: 0,
      interactionDelay: 0,
      override: [
        (context) => ({
          from: context.pos,
          options: [
            { label: alternate ? "parents()" : "trunk()", type: "function" },
          ],
        }),
      ],
    }),
    keymap.of(completionKeymap),
    keymap.of([{ key: "Alt-z", run: undo }, ...historyKeymap]),
  ]);
</script>

<div style="width: 24rem; padding: 1rem;">
  <SearchFilterInput
    bind:this={input}
    {value}
    inputMode="custom"
    focusAppearance="borderless"
    error={value.includes("invalid") ? "Invalid custom query" : null}
    editorExtensions={extensions}
    ariaLabel="Custom query"
    onValueChange={(next) => (value = next)}
    onClearSearch={() => {
      value = "";
    }}
  />
  <button
    onclick={() => {
      alternate = !alternate;
      input.focus();
    }}>Change completions</button
  >
  <output aria-label="Query value">{value}</output>
</div>
