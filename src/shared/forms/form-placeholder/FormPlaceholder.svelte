<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  let {
    class: className = "",
    children,
    ...rest
  }: HTMLAttributes<HTMLDivElement> & {
    children?: Snippet;
  } = $props();
</script>

<div
  class={["cv-form-placeholder", className].filter(Boolean).join(" ")}
  data-ui-part="form-placeholder"
  {...rest}
>
  {@render children?.()}
</div>

<style>
  .cv-form-placeholder {
    box-sizing: border-box;
    min-width: 0;
    border: 1px dotted var(--ui-form-border);
    border-radius: 0.35rem;
    padding: 0.75rem;
    color: var(--ui-form-muted);
    font-size: 0.875rem;
    line-height: 1.4;
  }
</style>
