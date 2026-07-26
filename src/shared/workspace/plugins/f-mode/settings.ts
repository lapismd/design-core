import type { AppShellController } from "../../core/app-shell-controller.svelte.js";
import type { WorkspaceSettingsSection } from "../../settings/types.js";
import {
  DEFAULT_FMODE_ALPHABET,
  normalizeFModeAlphabet,
} from "./hint-labels.js";
import type {
  FModeHintTarget,
  FModeHudMode,
  FModeInvalidInputBehavior,
  FModeSettings,
  FModeTargetGroupDefinition,
} from "./types.js";

export const FMODE_SETTING_IDS = {
  alphabet: "fmode.alphabet",
  enabledSurfaces: "fmode.enabledSurfaces",
  accentColor: "fmode.accentColor",
  showTargetLabels: "fmode.showTargetLabels",
  showTargetDescriptions: "fmode.showTargetDescriptions",
  hudMode: "fmode.hudMode",
  invalidInputBehavior: "fmode.invalidInputBehavior",
} as const;

export const BUILT_IN_FMODE_TARGET_GROUPS: FModeTargetGroupDefinition[] = [
  { id: "tabs", label: "Tabs" },
  { id: "view-header", label: "View headers" },
  { id: "sidebar", label: "Sidebars" },
  { id: "ribbon", label: "Ribbon" },
  { id: "status", label: "Status bar" },
];

export function createFModeTargetGroups(
  additional: FModeTargetGroupDefinition[] = [],
): FModeTargetGroupDefinition[] {
  const groups = new Map(
    BUILT_IN_FMODE_TARGET_GROUPS.map((group) => [group.id, group]),
  );
  for (const group of additional) groups.set(group.id, group);
  return [...groups.values()];
}

export function createFModeSettingsSection(
  groups: FModeTargetGroupDefinition[],
): WorkspaceSettingsSection {
  const enabled = groups
    .filter((group) => group.defaultEnabled !== false)
    .map((group) => group.id);
  return {
    id: "fmode",
    title: "F-Mode",
    description: "Navigate visible shell actions from the keyboard.",
    icon: "scan-search",
    order: 200,
    navigationGroupId: "core-plugins",
    fields: [
      {
        id: FMODE_SETTING_IDS.enabledSurfaces,
        title: "Enabled surfaces",
        description: "Choose which hint target groups F-Mode includes.",
        type: "multi-enum",
        default: enabled,
        options: groups.map((group) => ({
          value: group.id,
          label: group.label,
          description: group.description,
        })),
      },
      {
        id: FMODE_SETTING_IDS.alphabet,
        title: "Hint alphabet",
        description: "Unique alphanumeric keys used to build hint labels.",
        type: "string",
        default: DEFAULT_FMODE_ALPHABET,
      },
      {
        id: FMODE_SETTING_IDS.accentColor,
        title: "Accent colour",
        description: "Leave empty to use the application accent.",
        type: "string",
        default: "",
        placeholder: "Use application accent",
      },
      {
        id: FMODE_SETTING_IDS.showTargetLabels,
        title: "Show target labels",
        type: "boolean",
        default: true,
      },
      {
        id: FMODE_SETTING_IDS.showTargetDescriptions,
        title: "Show target descriptions",
        type: "boolean",
        default: false,
      },
      {
        id: FMODE_SETTING_IDS.hudMode,
        title: "HUD mode",
        type: "enum",
        default: "detailed",
        options: [
          { value: "detailed", label: "Detailed" },
          { value: "compact", label: "Compact" },
          { value: "minimal", label: "Minimal" },
        ],
      },
      {
        id: FMODE_SETTING_IDS.invalidInputBehavior,
        title: "Invalid input",
        type: "enum",
        default: "flash",
        options: [
          { value: "flash", label: "Flash the HUD" },
          { value: "close", label: "Close F-Mode" },
        ],
      },
    ],
  };
}

function getValue<T>(app: AppShellController, id: string, fallback: T): T {
  return app.configuration.get<T>(id) ?? fallback;
}

export function readFModeSettings(
  app: AppShellController,
  groups: FModeTargetGroupDefinition[],
): FModeSettings {
  const configuredAlphabet = getValue(
    app,
    FMODE_SETTING_IDS.alphabet,
    DEFAULT_FMODE_ALPHABET,
  );
  const alphabet = normalizeFModeAlphabet(
    typeof configuredAlphabet === "string" ? configuredAlphabet : "",
  ).join("");
  const permitted = new Set(groups.map((group) => group.id));
  const configuredSurfaces = getValue<unknown>(
    app,
    FMODE_SETTING_IDS.enabledSurfaces,
    groups.map((group) => group.id),
  );
  const enabledSurfaces = Array.isArray(configuredSurfaces)
    ? [
        ...new Set(
          configuredSurfaces.filter(
            (value): value is string =>
              typeof value === "string" && permitted.has(value),
          ),
        ),
      ]
    : groups.map((group) => group.id);
  const hudMode = getValue<unknown>(app, FMODE_SETTING_IDS.hudMode, "detailed");
  const invalidInputBehavior = getValue<unknown>(
    app,
    FMODE_SETTING_IDS.invalidInputBehavior,
    "flash",
  );
  return {
    alphabet: alphabet || DEFAULT_FMODE_ALPHABET,
    enabledSurfaces,
    accentColor: String(
      getValue(app, FMODE_SETTING_IDS.accentColor, ""),
    ).trim(),
    showTargetLabels:
      getValue<boolean>(app, FMODE_SETTING_IDS.showTargetLabels, true) === true,
    showTargetDescriptions:
      getValue<boolean>(
        app,
        FMODE_SETTING_IDS.showTargetDescriptions,
        false,
      ) === true,
    hudMode:
      hudMode === "compact" || hudMode === "minimal"
        ? (hudMode as FModeHudMode)
        : "detailed",
    invalidInputBehavior:
      invalidInputBehavior === "close"
        ? (invalidInputBehavior as FModeInvalidInputBehavior)
        : "flash",
  };
}

export function filterFModeTargets(
  targets: FModeHintTarget[],
  enabledSurfaces: string[],
): FModeHintTarget[] {
  return targets.filter(
    (target) => !target.group || enabledSurfaces.includes(target.group),
  );
}
