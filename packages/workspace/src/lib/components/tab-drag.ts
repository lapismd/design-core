const WORKSPACE_TAB_MIME = "application/x-stevejuma-workspace-tab";
let activePayload: WorkspaceTabDragPayload | null = null;

export interface WorkspaceTabDragPayload {
  groupId: string;
  tabId: string;
}

export function startWorkspaceTabDrag(
  event: DragEvent,
  payload: WorkspaceTabDragPayload,
) {
  activePayload = payload;
  if (!event.dataTransfer) return;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData(WORKSPACE_TAB_MIME, JSON.stringify(payload));
  event.dataTransfer.setData("text/plain", payload.tabId);
}

export function isWorkspaceTabDrag(event: DragEvent) {
  return (
    activePayload !== null ||
    Array.from(event.dataTransfer?.types ?? []).includes(WORKSPACE_TAB_MIME)
  );
}

export function readWorkspaceTabDrag(
  event: DragEvent,
): WorkspaceTabDragPayload | null {
  const raw = event.dataTransfer?.getData(WORKSPACE_TAB_MIME);
  if (!raw) return activePayload;
  try {
    const value = JSON.parse(raw) as Partial<WorkspaceTabDragPayload>;
    return typeof value.groupId === "string" && typeof value.tabId === "string"
      ? { groupId: value.groupId, tabId: value.tabId }
      : null;
  } catch {
    return null;
  }
}

export function clearWorkspaceTabDrag() {
  activePayload = null;
}
