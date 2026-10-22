<script lang="ts">
  import { AppShell, AppShellController } from "@lapismd/design-core/shell";

  const controller = new AppShellController({
    leftWidth: 248,
    rightClosed: true,
  });
  const overview = controller.createSidebar("overview", "right", {
    width: 232,
  });
  let surfaceOpen = $state(false);
  let main = $state<HTMLElement | null>(null);
  let target = $state<HTMLElement | null>(null);
</script>

<AppShell.Topbar
  {controller}
  mainElement={main}
  mobilePlacement="body"
  mobileTarget={target}
/>

<AppShell.Sidebar.Toggle
  shellController={controller}
  side="right"
  sidebarController={overview}
  sidebarName="overview"
/>

<AppShell.Root {controller}>
  <AppShell.Sidebar side="left" label="Navigation">
    <AppShell.Sidebar.Body>Navigation</AppShell.Sidebar.Body>
  </AppShell.Sidebar>
  <AppShell.Main bind:ref={main}>
    <AppShell.Topbar.Target bind:ref={target} />
    <AppShell.Toolbar>
      <AppShell.Sidebar.Toggle side="left" />
    </AppShell.Toolbar>
    <AppShell.Body>Content</AppShell.Body>
  </AppShell.Main>
  <AppShell.Sidebar
    side="right"
    variant="attached"
    constraintPriority={0}
    constrainedPresentation="replace-main"
  >
    <AppShell.Sidebar.Body
      ><AppShell.Sidebar.Section>
        {#snippet heading()}<h2>Inspector</h2>{/snippet}
        Inspector content
      </AppShell.Sidebar.Section></AppShell.Sidebar.Body
    >
  </AppShell.Sidebar>
  <AppShell.Sidebar
    side="right"
    sidebarController={overview}
    variant="rail"
    constraintPriority={100}
  >
    <AppShell.Sidebar.Body>Overview</AppShell.Sidebar.Body>
  </AppShell.Sidebar>
  <AppShell.SurfaceLayer
    open={surfaceOpen}
    label="Review surface"
    coverPanelIds={["right"]}
    suspendPanelIds={["overview"]}
    onDismiss={() => (surfaceOpen = false)}
  >
    <AppShell.SurfaceLayer.Header
      >Reviews<AppShell.SurfaceLayer.Close /></AppShell.SurfaceLayer.Header
    >
    <AppShell.SurfaceLayer.Body scrollable={false}
      >Release reviews</AppShell.SurfaceLayer.Body
    >
    <AppShell.SurfaceLayer.Footer>Review actions</AppShell.SurfaceLayer.Footer>
  </AppShell.SurfaceLayer>
</AppShell.Root>
