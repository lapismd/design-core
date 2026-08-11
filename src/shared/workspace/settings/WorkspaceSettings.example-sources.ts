export const Basic = `<script lang="ts">
	import { AppSettings, AppShellController } from "@lapismd/design-core/workspace";

	const app = new AppShellController();
</script>

<AppSettings.Root controller={app.settings} {app}>
	<AppSettings.Search />
	<AppSettings.Navigation />
	<AppSettings.Content />
</AppSettings.Root>`;

export const ToggleTable = `<script lang="ts">
	import {
		AppSettings,
		WorkspaceSettingsController,
		type WorkspaceSettingsSection,
	} from "@lapismd/design-core/workspace";

	const sections: WorkspaceSettingsSection[] = [{
		id: "markdown",
		title: "Markdown",
		fields: [{
			id: "markdown.features",
			type: "group",
			presentation: "toggle-table",
			title: "Features",
			description: "Choose which Markdown capabilities are available.",
			fields: [
				{
					id: "markdown.features.formatting",
					type: "boolean",
					title: "Formatting",
					description: "Show formatting actions.",
					default: true,
				},
			],
		}],
	}];
	const controller = new WorkspaceSettingsController({ sections });
</script>

<AppSettings.Root {controller}>
	<AppSettings.Navigation />
	<AppSettings.Content />
</AppSettings.Root>`;
