## Installation

```bash
pnpm ui:add dialog
```

## Usage

```html
<script lang="ts">
  import * as Dialog from "@lapismd/design-core/shadcn/dialog";
</script>
```

```html
<Dialog.Root>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Are you sure absolutely sure?</Dialog.Title>
      <Dialog.Description>
        This action cannot be undone. This will permanently delete your account
        and remove your data from our servers.
      </Dialog.Description>
    </Dialog.Header>
  </Dialog.Content>
</Dialog.Root>
```

## Examples

### Custom close button

<!-- Need to convert to svelte component

```html
<script lang="ts">
	import { buttonVariants } from "@lapismd/design-core/shadcn/button";
	import * as Dialog from "@lapismd/design-core/shadcn/dialog";
	import { Input } from "@lapismd/design-core/shadcn/input";
	import { Label } from "@lapismd/design-core/shadcn/label";
</script>

<Dialog.Root>
	<Dialog.Trigger class={buttonVariants({ variant: "outline" })}>Share</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Share link</Dialog.Title>
			<Dialog.Description>
				Anyone who has this link will be able to view this.
			</Dialog.Description>
		</Dialog.Header>
		<div class="flex items-center gap-2">
			<div class="grid flex-1 gap-2">
				<Label for="link" class="sr-only">Link</Label>
				<Input id="link" defaultValue="https://shadcn-svelte.com/docs/installation" />
			</div>
		</div>
		<Dialog.Footer class="sm:justify-start">
			<Dialog.Close class={buttonVariants({ variant: "secondary" })}>Close</Dialog.Close>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
```

## Notes

To use the `Dialog` component from within a `Context Menu` or `Dropdown Menu`, you must encase the `Context Menu` or
`Dropdown Menu` component in the `Dialog` component.

```tsx
<Dialog>
  <ContextMenu>
    <ContextMenuTrigger>Right click</ContextMenuTrigger>
    <ContextMenuContent>
      <ContextMenuItem>Open</ContextMenuItem>
      <ContextMenuItem>Download</ContextMenuItem>
      <DialogTrigger>
        {#snippet child({ props })}
          <ContextMenuItem {...props}>
            <span>Delete</span>
          </ContextMenuItem>
        {/snippet}
      </DialogTrigger>
    </ContextMenuContent>
  </ContextMenu>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you absolutely sure?</DialogTitle>
      <DialogDescription>
        This action cannot be undone. Are you sure you want to permanently
        delete this file from our servers?
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button type="submit">Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```
-->
