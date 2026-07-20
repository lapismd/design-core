<script lang="ts">
  import type { WorkspaceDropOverlayGeometry } from "./drop-geometry.js";

  let {
    geometry,
  }: {
    /** Lapis-derived edge or centre geometry for the active drop target. */
    geometry: WorkspaceDropOverlayGeometry;
  } = $props();
</script>

<div
  data-ui-component="workspace"
  data-ui-part="tab-drop-overlay"
  data-drop-position={geometry.position}
  style={`width: ${geometry.width}px; height: ${geometry.height}px; left: ${geometry.left}px; top: ${geometry.top}px;`}
></div>

<style>
  [data-ui-component="workspace"][data-ui-part="tab-drop-overlay"] {
    position: absolute;
    z-index: 2;
    border-radius: var(--ui-workspace-tab-radius, 0.375rem);
    /*
     * Lapis uses its interactive accent at half alpha, then applies the
     * overlay opacity. Keep the same layering while allowing consumers to
     * provide a semantic override for their own palette.
     */
    background: var(
      --ui-workspace-drop-overlay,
      color-mix(in srgb, var(--primary) 50%, transparent)
    );
    opacity: 0.5;
    pointer-events: none;
    transition: all 100ms ease-in-out;
    will-change: transform, width, height;
  }
</style>
