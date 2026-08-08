export const Basic = `import {
	AppShellController,
	createLocalStorageNotificationPersistence,
} from "@lapismd/design-core/workspace";
import { notificationsPlugin } from "@lapismd/design-core/workspace/plugins/notifications";

const app = new AppShellController({
	plugins: [notificationsPlugin()],
	persistence: {
		notifications: createLocalStorageNotificationPersistence(
			"application.notifications",
		),
	},
});`;
