export type WorkspaceDndStrategy = "auto" | "html5" | "pointer";

export function shouldUseWorkspacePointerDrag(
  strategy: WorkspaceDndStrategy,
  pointerType: string,
  coarsePointer: boolean,
): boolean {
  if (strategy === "html5") {
    return false;
  }
  if (strategy === "pointer") {
    return true;
  }
  if (pointerType === "touch" || pointerType === "pen") {
    return true;
  }
  return pointerType === "mouse" && coarsePointer;
}
