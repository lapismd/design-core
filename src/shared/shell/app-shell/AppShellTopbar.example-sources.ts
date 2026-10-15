export const Basic = `<script lang="ts">
  import { onDestroy } from "svelte";
  import { AppShell, AppShellController } from "@lapismd/design-core/shell";
  import { PanelToggle } from "@lapismd/design-core/shadcn/panel-toggle";
  import { ResponsiveTabs } from "@lapismd/design-core/shadcn/responsive-tabs";
  import * as Tabs from "@lapismd/design-core/shadcn/tabs";
  const controller = new AppShellController({ leftCollapsed: true, rightWidth: 224 });
  const tools = controller.createSidebar("tools", "right", { collapsed: true, width: 152 });
  let main = $state<HTMLDivElement | null>(null);
  let section = $state("overview");
  let details = $state(true);
  let outline = $state(false);
  const sections = [{ value: "overview", label: "Overview" }, { value: "documents", label: "Documents" }, { value: "activity", label: "Activity" }];
  onDestroy(() => { void controller.dispose(); });
</script>
<div style="display:flex;flex-direction:column;height:100dvh;overflow:hidden;--ui-shell-height:100%">
  <AppShell.Topbar mainElement={main}>
    {#snippet leading()}<PanelToggle expanded={!controller.left.collapsed} aria-label="Toggle navigation" onclick={() => controller.left.toggle()} />{/snippet}
    {#snippet center()}Workspace overview{/snippet}
    {#snippet trailing()}<PanelToggle side="right" expanded={!tools.collapsed} aria-label="Toggle tools rail" onclick={() => tools.toggle()} />{/snippet}
  </AppShell.Topbar>
  <AppShell.Root {controller} style="flex:1;min-height:0">
    <AppShell.Sidebar side="left" label="Project navigation">
      <AppShell.Sidebar.Header>Projects</AppShell.Sidebar.Header>
      <AppShell.Sidebar.Body><!-- Render named icons in collapsed state; labels in expanded state. --></AppShell.Sidebar.Body>
    </AppShell.Sidebar>
    <AppShell.Main bind:ref={main}>
      <Tabs.Root bind:value={section} style="display:flex;flex:1;flex-direction:column;min-height:0;gap:0">
        <AppShell.Toolbar label="Document header" style="flex-wrap:wrap">
          <strong>Release notes</strong>
          <PanelToggle side="right" style="margin-inline-start:auto" expanded={!controller.right.closed} aria-label="Toggle workspace inspector" onclick={() => controller.right.closed ? controller.right.open() : controller.right.close()} />
          <div style="width:100%"><ResponsiveTabs bind:value={section} items={sections} inheritContext label="Workspace sections" /></div>
        </AppShell.Toolbar>
        <AppShell.Body layout="regions" element="section" label="Document workspace">
          <AppShell.Body.Toggle side="left" target="outline" label="Toggle document outline" />
          <AppShell.Body.Toggle side="right" target="details" label="Toggle document details" />
          <AppShell.Body.Sidebar side="left" panelId="outline" bind:open={outline} label="Document outline"><div style="padding:3rem 1rem 1rem">Document outline</div></AppShell.Body.Sidebar>
          <AppShell.Body.Content label="Workspace content">
            <div style="padding:3rem 1rem 1rem">{#each sections as item}<Tabs.Content value={item.value}>{item.label} content</Tabs.Content>{/each}</div>
          </AppShell.Body.Content>
          <AppShell.Body.Sidebar side="right" panelId="details" bind:open={details} label="Document details"><div style="padding:3rem 1rem 1rem">Document metadata</div></AppShell.Body.Sidebar>
        </AppShell.Body>
      </Tabs.Root>
    </AppShell.Main>
    <AppShell.Sidebar side="right" label="Workspace inspector">
      <AppShell.Sidebar.Header>Workspace</AppShell.Sidebar.Header><AppShell.Sidebar.Body>Team activity</AppShell.Sidebar.Body>
    </AppShell.Sidebar>
    <AppShell.Sidebar side="right" sidebarController={tools} variant="rail" label="Tools rail">
      <AppShell.Sidebar.Body>Tools</AppShell.Sidebar.Body>
    </AppShell.Sidebar>
  </AppShell.Root>
</div>`;
