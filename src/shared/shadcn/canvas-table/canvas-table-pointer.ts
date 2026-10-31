import type { TableContext } from "./canvas-table-context.js";
import type { TableNavigation } from "./canvas-table-navigation.js";
import { hitTest } from "./canvas-table-hit.js";
import { tableTarget } from "./canvas-table-commands.js";
import { clampWidth } from "./canvas-table-text.js";

export function createPointer(ctx: TableContext, nav: TableNavigation) {
  const s = ctx.state;
  function hit(event: MouseEvent) {
    const rect = s.scroller?.getBoundingClientRect();
    return rect
      ? hitTest(
          ctx.layout(),
          event.clientX - rect.left,
          event.clientY - rect.top,
          s.left,
          s.top,
        )
      : null;
  }
  function down(event: PointerEvent) {
    if (event.button !== 0) return;
    s.menu = null;
    nav.commitEdit();
    const target = hit(event);
    if (!target) return;
    s.scroller?.focus();
    if (target.kind === "resize") {
      if (!ctx.props().onColumnWidthsChange) return;
      s.drag = {
        kind: "resize",
        col: target.col,
        index: 0,
        x: event.clientX,
        width: ctx.layout().widths[target.col] ?? 120,
        moved: false,
      };
    } else if (target.kind === "sort") {
      ctx.props().onSort?.(target.col);
      s.range = null;
      s.target = "cell";
      return;
    } else if (target.kind === "corner") {
      nav.selectAll();
      return;
    } else if (target.kind === "header") {
      nav.selectCell(-1, target.col);
      return;
    } else {
      const index = target.kind === "letter" ? 0 : target.index;
      const col = target.kind === "row" ? 0 : target.col;
      const kind =
        target.kind === "letter"
          ? "column"
          : target.kind === "row"
            ? "row"
            : "cell";
      if (kind === "column") nav.selectColumns(col, col);
      else if (kind === "row") nav.selectRows(index, index);
      else nav.selectCell(index, col);
      s.drag = { kind, col, index, x: event.clientX, width: 0, moved: false };
    }
    s.scroller?.setPointerCapture(event.pointerId);
  }
  function move(event: PointerEvent) {
    const target = hit(event);
    const drag = s.drag;
    if (!drag) {
      if (s.scroller)
        s.scroller.style.cursor =
          target?.kind === "resize" && ctx.props().onColumnWidthsChange
            ? "col-resize"
            : "default";
      return;
    }
    if (drag.kind === "resize") {
      const widths = [...ctx.layout().widths];
      widths[drag.col] = clampWidth(drag.width + event.clientX - drag.x);
      ctx.props().onColumnWidthsChange?.(widths);
      return;
    }
    if (!target || target.kind === "corner") return;
    if (drag.kind === "column" && "col" in target)
      nav.selectColumns(drag.col, target.col);
    else if ("index" in target) {
      if (drag.kind === "row") nav.selectRows(drag.index, target.index);
      else {
        const col = "col" in target ? target.col : drag.col;
        drag.moved = target.index !== drag.index || col !== drag.col;
        s.range = {
          startIndex: Math.min(drag.index, target.index),
          endIndex: Math.max(drag.index, target.index),
          startCol: Math.min(drag.col, col),
          endCol: Math.max(drag.col, col),
        };
      }
    }
  }
  function up(event: PointerEvent) {
    if (s.drag?.kind === "cell" && !s.drag.moved) s.range = null;
    s.drag = null;
    if (s.scroller?.hasPointerCapture(event.pointerId))
      s.scroller.releasePointerCapture(event.pointerId);
  }
  function doubleClick(event: MouseEvent) {
    const target = hit(event);
    if (target?.kind === "resize") nav.fitColumn(target.col);
    else if (target?.kind === "body" || target?.kind === "header") {
      nav.selectCell(target.kind === "header" ? -1 : target.index, target.col);
      nav.beginEdit();
    }
  }
  function contextMenu(event: MouseEvent) {
    if (!ctx.props().onCommand) return;
    nav.commitEdit();
    const target = hit(event);
    if (!target) return;
    if (target.kind === "corner" || tableTarget(ctx) === "sheet")
      nav.selectAll();
    else if (target.kind === "row") nav.selectRows(target.index, target.index);
    else if (target.kind === "body") nav.selectCell(target.index, target.col);
    else nav.selectColumns(target.col, target.col);
    const rect = s.scroller?.getBoundingClientRect();
    s.menu = {
      x: Math.max(
        0,
        Math.min(event.clientX - (rect?.left ?? 0), s.width - 180),
      ),
      y: Math.max(
        0,
        Math.min(event.clientY - (rect?.top ?? 0), s.height - 180),
      ),
    };
  }
  return { down, move, up, doubleClick, contextMenu };
}
