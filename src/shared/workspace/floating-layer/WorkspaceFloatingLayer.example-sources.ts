export const Basic = `<script lang="ts">
	import {
		WorkspaceShellController,
		createDefaultWorkspaceLayout,
		createWorkspaceTab,
	} from "@lapismd/design-core/workspace/core";
	import { WorkspaceFloatingLayer } from "@lapismd/design-core/workspace/floating-layer";

	const controller = new WorkspaceShellController({
		layout: createDefaultWorkspaceLayout(),
	});
	controller.openWindow(
		createWorkspaceTab({
			id: "reference",
			title: "Reference",
			view: { type: "my-view" },
		}),
		"floating",
		{ x: 96, y: 64, width: 480, height: 340 },
	);
	let boundsRoot: HTMLElement | undefined = $state();
</script>

<div bind:this={boundsRoot}>
	<WorkspaceFloatingLayer {controller} {boundsRoot} />
</div>`;
