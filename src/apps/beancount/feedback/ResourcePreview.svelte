<script lang="ts">
  import ExternalLink from "@lucide/svelte/icons/external-link";
  import FileWarning from "@lucide/svelte/icons/file-warning";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import * as ScrollArea from "@stevejuma/ui/shadcn/scroll-area";
  import ResourceViewerSkeleton from "./ResourceViewerSkeleton.svelte";

  /** A resolved resource ready for presentation in the workspace. */
  export type ResourcePreviewItem = {
    path: string;
    mimeType: string;
    /** Resolved object or remote URL, supplied by the application. */
    url?: string;
    /** Preloaded text for a text-like resource. */
    text?: string;
  };

  /**
   * Presents a resolved workspace resource. Applications own route lookup,
   * URL creation/revocation, text loading, and the external-open action.
   */
  let {
    resource,
    error,
    loading = false,
    ariaLabel,
    unavailableMessage = "This resource is not referenced by the active workspace.",
    onOpen,
  }: {
    resource?: ResourcePreviewItem;
    error?: string;
    loading?: boolean;
    /** Defaults to the current resource path so repeated previews remain distinct landmarks. */
    ariaLabel?: string;
    unavailableMessage?: string;
    onOpen?: (resource: ResourcePreviewItem) => void;
  } = $props();

  const isImage = $derived(Boolean(resource?.mimeType.startsWith("image/")));
  const isPdf = $derived(resource?.mimeType === "application/pdf");
  const isText = $derived(
    Boolean(
      resource &&
        (resource.mimeType.startsWith("text/") ||
          /(?:json|yaml|csv)/.test(resource.mimeType)),
    ),
  );
  const message = $derived(
    error ?? (!resource && !loading ? unavailableMessage : ""),
  );
  const accessibleLabel = $derived(
    ariaLabel ?? resource?.path ?? "Resource preview",
  );
</script>

<section
  class="flex h-full min-h-0 flex-col gap-3 p-4"
  aria-label={accessibleLabel}
  aria-busy={loading}
>
  <div class="flex items-center justify-between gap-3">
    <div class="min-w-0">
      <p class="truncate text-sm font-medium">{resource?.path ?? "Resource"}</p>
      <p class="text-muted-foreground text-xs">
        {resource?.mimeType ?? "Unavailable"}
      </p>
    </div>
    {#if resource?.url && onOpen}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onclick={() => onOpen(resource!)}
      >
        <ExternalLink class="size-4" aria-hidden="true" />
        Open
      </Button>
    {/if}
  </div>

  {#if message}
    <div
      class="border-destructive/30 text-destructive flex items-center gap-2 rounded-md border p-3 text-sm"
      role="alert"
    >
      <FileWarning class="size-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  {:else if loading || !resource || !resource.url}
    <ResourceViewerSkeleton />
  {:else if isImage}
    <ScrollArea.Root class="bg-muted min-h-0 flex-1 rounded-md border">
      <div class="p-3">
        <img
          src={resource.url}
          alt={resource.path}
          class="mx-auto max-w-full"
        />
      </div>
    </ScrollArea.Root>
  {:else if isPdf}
    <iframe
      title={resource.path}
      src={resource.url}
      class="bg-muted min-h-0 flex-1 rounded-md border"
    ></iframe>
  {:else if isText && resource.text !== undefined}
    <ScrollArea.Root class="bg-muted min-h-0 flex-1 rounded-md border">
      <pre
        class="p-3 font-mono text-sm break-words whitespace-pre-wrap">{resource.text}</pre>
    </ScrollArea.Root>
  {:else}
    <ResourceViewerSkeleton />
  {/if}
</section>
