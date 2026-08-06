<script lang="ts">
  import { Badge } from "@lapismd/design-core/shadcn/badge";
  import type { HTMLAttributes } from "svelte/elements";
  import type { ComposerToken } from "../types.js";
  import "../chat.css";

  let {
    ref = $bindable(null),
    token,
    id,
    ...restProps
  }: HTMLAttributes<HTMLSpanElement> & {
    ref?: HTMLSpanElement | null;
    token: ComposerToken;
    /** Stable DOM id used by a composer handle for expansion. */
    id?: string;
  } = $props();
</script>

<span
  bind:this={ref}
  {...restProps}
  data-ui-component="ai-chat-composer-token"
  data-ui-part="root"
  data-ui-chat-token-id={id}
  data-ui-chat-token-value={token.value}
  contenteditable="false"
>
  {#if "render" in token}
    {@render token.render(token)}
  {:else}
    <Badge variant={token.variant ?? "secondary"}>{token.label}</Badge>
  {/if}
</span>
