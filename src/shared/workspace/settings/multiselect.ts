export type WorkspaceSettingMultiSelectItem = {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
};

export function summarizeMultiSelectIds(
  ids: readonly string[],
  placeholder: string,
  visible = 2,
): string {
  if (ids.length === 0) return placeholder;
  if (ids.length <= visible) return ids.join(", ");
  return `${ids.slice(0, visible).join(", ")} + ${ids.length - visible} more`;
}

export function filterMultiSelectItems(
  items: readonly WorkspaceSettingMultiSelectItem[],
  query: string,
): WorkspaceSettingMultiSelectItem[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [...items];
  return items.filter((item) =>
    [item.value, item.label, item.description ?? ""].some((part) =>
      part.toLowerCase().includes(needle),
    ),
  );
}

export function orderSelectedFirst(
  items: readonly WorkspaceSettingMultiSelectItem[],
  selected: readonly string[],
): WorkspaceSettingMultiSelectItem[] {
  const selectedValues = new Set(selected);
  return [
    ...items.filter((item) => selectedValues.has(item.value)),
    ...items.filter((item) => !selectedValues.has(item.value)),
  ];
}
