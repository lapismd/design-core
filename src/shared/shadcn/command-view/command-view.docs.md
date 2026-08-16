# Command View

Host-agnostic searchable command surface with composable input and item parts.
Hosts drop it into a dialog, popover, or inline pane. Command View does not
export overlay chrome.

This is a project-authored native-CSS Forms family. It composes bits-ui Command
for keyboard highlight, typeahead, and `shouldFilter`, and uses the public
ScrollArea viewport for overflowing lists. It is not the same as Command:
Command ships a fixed dialog variant, a baked-in search icon, native list
overflow, and a default item check icon.

## Import

```ts
import * as CommandView from "@lapismd/design-core/shadcn/command-view";
```

## Usage

```svelte
<script lang="ts">
  import * as CommandView from "@lapismd/design-core/shadcn/command-view";
</script>

<CommandView.Root>
  <CommandView.Input placeholder="Type a command or search...">
    {#snippet start()}<!-- optional start icon -->{/snippet}
  </CommandView.Input>
  <CommandView.List>
    <CommandView.Empty>No results found.</CommandView.Empty>
    <CommandView.Group heading="Commands and actions">
      <CommandView.Item>
        <CommandView.ItemIcon><!-- leading icon --></CommandView.ItemIcon>
        <CommandView.ItemLabel>Split pane right</CommandView.ItemLabel>
        <CommandView.ItemDescription>Workspace</CommandView.ItemDescription>
        <CommandView.Shortcut>⌘+\</CommandView.Shortcut>
      </CommandView.Item>
    </CommandView.Group>
  </CommandView.List>
</CommandView.Root>
```

## Parts

- `Root` composes Command keyboard navigation. Default `shouldFilter={true}`.
- `Input` uses Input Group and a replaceable `start` snippet. The default search
  icon is an implementation fallback, not a public Lucide contract.
- `List` owns overflow through the public ScrollArea viewport
  (`--ui-command-view-list-max-height`).
- `Group` and `Empty` wrap the existing Command parts.
- `Item` lays out icon, label, optional description, and shortcut. There is no
  default check icon.

## Styling

Override `--ui-command-view-*` tokens on an ancestor. Production sources use
native CSS plus `data-ui-component` / `data-ui-part` hosts.
