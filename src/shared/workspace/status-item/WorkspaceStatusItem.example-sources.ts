export const Basic = `<script lang="ts">
	import type { WorkspaceStatusItem as WorkspaceStatusItemModel } from "@lapismd/design-core/workspace/core";
	import { WorkspaceStatusItem } from "@lapismd/design-core/workspace/status-item";

	const item: WorkspaceStatusItemModel = {
		id: "ready",
		icon: "circle-check",
		label: "Framework ready",
		tooltip: "Workspace framework ready",
		onSelect: () => {},
	};
</script>

<WorkspaceStatusItem {item} />`;
