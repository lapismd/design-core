export const Inline = `<script lang="ts">
	import Columns2Icon from "@lucide/svelte/icons/columns-2";
	import PanelRightIcon from "@lucide/svelte/icons/panel-right";
	import SettingsIcon from "@lucide/svelte/icons/settings";
	import * as CommandView from "@lapismd/design-core/shadcn/command-view";
</script>

<CommandView.Root>
	<CommandView.Input placeholder="Type a command or search..." />
	<CommandView.List>
		<CommandView.Empty>No results found.</CommandView.Empty>
		<CommandView.Group heading="Commands and actions">
			<CommandView.Item value="split-right">
				<CommandView.ItemIcon><Columns2Icon /></CommandView.ItemIcon>
				<CommandView.ItemLabel>Split pane right</CommandView.ItemLabel>
				<CommandView.ItemDescription>Workspace</CommandView.ItemDescription>
				<CommandView.Shortcut>⌘+\\</CommandView.Shortcut>
			</CommandView.Item>
			<CommandView.Item value="toggle-sidebar">
				<CommandView.ItemIcon><PanelRightIcon /></CommandView.ItemIcon>
				<CommandView.ItemLabel>Toggle right sidebar</CommandView.ItemLabel>
				<CommandView.ItemDescription>Workspace</CommandView.ItemDescription>
			</CommandView.Item>
			<CommandView.Item value="settings">
				<CommandView.ItemIcon><SettingsIcon /></CommandView.ItemIcon>
				<CommandView.ItemLabel>Open settings</CommandView.ItemLabel>
				<CommandView.ItemDescription>Application</CommandView.ItemDescription>
				<CommandView.Shortcut>⌘+,</CommandView.Shortcut>
			</CommandView.Item>
		</CommandView.Group>
	</CommandView.List>
</CommandView.Root>`;

export const InDialog = `<script lang="ts">
	import * as CommandView from "@lapismd/design-core/shadcn/command-view";
	import * as Dialog from "@lapismd/design-core/shadcn/dialog";
	import { Button } from "@lapismd/design-core/shadcn/button";

	let open = $state(false);
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		{#snippet child({ props })}
			<Button {...props}>Open command view</Button>
		{/snippet}
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Command view</Dialog.Title>
			<Dialog.Description>Search commands in a dialog host.</Dialog.Description>
		</Dialog.Header>
		<CommandView.Root>
			<CommandView.Input placeholder="Type a command or search..." />
			<CommandView.List>
				<CommandView.Empty>No results found.</CommandView.Empty>
				<CommandView.Group heading="Commands and actions">
					<CommandView.Item value="split-right">
						<CommandView.ItemLabel>Split pane right</CommandView.ItemLabel>
					</CommandView.Item>
				</CommandView.Group>
			</CommandView.List>
		</CommandView.Root>
	</Dialog.Content>
</Dialog.Root>`;

export const InPopover = `<script lang="ts">
	import * as CommandView from "@lapismd/design-core/shadcn/command-view";
	import * as Popover from "@lapismd/design-core/shadcn/popover";
	import { Button } from "@lapismd/design-core/shadcn/button";

	let open = $state(false);
</script>

<Popover.Root bind:open>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="outline">Open command view</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content style="--ui-popover-width: 22rem">
		<CommandView.Root>
			<CommandView.Input placeholder="Type a command or search..." />
			<CommandView.List>
				<CommandView.Empty>No results found.</CommandView.Empty>
				<CommandView.Group heading="Commands and actions">
					<CommandView.Item value="split-right">
						<CommandView.ItemLabel>Split pane right</CommandView.ItemLabel>
					</CommandView.Item>
				</CommandView.Group>
			</CommandView.List>
		</CommandView.Root>
	</Popover.Content>
</Popover.Root>`;

export const CustomStartIcon = `<script lang="ts">
	import TerminalIcon from "@lucide/svelte/icons/terminal";
	import * as CommandView from "@lapismd/design-core/shadcn/command-view";
</script>

<CommandView.Root>
	<CommandView.Input placeholder="Type a command or search...">
		{#snippet start()}
			<TerminalIcon />
		{/snippet}
	</CommandView.Input>
	<CommandView.List>
		<CommandView.Empty>No results found.</CommandView.Empty>
		<CommandView.Group heading="Commands and actions">
			<CommandView.Item value="split-right">
				<CommandView.ItemLabel>Split pane right</CommandView.ItemLabel>
			</CommandView.Item>
		</CommandView.Group>
	</CommandView.List>
</CommandView.Root>`;

export const OverflowingResults = `<script lang="ts">
	import * as CommandView from "@lapismd/design-core/shadcn/command-view";

	const commands = Array.from({ length: 24 }, (_, index) => ({
		id: \`overflow-\${index + 1}\`,
		title: \`Overflow command \${index + 1}\`,
	}));
</script>

<CommandView.Root>
	<CommandView.Input placeholder="Type a command or search..." />
	<CommandView.List>
		<CommandView.Empty>No results found.</CommandView.Empty>
		<CommandView.Group heading="Commands and actions">
			{#each commands as command (command.id)}
				<CommandView.Item value={command.id}>
					<CommandView.ItemLabel>{command.title}</CommandView.ItemLabel>
				</CommandView.Item>
			{/each}
		</CommandView.Group>
	</CommandView.List>
</CommandView.Root>`;
