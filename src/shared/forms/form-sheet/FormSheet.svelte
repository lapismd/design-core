<script lang="ts">
  import "./FormSheet.css";
  import ChevronsDownUpIcon from "@lucide/svelte/icons/chevrons-down-up";
  import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
  import XIcon from "@lucide/svelte/icons/x";
  import type { Snippet } from "svelte";
  import { Button } from "@lapismd/design-core/shadcn/button";
  import * as Sheet from "@lapismd/design-core/shadcn/sheet";

  let {
    open = $bindable(false),
    title,
    description,
    collapsedAll = undefined,
    onToggleCollapse = undefined,
    onOpenChange = undefined,
    titleLeading,
    titleSuffix,
    actions,
    bodyDensity = "default",
    class: className,
    children,
  }: {
    /** Whether the sheet is visible. Bind this to the workflow's state. */
    open?: boolean;
    /** Concise, visible name of the editing workflow. */
    title: string;
    /** Accessible summary of the workflow, announced by the dialog. */
    description: string;
    /** The current state of every descendant disclosure, when the form is collapsible. */
    collapsedAll?: boolean;
    /** Collapses or expands every descendant disclosure. Required with `collapsedAll`. */
    onToggleCollapse?: () => void;
    /** Called when the user opens or closes the sheet. */
    onOpenChange?: (open: boolean) => void;
    /** Optional visual context before the title, such as an avatar. */
    titleLeading?: Snippet;
    /** Optional compact context after the title, such as a record count. */
    titleSuffix?: Snippet;
    /** Optional workflow-specific controls placed before collapse and close. */
    actions?: Snippet;
    /** Body padding density. Prefer CSS tokens over custom class overrides. */
    bodyDensity?: "default" | "dense";
    class?: string;
    children: Snippet;
  } = $props();

  let titleElement = $state<HTMLElement | null>(null);
  const collapseLabel = $derived(collapsedAll ? "Expand all" : "Collapse all");
  const hasCollapseControl = $derived(
    collapsedAll !== undefined && onToggleCollapse !== undefined,
  );

  function handleOpenChange(next: boolean) {
    open = next;
    onOpenChange?.(next);
  }
</script>

<div data-ui-component="form-sheet" data-ui-part="form-sheet">
  <Sheet.Root bind:open onOpenChange={handleOpenChange}>
    <Sheet.Content
      side="right"
      showCloseButton={false}
      class={className}
      onOpenAutoFocus={(event) => {
        event.preventDefault();
        titleElement?.focus();
      }}
    >
      <Sheet.Header>
        <div
          data-ui-component="form-sheet"
          data-ui-part="form-sheet-title-group"
        >
          {#if titleLeading}
            {@render titleLeading()}
          {/if}
          <Sheet.Title
            bind:ref={titleElement}
            tabindex={-1}
            class="form-sheet-title"
          >
            {title}
          </Sheet.Title>
          {#if titleSuffix}
            {@render titleSuffix()}
          {/if}
        </div>
        <Sheet.Description class="sr-only">{description}</Sheet.Description>
        <div data-ui-component="form-sheet" data-ui-part="form-sheet-actions">
          {#if actions}
            {@render actions()}
          {/if}
          {#if hasCollapseControl}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              class="ui-form-sheet__icon-button"
              aria-label={collapseLabel}
              title={collapseLabel}
              onclick={onToggleCollapse}
            >
              {#if collapsedAll}
                <ChevronsUpDownIcon aria-hidden="true" />
              {:else}
                <ChevronsDownUpIcon aria-hidden="true" />
              {/if}
            </Button>
          {/if}
          <Sheet.Close
            class="ui-form-sheet__close"
            aria-label="Close"
            title="Close"
          >
            <XIcon aria-hidden="true" />
            <span class="sr-only">Close</span>
          </Sheet.Close>
        </div>
      </Sheet.Header>

      <div
        data-ui-component="form-sheet"
        data-ui-part="form-sheet-body"
        data-density={bodyDensity}
      >
        {@render children()}
      </div>
    </Sheet.Content>
  </Sheet.Root>
</div>
