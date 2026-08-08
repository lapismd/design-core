export const Basic = `<script lang="ts">
	import { AppShell, AppShellController } from "@lapismd/design-core/workspace";

	const app = new AppShellController({
		application: {
			name: "Workspace Studio",
			version: "1.12.3",
			icon: "blocks",
		},
	});
</script>

<AppShell.Root controller={app}>
	<AppShell.StatusBar />
</AppShell.Root>`;
