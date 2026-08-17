export const Basic = `<script lang="ts">
	import { AppSettings, AppShellController } from "@lapismd/design-core/workspace";

	const app = new AppShellController();
</script>

<AppSettings.Root controller={app.settings} {app}>
	<AppSettings.Search />
	<AppSettings.Navigation />
	<AppSettings.Content />
</AppSettings.Root>`;

export const AllSupported = `<script lang="ts">
	import {
		AppSettings,
		WorkspaceSettingsController,
		type WorkspaceSettingsSection,
	} from "@lapismd/design-core/workspace";

	const sections: WorkspaceSettingsSection[] = [{
		id: "workspace",
		title: "Workspace",
		fields: [
			{
				id: "workspace.filters",
				type: "group",
				title: "Filters",
				fields: [
					{
						id: "workspace.excludeGlobs",
						type: "list",
						itemType: "string",
						title: "Exclude globs",
						default: [".git/**"],
					},
					{
						id: "workspace.flags",
						type: "list",
						itemType: "boolean",
						title: "Feature flags",
						default: [true, false],
						itemLabels: ["Live preview", "Diagnostics"],
					},
					{
						id: "workspace.model",
						type: "string",
						presentation: "combobox",
						title: "Default model",
						default: "gpt-4.1",
						optionsSource: "workspace.models",
					},
					{
						id: "workspace.columns",
						type: "object-array",
						title: "Table columns",
						default: [{ id: "title", width: 240 }],
						properties: [
							{ id: "id", title: "ID", type: "string", required: true },
							{ id: "width", title: "Width", type: "integer", default: 160 },
						],
					},
				],
			},
			{
				id: "workspace.features",
				type: "group",
				presentation: "toggle-table",
				title: "Features",
				fields: [{
					id: "workspace.features.capture",
					type: "boolean",
					title: "Capture revisions",
					default: true,
				}],
			},
		],
	}];
	const controller = new WorkspaceSettingsController({ sections });
	controller.setOptionSourceLoader((sourceId) =>
		sourceId === "workspace.models"
			? [{ value: "gpt-4.1", label: "GPT-4.1" }]
			: [],
	);
</script>

<AppSettings.Root {controller}>
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
