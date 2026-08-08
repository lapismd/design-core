export const Basic = `<script lang="ts">
	import { AppSettings, AppShellController } from "@lapismd/design-core/workspace";

	const app = new AppShellController();
</script>

<AppSettings.Root controller={app.settings} {app}>
	<AppSettings.Search />
	<AppSettings.Navigation />
	<AppSettings.Content />
</AppSettings.Root>`;
