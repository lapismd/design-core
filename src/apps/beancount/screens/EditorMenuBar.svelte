<script lang="ts">
  import { Button } from "@stevejuma/ui/shadcn/button";
  import * as DropdownMenu from "@stevejuma/ui/shadcn/dropdown-menu";

  export type EditorSourceOption = {
    /** Stable application-owned file identity. */
    id: string;
    /** Display-ready file label. */
    label: string;
  };

  export type EditorMenuAction =
    | "ask-ai"
    | "close-all-folds"
    | "find"
    | "format"
    | "go-to-line"
    | "open-all-folds"
    | "toggle-comment";

  /**
   * Controlled Editor File/Edit chrome. The application remains responsible
   * for source selection, formatting, CodeMirror commands, and AI requests.
   */
  let {
    sources = [],
    activeSourceId,
    formatOnSave = true,
    onSourceSelect = () => {},
    onFormatOnSaveChange = () => {},
    onAction = () => {},
  }: {
    sources?: readonly EditorSourceOption[];
    activeSourceId?: string;
    /** Controlled format-on-save preference owned by the editor host. */
    formatOnSave?: boolean;
    onSourceSelect?: (source: EditorSourceOption) => void;
    onFormatOnSaveChange?: (formatOnSave: boolean) => void;
    /** Requests an editor command without importing CodeMirror. */
    onAction?: (action: EditorMenuAction) => void;
  } = $props();
</script>

<div class="bc-editor-menu-bar" aria-label="Ledger editor menus">
  <DropdownMenu.Root>
    <DropdownMenu.Trigger>
      {#snippet child({ props })}
        <Button
          {...props}
          type="button"
          variant="ghost"
          size="sm"
          class="bc-editor-menu-bar__trigger"
        >
          File
        </Button>
      {/snippet}
    </DropdownMenu.Trigger>
    <DropdownMenu.Content align="start" class="bc-editor-menu-bar__content">
      <DropdownMenu.Group>
        <DropdownMenu.Label>File</DropdownMenu.Label>
        {#each sources as source (source.id)}
          <DropdownMenu.Item
            data-active={source.id === activeSourceId}
            onSelect={() => onSourceSelect(source)}
          >
            {source.label}
          </DropdownMenu.Item>
        {:else}
          <DropdownMenu.Item disabled
            >No source files available.</DropdownMenu.Item
          >
        {/each}
        <DropdownMenu.Separator />
        <DropdownMenu.CheckboxItem
          checked={formatOnSave}
          onCheckedChange={onFormatOnSaveChange}
        >
          Format on save
        </DropdownMenu.CheckboxItem>
        <DropdownMenu.Item onSelect={() => onAction("go-to-line")}>
          Go to line…
        </DropdownMenu.Item>
      </DropdownMenu.Group>
    </DropdownMenu.Content>
  </DropdownMenu.Root>

  <DropdownMenu.Root>
    <DropdownMenu.Trigger>
      {#snippet child({ props })}
        <Button
          {...props}
          type="button"
          variant="ghost"
          size="sm"
          class="bc-editor-menu-bar__trigger"
        >
          Edit
        </Button>
      {/snippet}
    </DropdownMenu.Trigger>
    <DropdownMenu.Content align="start" class="bc-editor-menu-bar__content">
      <DropdownMenu.Group>
        <DropdownMenu.Label>Edit</DropdownMenu.Label>
        <DropdownMenu.Item onSelect={() => onAction("format")}>
          Format
          <DropdownMenu.Shortcut>⌘ D</DropdownMenu.Shortcut>
        </DropdownMenu.Item>
        <DropdownMenu.Item onSelect={() => onAction("toggle-comment")}>
          Toggle comment
          <DropdownMenu.Shortcut>⌘ /</DropdownMenu.Shortcut>
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item onSelect={() => onAction("open-all-folds")}>
          Open all folds
        </DropdownMenu.Item>
        <DropdownMenu.Item onSelect={() => onAction("close-all-folds")}>
          Close all folds
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item onSelect={() => onAction("find")}>
          Find…
        </DropdownMenu.Item>
        <DropdownMenu.Item onSelect={() => onAction("ask-ai")}>
          Ask AI about selection
        </DropdownMenu.Item>
      </DropdownMenu.Group>
    </DropdownMenu.Content>
  </DropdownMenu.Root>
</div>

<style>
  .bc-editor-menu-bar {
    display: flex;
    align-items: center;
    gap: var(--ui-beancount-space-1);
    margin-inline-start: var(--ui-beancount-space-2);
  }

  :global(.bc-editor-menu-bar__trigger) {
    height: var(--ui-beancount-compact-control-height);
    padding-inline: var(--ui-beancount-space-2);
    color: var(--ui-beancount-foreground);
    font-size: var(--text-sm);
    font-weight: var(--font-weight-medium);
  }

  :global(.bc-editor-menu-bar__content) {
    min-inline-size: 12rem;
  }
</style>
