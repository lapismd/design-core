import { SvelteMap } from "svelte/reactivity";
import type { TableState } from "./canvas-table-context.js";

import type { CanvasTableProps } from "./canvas-table-types.js";

export function createTableState(
  getProps: () => Partial<CanvasTableProps> = () => ({}),
): TableState {
  const display = $state({ wrap: false, colours: false });
  const state = $state<TableState>({
    detailHeights: new SvelteMap(),
    rowSelectionIds: [],
    active: null,
    range: null,
    target: "cell",
    editing: false,
    draft: "",
    selectOnEdit: false,
    get wrap() {
      return getProps().wrapText ?? display.wrap;
    },
    set wrap(value) {
      const props = getProps();
      if (props.wrapText === undefined) display.wrap = value;
      props.onWrapTextChange?.(value);
    },
    get colours() {
      return getProps().columnColours ?? display.colours;
    },
    set colours(value) {
      const props = getProps();
      if (props.columnColours === undefined) display.colours = value;
      props.onColumnColoursChange?.(value);
    },
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    epoch: 0,
    scroller: null,
    canvas: null,
    gutterCanvas: null,
    menu: null,
    drag: null,
  });
  return state;
}
