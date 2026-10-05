export interface NotificationsPluginOptions {
  enabled?: boolean;
  showToasts?: boolean;
  showStatus?: boolean;
}

export interface NotificationsPluginRuntimeOptions {
  showToasts: boolean;
  showStatus: boolean;
}

/** Controlled toast data; hosts own identity, lifetime and action execution. */
export interface NotificationToastRecord {
  id: string;
  title?: string;
  message: string;
  severity: "info" | "warning" | "error";
  action?: {
    id: string;
    label: string;
    /** Secondary keeps a themed surface at rest; ghost is the default. */
    variant?: "ghost" | "secondary";
  };
}
