import type {
  WorkspaceViewDefinition,
  WorkspaceViewRegistry,
} from "./types.js";

/** In-memory renderer registry. Consumers own registration and teardown. */
export class DefaultWorkspaceViewRegistry implements WorkspaceViewRegistry {
  #definitions = new Map<string, WorkspaceViewDefinition>();

  register(definition: WorkspaceViewDefinition): () => void {
    this.#definitions.set(definition.type, definition);
    return () => {
      if (this.#definitions.get(definition.type) === definition) {
        this.#definitions.delete(definition.type);
      }
    };
  }

  resolve(type: string): WorkspaceViewDefinition | undefined {
    return this.#definitions.get(type);
  }
}
