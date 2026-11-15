<script lang="ts">
  import { onDestroy } from "svelte";
  import { AppShell, AppShellController } from "./index.js";
  import * as Dialog from "../../shadcn/dialog/index.js";
  import { Button } from "../../shadcn/button/index.js";
  import { Input } from "../../shadcn/input/index.js";
  const controller = new AppShellController();
  onDestroy(() => void controller.dispose());
</script>

<div style="width: 100vw; height: 100vh; display: flex;">
  <Dialog.Root>
    <AppShell.Root {controller} displayMode="auto">
      <AppShell.Sidebar side="left" label="Files">
        <AppShell.Sidebar.Header>Files</AppShell.Sidebar.Header>
        <AppShell.Sidebar.Body>Saved documents</AppShell.Sidebar.Body>
      </AppShell.Sidebar>
      <AppShell.Main>
        <AppShell.Toolbar>
          <Dialog.Trigger>
            {#snippet child({ props })}<Button {...props}>Edit draft</Button
              >{/snippet}
          </Dialog.Trigger>
        </AppShell.Toolbar>
        <AppShell.Body>
          <Input aria-label="Main draft" value="Saved main draft" />
        </AppShell.Body>
      </AppShell.Main>
    </AppShell.Root>
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>Edit draft</Dialog.Title>
        <Dialog.Description
          >Keep this draft while the shell changes mode.</Dialog.Description
        >
      </Dialog.Header>
      <Input aria-label="Dialog draft" />
    </Dialog.Content>
  </Dialog.Root>
</div>
