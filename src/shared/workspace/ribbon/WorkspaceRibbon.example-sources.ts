export const Basic = `<script lang="ts">
	import { WorkspaceShellController } from "@lapismd/design-core/workspace/core";
	import { WorkspaceRibbon } from "@lapismd/design-core/workspace/ribbon";

	const controller = new WorkspaceShellController();
	controller.ribbon.addItem({
		id: "files",
		label: "Files",
		icon: "files",
		onSelect: () => {},
	});
</script>

<WorkspaceRibbon {controller} />`;
