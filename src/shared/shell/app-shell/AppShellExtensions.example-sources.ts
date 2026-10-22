export const Basic = `<script lang="ts">
  import { AppShell, AppShellController } from '@lapismd/design-core/shell';
  import { Button } from '@lapismd/design-core/shadcn/button';
  const controller = new AppShellController({ leftCollapsed: true });
  const tools = controller.createSidebar('tools', 'right', { width: 176 });
  let main = $state<HTMLElement | null>(null);
  let target = $state<HTMLElement | null>(null);
  let reviewOpen = $state(false);
</script>

<div style="display:flex;flex-direction:column;height:100dvh;min-height:0">
  <AppShell.Topbar {controller} mainElement={main}
    mobilePlacement="body" mobileTarget={target}>
    {#snippet leading()}
      <AppShell.Sidebar.Toggle shellController={controller} side="left" />
    {/snippet}
    {#snippet center()}Workspace{/snippet}
    {#snippet trailing()}<Button variant="ghost">Application actions</Button>{/snippet}
  </AppShell.Topbar>
  <AppShell.Root {controller} style="flex:1;min-height:0">
    <AppShell.Sidebar side="left" label="Navigation">
      <AppShell.Sidebar.Body>Navigation</AppShell.Sidebar.Body>
    </AppShell.Sidebar>
    <AppShell.Main bind:ref={main}>
      <AppShell.Topbar.Target bind:ref={target} />
      <AppShell.Toolbar>
        <h1>Document</h1>
        <AppShell.Sidebar.Toggle side="right" />
      </AppShell.Toolbar>
      <AppShell.Body>
        <Button onclick={() => reviewOpen = true}>Review document</Button>
      </AppShell.Body>
    </AppShell.Main>
    <AppShell.Sidebar side="right" variant="attached" label="Inspector" closeable>
      <AppShell.Sidebar.Header>
        <h2>Inspector</h2><AppShell.Sidebar.Close />
      </AppShell.Sidebar.Header>
      <AppShell.Sidebar.Body>
        <AppShell.Sidebar.Section>
          {#snippet heading()}<h3>Details</h3>{/snippet}
          <p>Host-owned document details.</p>
        </AppShell.Sidebar.Section>
      </AppShell.Sidebar.Body>
    </AppShell.Sidebar>
    <AppShell.Sidebar side="right" sidebarController={tools} variant="rail" label="Tools">
      <AppShell.Sidebar.Body>
        <AppShell.Sidebar.Section>Host-owned tool controls</AppShell.Sidebar.Section>
      </AppShell.Sidebar.Body>
    </AppShell.Sidebar>
    <AppShell.SurfaceLayer open={reviewOpen} label="Review"
      coverPanelIds={['right']} suspendPanelIds={['tools']}
      mobilePlacement="root" onDismiss={() => reviewOpen = false}>
      <AppShell.SurfaceLayer.Header>
        <h2>Review</h2><AppShell.SurfaceLayer.Close />
      </AppShell.SurfaceLayer.Header>
      <AppShell.SurfaceLayer.Body>Review content</AppShell.SurfaceLayer.Body>
      <AppShell.SurfaceLayer.Footer>
        <Button onclick={() => reviewOpen = false}>Done</Button>
      </AppShell.SurfaceLayer.Footer>
    </AppShell.SurfaceLayer>
  </AppShell.Root>
</div>`;

export const Native = Basic.replace(
  'mobilePlacement="body"',
  'mobilePlacement="top"',
);
export const ChildScroll = Basic.replace(
  "<AppShell.SurfaceLayer.Body>Review content</AppShell.SurfaceLayer.Body>",
  '<AppShell.SurfaceLayer.Body scrollable={false}>\n        <div style="flex:1;min-height:0;overflow:auto">Child-owned editor or conversation</div>\n      </AppShell.SurfaceLayer.Body>',
);
