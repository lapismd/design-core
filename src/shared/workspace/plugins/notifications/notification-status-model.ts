import type {
  NotificationProgressSnapshot,
  NotificationRecord,
} from "../../core/notification-manager.svelte.js";

export interface NotificationBackgroundTask {
  id: string;
  title: string;
  detail?: string;
  progress?: number;
  cancellable: boolean;
  cancelRequested: boolean;
  startedAt: number;
}

export interface NotificationStatusState {
  records: NotificationRecord[];
  activeProgress: NotificationProgressSnapshot[];
  unreadCount: number;
  hasUnread: boolean;
  hasProgress: boolean;
  visible: boolean;
  backgroundTasks: NotificationBackgroundTask[];
  primaryTask: NotificationBackgroundTask | null;
  additionalTaskCount: number;
  progressLabel: string;
  progressTooltip: string;
  historyTooltip: string;
  unreadText?: string;
}

function progressPercent(
  progress: NotificationProgressSnapshot,
): number | null {
  if (typeof progress.percent === "number") {
    return Math.round(progress.percent);
  }
  if (
    typeof progress.current === "number" &&
    typeof progress.total === "number" &&
    progress.total > 0
  ) {
    return Math.round((progress.current / progress.total) * 100);
  }
  return null;
}

export function toNotificationBackgroundTask(
  progress: NotificationProgressSnapshot,
): NotificationBackgroundTask {
  const percent = progressPercent(progress);
  const message = progress.message?.trim();
  return {
    id: progress.id,
    title: progress.title,
    detail: message && message !== progress.title ? message : undefined,
    progress: percent === null ? undefined : percent,
    cancellable: progress.cancellable,
    cancelRequested: progress.cancelRequested,
    startedAt: progress.startedAt,
  };
}

export function formatNotificationTaskLabel(
  task: NotificationBackgroundTask,
): string {
  return typeof task.progress === "number"
    ? `${task.title} ${task.progress}%`
    : task.title;
}

export function formatNotificationTaskTooltip(
  task: NotificationBackgroundTask,
): string {
  const parts = [task.title];
  if (typeof task.progress === "number") parts.push(`${task.progress}%`);
  if (task.detail) parts.push(task.detail);
  return parts.join(" • ");
}

export function formatNotificationHistoryTooltip(unreadCount: number): string {
  return unreadCount > 0
    ? `Notifications (${unreadCount} unread)`
    : "Notifications";
}

export function formatNotificationProgressLabel(
  tasks: NotificationBackgroundTask[],
): string {
  if (tasks.length === 0) return "";
  if (tasks.length === 1) return formatNotificationTaskLabel(tasks[0]!);
  return `${formatNotificationTaskLabel(tasks[0]!)} · ${tasks.length - 1} more`;
}

export function formatNotificationProgressTooltip(
  tasks: NotificationBackgroundTask[],
  unreadCount: number,
): string {
  if (tasks.length === 0) {
    return formatNotificationHistoryTooltip(unreadCount);
  }
  const [primary, ...rest] = tasks;
  const details = [formatNotificationTaskTooltip(primary!)];
  for (const task of rest.slice(0, 3)) {
    details.push(formatNotificationTaskTooltip(task));
  }
  if (rest.length > 3) {
    details.push(`${rest.length - 3} more background tasks`);
  }
  return details.join(" | ");
}

export function createNotificationStatusState(
  records: NotificationRecord[],
  activeProgress: NotificationProgressSnapshot[],
): NotificationStatusState {
  const backgroundTasks = activeProgress.map(toNotificationBackgroundTask);
  const unreadCount = records.filter((record) => !record.read).length;
  return {
    records,
    activeProgress,
    unreadCount,
    hasUnread: unreadCount > 0,
    hasProgress: backgroundTasks.length > 0,
    visible: true,
    backgroundTasks,
    primaryTask: backgroundTasks[0] ?? null,
    additionalTaskCount: Math.max(0, backgroundTasks.length - 1),
    progressLabel: formatNotificationProgressLabel(backgroundTasks),
    progressTooltip: formatNotificationProgressTooltip(
      backgroundTasks,
      unreadCount,
    ),
    historyTooltip: formatNotificationHistoryTooltip(unreadCount),
    unreadText: unreadCount > 0 ? String(unreadCount) : undefined,
  };
}
