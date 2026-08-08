export const Basic = `<script lang="ts">
	import {
		WorkspaceShellController,
		createDefaultWorkspaceLayout,
	} from "@lapismd/design-core/workspace/core";
	import { WorkspaceViewHeader } from "@lapismd/design-core/workspace/view-header";

	const layout = createDefaultWorkspaceLayout();
	const pane = layout.main.kind === "tabs" ? layout.main : null;
	const tab = pane?.items[0]?.kind === "tab" ? pane.items[0] : null;
	const controller = new WorkspaceShellController({ layout });
</script>

{#if pane && tab}
	<WorkspaceViewHeader {controller} {tab} hostId="root" paneId={pane.id} />
{/if}`;
