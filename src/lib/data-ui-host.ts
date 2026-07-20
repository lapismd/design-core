/**
 * Helpers for locking shadcn host `data-ui-*` identity.
 *
 * Hosts stamp identity after `{...restProps}` so accidental consumer overrides
 * cannot kill host CSS. Intentional family restyles pass `dataUiComponent`.
 */

const DATA_UI_COMPONENT_KEY = "data-ui-component";
const DATA_UI_PART_KEY = "data-ui-part";

export type DataUiRestProps = Record<string, unknown>;

/** Strip `data-ui-component` from rest props (Svelte spreads attribute bags). */
export function omitDataUiComponent<T extends DataUiRestProps>(
  rest: T,
): Omit<T, "data-ui-component" | "dataUiComponent"> {
  const {
    [DATA_UI_COMPONENT_KEY]: _attr,
    dataUiComponent: _prop,
    ...safe
  } = rest as T & {
    "data-ui-component"?: unknown;
    dataUiComponent?: unknown;
  };
  return safe;
}

/** Strip both component and part attrs used for locked fixed-part hosts. */
export function omitDataUiIdentity<T extends DataUiRestProps>(
  rest: T,
): Omit<
  T,
  "data-ui-component" | "data-ui-part" | "dataUiComponent" | "dataUiPart"
> {
  const {
    [DATA_UI_COMPONENT_KEY]: _c,
    [DATA_UI_PART_KEY]: _p,
    dataUiComponent: _prop,
    dataUiPart: _partProp,
    ...safe
  } = rest as T & {
    "data-ui-component"?: unknown;
    "data-ui-part"?: unknown;
    dataUiComponent?: unknown;
    dataUiPart?: unknown;
  };
  return safe;
}

/**
 * Resolve the effective `data-ui-component` value.
 * Prefer explicit `dataUiComponent` opt-in for intentional family restyles.
 */
export function resolveDataUiComponent(
  defaultComponent: string,
  dataUiComponent?: string | null,
): string {
  return dataUiComponent && dataUiComponent.length > 0
    ? dataUiComponent
    : defaultComponent;
}

/** Resolve fixed `data-ui-part`, allowing intentional opt-in overrides. */
export function resolveDataUiPart(
  defaultPart: string,
  dataUiPart?: string | null,
): string {
  return dataUiPart && dataUiPart.length > 0 ? dataUiPart : defaultPart;
}
