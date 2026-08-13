import type { FormController } from "../core/form-controller.svelte";
import type { FormGroupConfig } from "../core/path-config";

export function isControllableFormGroupDisclosure(
  group: FormGroupConfig,
): boolean {
  return group.hiddenHeader !== true && group.collapsible !== false;
}

export function registerConfiguredArraySectionDisclosures(
  controller: FormController<any, any>,
  formId: string,
  path: string,
  itemIds: readonly string[],
): void {
  for (const itemId of itemIds) {
    controller.registerDisclosure(`${formId}:${path}:${itemId}`, path);
  }
}
