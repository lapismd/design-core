import {
  AppShellPlugin,
  CommandKeymapScope,
  Notice,
  type AppShellPluginDescriptor,
} from "../../core/index.js";
import FModeOverlay from "./FModeOverlay.svelte";
import { FModeSession } from "./f-mode-session.svelte.js";
import { normalizeFModeKey } from "./hint-labels.js";
import {
  createFModeSettingsSection,
  createFModeTargetGroups,
  filterFModeTargets,
  readFModeSettings,
} from "./settings.js";
import type {
  FModeHintTarget,
  FModePluginOptions,
  FModeTargetGroupDefinition,
} from "./types.js";

const DEFAULT_HOTKEYS = [{ modifiers: ["Mod", "Shift"], key: "F" }] as const;

interface FModeRuntimeOptions {
  hotkeys: FModePluginOptions["hotkeys"];
  targetGroups: FModeTargetGroupDefinition[];
}

class FModeAppShellPlugin extends AppShellPlugin<FModeRuntimeOptions> {
  readonly #session = new FModeSession();
  readonly #groups: FModeTargetGroupDefinition[];

  constructor(
    app: ConstructorParameters<typeof AppShellPlugin>[0],
    id: string,
    options: FModeRuntimeOptions,
  ) {
    super(app, id, options);
    this.#groups = createFModeTargetGroups(options.targetGroups);
  }

  onload(): void {
    this.registerSettingsSection(createFModeSettingsSection(this.#groups));
    this.registerOverlay({
      id: "fmode:overlay",
      component: FModeOverlay,
      props: { session: this.#session },
      priority: 100,
    });
    const scope = new CommandKeymapScope();
    scope.registerAny((event) => {
      if (!this.#session.active) return false;
      event.preventDefault();
      event.stopPropagation();
      this.#handleSessionKeydown(event);
      return true;
    });
    this.pushKeymapScope(scope);
    this.addCommand({
      id: "toggle-fmode",
      title: "Toggle F-Mode",
      category: "Navigation",
      icon: "scan-search",
      hotkeys:
        this.options.hotkeys ??
        DEFAULT_HOTKEYS.map((entry) => ({
          modifiers: [...entry.modifiers],
          key: entry.key,
        })),
      callback: () => this.#toggleSession(),
    });
    this.register(() => this.#session.close());
  }

  #toggleSession(): void {
    if (this.#session.active) {
      this.#session.close();
      return;
    }
    const settings = readFModeSettings(this.app, this.#groups);
    const targets = filterFModeTargets(
      this.app.ui.getVisibleHintTargets(),
      settings.enabledSurfaces,
    );
    if (targets.length === 0) {
      new Notice(this.app, "No hint targets available");
      return;
    }
    this.#session.open(targets, settings);
  }

  #handleSessionKeydown(event: KeyboardEvent): void {
    if (event.isComposing) return;
    if (event.key === "Escape") {
      this.#session.close();
      return;
    }
    if (event.key === "Backspace") {
      this.#session.backspace();
      return;
    }
    const key = normalizeFModeKey(event.key);
    if (!key) return;
    const result = this.#session.advance(key);
    if (
      !result.accepted &&
      this.#session.settings?.invalidInputBehavior === "close"
    ) {
      this.#session.close();
      return;
    }
    if (result.matchedTarget) {
      this.#session.close();
      this.#activateTarget(result.matchedTarget);
    }
  }

  #activateTarget(target: FModeHintTarget): void {
    if (target.commandId || target.action === "command") {
      if (!target.commandId) return;
      void this.app.commands.execute(target.commandId).then((executed) => {
        if (!executed) {
          new Notice(this.app, `Unable to execute ${target.label}`);
        }
      });
      return;
    }
    if (target.action === "focus") {
      target.element.focus();
      return;
    }
    target.element.click();
  }
}

export function fModePlugin(
  options: FModePluginOptions = {},
): AppShellPluginDescriptor {
  return {
    id: "fmode",
    name: "F-Mode",
    description: "Navigate visible shell actions with keyboard hints.",
    icon: "scan-search",
    required: false,
    enabled: options.enabled ?? true,
    plugin: FModeAppShellPlugin,
    options: {
      hotkeys: options.hotkeys,
      targetGroups: options.targetGroups ?? [],
    },
  };
}
