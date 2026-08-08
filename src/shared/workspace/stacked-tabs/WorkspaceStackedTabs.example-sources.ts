export const Basic = `<script lang="ts">
	import {
		WorkspaceShellController,
		createDefaultWorkspaceLayout,
		createWorkspaceTab,
		createWorkspaceTabs,
	} from "@lapismd/design-core/workspace/core";
	import { WorkspaceStackedTabs } from "@lapismd/design-core/workspace/stacked-tabs";

	const pane = createWorkspaceTabs(
		[
			createWorkspaceTab({
				id: "home",
				title: "Framework home",
				icon: "layout-template",
			}),
			createWorkspaceTab({
				id: "reference",
				title: "Reference",
				icon: "book-open",
			}),
		],
		{ presentation: "stacked", activeItemId: "home" },
	);
	const layout = createDefaultWorkspaceLayout();
	layout.main = pane;
	const controller = new WorkspaceShellController({ layout });
</script>

<WorkspaceStackedTabs {controller} {pane} />`;
