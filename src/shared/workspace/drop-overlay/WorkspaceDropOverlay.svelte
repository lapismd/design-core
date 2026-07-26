<script lang="ts">
  import type { WorkspaceDropPosition } from "../core/types.js";
  import { resolveWorkspaceDropOverlay } from "./workspace-tabs-drop.js";
  import "./WorkspaceDropOverlay.css";

  let {
    position = "center",
    width = 640,
    height = 360,
  }: {
    position?: WorkspaceDropPosition;
    width?: number;
    height?: number;
  } = $props();

  let point = $derived(
    position === "left"
      ? { x: 1, y: height / 2 }
      : position === "right"
        ? { x: width - 1, y: height / 2 }
        : position === "top"
          ? { x: width / 2, y: 1 }
          : position === "bottom"
            ? { x: width / 2, y: height - 1 }
            : { x: width / 2, y: height / 2 },
  );
  let geometry = $derived(
    resolveWorkspaceDropOverlay(point.x, point.y, {
      x: 0,
      y: 0,
      width,
      height,
    }),
  );
</script>

<div
  class="ui-workspace-drop-preview"
  data-ui-component="workspace-drop-overlay"
  data-drop-position={geometry.position}
  style={`width: ${width}px; height: ${height}px;`}
>
  <div
    class="workspace-drop-overlay ui-workspace-drop-overlay"
    data-ui-part="overlay"
    style={geometry.style}
  ></div>
</div>
