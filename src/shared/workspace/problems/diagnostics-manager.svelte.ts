import {
  WorkspaceEventDispatcher,
  type WorkspaceEventRef,
} from "../core/event-dispatcher.js";
import type { WorkspaceMenu } from "../core/workspace-menu.js";
import type {
  WorkspaceDiagnostic,
  WorkspaceDiagnosticCollection,
  WorkspaceDiagnosticCollectionOptions,
  WorkspaceDiagnosticCollectionUpdate,
  WorkspaceDiagnosticEntry,
  WorkspaceDiagnosticResource,
  WorkspaceDiagnosticsManagerSnapshot,
  WorkspaceDiagnosticsSubscriber,
} from "./types.js";

interface StoredResourceDiagnostics {
  resource: WorkspaceDiagnosticResource | null;
  diagnostics: readonly WorkspaceDiagnostic[];
}

interface WorkspaceDiagnosticsManagerEventMap {
  change: [snapshot: WorkspaceDiagnosticsManagerSnapshot];
}

/** Application-independent, ephemeral diagnostic collection registry. */
export class WorkspaceDiagnosticsManager {
  entries = $state<WorkspaceDiagnosticEntry[]>([]);

  readonly #collections = new Map<string, ManagedDiagnosticCollection>();
  readonly #events =
    new WorkspaceEventDispatcher<WorkspaceDiagnosticsManagerEventMap>();

  get counts() {
    return countDiagnostics(this.entries);
  }

  get size(): number {
    return this.entries.length;
  }

  createCollection(
    id: string,
    options: WorkspaceDiagnosticCollectionOptions = {},
  ): WorkspaceDiagnosticCollection {
    const normalizedId = id.trim();
    if (!normalizedId) {
      throw new Error("Diagnostic collections require a non-empty id");
    }
    if (this.#collections.has(normalizedId)) {
      throw new Error(`Duplicate diagnostic collection id "${normalizedId}"`);
    }
    const collection = new ManagedDiagnosticCollection(
      normalizedId,
      options,
      () => this.#publish(),
      () => {
        this.#collections.delete(normalizedId);
        this.#publish();
      },
    );
    this.#collections.set(normalizedId, collection);
    this.#publish();
    return collection;
  }

  getCollection(id: string): WorkspaceDiagnosticCollection | undefined {
    return this.#collections.get(id);
  }

  buildItemMenu(menu: WorkspaceMenu, entry: WorkspaceDiagnosticEntry): void {
    this.#collections.get(entry.collectionId)?.buildItemMenu(menu, entry);
  }

  subscribe(subscriber: WorkspaceDiagnosticsSubscriber): () => void {
    const ref = this.#events.on("change", subscriber);
    subscriber(this.snapshot());
    return () => this.#events.offref(ref);
  }

  onChange(
    subscriber: WorkspaceDiagnosticsSubscriber,
  ): WorkspaceEventRef<WorkspaceDiagnosticsManagerEventMap, "change"> {
    return this.#events.on("change", subscriber);
  }

  offref(
    ref: WorkspaceEventRef<WorkspaceDiagnosticsManagerEventMap, "change">,
  ): void {
    this.#events.offref(ref);
  }

  snapshot(): WorkspaceDiagnosticsManagerSnapshot {
    const entries = Object.freeze(this.entries.map(cloneEntry));
    return Object.freeze({
      entries,
      counts: Object.freeze(countDiagnostics(entries)),
    });
  }

  dispose(): void {
    for (const collection of [...this.#collections.values()]) {
      collection.dispose();
    }
    this.entries = [];
    this.#events.clear();
  }

  #publish(): void {
    const entries: WorkspaceDiagnosticEntry[] = [];
    for (const collection of this.#collections.values()) {
      collection.appendEntries(entries);
    }
    this.entries = entries;
    this.#events.trigger("change", this.snapshot());
  }
}

class ManagedDiagnosticCollection implements WorkspaceDiagnosticCollection {
  readonly label: string;
  disposed = false;

  readonly #entries = new Map<string, StoredResourceDiagnostics>();
  readonly #buildItemMenu?: WorkspaceDiagnosticCollectionOptions["buildItemMenu"];

  constructor(
    readonly id: string,
    options: WorkspaceDiagnosticCollectionOptions,
    readonly onChange: () => void,
    readonly onDispose: () => void,
  ) {
    this.label = options.label?.trim() || id;
    this.#buildItemMenu = options.buildItemMenu;
  }

  set(
    resourceOrEntries:
      | WorkspaceDiagnosticResource
      | null
      | Iterable<WorkspaceDiagnosticCollectionUpdate>,
    diagnostics?: readonly WorkspaceDiagnostic[],
  ): void {
    this.#assertActive();
    if (isCollectionUpdateIterable(resourceOrEntries)) {
      for (const [resource, nextDiagnostics] of resourceOrEntries) {
        this.#setOne(resource, nextDiagnostics);
      }
      this.onChange();
      return;
    }
    this.#setOne(resourceOrEntries, diagnostics);
    this.onChange();
  }

  get(
    resource: WorkspaceDiagnosticResource | null,
  ): readonly WorkspaceDiagnostic[] | undefined {
    this.#assertActive();
    return this.#entries.get(resourceKey(resource))?.diagnostics;
  }

  has(resource: WorkspaceDiagnosticResource | null): boolean {
    this.#assertActive();
    return this.#entries.has(resourceKey(resource));
  }

  delete(resource: WorkspaceDiagnosticResource | null): boolean {
    this.#assertActive();
    const deleted = this.#entries.delete(resourceKey(resource));
    if (deleted) this.onChange();
    return deleted;
  }

  clear(): void {
    this.#assertActive();
    if (this.#entries.size === 0) return;
    this.#entries.clear();
    this.onChange();
  }

  forEach(
    callback: (
      resource: WorkspaceDiagnosticResource | null,
      diagnostics: readonly WorkspaceDiagnostic[],
      collection: WorkspaceDiagnosticCollection,
    ) => void,
  ): void {
    this.#assertActive();
    for (const value of this.#entries.values()) {
      callback(cloneResource(value.resource), value.diagnostics, this);
    }
  }

  *[Symbol.iterator](): Iterator<
    readonly [
      WorkspaceDiagnosticResource | null,
      readonly WorkspaceDiagnostic[],
    ]
  > {
    this.#assertActive();
    for (const value of this.#entries.values()) {
      yield [cloneResource(value.resource), value.diagnostics] as const;
    }
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.#entries.clear();
    this.onDispose();
  }

  buildItemMenu(menu: WorkspaceMenu, entry: WorkspaceDiagnosticEntry): void {
    if (!this.disposed) this.#buildItemMenu?.(menu, cloneEntry(entry));
  }

  appendEntries(target: WorkspaceDiagnosticEntry[]): void {
    if (this.disposed) return;
    for (const [key, value] of this.#entries) {
      value.diagnostics.forEach((diagnostic, index) => {
        target.push(
          Object.freeze({
            key: `${this.id}:${key}:${index}`,
            collectionId: this.id,
            collectionLabel: this.label,
            resource: cloneResource(value.resource),
            diagnostic,
          }),
        );
      });
    }
  }

  #setOne(
    resource: WorkspaceDiagnosticResource | null,
    diagnostics: readonly WorkspaceDiagnostic[] | undefined,
  ): void {
    const key = resourceKey(resource);
    if (!diagnostics) {
      this.#entries.delete(key);
      return;
    }
    const cloned = Object.freeze(diagnostics.map(cloneDiagnostic));
    this.#entries.set(key, {
      resource: cloneResource(resource),
      diagnostics: cloned,
    });
  }

  #assertActive(): void {
    if (this.disposed) {
      throw new Error(`Diagnostic collection "${this.id}" is disposed`);
    }
  }
}

function isCollectionUpdateIterable(
  value:
    | WorkspaceDiagnosticResource
    | null
    | Iterable<WorkspaceDiagnosticCollectionUpdate>,
): value is Iterable<WorkspaceDiagnosticCollectionUpdate> {
  return Boolean(
    value &&
      typeof value === "object" &&
      !("uri" in value) &&
      Symbol.iterator in value,
  );
}

function resourceKey(resource: WorkspaceDiagnosticResource | null): string {
  return resource ? resource.uri : "\u0000workspace";
}

function cloneResource(
  resource: WorkspaceDiagnosticResource | null,
): WorkspaceDiagnosticResource | null {
  return resource ? Object.freeze({ ...resource }) : null;
}

function cloneDiagnostic(diagnostic: WorkspaceDiagnostic): WorkspaceDiagnostic {
  return Object.freeze({
    ...diagnostic,
    range: diagnostic.range
      ? Object.freeze({
          start: Object.freeze({ ...diagnostic.range.start }),
          end: Object.freeze({ ...diagnostic.range.end }),
        })
      : undefined,
    code:
      diagnostic.code && typeof diagnostic.code === "object"
        ? Object.freeze({ ...diagnostic.code })
        : diagnostic.code,
    tags: diagnostic.tags ? Object.freeze([...diagnostic.tags]) : undefined,
    relatedInformation: diagnostic.relatedInformation
      ? Object.freeze(
          diagnostic.relatedInformation.map((related) =>
            Object.freeze({
              ...related,
              resource: Object.freeze({ ...related.resource }),
              range: related.range
                ? Object.freeze({
                    start: Object.freeze({ ...related.range.start }),
                    end: Object.freeze({ ...related.range.end }),
                  })
                : undefined,
            }),
          ),
        )
      : undefined,
  });
}

function cloneEntry(entry: WorkspaceDiagnosticEntry): WorkspaceDiagnosticEntry {
  return Object.freeze({
    ...entry,
    resource: cloneResource(entry.resource),
    diagnostic: cloneDiagnostic(entry.diagnostic),
  });
}

function countDiagnostics(entries: readonly WorkspaceDiagnosticEntry[]) {
  const counts = { error: 0, warning: 0, information: 0, hint: 0 };
  for (const entry of entries) counts[entry.diagnostic.severity] += 1;
  return counts;
}
