export const Basic = `<script lang="ts">
	import { WorkspaceShellController } from "@lapismd/design-core/workspace/core";
	import { WorkspaceStatusBar } from "@lapismd/design-core/workspace/status-bar";

	const controller = new WorkspaceShellController();
	controller.statusBar.addItem({
		id: "sync",
		label: "Synced",
		icon: "cloud-check",
		onSelect: () => {},
	});
</script>

<WorkspaceStatusBar {controller} />`;
