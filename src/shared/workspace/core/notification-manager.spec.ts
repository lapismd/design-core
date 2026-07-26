import { afterEach, describe, expect, it, vi } from "vitest";
import {
  NotificationManager,
  normalizeNotificationHistory,
  type NotificationHistorySnapshotV1,
} from "./notification-manager.svelte.js";

afterEach(() => {
  vi.useRealTimers();
});

describe("NotificationManager", () => {
  it("normalizes durable history and persists coherent snapshots", async () => {
    const save = vi.fn(async (_snapshot: NotificationHistorySnapshotV1) => {});
    const manager = new NotificationManager(
      {
        load: async () => ({
          version: 1,
          records: [
            {
              id: "saved",
              message: "Saved notification",
              severity: "warning",
              createdAt: 10,
              updatedAt: 20,
              read: false,
              cleared: false,
            },
            { id: "malformed" },
          ],
        }),
        save,
      },
      0,
    );

    await manager.load();
    expect(manager.records).toEqual([
      expect.objectContaining({
        id: "saved",
        message: "Saved notification",
        severity: "warning",
      }),
    ]);

    manager.notify({
      id: "persisted",
      title: "Build",
      message: "Complete",
      persist: true,
    });
    await manager.flushSave();

    expect(save).toHaveBeenCalledWith({
      version: 1,
      records: expect.arrayContaining([
        expect.objectContaining({ id: "persisted", message: "Complete" }),
      ]),
    });
  });

  it("keeps transient notices visible until their duration expires", () => {
    vi.useFakeTimers();
    const manager = new NotificationManager();
    const record = manager.notify({ message: "Working", duration: 1000 });

    expect(manager.transient[0]?.id).toBe(record.id);
    vi.advanceTimersByTime(999);
    expect(manager.transient).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(manager.transient).toEqual([]);
  });

  it("does not replay plugin-owned transients through the fallback presenter", () => {
    const manager = new NotificationManager();
    const releasePresentation = manager.claimPresentation("plugin");

    manager.notify({ message: "Plugin owned", duration: 0 });
    expect(manager.transient).toHaveLength(1);

    releasePresentation();
    expect(manager.hasCustomPresenter).toBe(false);
    expect(manager.transient).toEqual([]);

    manager.notify({ message: "Fallback owned", duration: 0 });
    expect(manager.transient[0]?.message).toBe("Fallback owned");
  });

  it("tracks progress, cancellation, completion, and errors", async () => {
    const manager = new NotificationManager();
    const progress = manager.createProgress({
      title: "Index",
      cancellable: true,
    });
    progress.report({ current: 2, total: 4 });
    expect(manager.activeProgress[0]).toMatchObject({
      id: progress.id,
      percent: 50,
      status: "running",
    });

    manager.cancel(progress.id);
    expect(progress.signal.aborted).toBe(true);
    expect(manager.activeProgress[0]?.status).toBe("cancelling");
    progress.cancelled();
    expect(manager.activeProgress).toEqual([]);

    await expect(
      manager.withProgress({ title: "Failing task" }, () => {
        throw new Error("broken");
      }),
    ).rejects.toThrow("broken");
    expect(manager.records[0]).toMatchObject({
      title: "Failing task",
      message: "broken",
      severity: "error",
    });
  });

  it("surfaces persistence failures without discarding live state", async () => {
    const manager = new NotificationManager({
      load: async () => {
        throw new Error("load failed");
      },
      save: async () => {
        throw new Error("save failed");
      },
    });
    const failures: string[] = [];
    manager.on("persistence-error", ({ operation }) =>
      failures.push(operation),
    );

    await manager.load();
    manager.notify({ message: "Still usable", persist: true });
    await manager.flushSave();

    expect(failures).toEqual(["load", "save"]);
    expect(manager.records[0]?.message).toBe("Still usable");
  });
});

describe("normalizeNotificationHistory", () => {
  it("accepts legacy record arrays and drops cleared or malformed entries", () => {
    expect(
      normalizeNotificationHistory([
        {
          id: "visible",
          message: "Visible",
          severity: "info",
          createdAt: 1,
          updatedAt: 2,
          read: false,
          cleared: false,
        },
        {
          id: "cleared",
          message: "Cleared",
          severity: "info",
          createdAt: 1,
          updatedAt: 3,
          read: false,
          cleared: true,
        },
        { message: "missing id" },
      ]).records,
    ).toEqual([expect.objectContaining({ id: "visible" })]);
  });
});
