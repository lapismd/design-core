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
</script>

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
  <AppShell.Main>
    <AppShell.Toolbar>
      <AppShell.Sidebar.Toggle side="left" />
    </AppShell.Toolbar>
    <AppShell.Body>Content</AppShell.Body>
  </AppShell.Main>
  <AppShell.Sidebar
    side="right"
    constraintPriority={0}
    constrainedPresentation="replace-main"
  >
    <AppShell.Sidebar.Body>Inspector</AppShell.Sidebar.Body>
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
    <AppShell.SurfaceLayer.Header>Reviews</AppShell.SurfaceLayer.Header>
    <AppShell.SurfaceLayer.Body>Release reviews</AppShell.SurfaceLayer.Body>
  </AppShell.SurfaceLayer>
</AppShell.Root>
