import type {
  WorkspaceDropPosition,
  WorkspaceDropZone,
} from "../core/types.js";

export type {
  WorkspaceDropPosition,
  WorkspaceDropZone,
} from "../core/types.js";

export interface WorkspaceDropGeometryInput {
  width: number;
  height: number;
  x: number;
  y: number;
  dropZones?: WorkspaceDropZone[];
}

export interface WorkspaceDropOverlayGeometry {
  position: WorkspaceDropPosition;
  left: number;
  top: number;
  width: number;
  height: number;
}

const EDGE_THRESHOLD = 0.25;
const BOTTOM_OVERLAY_RATIO = 0.35;

export function getWorkspaceDropOverlayGeometry(
  input: WorkspaceDropGeometryInput,
): WorkspaceDropOverlayGeometry | null {
  if (input.width <= 0 || input.height <= 0) return null;

  const dropZones = input.dropZones ?? ["left", "right", "top", "bottom"];
  const fromLeft = input.x / input.width;
  const fromTop = input.y / input.height;
  const fromRight = 1 - fromLeft;
  const fromBottom = 1 - fromTop;

  const candidates = [
    { position: "left" as const, distance: fromLeft },
    { position: "right" as const, distance: fromRight },
    { position: "top" as const, distance: fromTop },
    { position: "bottom" as const, distance: fromBottom },
  ]
    .filter((candidate) => dropZones.includes(candidate.position))
    .sort((a, b) => a.distance - b.distance);

  const nearest = candidates[0];
  if (nearest && nearest.distance < EDGE_THRESHOLD) {
    switch (nearest.position) {
      case "left":
        return {
          position: "left",
          left: 0,
          top: 0,
          width: input.width * EDGE_THRESHOLD,
          height: input.height,
        };
      case "right":
        return {
          position: "right",
          left: input.width * (1 - EDGE_THRESHOLD),
          top: 0,
          width: input.width * EDGE_THRESHOLD,
          height: input.height,
        };
      case "top":
        return {
          position: "top",
          left: 0,
          top: 0,
          width: input.width,
          height: input.height * EDGE_THRESHOLD,
        };
      case "bottom":
        return {
          position: "bottom",
          left: 0,
          top: input.height * (1 - BOTTOM_OVERLAY_RATIO),
          width: input.width,
          height: input.height * BOTTOM_OVERLAY_RATIO,
        };
    }
  }

  return {
    position: "center",
    left: 0,
    top: 0,
    width: input.width,
    height: input.height,
  };
}

export function workspaceDropOverlayStyle(
  geometry: WorkspaceDropOverlayGeometry,
) {
  return `width: ${geometry.width}px; height: ${geometry.height}px; left: ${geometry.left}px; top: ${geometry.top}px;`;
}
