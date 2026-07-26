<script lang="ts">
  import type { SVGAttributes } from "svelte/elements";
  import { getWorkspaceIconSvg, resolveWorkspaceIcon } from "./icons.js";
  import "./WorkspaceIcon.css";

  let {
    name,
    class: className,
    "data-icon": dataIcon,
    ...props
  }: {
    /** Serializable Lucide icon name or a name registered by the application. */
    name?: string;
    class?: string;
    "data-icon"?: string;
  } & SVGAttributes<SVGElement> = $props();

  let Icon = $derived(resolveWorkspaceIcon(name));
  let svg = $derived(getWorkspaceIconSvg(name, className, dataIcon));
</script>

{#if Icon}
  <Icon
    aria-hidden="true"
    class={["ui-workspace-icon", className].filter(Boolean).join(" ")}
    data-ui-component="workspace-icon"
    data-icon={dataIcon}
    {...props}
  />
{:else}
  <span
    data-ui-component="workspace-icon"
    data-ui-part="icon"
    data-workspace-icon={name || "file"}
  >
    {@html svg}
  </span>
{/if}
