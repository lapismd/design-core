import { getContext, setContext } from "svelte";

const key = Symbol("app-shell-surface-layer");

interface SurfaceLayerContext {
  readonly dismissLabel: string;
  dismiss(): void;
}

export function setSurfaceLayerContext(context: SurfaceLayerContext): void {
  setContext(key, context);
}

export function useSurfaceLayerContext(): SurfaceLayerContext {
  const context = getContext<SurfaceLayerContext | undefined>(key);
  if (!context)
    throw new Error("SurfaceLayer.Close requires AppShell.SurfaceLayer");
  return context;
}
