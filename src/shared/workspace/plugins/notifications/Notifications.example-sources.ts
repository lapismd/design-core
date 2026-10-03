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

export const Controlled = `import { NotificationToasts, type NotificationToastRecord } from '@lapismd/design-core/workspace/plugins/notifications';

// The host owns state, lifetime and command execution.
let records: NotificationToastRecord[] = [
  { id: 'save-error', severity: 'error', title: 'Save failed', message: 'Your draft is retained.', action: { id: 'retry', label: 'Retry' } },
];

<NotificationToasts records={records} portal
  onDismiss={(id) => records = records.filter((record) => record.id !== id)}
  onAction={(id, action) => retryExactRequest(id, action)}
  onPause={(id) => timers.pause(id)} onResume={(id) => timers.resume(id)} />`;
