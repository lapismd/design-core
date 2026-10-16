<script lang="ts">
  import { untrack } from "svelte";
  import { AppShell, AppShellController } from "@lapismd/design-core/shell";
  import { Button } from "@lapismd/design-core/shadcn/button";

  let { initiallyClosed = true }: { initiallyClosed?: boolean } = $props();
  const controller = new AppShellController({
    leftClosed: true,
    rightClosed: untrack(() => initiallyClosed),
    rightWidth: 280,
  });
  let hidden = $state(false);
</script>

<div style="height: 24rem">
  <AppShell.Root {controller} displayMode="desktop">
    <AppShell.Main>
      <AppShell.Toolbar>
        <Button onclick={() => (hidden = !hidden)}
          >Toggle consumer visibility</Button
        >
        <Button
          aria-label="Toggle visibility details"
          aria-expanded={!controller.right.closed}
          onclick={() =>
            controller.right.closed
              ? controller.right.open()
              : controller.right.close()}>Details</Button
        >
      </AppShell.Toolbar>
      <AppShell.Body><p>Repository content</p></AppShell.Body>
    </AppShell.Main>
    <AppShell.Sidebar side="right" label="Visibility details" {hidden}>
      <AppShell.Sidebar.Header>Details</AppShell.Sidebar.Header>
      <AppShell.Sidebar.Body
        ><p>Retained sidebar content</p></AppShell.Sidebar.Body
      >
    </AppShell.Sidebar>
  </AppShell.Root>
</div>
