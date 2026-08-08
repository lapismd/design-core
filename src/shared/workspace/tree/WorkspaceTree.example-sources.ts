export const Basic = `<script lang="ts">
	import {
		WorkspaceShellController,
		createDefaultWorkspaceLayout,
		createWorkspaceSplit,
		createWorkspaceTab,
		createWorkspaceTabs,
	} from "@lapismd/design-core/workspace/core";
	import { WorkspaceTree } from "@lapismd/design-core/workspace/tree";

	const left = createWorkspaceTabs([
		createWorkspaceTab({ id: "home", title: "Framework home", icon: "layout-template" }),
	]);
	const right = createWorkspaceTabs(
		[createWorkspaceTab({ id: "reference", title: "Reference", icon: "book-open" })],
		{ presentation: "stacked" },
	);
	const root = createWorkspaceSplit("horizontal", [left, right], [55, 45]);
	const layout = createDefaultWorkspaceLayout();
	layout.main = root;
	const controller = new WorkspaceShellController({ layout });
</script>

<WorkspaceTree {controller} node={controller.layout.main} />`;
