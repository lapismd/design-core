import type { TableContext } from "./canvas-table-context.js";
import type { TableNavigation } from "./canvas-table-navigation.js";
import { applyCommand, tableTarget } from "./canvas-table-commands.js";

export function createKeyboard(ctx: TableContext, nav: TableNavigation) {
  const s = ctx.state;
  function grid(event: KeyboardEvent) {
    if (s.editing) return;
    if (event.key === "Escape") {
      s.menu = null;
      s.range = null;
      s.target = "cell";
      return;
    }
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "a") {
      event.preventDefault();
      nav.selectAll();
      return;
    }
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
      event.preventDefault();
      const props = ctx.props();
      if (event.shiftKey && props.canRedo) props.onRedo?.();
      else if (!event.shiftKey && props.canUndo) props.onUndo?.();
      return;
    }
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const delta: Record<string, [number, number]> = {
      ArrowDown: [1, 0],
      ArrowUp: [-1, 0],
      ArrowRight: [0, 1],
      ArrowLeft: [0, -1],
    };
    const direction = delta[event.key];
    if (direction) {
      event.preventDefault();
      nav.move(...direction);
    } else if (event.key === "Tab") {
      // Let Tab leave the grid at its horizontal boundary.
      const col = s.active?.col;
      if (
        col != null &&
        (event.shiftKey ? col > 0 : col < ctx.layout().widths.length - 1)
      ) {
        event.preventDefault();
        nav.move(0, event.shiftKey ? -1 : 1);
      }
    } else if (event.key === "Enter") {
      event.preventDefault();
      nav.beginEdit();
    } else if (event.key === "Backspace" || event.key === "Delete") {
      if (!s.active) return;
      event.preventDefault();
      if (tableTarget(ctx) !== "cell") applyCommand(ctx, "delete");
      else ctx.props().onCellChange?.(s.active.rowId, s.active.col, "");
    } else if (event.key.length === 1 && tableTarget(ctx) === "cell") {
      if (!s.active || !ctx.props().onCellChange) return;
      event.preventDefault();
      nav.beginEdit(event.key);
    }
  }
  function editor(event: KeyboardEvent) {
    if (event.key === "Escape") {
      event.preventDefault();
      s.editing = false;
      s.scroller?.focus();
    } else if (event.key === "Enter" || event.key === "Tab") {
      event.preventDefault();
      nav.commitEdit();
      nav.move(
        event.key === "Enter" ? 1 : 0,
        event.key === "Tab" ? (event.shiftKey ? -1 : 1) : 0,
      );
      s.scroller?.focus();
    }
  }
  return { grid, editor };
}
