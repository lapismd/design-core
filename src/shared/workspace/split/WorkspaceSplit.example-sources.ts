export const Basic = `<script lang="ts">
	import {
		WorkspaceShellController,
		createDefaultWorkspaceLayout,
		createWorkspaceSplit,
		createWorkspaceTab,
		createWorkspaceTabs,
	} from "@lapismd/design-core/workspace/core";
	import { WorkspaceSplit } from "@lapismd/design-core/workspace/split";

	const split = createWorkspaceSplit(
		"horizontal",
		[
			createWorkspaceTabs([
				createWorkspaceTab({ id: "left", title: "Left pane" }),
			]),
			createWorkspaceTabs([
				createWorkspaceTab({ id: "right", title: "Right pane" }),
			]),
		],
		[50, 50],
	);
	const layout = createDefaultWorkspaceLayout();
	layout.main = split;
	const controller = new WorkspaceShellController({ layout });
</script>

<WorkspaceSplit {controller} split={controller.layout.main}>
	{#snippet children(child)}
		{child.kind === "tabs" ? child.items[0]?.title : "Nested split"}
	{/snippet}
</WorkspaceSplit>`;
