<script lang="ts">
  import Loader2Icon from "@lucide/svelte/icons/loader-2";
  import type { SVGAttributes } from "svelte/elements";
  import { omitDataUiComponent } from "../../../lib/data-ui-host.js";

  let {
    class: className,
    role = "status",
    // we add name, color, and stroke for compatibility with different icon libraries props
    name,
    color,
    stroke,
    "aria-label": ariaLabel = "Loading",
    ...restProps
  }: SVGAttributes<SVGSVGElement> = $props();
</script>

<Loader2Icon
  {...omitDataUiComponent(restProps)}
  {role}
  {...name == null ? {} : { name }}
  {...color == null ? {} : { color }}
  {...stroke == null ? {} : { stroke }}
  aria-label={ariaLabel}
  data-ui-component="spinner"
  class={className}
/>

<style>
  :global {
    [data-ui-component="spinner"] {
      width: 1rem;
      height: 1rem;
      flex: none;
      animation: ui-spinner-spin 1s linear infinite;
    }

    @keyframes ui-spinner-spin {
      to {
        transform: rotate(360deg);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      [data-ui-component="spinner"] {
        animation: none;
      }
    }
  }
</style>
