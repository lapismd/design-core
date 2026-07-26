import type { AppShellHintTarget, Hotkey } from "../../core/index.js";

export type FModeHudMode = "compact" | "detailed" | "minimal";
export type FModeInvalidInputBehavior = "flash" | "close";

export interface FModeTargetGroupDefinition {
  id: string;
  label: string;
  description?: string;
  defaultEnabled?: boolean;
}

export interface FModeSettings {
  alphabet: string;
  enabledSurfaces: string[];
  accentColor: string;
  showTargetLabels: boolean;
  showTargetDescriptions: boolean;
  hudMode: FModeHudMode;
  invalidInputBehavior: FModeInvalidInputBehavior;
}

export interface FModePluginOptions {
  enabled?: boolean;
  hotkeys?: Hotkey[];
  targetGroups?: FModeTargetGroupDefinition[];
}

export type FModeHintTarget = AppShellHintTarget;
