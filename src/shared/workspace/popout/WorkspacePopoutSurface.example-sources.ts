export const Basic = `<script lang="ts">
	import { AppShell, AppShellController } from "@lapismd/design-core/workspace";
	import {
		createDefaultWorkspaceLayout,
		createWorkspaceTab,
		createWorkspaceTabs,
	} from "@lapismd/design-core/workspace/core";
	import { WorkspaceDragState } from "@lapismd/design-core/workspace/drag";
	import { WorkspacePopoutSurface } from "@lapismd/design-core/workspace/popout";

	const tab = createWorkspaceTab({
		id: "detached",
		title: "Detached view",
		view: { type: "my-view" },
	});
	const popoutWindow = {
		id: "detached-window",
		mode: "popout" as const,
		state: "normal" as const,
		bounds: { x: 120, y: 90, width: 720, height: 480 },
		root: createWorkspaceTabs([tab], { activeItemId: tab.id }),
	};
	const layout = createDefaultWorkspaceLayout();
	layout.windows = [popoutWindow];
	const app = new AppShellController({ layout });
	const drag = new WorkspaceDragState(app.renderer);
</script>

<AppShell.Root controller={app} popoutHost={null}>
	<WorkspacePopoutSurface
		controller={app.renderer}
		window={popoutWindow}
		{drag}
	/>
</AppShell.Root>`;
