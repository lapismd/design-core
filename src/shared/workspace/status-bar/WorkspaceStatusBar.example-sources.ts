export const Basic = `<script lang="ts">
	import { WorkspaceShellController } from "@lapismd/design-core/workspace/core";
	import { WorkspaceStatusBar } from "@lapismd/design-core/workspace/status-bar";

	const controller = new WorkspaceShellController();
	controller.statusBar.addItem({
		id: "sync",
		label: "Synced",
		icon: "cloud-check",
		onSelect: () => {},
	});
</script>

<WorkspaceStatusBar {controller} />`;

export const Footer = `import { AppShell } from "@lapismd/design-core/workspace/app-shell";
import { notificationsPlugin } from "@lapismd/design-core/workspace/plugins/notifications";
import { AppShellController } from "@lapismd/design-core/workspace/core";
const app = new AppShellController({ plugins: [notificationsPlugin()] });
app.status.addItem({ id: "repository", align: "left", label: "notes-vault", icon: "git-branch" });
<AppShell.Root controller={app}><AppShell.Surface displayMode="desktop" /></AppShell.Root>`;
