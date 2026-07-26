<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { setMessageContext, useListContext } from "./context.svelte.js";
  import type { Density, MessageSender } from "./types.js";
  import "./chat.css";

  let {
    ref = $bindable(null),
    sender,
    density: densityProp,
    avatar,
    name,
    metadata,
    children,
    "aria-label": ariaLabel,
    ...restProps
  }: HTMLAttributes<HTMLElement> & {
    ref?: HTMLElement | null;
    sender: MessageSender;
    density?: Density;
    avatar?: Snippet;
    name?: Snippet;
    metadata?: Snippet;
    children: Snippet;
  } = $props();

  const list = useListContext();
  const density = $derived(densityProp ?? list?.getDensity() ?? "balanced");

  setMessageContext({
    get sender() {
      return sender;
    },
    get density() {
      return density;
    },
  });
</script>

<article
  bind:this={ref}
  {...restProps}
  data-ui-component="ai-chat-message"
  data-ui-part="root"
  data-sender={sender}
  data-density={density}
  aria-label={ariaLabel}
>
  {#if sender !== "system" && avatar}
    <div data-ui-part="avatar">
      {@render avatar()}
    </div>
  {/if}
  <div data-ui-part="content">
    {#if name}
      <div data-ui-part="name">
        {@render name()}
      </div>
    {/if}
    <div data-ui-part="bubbles">
      {@render children()}
    </div>
    {#if metadata}
      {@render metadata()}
    {/if}
  </div>
</article>
