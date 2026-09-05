<script lang="ts">
  import { AppShell, AppShellController } from "@lapismd/design-core/shell";

  const controller = new AppShellController({
    leftWidth: 248,
    rightClosed: true,
  });
</script>

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
</AppShell.Root>
