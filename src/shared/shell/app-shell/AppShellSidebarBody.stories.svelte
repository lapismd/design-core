<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import {
    AppShell,
    AppShellSidebarBody,
    AppShellController,
  } from "@lapismd/design-core/shell";
  import { ScrollArea } from "@lapismd/design-core/shadcn/scroll-area";
  const { Story } = defineMeta({
    title: "Shell/App Shell",
    component: AppShellSidebarBody,
    tags: ["visual-pending"],
    parameters: {
      docs: {
        source: {
          code: '<AppShell.Sidebar side="right"><AppShell.Sidebar.Header>Thread</AppShell.Sidebar.Header><AppShell.Sidebar.Body scrollable={false}><ScrollArea class="thread-viewport">…</ScrollArea></AppShell.Sidebar.Body></AppShell.Sidebar>',
          language: "tsx",
          type: "code",
        },
      },
    },
  });
</script>

<script lang="ts">
  const controller = new AppShellController({
    leftClosed: true,
    rightWidth: 280,
  });
</script>

<Story
  name="One independent child viewport"
  play={async ({ canvasElement }) => {
    const sidebar = canvasElement.querySelector('[aria-label="Thread"]')!;
    const viewports = sidebar.querySelectorAll<HTMLElement>(
      '[data-ui-part="scroll-area-viewport"]',
    );
    await expect(viewports).toHaveLength(1);
    const viewport = viewports[0]!;
    await expect(viewport.clientHeight).toBeGreaterThan(100);
    await expect(viewport.scrollHeight).toBeGreaterThan(viewport.clientHeight);
    const main = canvasElement.querySelector<HTMLElement>(
      '[data-ui-part="body"] [data-ui-part="scroll-area-viewport"]',
    )!;
    const before = main.scrollTop;
    viewport.scrollTop = 150;
    await expect(viewport.scrollTop).toBe(150);
    await expect(main.scrollTop).toBe(before);
  }}
>
  {#snippet template()}
    <div style="height: 30rem">
      <AppShell.Root {controller}>
        <AppShell.Main
          ><AppShell.Toolbar>Project</AppShell.Toolbar><AppShell.Body
            >{#each Array.from({ length: 60 }) as _, i}<p>
                Project entry {i}
              </p>{/each}</AppShell.Body
          ></AppShell.Main
        >
        <AppShell.Sidebar side="right" label="Thread">
          <AppShell.Sidebar.Header>Thread</AppShell.Sidebar.Header>
          <AppShell.Sidebar.Body scrollable={false}>
            <ScrollArea style="flex:1;min-height:0"
              >{#each Array.from({ length: 60 }) as _, i}<p>
                  Reply {i}
                </p>{/each}</ScrollArea
            >
          </AppShell.Sidebar.Body>
        </AppShell.Sidebar>
      </AppShell.Root>
    </div>
  {/snippet}
</Story>
