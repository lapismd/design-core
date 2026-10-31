import type { TableState } from "./canvas-table-context.js";

export function createTableState(): TableState {
  const state = $state<TableState>({
    active: null,
    range: null,
    target: "cell",
    editing: false,
    draft: "",
    selectOnEdit: false,
    wrap: false,
    colours: false,
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    epoch: 0,
    scroller: null,
    canvas: null,
    menu: null,
    drag: null,
  });
  return state;
}
