<script lang="ts">
  import { AppShell, AppShellController } from "./index.js";
  let { target }: { target: HTMLElement | null } = $props();
  const destination = $derived(target);
  const controller = new AppShellController();
</script>

<AppShell.Root {controller} displayMode="desktop" style="height:180px">
  <AppShell.Main><AppShell.Body>Owner content</AppShell.Body></AppShell.Main>
  <AppShell.SurfaceLayer open label="Owned preview" returnFocus={destination}>
    <AppShell.SurfaceLayer.Body>Preview content</AppShell.SurfaceLayer.Body>
  </AppShell.SurfaceLayer>
</AppShell.Root>
