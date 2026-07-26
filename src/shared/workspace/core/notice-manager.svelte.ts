import type { AppShellController } from "./app-shell-controller.svelte.js";
import {
  NotificationManager,
  type NotificationTransientRecord,
} from "./notification-manager.svelte.js";

const DEFAULT_NOTICE_DURATION = 5000;
let generatedNoticeId = 0;

export type NoticeTarget =
  | AppShellController
  | NoticeManager
  | NotificationManager
  | { notices: NoticeManager };

function resolveNoticeManager(target: NoticeTarget): NoticeManager {
  if (target instanceof NoticeManager) return target;
  if (target instanceof NotificationManager) return new NoticeManager(target);
  return target.notices;
}

function createNoticeId(): string {
  generatedNoticeId += 1;
  return `notice-${Date.now().toString(36)}-${generatedNoticeId.toString(36)}`;
}

/**
 * Controller-owned equivalent of Lapis's `Notice`.
 *
 * A controller (or its notice manager) is explicit so reusable applications do
 * not need to install an app singleton on `globalThis`.
 */
export class Notice {
  readonly id = createNoticeId();
  message = $state("");
  readonly duration: number;
  noticeEl: HTMLElement | null = null;
  containerEl: HTMLElement | null = null;
  messageEl: HTMLElement | null = null;

  readonly #manager: NoticeManager;
  #timer: ReturnType<typeof setTimeout> | null = null;
  #hidden = false;

  constructor(target: NoticeTarget, message: string, duration?: number) {
    this.#manager = resolveNoticeManager(target);
    this.message = message;
    this.duration = Math.max(0, duration ?? DEFAULT_NOTICE_DURATION);
    this.#manager.add(this);
    this.#manager.notifications.notify({
      id: this.id,
      message,
      duration: this.duration,
    });
    this.#scheduleHide();
  }

  setMessage(message: string): void {
    if (this.#hidden) return;
    this.message = message;
    if (this.messageEl) this.messageEl.textContent = message;
    this.#manager.notifications.notify({
      id: this.id,
      message,
      duration: this.duration,
    });
  }

  hide(): void {
    if (this.#hidden) return;
    this.#hidden = true;
    if (this.#timer) clearTimeout(this.#timer);
    this.#timer = null;
    this.noticeEl?.remove();
    this.noticeEl = null;
    this.containerEl = null;
    this.messageEl = null;
    this.#manager.notifications.dismiss(this.id);
    this.#manager.remove(this.id);
  }

  #scheduleHide(): void {
    if (this.duration === 0) return;
    this.#timer = setTimeout(() => this.hide(), this.duration);
  }
}

export class NoticeManager {
  items = $state<Notice[]>([]);
  readonly notifications: NotificationManager;

  constructor(notifications = new NotificationManager()) {
    this.notifications = notifications;
  }

  show(message: string, duration?: number): Notice {
    return new Notice(this, message, duration);
  }

  get(id: string): Notice | undefined {
    return this.items.find((notice) => notice.id === id);
  }

  get transient(): NotificationTransientRecord[] {
    return this.notifications.transient;
  }

  /** @internal */
  add(notice: Notice): void {
    this.items = [...this.items, notice];
  }

  /** @internal */
  remove(id: string): void {
    this.items = this.items.filter((notice) => notice.id !== id);
  }

  clear(): void {
    for (const notice of [...this.items]) notice.hide();
    this.notifications.clearTransient();
  }
}
