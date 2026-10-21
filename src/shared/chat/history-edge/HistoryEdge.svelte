<script lang="ts">
  import { Button } from "../../shadcn/button/index.js";
  import { Spinner } from "../../shadcn/spinner/index.js";
  import * as Empty from "../../shadcn/empty/index.js";
  import MessageSquareIcon from "@lucide/svelte/icons/message-square";
  let {
    state = "idle",
    onLoad,
    label,
  }: {
    state?: "idle" | "loading" | "retry" | "empty";
    onLoad?: (() => void) | undefined;
    label?: string;
  } = $props();
  import "./history-edge.css";
</script>

{#if state === "empty"}<Empty.Root
    ><Empty.Header
      ><Empty.Media variant="icon"
        ><MessageSquareIcon aria-hidden="true" /></Empty.Media
      ><Empty.Title>{label ?? "No captured messages."}</Empty.Title
      ></Empty.Header
    ></Empty.Root
  >
{:else}<div
    class="chat-history-loading"
    data-ui-component="history-edge"
    role={state === "loading" ? "status" : undefined}
    aria-label={state === "loading" ? "Loading previous messages" : undefined}
  >
    <Button
      variant="ghost"
      size="xs"
      disabled={state === "loading" || !onLoad}
      onclick={onLoad}
    >
      {#if state === "loading"}<Spinner
          data-icon="inline-start"
          role="presentation"
          aria-hidden="true"
        />{/if}
      {label ??
        (state === "loading"
          ? "Loading previous messages"
          : state === "retry"
            ? "Retry loading history"
            : "Load previous messages")}
    </Button>
  </div>{/if}
