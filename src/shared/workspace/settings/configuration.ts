import type { WorkspaceSettingsController } from "./settings-controller.svelte.js";
import type {
  WorkspaceSettingOption,
  WorkspaceSettingsNavigationGroup,
  WorkspaceSettingsSection,
} from "./types.js";

export interface ConfigurationOptionSourceContext {
  settingId: string;
  params?: Record<string, unknown>;
  query?: string;
}

export interface ConfigurationOptionSource {
  id: string;
  load(
    context: ConfigurationOptionSourceContext,
  ): WorkspaceSettingOption[] | Promise<WorkspaceSettingOption[]>;
}

export class ConfigurationOptionSourceRegistry {
  readonly #sources = new Map<string, ConfigurationOptionSource>();

  register(source: ConfigurationOptionSource): () => void {
    if (this.#sources.has(source.id)) {
      throw new Error(
        `A configuration option source is already registered for "${source.id}"`,
      );
    }
    this.#sources.set(source.id, source);
    return () => {
      if (this.#sources.get(source.id) === source) {
        this.#sources.delete(source.id);
      }
    };
  }

  resolve(id: string): ConfigurationOptionSource | undefined {
    return this.#sources.get(id);
  }

  async load(
    id: string,
    context: ConfigurationOptionSourceContext,
  ): Promise<WorkspaceSettingOption[]> {
    const source = this.resolve(id);
    if (!source) {
      throw new Error(`Unknown configuration option source "${id}"`);
    }
    return source.load(context);
  }

  clear(): void {
    this.#sources.clear();
  }
}

/**
 * Declarative, extension-friendly schema registry backed by the settings value
 * controller. Sections and navigation groups are independently disposable.
 */
export class ConfigurationSchema {
  readonly optionSources = new ConfigurationOptionSourceRegistry();

  constructor(readonly settings: WorkspaceSettingsController) {}

  register(section: WorkspaceSettingsSection): () => void {
    return this.settings.registerSection(section);
  }

  registerSection(section: WorkspaceSettingsSection): () => void {
    return this.register(section);
  }

  registerNavigationGroup(group: WorkspaceSettingsNavigationGroup): () => void {
    return this.settings.registerNavigationGroup(group);
  }

  get<T = unknown>(id: string): T | undefined {
    return this.settings.get<T>(id);
  }

  set(id: string, value: unknown): boolean {
    return this.settings.update(id, value);
  }

  restoreDefault(id: string): boolean {
    return this.settings.restoreDefault(id);
  }
}
