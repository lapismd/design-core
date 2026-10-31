import type { TableContext } from "./canvas-table-context.js";
import { watchTableTheme } from "./canvas-table-theme.js";

export function attachScroller(ctx: TableContext, node: HTMLDivElement) {
  const s = ctx.state;
  s.scroller = node;
  const read = () => {
    s.left = node.scrollLeft;
    s.top = node.scrollTop;
    s.width = node.clientWidth;
    s.height = node.clientHeight;
  };
  read();
  node.addEventListener("scroll", read, { passive: true });
  const Observer = node.ownerDocument.defaultView?.ResizeObserver;
  const observer = Observer ? new Observer(read) : null;
  observer?.observe(node);
  const stopTheme = watchTableTheme(node, () => {
    s.epoch++;
  });
  const view = node.ownerDocument.defaultView;
  const resize = () => {
    read();
    s.epoch++;
  };
  view?.addEventListener("resize", resize);
  return () => {
    node.removeEventListener("scroll", read);
    view?.removeEventListener("resize", resize);
    observer?.disconnect();
    stopTheme();
    s.drag = null;
    if (s.scroller === node) s.scroller = null;
  };
}
