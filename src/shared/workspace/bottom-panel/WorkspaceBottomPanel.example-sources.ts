export const Basic = `<script lang="ts">
	import {
		WorkspaceShellController,
		createDefaultWorkspaceLayout,
		createWorkspaceTab,
		createWorkspaceTabs,
	} from "@lapismd/design-core/workspace/core";
	import { WorkspaceBottomPanel } from "@lapismd/design-core/workspace/bottom-panel";

	const terminal = createWorkspaceTab({
		id: "terminal",
		title: "Terminal",
		icon: "terminal",
		view: { type: "terminal" },
	});
	const pane = createWorkspaceTabs([terminal], { activeItemId: terminal.id });
	const layout = createDefaultWorkspaceLayout();
	layout.bottom = { open: true, size: 288, root: pane };
	const controller = new WorkspaceShellController({ layout });
</script>

<WorkspaceBottomPanel {controller} />`;
