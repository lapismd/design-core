export const Basic = `<script lang="ts">
	import { DropdownMenu } from "bits-ui";
	import { WorkspaceMenu } from "@lapismd/design-core/workspace/core";
	import { WorkspaceMenuItems } from "@lapismd/design-core/workspace/menu";

	const menu = new WorkspaceMenu()
		.addItem((item) => item.setTitle("Split right").onClick(() => {}))
		.addMenu("Move to", (submenu) => {
			submenu.addItem((item) => item.setTitle("Floating window").onClick(() => {}));
		})
		.addSeparator()
		.addItem((item) => item.setTitle("Close").setDisabled(true));
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>Open pane menu</DropdownMenu.Trigger>
	<DropdownMenu.Portal>
		<DropdownMenu.Content>
			<WorkspaceMenuItems {menu} />
		</DropdownMenu.Content>
	</DropdownMenu.Portal>
</DropdownMenu.Root>`;
