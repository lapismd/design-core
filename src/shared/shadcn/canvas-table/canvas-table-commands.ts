import type { TableContext } from "./canvas-table-context.js";
import type { CanvasTableCommandId } from "./canvas-table-types.js";

export function tableTarget(
  ctx: TableContext,
): TableContext["state"]["target"] {
  const range = ctx.state.range;
  const layout = ctx.layout();
  if (!range || !layout.body.length || !layout.widths.length)
    return ctx.state.target;
  const fullRows =
    range.startIndex === 0 && range.endIndex >= layout.body.length - 1;
  const fullColumns =
    range.startCol === 0 && range.endCol >= layout.widths.length - 1;
  if (fullRows && fullColumns) return "sheet";
  if (fullRows && range.startCol === range.endCol) return "column";
  if (fullColumns && range.startIndex === range.endIndex) return "row";
  return "cell";
}

export function tableCommands(ctx: TableContext) {
  const { active } = ctx.state;
  const target = tableTarget(ctx);
  if (!active || !ctx.props().onCommand) return [];
  const row = (ctx.layout().byId.get(active.rowId)?.number ?? 1) - 1;
  const commands: {
    id: CanvasTableCommandId;
    label: string;
    disabled: boolean;
  }[] = [];
  if (target === "column")
    commands.push(
      { id: "move-left", label: "Move left", disabled: active.col <= 0 },
      {
        id: "move-right",
        label: "Move right",
        disabled: active.col >= ctx.layout().widths.length - 1,
      },
    );
  if (target === "row")
    commands.push(
      { id: "move-up", label: "Move up", disabled: row <= 0 },
      {
        id: "move-down",
        label: "Move down",
        disabled: row >= ctx.props().rows.length - 1,
      },
    );
  commands.push(
    { id: "clear", label: "Clear", disabled: false },
    { id: "delete", label: "Delete", disabled: false },
  );
  return commands;
}

export function applyCommand(ctx: TableContext, id: CanvasTableCommandId) {
  const { active } = ctx.state;
  const target = tableTarget(ctx);
  if (
    !active ||
    tableCommands(ctx).find((command) => command.id === id)?.disabled !== false
  )
    return;
  ctx
    .props()
    .onCommand?.({ id, target, rowId: active.rowId, column: active.col });
  ctx.state.menu = null;
}
