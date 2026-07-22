## Installation

```bash
pnpm ui:add dropdown-menu
```

## Usage

```html
<script lang="ts">
  import * as DropdownMenu from "@stevejuma/ui/shadcn/dropdown-menu";
</script>
```

```html
<DropdownMenu.Root>
  <DropdownMenu.Trigger>Open</DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Group>
      <DropdownMenu.Label>My Account</DropdownMenu.Label>
      <DropdownMenu.Separator />
      <DropdownMenu.Item>Profile</DropdownMenu.Item>
      <DropdownMenu.Item>Billing</DropdownMenu.Item>
      <DropdownMenu.Item>Team</DropdownMenu.Item>
      <DropdownMenu.Item>Subscription</DropdownMenu.Item>
    </DropdownMenu.Group>
  </DropdownMenu.Content>
</DropdownMenu.Root>
```

## Examples

### Checkboxes


```html
<script lang="ts">
	import * as DropdownMenu from "@stevejuma/ui/shadcn/dropdown-menu";
	import { Button } from "@stevejuma/ui/shadcn/button";

	let showStatusBar = $state(true);
	let showActivityBar = $state(false);
	let showPanel = $state(false);
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="outline">Open</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-56">
		<DropdownMenu.Group>
			<DropdownMenu.Label>Appearance</DropdownMenu.Label>
			<DropdownMenu.Separator />
			<DropdownMenu.CheckboxItem bind:checked={showStatusBar}>
				Status Bar
			</DropdownMenu.CheckboxItem>
			<DropdownMenu.CheckboxItem bind:checked={showActivityBar} disabled>
				Activity Bar
			</DropdownMenu.CheckboxItem>
			<DropdownMenu.CheckboxItem bind:checked={showPanel}>Panel</DropdownMenu.CheckboxItem>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
```

### Radio Group


```html
<script lang="ts">
	import * as DropdownMenu from "@stevejuma/ui/shadcn/dropdown-menu";
	import { Button } from "@stevejuma/ui/shadcn/button";

	let position = $state("bottom");
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="outline">Open</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-56">
		<DropdownMenu.Group>
			<DropdownMenu.Label>Panel Position</DropdownMenu.Label>
			<DropdownMenu.Separator />
			<DropdownMenu.RadioGroup bind:value={position}>
				<DropdownMenu.RadioItem value="top">Top</DropdownMenu.RadioItem>
				<DropdownMenu.RadioItem value="bottom">Bottom</DropdownMenu.RadioItem>
				<DropdownMenu.RadioItem value="right">Right</DropdownMenu.RadioItem>
			</DropdownMenu.RadioGroup>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
```

### Dialog

This example shows how to open a dialog from a dropdown menu.

```html
<script lang="ts">
	import MoreHorizontal from "@lucide/svelte/icons/more-horizontal";

	import { Button, buttonVariants } from "@stevejuma/ui/shadcn/button";
	import * as Dialog from "@stevejuma/ui/shadcn/dialog";
	import * as DropdownMenu from "@stevejuma/ui/shadcn/dropdown-menu";
	import { Input } from "@stevejuma/ui/shadcn/input";
	import { Label } from "@stevejuma/ui/shadcn/label";
	import { Textarea } from "@stevejuma/ui/shadcn/textarea";
	import * as Field from "@stevejuma/ui/shadcn/field";

	let showNewDialog = $state(false);
	let showShareDialog = $state(false);
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger class={buttonVariants({ variant: "outline", size: "icon-sm" })}>
		<MoreHorizontal />
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-40" align="end">
		<DropdownMenu.Label>File Actions</DropdownMenu.Label>
		<DropdownMenu.Group>
			<DropdownMenu.Item onSelect={() => (showNewDialog = true)}>
				New File...
			</DropdownMenu.Item>
			<DropdownMenu.Item onSelect={() => (showShareDialog = true)}>
				Share...
			</DropdownMenu.Item>
			<DropdownMenu.Item disabled>Download</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<Dialog.Root bind:open={showNewDialog}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Create New File</Dialog.Title>
			<Dialog.Description>
				Provide a name for your new file. Click create when you&apos;re done.
			</Dialog.Description>
		</Dialog.Header>
		<Field.Group class="pb-3">
			<Field.Field>
				<Field.Label for="filename">File Name</Field.Label>
				<Input id="filename" name="filename" placeholder="document.txt" />
			</Field.Field>
		</Field.Group>
		<Dialog.Footer>
			<Dialog.Close class={buttonVariants({ variant: "outline" })}>Cancel</Dialog.Close>
			<Button type="submit">Create</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={showShareDialog}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Share File</Dialog.Title>
			<Dialog.Description>
				Anyone with the link will be able to view this file.
			</Dialog.Description>
		</Dialog.Header>
		<Field.Group class="py-3">
			<Field.Field>
				<Label for="email">Email Address</Label>
				<Input id="email" name="email" type="email" placeholder="shadcn@vercel.com" />
			</Field.Field>
			<Field.Field>
				<Field.Label for="message">Message (Optional)</Field.Label>
				<Textarea id="message" name="message" placeholder="Check out this file" />
			</Field.Field>
		</Field.Group>
		<Dialog.Footer>
			<Dialog.Close class={buttonVariants({ variant: "outline" })}>Cancel</Dialog.Close>
			<Button type="submit">Send Invite</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
```

## Changelog

### 2024-10-30 Classes for DropdownMenu.SubTrigger

- Added `gap-2 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0` to the `<DropdownMenu.SubTrigger>` to automatically style icon inside the dropdown menu sub trigger.
- Removed `size-4` from the icon inside the `<DropdownMenu.SubTrigger>` since it is now handled by the parent `<DropdownMenu.SubTrigger>`.
