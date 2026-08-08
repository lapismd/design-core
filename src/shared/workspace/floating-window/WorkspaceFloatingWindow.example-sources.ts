export const Basic = `<script lang="ts">
	import {
		WorkspaceShellController,
		createDefaultWorkspaceLayout,
		createWorkspaceTab,
	} from "@lapismd/design-core/workspace/core";
	import { WorkspaceDragState } from "@lapismd/design-core/workspace/drag";
	import { WorkspaceFloatingWindow } from "@lapismd/design-core/workspace/floating-window";

	const controller = new WorkspaceShellController({
		layout: createDefaultWorkspaceLayout(),
	});
	const workspaceWindow = controller.openWindow(
		createWorkspaceTab({
			id: "floating-reference",
			title: "Floating reference",
			view: { type: "my-view" },
		}),
		"floating",
		{ x: 72, y: 48, width: 520, height: 360 },
	)!;
	const drag = new WorkspaceDragState(controller);
	let boundsRoot: HTMLElement | undefined = $state();
</script>

<div bind:this={boundsRoot}>
	<WorkspaceFloatingWindow {controller} window={workspaceWindow} {drag} {boundsRoot} />
</div>`;
