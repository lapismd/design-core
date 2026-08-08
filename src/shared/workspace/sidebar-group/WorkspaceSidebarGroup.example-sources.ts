export const Basic = `<script lang="ts">
	import {
		WorkspaceShellController,
		createDefaultWorkspaceLayout,
		createWorkspaceTab,
		createWorkspaceTabs,
		type WorkspaceSidebarGroup,
	} from "@lapismd/design-core/workspace/core";
	import { WorkspaceSidebarGroup as WorkspaceSidebarGroupComponent } from "@lapismd/design-core/workspace/sidebar-group";

	const outline = createWorkspaceTab({
		id: "outline",
		title: "Outline",
		icon: "list-tree",
		view: { type: "outline" },
	});
	const group: WorkspaceSidebarGroup = {
		kind: "sidebar-group",
		id: "reference",
		title: "Reference panels",
		icon: "panel-top",
		tabs: [outline],
		hiddenTabIds: [],
		collapsedByTabId: { [outline.id]: false },
		panelSizesByTabId: { [outline.id]: 100 },
	};
	const pane = createWorkspaceTabs([group], { activeItemId: group.id });
	const layout = createDefaultWorkspaceLayout();
	layout.right = { open: true, size: 320, root: pane };
	const controller = new WorkspaceShellController({ layout });
</script>

<WorkspaceSidebarGroupComponent {controller} {group} {pane} side="right" />`;
