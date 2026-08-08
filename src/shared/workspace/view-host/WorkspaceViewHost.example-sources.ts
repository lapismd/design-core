export const Basic = `<script lang="ts">
	import {
		WorkspaceShellController,
		createDefaultWorkspaceLayout,
		createWorkspaceTab,
		createWorkspaceTabs,
	} from "@lapismd/design-core/workspace/core";
	import { WorkspaceViewHost } from "@lapismd/design-core/workspace/view-host";

	const tab = createWorkspaceTab({
		id: "editor",
		title: "Editor",
		view: { type: "my-editor" },
	});
	const pane = createWorkspaceTabs([tab], { activeItemId: tab.id });
	const layout = createDefaultWorkspaceLayout();
	layout.main = pane;
	const controller = new WorkspaceShellController({ layout });
</script>

<WorkspaceViewHost {controller} {tab} hostId="root" paneId={pane.id} />`;
