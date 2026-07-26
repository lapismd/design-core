import { describe, expect, it } from "vitest";
import {
  createNotificationStatusState,
  formatNotificationProgressTooltip,
  toNotificationBackgroundTask,
} from "./notification-status-model.js";

describe("notification status model", () => {
  it("prioritises progress and preserves unread history", () => {
    const state = createNotificationStatusState(
      [
        {
          id: "notice",
          message: "Saved",
          severity: "info",
          createdAt: 1,
          updatedAt: 1,
          read: false,
          cleared: false,
        },
      ],
      [
        {
          id: "progress",
          title: "Indexing",
          message: "12 files",
          location: "status",
          status: "running",
          cancellable: true,
          cancelRequested: false,
          current: 1,
          total: 4,
          percent: 25,
          indeterminate: false,
          startedAt: 1,
          updatedAt: 2,
        },
      ],
    );

    expect(state).toMatchObject({
      unreadCount: 1,
      hasUnread: true,
      hasProgress: true,
      progressLabel: "Indexing 25%",
      historyTooltip: "Notifications (1 unread)",
    });
    expect(state.progressTooltip).toBe("Indexing • 25% • 12 files");
  });

  it("normalises indeterminate progress without an invented percent", () => {
    const task = toNotificationBackgroundTask({
      id: "sync",
      title: "Syncing",
      location: "status",
      status: "running",
      cancellable: false,
      cancelRequested: false,
      indeterminate: true,
      startedAt: 1,
      updatedAt: 2,
    });

    expect(task.progress).toBeUndefined();
    expect(formatNotificationProgressTooltip([task], 0)).toBe("Syncing");
  });
});
