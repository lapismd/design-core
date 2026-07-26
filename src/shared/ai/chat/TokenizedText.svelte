<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import Token from "./ComposerToken.svelte";
  import type { ComposerToken as ComposerTokenValue } from "./types.js";
  import "./chat.css";

  let {
    ref = $bindable(null),
    text,
    tokens = [],
    ...restProps
  }: HTMLAttributes<HTMLSpanElement> & {
    ref?: HTMLSpanElement | null;
    text: string;
    tokens?: ComposerTokenValue[];
  } = $props();

  type Part =
    | { kind: "text"; value: string }
    | {
        kind: "token";
        token: ComposerTokenValue;
        key: string;
      };

  function tokenize(value: string, definitions: ComposerTokenValue[]): Part[] {
    if (!value || definitions.length === 0) {
      return [{ kind: "text", value }];
    }
    const sorted = [...definitions]
      .filter((token) => token.value.length > 0)
      .sort((left, right) => right.value.length - left.value.length);
    const result: Part[] = [];
    let cursor = 0;
    while (cursor < value.length) {
      const match = sorted
        .map((token) => ({ token, index: value.indexOf(token.value, cursor) }))
        .filter(({ index }) => index >= 0)
        .sort((left, right) => left.index - right.index)[0];
      if (!match) {
        result.push({ kind: "text", value: value.slice(cursor) });
        break;
      }
      if (match.index > cursor) {
        result.push({
          kind: "text",
          value: value.slice(cursor, match.index),
        });
      }
      result.push({
        kind: "token",
        token: match.token,
        key: `${match.token.value}-${match.index}`,
      });
      cursor = match.index + match.token.value.length;
    }
    return result;
  }

  const parts = $derived(tokenize(text, tokens));
</script>

<span
  bind:this={ref}
  {...restProps}
  data-ui-component="ai-chat-tokenized-text"
  data-ui-part="root"
>
  {#each parts as part, index (part.kind === "token" ? part.key : `text-${index}`)}
    {#if part.kind === "token"}
      <Token token={part.token} />
    {:else}
      {part.value}
    {/if}
  {/each}
</span>
