export interface WorkspaceEventRef<
  Events extends { [K in keyof Events]: unknown[] },
  Name extends keyof Events = keyof Events,
> {
  name: Name;
  listener: (...args: Events[Name]) => void;
  once: boolean;
}

export class WorkspaceEventDispatcher<
  Events extends { [K in keyof Events]: unknown[] },
> {
  readonly #listeners = new Map<
    keyof Events,
    Set<WorkspaceEventRef<Events, keyof Events>>
  >();

  on<Name extends keyof Events>(
    name: Name,
    listener: (...args: Events[Name]) => void,
  ): WorkspaceEventRef<Events, Name> {
    const ref: WorkspaceEventRef<Events, Name> = {
      name,
      listener,
      once: false,
    };
    const listeners = this.#listeners.get(name) ?? new Set();
    listeners.add(ref as unknown as WorkspaceEventRef<Events, keyof Events>);
    this.#listeners.set(name, listeners);
    return ref;
  }

  once<Name extends keyof Events>(
    name: Name,
    listener: (...args: Events[Name]) => void,
  ): WorkspaceEventRef<Events, Name> {
    const ref = this.on(name, listener);
    ref.once = true;
    return ref;
  }

  off<Name extends keyof Events>(
    name: Name,
    listener: (...args: Events[Name]) => void,
  ): void {
    const listeners = this.#listeners.get(name);
    if (!listeners) return;
    for (const ref of listeners) {
      if (ref.listener === listener) listeners.delete(ref);
    }
    if (listeners.size === 0) this.#listeners.delete(name);
  }

  offref<Name extends keyof Events>(
    ref: WorkspaceEventRef<Events, Name>,
  ): void {
    const listeners = this.#listeners.get(ref.name);
    listeners?.delete(
      ref as unknown as WorkspaceEventRef<Events, keyof Events>,
    );
    if (listeners?.size === 0) this.#listeners.delete(ref.name);
  }

  trigger<Name extends keyof Events>(name: Name, ...args: Events[Name]): void {
    const listeners = [...(this.#listeners.get(name) ?? [])];
    for (const ref of listeners) {
      const typedRef = ref as unknown as WorkspaceEventRef<Events, Name>;
      typedRef.listener(...args);
      if (typedRef.once) this.offref(typedRef);
    }
  }

  clear(): void {
    this.#listeners.clear();
  }
}

export function createCancelableEvent<Fields extends object>(
  fields: Fields,
): Fields & { readonly defaultPrevented: boolean; preventDefault(): void } {
  let prevented = false;
  return {
    ...fields,
    get defaultPrevented() {
      return prevented;
    },
    preventDefault() {
      prevented = true;
    },
  };
}
