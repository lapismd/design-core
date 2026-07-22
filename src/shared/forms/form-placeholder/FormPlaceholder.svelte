<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import "./FormPlaceholder.css";

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
