<script lang="ts">
  import FileTextIcon from "@lucide/svelte/icons/file-text";
  import { cn } from "../../../lib/utils.js";
  import { resolveFileTypeIcon } from "./file-type-icon.js";
  import type { FileTypeIconProps } from "./file-type-icon.types.js";
  import "./file-type-icon.css";

  let {
    path,
    title,
    size = "md",
    class: className,
    ...props
  }: FileTypeIconProps = $props();
  const icon = $derived(resolveFileTypeIcon(path));
</script>

<span
  {...props}
  class={cn("ui-file-type-icon", className)}
  data-ui-component="file-type-icon"
  data-ui-part="icon"
  data-slot="file-type-icon"
  data-size={size}
  data-file-type-icon={icon.name}
  role={title ? "img" : undefined}
  aria-label={title || undefined}
  aria-hidden={title ? undefined : true}
  title={title || undefined}
>
  {#if icon.svg}{@html icon.svg}{:else}<FileTextIcon aria-hidden="true" />{/if}
</span>
