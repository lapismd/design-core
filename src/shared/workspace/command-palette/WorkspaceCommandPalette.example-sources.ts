export const Basic = `<script lang="ts">
	import { AppShell, AppShellController } from "@lapismd/design-core/workspace";

	const app = new AppShellController({
		commands: [
			{
				id: "workspace:split-right",
				title: "Split pane right",
				category: "Workspace",
				callback: () => true,
			},
		],
	});
</script>

<AppShell.Root controller={app}>
	<AppShell.CommandPalette />
</AppShell.Root>`;
