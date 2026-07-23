<script lang="ts">
  import ExternalLink from "@lucide/svelte/icons/external-link";
  import FileWarning from "@lucide/svelte/icons/file-warning";
  import * as Alert from "@stevejuma/ui/shadcn/alert";
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
  class="bc-resource-preview"
  aria-label={accessibleLabel}
  aria-busy={loading}
>
  <div class="bc-resource-preview__header">
    <div class="bc-resource-preview__identity">
      <p class="bc-resource-preview__path">{resource?.path ?? "Resource"}</p>
      <p class="bc-resource-preview__mime">
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
        <ExternalLink data-icon="inline-start" aria-hidden="true" />
        Open
      </Button>
    {/if}
  </div>

  {#if message}
    <Alert.Root variant="destructive" class="bc-resource-preview__alert">
      <FileWarning aria-hidden="true" />
      <Alert.Description>{message}</Alert.Description>
    </Alert.Root>
  {:else if loading || !resource || !resource.url}
    <ResourceViewerSkeleton />
  {:else if isImage}
    <ScrollArea.Root class="bc-resource-preview__viewer">
      <div class="bc-resource-preview__image-wrap">
        <img
          src={resource.url}
          alt={resource.path}
          class="bc-resource-preview__image"
        />
      </div>
    </ScrollArea.Root>
  {:else if isPdf}
    <iframe
      title={resource.path}
      src={resource.url}
      class="bc-resource-preview__viewer"
    ></iframe>
  {:else if isText && resource.text !== undefined}
    <ScrollArea.Root class="bc-resource-preview__viewer">
      <pre class="bc-resource-preview__text">{resource.text}</pre>
    </ScrollArea.Root>
  {:else}
    <ResourceViewerSkeleton />
  {/if}
</section>

<style>
  .bc-resource-preview {
    display: flex;
    height: 100%;
    min-height: 0;
    flex-direction: column;
    gap: var(--ui-beancount-space-3);
    padding: var(--ui-beancount-space-4);
  }

  .bc-resource-preview__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--ui-beancount-space-3);
  }

  .bc-resource-preview__identity {
    min-width: 0;
  }

  .bc-resource-preview__path {
    margin: 0;
    overflow: hidden;
    color: var(--ui-beancount-foreground);
    font-size: var(--text-sm);
    font-weight: var(--font-weight-medium);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .bc-resource-preview__mime {
    margin: 0;
    color: var(--ui-beancount-muted-foreground);
    font-size: var(--text-xs);
  }

  :global(.bc-resource-preview__alert) {
    flex: 0 0 auto;
  }

  :global(.bc-resource-preview__viewer) {
    min-height: 0;
    flex: 1 1 auto;
    overflow: hidden;
    border: 1px solid var(--ui-beancount-border);
    border-radius: var(--radius-md);
    background: var(--ui-beancount-surface-muted);
  }

  .bc-resource-preview__image-wrap {
    padding: var(--ui-beancount-space-3);
  }

  .bc-resource-preview__image {
    display: block;
    max-width: 100%;
    margin-inline: auto;
  }

  .bc-resource-preview__text {
    margin: 0;
    padding: var(--ui-beancount-space-3);
    overflow-wrap: anywhere;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    white-space: pre-wrap;
  }
</style>
