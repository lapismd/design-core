import {
  WorkspaceEventDispatcher,
  type WorkspaceEventRef,
} from "./event-dispatcher.js";

export type NotificationSeverity = "info" | "warning" | "error";
export type NotificationLocation = "status" | "notification" | "silent";
export type NotificationProgressStatus =
  | "running"
  | "cancelling"
  | "completed"
  | "failed"
  | "cancelled";

export interface NotificationRecord {
  id: string;
  title?: string;
  message: string;
  severity: NotificationSeverity;
  source?: string;
  createdAt: number;
  updatedAt: number;
  read: boolean;
  cleared: boolean;
}

export interface NotificationTransientRecord extends NotificationRecord {
  duration: number;
}

export interface NotifyOptions {
  id?: string;
  title?: string;
  message: string;
  severity?: NotificationSeverity;
  source?: string;
  persist?: boolean;
  duration?: number;
}

export interface NotificationProgressOptions {
  id?: string;
  title: string;
  message?: string;
  source?: string;
  location?: NotificationLocation;
  cancellable?: boolean;
  persistOnComplete?: boolean;
  persistOnError?: boolean;
}

export interface NotificationProgressReport {
  message?: string;
  current?: number;
  total?: number;
  increment?: number;
  indeterminate?: boolean;
}

export interface NotificationProgressSnapshot {
  id: string;
  title: string;
  message?: string;
  source?: string;
  location: NotificationLocation;
  status: NotificationProgressStatus;
  cancellable: boolean;
  cancelRequested: boolean;
  current?: number;
  total?: number;
  percent?: number;
  indeterminate: boolean;
  startedAt: number;
  updatedAt: number;
  error?: string;
}

export interface NotificationProgressToken {
  readonly signal: AbortSignal;
  readonly isCancellationRequested: boolean;
  throwIfCancellationRequested(): void;
}

export interface NotificationHistorySnapshotV1 {
  version: 1;
  records: NotificationRecord[];
}

export interface NotificationPersistence {
  load(): Promise<unknown | null>;
  save(snapshot: NotificationHistorySnapshotV1): Promise<void>;
}

export interface NotificationManagerEventMap {
  changed: [];
  notify: [record: NotificationTransientRecord];
  "persistence-error": [event: { operation: "load" | "save"; error: unknown }];
}

const DEFAULT_NOTIFICATION_DURATION = 4000;
const DEFAULT_ERROR_DURATION = 6000;
let generatedNotificationId = 0;

function createNotificationId(prefix = "notification"): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  generatedNotificationId += 1;
  return `${prefix}-${Date.now().toString(36)}-${generatedNotificationId.toString(36)}`;
}

function cloneRecord(record: NotificationRecord): NotificationRecord {
  return { ...record };
}

function cloneProgress(
  progress: NotificationProgressSnapshot,
): NotificationProgressSnapshot {
  return { ...progress };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isRecord(value: unknown): value is NotificationRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<NotificationRecord>;
  return (
    typeof record.id === "string" &&
    typeof record.message === "string" &&
    (record.severity === "info" ||
      record.severity === "warning" ||
      record.severity === "error") &&
    typeof record.createdAt === "number" &&
    Number.isFinite(record.createdAt) &&
    typeof record.updatedAt === "number" &&
    Number.isFinite(record.updatedAt)
  );
}

export function normalizeNotificationHistory(
  value: unknown,
): NotificationHistorySnapshotV1 {
  const input = Array.isArray(value)
    ? value
    : value &&
        typeof value === "object" &&
        Array.isArray((value as Partial<NotificationHistorySnapshotV1>).records)
      ? (value as Partial<NotificationHistorySnapshotV1>).records!
      : [];
  const records = new Map<string, NotificationRecord>();
  for (const candidate of input) {
    if (!isRecord(candidate)) continue;
    const record: NotificationRecord = {
      id: candidate.id,
      title: typeof candidate.title === "string" ? candidate.title : undefined,
      message: candidate.message,
      severity: candidate.severity,
      source:
        typeof candidate.source === "string" ? candidate.source : undefined,
      createdAt: candidate.createdAt,
      updatedAt: candidate.updatedAt,
      read: candidate.read === true,
      cleared: candidate.cleared === true,
    };
    const previous = records.get(record.id);
    if (!previous || previous.updatedAt <= record.updatedAt) {
      records.set(record.id, record);
    }
  }
  return {
    version: 1,
    records: [...records.values()]
      .filter((record) => !record.cleared)
      .sort((left, right) => right.updatedAt - left.updatedAt),
  };
}

class NotificationCancellationError extends Error {
  constructor() {
    super("Operation cancelled");
    this.name = "AbortError";
  }
}

export class NotificationProgressHandle implements NotificationProgressToken {
  readonly id: string;
  readonly signal: AbortSignal;
  readonly #controller = new AbortController();
  readonly #manager: NotificationManager;
  readonly #options: NotificationProgressOptions;
  #snapshot: NotificationProgressSnapshot;
  #completed = false;

  constructor(
    manager: NotificationManager,
    options: NotificationProgressOptions,
  ) {
    this.#manager = manager;
    this.#options = options;
    this.id = options.id ?? createNotificationId("progress");
    this.signal = this.#controller.signal;
    const now = Date.now();
    this.#snapshot = {
      id: this.id,
      title: options.title,
      message: options.message,
      source: options.source,
      location: options.location ?? "status",
      status: "running",
      cancellable: options.cancellable === true,
      cancelRequested: false,
      indeterminate: true,
      startedAt: now,
      updatedAt: now,
    };
  }

  get isCancellationRequested(): boolean {
    return this.signal.aborted;
  }

  get currentSnapshot(): NotificationProgressSnapshot {
    return cloneProgress(this.#snapshot);
  }

  report(report: NotificationProgressReport): void {
    if (this.#completed) return;
    const next = { ...this.#snapshot, updatedAt: Date.now() };
    if (report.message !== undefined) next.message = report.message;
    if (typeof report.increment === "number") {
      const previous = next.percent ?? 0;
      next.percent = Math.max(0, Math.min(100, previous + report.increment));
      next.current = next.percent;
      next.total = 100;
      next.indeterminate = false;
    }
    if (
      typeof report.current === "number" ||
      typeof report.total === "number"
    ) {
      next.current = report.current ?? next.current;
      next.total = report.total ?? next.total;
      if (typeof next.current === "number" && typeof next.total === "number") {
        next.percent =
          next.total > 0
            ? Math.max(0, Math.min(100, (next.current / next.total) * 100))
            : 0;
      }
      next.indeterminate = false;
    }
    if (report.indeterminate === true) {
      delete next.current;
      delete next.total;
      delete next.percent;
      next.indeterminate = true;
    }
    this.#snapshot = next;
    this.#manager.updateProgress(next);
  }

  update(report: NotificationProgressReport): void {
    this.report(report);
  }

  cancel(): void {
    if (this.#completed || !this.#snapshot.cancellable) return;
    this.#snapshot = {
      ...this.#snapshot,
      status: "cancelling",
      cancelRequested: true,
      updatedAt: Date.now(),
    };
    this.#controller.abort();
    this.#manager.updateProgress(this.#snapshot);
  }

  complete(message?: string): void {
    this.#finish("completed", message);
    if (this.#options.persistOnComplete) {
      this.#manager.notify({
        title: this.#options.title,
        message: message ?? this.#snapshot.message ?? "Completed",
        severity: "info",
        source: this.#options.source,
        persist: true,
      });
    }
  }

  fail(error: unknown): void {
    const message = errorMessage(error);
    this.#finish("failed", message, message);
    if (this.#options.persistOnError !== false) {
      this.#manager.notify({
        title: this.#options.title,
        message,
        severity: "error",
        source: this.#options.source,
        persist: true,
      });
    }
  }

  cancelled(message = "Cancelled"): void {
    this.#finish("cancelled", message);
  }

  throwIfCancellationRequested(): void {
    if (this.signal.aborted) throw new NotificationCancellationError();
  }

  #finish(
    status: Exclude<NotificationProgressStatus, "running" | "cancelling">,
    message?: string,
    error?: string,
  ): void {
    if (this.#completed) return;
    this.#completed = true;
    this.#snapshot = {
      ...this.#snapshot,
      status,
      message: message ?? this.#snapshot.message,
      error,
      updatedAt: Date.now(),
    };
    this.#manager.finishProgress(this.#snapshot);
  }
}

export class NotificationManager {
  records = $state<NotificationRecord[]>([]);
  transient = $state<NotificationTransientRecord[]>([]);
  activeProgress = $state<NotificationProgressSnapshot[]>([]);
  ready = $state(false);
  presentationOwners = $state<string[]>([]);

  readonly #events =
    new WorkspaceEventDispatcher<NotificationManagerEventMap>();
  readonly #progressHandles = new Map<string, NotificationProgressHandle>();
  readonly #transientTimers = new Map<string, ReturnType<typeof setTimeout>>();
  readonly #persistence?: NotificationPersistence;
  readonly #saveDebounceMs: number;
  #saveTimer: ReturnType<typeof setTimeout> | null = null;
  #saveChain: Promise<void> = Promise.resolve();

  constructor(persistence?: NotificationPersistence, saveDebounceMs = 300) {
    this.#persistence = persistence;
    this.#saveDebounceMs = Math.max(0, saveDebounceMs);
  }

  get hasCustomPresenter(): boolean {
    return this.presentationOwners.length > 0;
  }

  on<Name extends keyof NotificationManagerEventMap>(
    name: Name,
    listener: (...args: NotificationManagerEventMap[Name]) => void,
  ): WorkspaceEventRef<NotificationManagerEventMap, Name> {
    return this.#events.on(name, listener);
  }

  once<Name extends keyof NotificationManagerEventMap>(
    name: Name,
    listener: (...args: NotificationManagerEventMap[Name]) => void,
  ): WorkspaceEventRef<NotificationManagerEventMap, Name> {
    return this.#events.once(name, listener);
  }

  offref<Name extends keyof NotificationManagerEventMap>(
    ref: WorkspaceEventRef<NotificationManagerEventMap, Name>,
  ): void {
    this.#events.offref(ref);
  }

  claimPresentation(ownerId: string): () => void {
    if (!this.presentationOwners.includes(ownerId)) {
      this.presentationOwners = [...this.presentationOwners, ownerId];
    }
    return () => {
      this.presentationOwners = this.presentationOwners.filter(
        (id) => id !== ownerId,
      );
    };
  }

  async load(): Promise<void> {
    if (this.ready) return;
    try {
      const snapshot = normalizeNotificationHistory(
        await this.#persistence?.load(),
      );
      this.records = snapshot.records;
    } catch (error) {
      this.#events.trigger("persistence-error", {
        operation: "load",
        error,
      });
    } finally {
      this.ready = true;
      this.#events.trigger("changed");
    }
  }

  list(): NotificationRecord[] {
    return this.records.map(cloneRecord);
  }

  notify(options: NotifyOptions | string): NotificationRecord {
    const normalized =
      typeof options === "string" ? { message: options } : options;
    const now = Date.now();
    const previous =
      this.transient.find((record) => record.id === normalized.id) ??
      this.records.find((record) => record.id === normalized.id);
    const record: NotificationRecord = {
      id: normalized.id ?? createNotificationId(),
      title: normalized.title,
      message: normalized.message,
      severity: normalized.severity ?? "info",
      source: normalized.source,
      createdAt: previous?.createdAt ?? now,
      updatedAt: now,
      read: false,
      cleared: false,
    };
    const duration = Math.max(
      0,
      normalized.duration ??
        (record.severity === "error"
          ? DEFAULT_ERROR_DURATION
          : DEFAULT_NOTIFICATION_DURATION),
    );
    const transient = { ...record, duration };
    this.transient = [
      transient,
      ...this.transient.filter((entry) => entry.id !== record.id),
    ];
    this.#scheduleTransientDismissal(transient);
    if (normalized.persist) {
      this.records = [
        record,
        ...this.records.filter((entry) => entry.id !== record.id),
      ];
      this.requestSave();
    }
    this.#events.trigger("notify", { ...transient });
    this.#events.trigger("changed");
    return cloneRecord(record);
  }

  dismiss(id: string): void {
    this.#clearTransientTimer(id);
    const next = this.transient.filter((record) => record.id !== id);
    if (next.length === this.transient.length) return;
    this.transient = next;
    this.#events.trigger("changed");
  }

  clearTransient(): void {
    for (const id of this.#transientTimers.keys()) {
      this.#clearTransientTimer(id);
    }
    this.transient = [];
    this.#events.trigger("changed");
  }

  createProgress(
    options: NotificationProgressOptions,
  ): NotificationProgressHandle {
    const handle = new NotificationProgressHandle(this, options);
    this.#progressHandles.set(handle.id, handle);
    this.updateProgress(handle.currentSnapshot);
    return handle;
  }

  async withProgress<T>(
    options: NotificationProgressOptions,
    task: (
      progress: NotificationProgressHandle,
      token: NotificationProgressToken,
    ) => Promise<T> | T,
  ): Promise<T> {
    const progress = this.createProgress(options);
    try {
      const result = await task(progress, progress);
      progress.complete();
      return result;
    } catch (error) {
      if (progress.signal.aborted) progress.cancelled();
      else progress.fail(error);
      throw error;
    }
  }

  cancel(id: string): void {
    this.#progressHandles.get(id)?.cancel();
  }

  async markRead(id: string): Promise<void> {
    this.records = this.records.map((record) =>
      record.id === id
        ? { ...record, read: true, updatedAt: Date.now() }
        : record,
    );
    this.#events.trigger("changed");
    this.requestSave();
    await this.flushSave();
  }

  async clear(id: string): Promise<void> {
    this.records = this.records.filter((record) => record.id !== id);
    this.dismiss(id);
    this.#events.trigger("changed");
    this.requestSave();
    await this.flushSave();
  }

  async clearAll(): Promise<void> {
    this.records = [];
    this.#events.trigger("changed");
    this.requestSave();
    await this.flushSave();
  }

  updateProgress(snapshot: NotificationProgressSnapshot): void {
    this.activeProgress = [
      cloneProgress(snapshot),
      ...this.activeProgress.filter((entry) => entry.id !== snapshot.id),
    ];
    this.#events.trigger("changed");
  }

  finishProgress(snapshot: NotificationProgressSnapshot): void {
    this.#progressHandles.delete(snapshot.id);
    this.activeProgress = this.activeProgress.filter(
      (entry) => entry.id !== snapshot.id,
    );
    this.#events.trigger("changed");
  }

  requestSave(): void {
    if (!this.#persistence) return;
    if (this.#saveTimer) clearTimeout(this.#saveTimer);
    this.#saveTimer = setTimeout(() => {
      this.#saveTimer = null;
      void this.#enqueueSave();
    }, this.#saveDebounceMs);
  }

  async flushSave(): Promise<void> {
    if (this.#saveTimer) {
      clearTimeout(this.#saveTimer);
      this.#saveTimer = null;
      await this.#enqueueSave();
    }
    await this.#saveChain;
  }

  destroy(): void {
    if (this.#saveTimer) clearTimeout(this.#saveTimer);
    this.#saveTimer = null;
    for (const id of this.#transientTimers.keys()) {
      this.#clearTransientTimer(id);
    }
    for (const handle of this.#progressHandles.values()) handle.cancel();
    this.#progressHandles.clear();
    this.records = [];
    this.transient = [];
    this.activeProgress = [];
    this.presentationOwners = [];
    this.#events.clear();
  }

  #scheduleTransientDismissal(record: NotificationTransientRecord): void {
    this.#clearTransientTimer(record.id);
    if (record.duration === 0) return;
    this.#transientTimers.set(
      record.id,
      setTimeout(() => this.dismiss(record.id), record.duration),
    );
  }

  #clearTransientTimer(id: string): void {
    const timer = this.#transientTimers.get(id);
    if (timer) clearTimeout(timer);
    this.#transientTimers.delete(id);
  }

  #enqueueSave(): Promise<void> {
    if (!this.#persistence) return this.#saveChain;
    const snapshot: NotificationHistorySnapshotV1 = {
      version: 1,
      records: this.records.map(cloneRecord),
    };
    this.#saveChain = this.#saveChain.then(async () => {
      try {
        await this.#persistence!.save(snapshot);
      } catch (error) {
        this.#events.trigger("persistence-error", {
          operation: "save",
          error,
        });
      }
    });
    return this.#saveChain;
  }
}

export function createLocalStorageNotificationPersistence(
  key: string,
  storage?: Storage,
): NotificationPersistence {
  const resolveStorage = () => storage ?? globalThis.localStorage;
  return {
    async load() {
      const value = resolveStorage().getItem(key);
      return value ? (JSON.parse(value) as unknown) : null;
    },
    async save(snapshot) {
      resolveStorage().setItem(key, JSON.stringify(snapshot));
    },
  };
}
