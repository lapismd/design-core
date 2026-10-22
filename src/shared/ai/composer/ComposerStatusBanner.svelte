<script lang="ts">
  import type { Snippet } from "svelte";
  import TriangleAlertIcon from "@lucide/svelte/icons/triangle-alert";
  import InfoIcon from "@lucide/svelte/icons/info";
  import CheckIcon from "@lucide/svelte/icons/check";
  import type { ComposerStatus } from "../types.js";
  import "./composer-status.css";
  let {
    status,
    position = "top",
    children,
  }: {
    status: ComposerStatus;
    /** Custom content owns its accessible status announcement. */
    children?: Snippet;
    /** Standalone keeps all corners rounded without overlapping adjacent controls. */
    position?: "top" | "bottom" | "standalone";
  } = $props();
</script>

<div
  data-ui-component="composer-status-banner"
  data-ui-part="status"
  data-position={position}
  data-status={status.type}
  role={children ? undefined : status.type === "error" ? "alert" : "status"}
>
  {#if children}{@render children()}{:else}
    {#if status.type === "info"}<InfoIcon
        aria-hidden="true"
      />{:else if status.type === "success"}<CheckIcon
        aria-hidden="true"
      />{:else}<TriangleAlertIcon aria-hidden="true" />{/if}
    <span>{status.message ?? status.type}</span>
  {/if}
</div>
