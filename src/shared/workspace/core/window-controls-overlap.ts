type HeaderRect = Pick<DOMRectReadOnly, "left" | "right" | "top" | "bottom">;
type ControlsGeometry = {
  left: number;
  right: number;
  top: number;
  height: number;
  start: number;
  end: number;
  scale: number;
};

export function resolveWindowControlsOverlap(
  rect: HeaderRect,
  window: ControlsGeometry,
) {
  if (
    window.height <= 0 ||
    rect.top >= window.top + window.height ||
    rect.bottom <= window.top
  )
    return null;
  const scale = window.scale > 0 ? window.scale : 1;
  const width = rect.right - rect.left;
  return {
    start:
      Math.min(width, Math.max(0, window.left + window.start - rect.left)) /
      scale,
    end:
      Math.min(width, Math.max(0, rect.right - window.right + window.end)) /
      scale,
    height: window.height / scale,
  };
}

/** Internal header action; hosts supply geometry using public workspace tokens. */
export function windowControlsOverlap(node: HTMLElement) {
  const source = node.ownerDocument;
  const view = source.defaultView;
  const root = node.closest<HTMLElement>("[data-app-shell-root]");
  if (!view || !root) return {};
  let frame = 0;
  const properties = [
    "--ui-workspace-controls-overlap-start",
    "--ui-workspace-controls-overlap-end",
    "--ui-workspace-controls-overlap-height",
  ];
  const set = (key: string, value: string) => {
    if (node.style.getPropertyValue(key) !== value)
      node.style.setProperty(key, value);
  };
  const sync = () => {
    frame = 0;
    const style = view.getComputedStyle(root);
    const px = (key: string) =>
      Math.max(0, Number.parseFloat(style.getPropertyValue(key)) || 0);
    const rect = root.getBoundingClientRect();
    const overlap = resolveWindowControlsOverlap(node.getBoundingClientRect(), {
      left: rect.left,
      right: rect.right,
      top: rect.top,
      height: px("--ui-workspace-window-controls-overlay-height"),
      start: px("--ui-workspace-window-controls-overlay-inline-start"),
      end: px("--ui-workspace-window-controls-overlay-inline-end"),
      scale: rect.width / root.offsetWidth,
    });
    if (overlap) {
      node.dataset.windowControlsOverlap = "true";
      set(properties[0], `${overlap.start}px`);
      set(properties[1], `${overlap.end}px`);
      set(properties[2], `${overlap.height}px`);
    } else {
      delete node.dataset.windowControlsOverlap;
      for (const property of properties) node.style.removeProperty(property);
    }
  };
  const schedule = () => {
    if (!frame) frame = view.requestAnimationFrame(sync);
  };
  const resize = new ResizeObserver(schedule);
  resize.observe(node);
  resize.observe(root);
  const geometry = new MutationObserver(schedule);
  geometry.observe(source.documentElement, {
    attributes: true,
    attributeFilter: ["style"],
  });
  const layout = new MutationObserver(schedule);
  layout.observe(root, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["style", "data-workspace-focus-mode"],
  });
  view.addEventListener("resize", schedule);
  sync();
  return {
    destroy() {
      if (frame) view.cancelAnimationFrame(frame);
      resize.disconnect();
      geometry.disconnect();
      layout.disconnect();
      view.removeEventListener("resize", schedule);
    },
  };
}
