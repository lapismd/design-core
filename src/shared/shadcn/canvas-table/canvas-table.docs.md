# Canvas Table

Import `{ CanvasTable }` and its types from
`@lapismd/design-core/shadcn/canvas-table`. This project-authored Data Display
family provides a canvas spreadsheet, not CSV parsing or file persistence.
See `Shadcn/Guidance` for shared control conventions. Give the component a
bounded height and import `@lapismd/design-core/styles.css` once in the host.

## Data and controlled actions

`rows` is a readonly array of `{ id: string | number, cells: readonly string[] }`.
IDs must be unique and stable through sorting, filtering and edits. Missing
cells paint as empty strings. Duplicate dataset IDs throw a descriptive error.
`columnWidths` supplies one CSS-pixel width per column; widths are clamped to
48–960 pixels. The component never mutates either input.

`headerRow` defaults to `true` and fixes the first supplied row above the body.
`visibleRowIds` optionally supplies filtered body order; absent/duplicate IDs
are ignored and the fixed header is always excluded. Omit it to show all data
rows. Sorting and filtering remain host operations.

| Callback               | Payload and behavior                                                                                            |
| ---------------------- | --------------------------------------------------------------------------------------------------------------- |
| `onCellChange`         | `(rowId, column, value)` commits a string edit; omitted makes cells read only.                                  |
| `onColumnWidthsChange` | `(widths)` requests resizing/autofit; omitted disables resizing.                                                |
| `onSort`               | `(column)` requests host sorting; `sort: { column, direction: "asc" \| "desc" }` paints its state.              |
| `onCommand`            | `({ id, target, rowId, column })` requests clear/delete or a directional move. Omitted hides mutation commands. |
| `onHeaderRowChange`    | `(boolean)` requests the toolbar header preference; omitted disables that toggle.                               |
| `onUndo`, `onRedo`     | Invoke host history, enabled only with `canUndo`/`canRedo` and the corresponding callback.                      |

Command targets are `cell`, `row`, `column` or `sheet`. IDs are `clear`, `delete`,
`move-left`, `move-right`, `move-up` and `move-down`. Only valid moves are offered
for a target. Clear/delete on a cell request clearing its string. Consumers
decide how sheet-level clear/delete affects their dataset. These commands use
the spreadsheet selection, independently of checked rows.

## Spreadsheet interaction

Click or use arrows to select a cell; Enter or double-click opens its editor, clipped below fixed headers when editing a body row.
Typing starts an edit. Enter commits and moves down; Tab commits and moves
horizontally; Escape cancels and returns focus to the grid. Tab leaves the grid
at its horizontal boundary. Delete clears a cell or requests deletion of the
selected row/column/sheet. Command/Control-A selects the sheet and
Command/Control-Z (Shift for redo) calls enabled host history.

Drag over body cells for a range, column letters for column selection, or row
numbers for row selection. The corner selects the sheet. The address input
accepts a cell (`B3`), row (`3`) or column (`B`), including `$B$3` notation.
Addresses refer to the supplied sheet and never reveal a filtered-out row.
Drag a column boundary in the letter band to resize; double-click it to fit its
text. Sort controls stay aligned with column edges during scrolling and resizing. Wrap text grows rows up to four lines. Column colours use theme tokens.
Right-click a cell, row number, column letter/header or sort button for its
command menu. Shared ContextMenu owns keyboard focus and dismissal.

`searchCell: { rowId, column }` optionally outlines a host search result without
introducing a search engine. `aria-label` names the grid (default `Canvas table`)
and `class` extends the root. The canvas is decorative; a bounded semantic grid
exposes cell text, source row indices and the active descendant.

## Numbered and checkbox gutters

`rowNumbers` defaults to `true`; `rowSelection` defaults to `false`. Either can
be enabled independently. Numbers include the header as row 1 and retain
source positions after filtering. Gutters and headers remain fixed while data
scrolls; large row numbers expand their gutter instead of clipping.

Enable controlled row checkboxes with `selectedRowIds` and
`onSelectedRowIdsChange(ids)`. Without the callback they are disabled. Checked
rows remain independent of cell/range selection, including Delete and menus.
Selection follows IDs across sorting and edits; missing IDs and a newly fixed
header are removed through the selection callback. Filtering preserves hidden
selections.

The header checkbox toggles all filtered data rows, including offscreen rows,
and preserves selected hidden rows. Its checked/mixed state counts only the
filtered result; an empty result disables it. Space activates a focused real
Checkbox; Tab visits visible controls only. Scrolling a focused row control out of the viewport returns
focus to the grid.

`selectionActions` is a Svelte snippet receiving valid selected IDs, including
hidden selections. Use it to display a count or host-defined actions. Canvas
Table does not provide bulk mutations.

## Tokens

Defaults inherit Design Core semantic colours. Override these properties on an
ancestor; the canvas repaints after ancestor theme/style changes and font loads.
Exported `canvasTableTokenNames` and `CanvasTableToken` enumerate the contract.

| Token                          | Default                           |
| ------------------------------ | --------------------------------- |
| `--ui-canvas-table-background` | `--background`                    |
| `--ui-canvas-table-foreground` | `--foreground`                    |
| `--ui-canvas-table-header`     | `--muted`                         |
| `--ui-canvas-table-gutter`     | `--muted`                         |
| `--ui-canvas-table-muted`      | `--muted-foreground`              |
| `--ui-canvas-table-border`     | `--border`                        |
| `--ui-canvas-table-selection`  | 16% primary wash                  |
| `--ui-canvas-table-accent`     | `--primary`                       |
| `--ui-canvas-table-search`     | `--warning`, amber fallback       |
| `--ui-canvas-table-font`       | `--font-mono`, monospace fallback |
| `--ui-canvas-table-column-1`   | `--chart-1`, orange fallback      |
| `--ui-canvas-table-column-2`   | `--chart-2`, green fallback       |
| `--ui-canvas-table-column-3`   | `--chart-3`, blue fallback        |
| `--ui-canvas-table-column-4`   | `--chart-4`, violet fallback      |
| `--ui-canvas-table-column-5`   | `--chart-5`, amber fallback       |

Rendering and semantic DOM are bounded by the visible row/column window, with
one extra active row/column when needed for accessibility. Observers, listeners,
pointer state and theme subscriptions are instance-owned and disposed on unmount.
All handwritten family JS/TS/Svelte files, including authoring and tests, stay
at or below 300 physical lines. The CSV plugin remains unchanged; adoption is
a separate consumer task.
