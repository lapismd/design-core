<script lang="ts">
  import { onDestroy } from "svelte";
  import {
    AppShell,
    AppShellController,
    type AppShellDisplayMode,
  } from "@lapismd/design-core/shell";
  import { Button } from "@lapismd/design-core/shadcn/button";
  let {
    outer = "desktop",
    inner = "mobile",
  }: { outer?: AppShellDisplayMode; inner?: AppShellDisplayMode } = $props();
  const outside = new AppShellController({ leftWidth: 180, rightClosed: true });
  const inside = new AppShellController({
    leftClosed: true,
    rightClosed: true,
  });
  let activated = $state(false);
  onDestroy(() => {
    void outside.dispose();
    void inside.dispose();
  });
</script>

<div style="height:30rem;--ui-shell-height:100%">
  <AppShell.Root controller={outside} displayMode={outer}>
    <AppShell.Sidebar side="left" label="Outer navigation"
      ><AppShell.Sidebar.Body>Outer navigation</AppShell.Sidebar.Body
      ></AppShell.Sidebar
    >
    <AppShell.Main>
      <AppShell.Root
        controller={inside}
        displayMode={inner}
        desktopMinMainWidth={0}
      >
        <AppShell.Main
          ><AppShell.Toolbar>Nested content</AppShell.Toolbar><AppShell.Body
            element="div"
            ><Button onclick={() => (activated = true)}
              >Nested content action</Button
            >{#if activated}<p>Nested action activated</p>{/if}</AppShell.Body
          ></AppShell.Main
        >
      </AppShell.Root>
    </AppShell.Main>
  </AppShell.Root>
</div>
