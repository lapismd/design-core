export const Basic = `<script lang="ts">
	import {
		WorkspaceShellController,
		createDefaultWorkspaceLayout,
		createWorkspaceTab,
		createWorkspaceTabs,
	} from "@lapismd/design-core/workspace/core";
	import { WorkspaceSidebar } from "@lapismd/design-core/workspace/sidebar";

	const files = createWorkspaceTab({
		id: "files",
		title: "Files",
		icon: "files",
		view: { type: "files" },
	});
	const pane = createWorkspaceTabs([files], { activeItemId: files.id });
	const layout = createDefaultWorkspaceLayout();
	layout.right = { open: true, size: 320, root: pane };
	const controller = new WorkspaceShellController({ layout });
</script>

<WorkspaceSidebar {controller} side="right" />`;
