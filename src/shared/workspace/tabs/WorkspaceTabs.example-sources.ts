export const Basic = `<script lang="ts">
	import {
		WorkspaceShellController,
		createDefaultWorkspaceLayout,
		createWorkspaceTab,
		createWorkspaceTabs,
	} from "@lapismd/design-core/workspace/core";
	import { WorkspaceTabs } from "@lapismd/design-core/workspace/tabs";

	const pane = createWorkspaceTabs([
		createWorkspaceTab({ id: "welcome", title: "Welcome.md", icon: "book-open" }),
	]);
	const layout = createDefaultWorkspaceLayout();
	layout.main = pane;
	const controller = new WorkspaceShellController({ layout });
</script>

<WorkspaceTabs {controller} {pane} sidebarToggleSides={["left", "right"]} />`;
