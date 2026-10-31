export interface TableTheme {
  background: string;
  header: string;
  gutter: string;
  text: string;
  muted: string;
  grid: string;
  selection: string;
  accent: string;
  search: string;
  columns: string[];
  headerTints: string[];
}

export function readTableTheme(node: HTMLCanvasElement): TableTheme {
  const view = node.ownerDocument.defaultView;
  const style = view?.getComputedStyle(node);
  const probe = node.ownerDocument.createElement("span");
  probe.hidden = true;
  node.append(probe);
  const value = (name: string, fallback: string) => {
    probe.style.backgroundColor =
      style?.getPropertyValue("--ui-canvas-table-" + name).trim() || fallback;
    return view?.getComputedStyle(probe).backgroundColor || fallback;
  };
  const header = value("header", "#f4f4f5");
  const columns = [1, 2, 3, 4, 5].map((slot, i) =>
    value(
      "column-" + slot,
      ["#c2410c", "#15803d", "#1d4ed8", "#a21caf", "#a16207"][i] ?? "#111",
    ),
  );
  const headerTints = columns.map((column) => {
    probe.style.backgroundColor =
      "color-mix(in oklab, " + column + " 8%, " + header + ")";
    return view?.getComputedStyle(probe).backgroundColor || header;
  });
  const theme = {
    background: value("background", "#fff"),
    header,
    gutter: value("gutter", "#f4f4f5"),
    text: value("foreground", "#111"),
    muted: value("muted", "#666"),
    grid: value("border", "#ddd"),
    selection: value("selection", "rgba(37,99,235,.16)"),
    accent: value("accent", "#2563eb"),
    search: value("search", "#b45309"),
    columns,
    headerTints,
  };
  probe.remove();
  return theme;
}

export function watchTableTheme(
  node: HTMLElement,
  changed: () => void,
): () => void {
  const view = node.ownerDocument.defaultView;
  if (!view) return () => {};
  const observer = new view.MutationObserver(changed);
  for (
    let current: HTMLElement | null = node;
    current;
    current = current.parentElement
  ) {
    observer.observe(current, {
      attributes: true,
      attributeFilter: [
        "class",
        "style",
        "data-theme",
        "data-mode",
        "data-ui-theme",
      ],
    });
  }
  const media = view.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", changed);
  node.ownerDocument.fonts?.addEventListener("loadingdone", changed);
  return () => {
    observer.disconnect();
    media.removeEventListener("change", changed);
    node.ownerDocument.fonts?.removeEventListener("loadingdone", changed);
  };
}
