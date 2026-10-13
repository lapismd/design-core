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

export const Segments = `import { WorkspaceStatusItem } from "@lapismd/design-core/workspace/status-item";

<WorkspaceStatusItem item={{ id: "version", segments: ["v1.2.3"], tooltip: "About Atlas", onSelect: () => {} }} />`;
