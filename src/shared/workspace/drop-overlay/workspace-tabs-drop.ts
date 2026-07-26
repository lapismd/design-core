import type { WorkspaceDropPosition } from "../core/types.js";

export type WorkspaceDropZone = Exclude<WorkspaceDropPosition, "center">;

export interface WorkspaceDropOverlayGeometry {
  position: WorkspaceDropPosition;
  style: string;
}

export function resolveWorkspaceDropOverlay(
  clientX: number,
  clientY: number,
  rect: Pick<DOMRect, "x" | "y" | "width" | "height">,
  dropZones: WorkspaceDropZone[] = ["left", "right", "top", "bottom"],
): WorkspaceDropOverlayGeometry {
  const mouseX = clientX - rect.x;
  const mouseY = clientY - rect.y;
  const fromLeft = mouseX / rect.width;
  const fromTop = mouseY / rect.height;
  const positions = [
    { position: "left" as const, distance: fromLeft },
    { position: "right" as const, distance: 1 - fromLeft },
    { position: "top" as const, distance: fromTop },
    { position: "bottom" as const, distance: 1 - fromTop },
  ]
    .filter((candidate) => dropZones.includes(candidate.position))
    .sort((a, b) => a.distance - b.distance);

  if (positions.length && positions[0].distance < 0.25) {
    const position = positions[0].position;
    switch (position) {
      case "left":
        return {
          position,
          style: `width: ${rect.width * 0.25}px; height: ${rect.height}px; left: 0px; top: 0px;`,
        };
      case "right":
        return {
          position,
          style: `width: ${rect.width * 0.25}px; height: ${rect.height}px; right: 0px; top: 0px; margin-left: auto;`,
        };
      case "top":
        return {
          position,
          style: `width: ${rect.width}px; height: ${rect.height * 0.25}px; top: 0px; left: 0px;`,
        };
      case "bottom":
        return {
          position,
          style: `width: ${rect.width}px; height: ${rect.height * 0.35}px; bottom: 0px; left: 0px`,
        };
    }
  }

  return {
    position: "center",
    style: `width: ${rect.width}px; height: ${rect.height}px; top: 0px; left: 0px`,
  };
}
