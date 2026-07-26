import type {
  WorkspaceViewDefinition,
  WorkspaceViewRegistry,
} from "./types.js";

export function createWorkspaceViewRegistry(): WorkspaceViewRegistry {
  const definitions = new Map<string, WorkspaceViewDefinition>();
  return {
    register(definition) {
      definitions.set(definition.type, definition);
      return () => {
        if (definitions.get(definition.type) === definition) {
          definitions.delete(definition.type);
        }
      };
    },
    resolve(type) {
      return definitions.get(type);
    },
  };
}
