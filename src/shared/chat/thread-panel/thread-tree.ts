/** Input order determines sibling priority; depth is presentation only. */
export type ThreadNode = { id: string; parentId?: string | undefined };
export type ThreadTreeRow<T> = {
  message: T;
  depth: number;
  indentRem: number;
  connectorIndentRem?: number;
  guideIndentRems: readonly number[];
  connectsToChildren: boolean;
};
export function threadTreeIndentRem(depth: number): number {
  return Math.min(Math.max(depth - 1, 0), 6) * 2.25;
}
export function projectThreadTree<T extends ThreadNode>(
  messages: readonly T[],
  rootId: string,
): readonly ThreadTreeRow<T>[] {
  const byId = new Map(messages.map((message) => [message.id, message]));
  const children = new Map<string, T[]>();
  for (const message of messages) {
    if (message.id === rootId) continue;
    const parent =
      message.parentId &&
      message.parentId !== message.id &&
      byId.has(message.parentId)
        ? message.parentId
        : rootId;
    const values = children.get(parent) ?? [];
    values.push(message);
    children.set(parent, values);
  }
  const visited = new Set<string>(),
    rows: ThreadTreeRow<T>[] = [];
  function visit(start: T, depth: number) {
    const stack: { message: T; depth: number; guides: number[] }[] = [
      { message: start, depth, guides: [] },
    ];
    while (stack.length) {
      const current = stack.pop()!;
      if (visited.has(current.message.id)) continue;
      visited.add(current.message.id);
      const descendants = (children.get(current.message.id) ?? []).filter(
        (child) => !visited.has(child.id),
      );
      rows.push({
        message: current.message,
        depth: current.depth,
        indentRem: threadTreeIndentRem(current.depth),
        ...(current.depth > 1
          ? { connectorIndentRem: threadTreeIndentRem(current.depth - 1) }
          : {}),
        guideIndentRems: current.guides.map(threadTreeIndentRem),
        connectsToChildren: current.depth > 0 && descendants.length > 0,
      });
      for (let i = descendants.length - 1; i >= 0; i--) {
        const guides =
          current.depth > 0 && i < descendants.length - 1
            ? [...current.guides, Math.min(current.depth, 7)]
            : current.guides;
        stack.push({
          message: descendants[i]!,
          depth: current.depth + 1,
          guides: [...new Set(guides)],
        });
      }
    }
  }
  const root = byId.get(rootId);
  if (root) visit(root, 0);
  for (const message of messages)
    if (!visited.has(message.id)) visit(message, message.id === rootId ? 0 : 1);
  return rows;
}
