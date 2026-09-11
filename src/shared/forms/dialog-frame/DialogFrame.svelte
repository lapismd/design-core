<script lang="ts" module>
  import type { ComponentProps, Snippet } from "svelte";
  import type * as DialogTypes from "../../shadcn/dialog/index.js";

  export type DialogFrameSize = "compact" | "form" | "wide";
  export type DialogFrameProps = Omit<
    ComponentProps<typeof DialogTypes.Content>,
    "children" | "title" | "showCloseButton" | "dataUiComponent" | "dataUiPart"
  > & {
    title: string | Snippet;
    description?: string | Snippet;
    descriptionHidden?: boolean;
    size?: DialogFrameSize;
    busy?: boolean;
    closeLabel?: string;
    sidebar?: Snippet;
    headerActions?: Snippet;
    footer?: Snippet;
    children: Snippet;
    bodyPadding?: "default" | "none";
  };
</script>

<script lang="ts">
  import * as Dialog from "../../shadcn/dialog/index.js";
  import { Button } from "../../shadcn/button/index.js";
  import { ScrollArea } from "../../shadcn/scroll-area/index.js";
  import XIcon from "@lucide/svelte/icons/x";
  import "./DialogFrame.css";

  let {
    title,
    description,
    descriptionHidden = false,
    size = "form",
    busy = false,
    closeLabel = "Close",
    sidebar,
    headerActions,
    footer,
    children,
    bodyPadding = "default",
    ref = $bindable(null),
    onInteractOutside,
    onEscapeKeydown,
    ...contentProps
  }: DialogFrameProps = $props();
</script>

<Dialog.Content
  {...contentProps}
  bind:ref
  showCloseButton={false}
  data-ui-dialog-frame=""
  data-frame-size={size}
  data-frame-padding={bodyPadding}
  onInteractOutside={(event) => {
    if (busy) event.preventDefault();
    else onInteractOutside?.(event);
  }}
  onEscapeKeydown={(event) => {
    if (busy) event.preventDefault();
    else onEscapeKeydown?.(event);
  }}
>
  <div data-ui-part="dialog-frame-header">
    <div data-ui-part="dialog-frame-heading">
      <Dialog.Title
        >{#if typeof title === "string"}{title}{:else}{@render title()}{/if}</Dialog.Title
      >
      {#if description}<Dialog.Description
          class={descriptionHidden ? "sr-only" : undefined}
          >{#if typeof description === "string"}{description}{:else}{@render description()}{/if}</Dialog.Description
        >{/if}
    </div>
    {@render headerActions?.()}
    <Dialog.Close>
      {#snippet child({ props })}
        <Button
          {...props}
          variant="ghost"
          size="icon-sm"
          disabled={busy}
          aria-label={closeLabel}
          data-ui-part="dialog-frame-close"><XIcon aria-hidden="true" /></Button
        >
      {/snippet}
    </Dialog.Close>
  </div>
  <div data-ui-part="dialog-frame-layout" data-has-sidebar={Boolean(sidebar)}>
    {#if sidebar}<aside data-ui-part="dialog-frame-sidebar">
        {@render sidebar()}
      </aside>{/if}
    <div data-ui-part="dialog-frame-main">
      <ScrollArea class="ui-dialog-frame-scroll" type="always">
        <div data-ui-part="dialog-frame-body">{@render children()}</div>
      </ScrollArea>
      {#if footer}<Dialog.Footer data-ui-part="dialog-frame-footer"
          >{@render footer()}</Dialog.Footer
        >{/if}
    </div>
  </div>
</Dialog.Content>
