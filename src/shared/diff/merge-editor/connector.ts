import type {
  RenderConnection,
  RenderVisualKind,
} from "../core/merge/render-model.js";

export type ConnectorLaneName = "left" | "right";

export interface ConnectorPathGeometry {
  id: string;
  visualKind: RenderVisualKind;
  path: string;
}

export interface ConnectorLaneGeometry {
  width: number;
  height: number;
  paths: ConnectorPathGeometry[];
}

export interface ConnectorGeometry {
  left: ConnectorLaneGeometry;
  right: ConnectorLaneGeometry;
}

export const EMPTY_CONNECTOR_LANE: ConnectorLaneGeometry = {
  width: 40,
  height: 0,
  paths: [],
};

export const EMPTY_CONNECTOR_GEOMETRY: ConnectorGeometry = {
  left: EMPTY_CONNECTOR_LANE,
  right: EMPTY_CONNECTOR_LANE,
};

export function connectorPath(
  width: number,
  fromTop: number,
  fromBottom: number,
  toTop: number,
  toBottom: number,
): string {
  const bend = Math.min(8, Math.max(4, width / 4));
  return [
    `M 0 ${fromTop}`,
    `C ${bend} ${fromTop}, ${width - bend} ${toTop}, ${width} ${toTop}`,
    `L ${width} ${toBottom}`,
    `C ${width - bend} ${toBottom}, ${bend} ${fromBottom}, 0 ${fromBottom}`,
    "Z",
  ].join(" ");
}

export function measureConnectorLane(
  container: HTMLElement,
  laneName: ConnectorLaneName,
  connections: readonly RenderConnection[],
): ConnectorLaneGeometry {
  const lane = container.querySelector<HTMLElement>(
    `[data-connector-lane="${laneName}"]`,
  );
  if (!lane) {
    return EMPTY_CONNECTOR_LANE;
  }
  const laneRect = lane.getBoundingClientRect();
  const width = lane.clientWidth || 40;
  const height = lane.clientHeight;
  const paths = connections.flatMap((connection): ConnectorPathGeometry[] => {
    const from = container.querySelector<HTMLElement>(
      `[data-render-component-id="${connection.fromComponentId}"]`,
    );
    const to = container.querySelector<HTMLElement>(
      `[data-render-component-id="${connection.toComponentId}"]`,
    );
    if (!from || !to) {
      return [];
    }
    const fromRect = from.getBoundingClientRect();
    const toRect = to.getBoundingClientRect();
    return [
      {
        id: connection.id,
        visualKind: connection.visualKind,
        path: connectorPath(
          width,
          fromRect.top - laneRect.top,
          fromRect.bottom - laneRect.top,
          toRect.top - laneRect.top,
          toRect.bottom - laneRect.top,
        ),
      },
    ];
  });
  return { width, height, paths };
}
