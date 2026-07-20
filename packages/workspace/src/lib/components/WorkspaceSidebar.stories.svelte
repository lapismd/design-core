<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import WorkspaceSidebar from "./WorkspaceSidebar.svelte";

  const { Story } = defineMeta({
    title: "Workspace/Workspace Sidebar",
    component: WorkspaceSidebar,
    parameters: {
      docs: {
        description: {
          component:
            "Controlled left and right sidebars with pointer and keyboard resizing.",
        },
      },
    },
  });
</script>

<script lang="ts">
  import { Button } from "@stevejuma/ui/shadcn/button";
  import FilesIcon from "@lucide/svelte/icons/files";
  import SearchIcon from "@lucide/svelte/icons/search";
  import { createDemoController } from "./stories/fixtures";

  let controller = $state(createDemoController());
</script>

<Story
  name="Keyboard resize"
  play={async ({ canvas }) => {
    const resizer = canvas.getByRole("button", { name: "Resize left sidebar" });
    await userEvent.click(resizer);
    resizer.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("status")).toHaveTextContent("296px");
  }}
>
  {#snippet template()}
    <div data-ui-component="workspace-sidebar-story" data-ui-part="host">
      <WorkspaceSidebar {controller} side="left">
        <p>Sidebar content</p>
      </WorkspaceSidebar>
      <main>
        <Button
          type="button"
          onclick={() => controller.setSidebarOpen("left", false)}
          >Close sidebar</Button
        >
        <output>{controller.layout.left.size}px</output>
      </main>
    </div>
  {/snippet}
</Story>

<Story
  name="Icon-only tabs"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/reference/lapis-left-sidebar-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  play={async ({ canvas, canvasElement }) => {
    const fileTab = canvas.getByRole("radio", { name: "Files" });
    await expect(fileTab.textContent?.trim()).toBe("");
    await expect(Math.round(fileTab.getBoundingClientRect().width)).toBe(32);
    await expect(Math.round(fileTab.getBoundingClientRect().height)).toBe(32);
    await userEvent.click(canvas.getByRole("radio", { name: "Search" }));
    await expect(canvas.getByText("Search sidebar content")).toBeVisible();
    await expect(canvas.getByRole("status")).toHaveTextContent("search");
    await expect(
      canvasElement.querySelectorAll(
        '[data-workspace-part="sidebar-tab-trigger"]',
      ),
    ).toHaveLength(2);
  }}
>
  {#snippet template()}
    <div data-ui-component="workspace-sidebar-story" data-ui-part="host">
      <WorkspaceSidebar
        {controller}
        side="left"
        tabs={[
          { id: "files", label: "Files", icon: FilesIcon },
          { id: "search", label: "Search", icon: SearchIcon },
        ]}
      >
        {#snippet tabContent(tab)}
          <p>{tab.label} sidebar content</p>
        {/snippet}
      </WorkspaceSidebar>
      <output>Selected: {controller.layout.left.activeTabId}</output>
    </div>
  {/snippet}
</Story>

<Story
  name="Collapsible sidebar groups"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/reference/lapis-right-sidebar-groups-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  play={async ({ canvas }) => {
    const trigger = canvas.getByRole("button", { name: "Navigator" });
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(canvas.getByRole("status")).toHaveTextContent("collapsed");
  }}
>
  {#snippet template()}
    <div data-ui-component="workspace-sidebar-story" data-ui-part="host">
      <WorkspaceSidebar
        {controller}
        side="left"
        groups={[{ id: "navigator", title: "Navigator", icon: FilesIcon }]}
      >
        {#snippet groupContent()}
          <p>Workspace files</p>
        {/snippet}
      </WorkspaceSidebar>
      <output>
        Navigator {controller.layout.left.collapsedGroups.navigator
          ? "collapsed"
          : "expanded"}
      </output>
    </div>
  {/snippet}
</Story>

<Story
  name="Lapis sidebar reference captures"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/reference/lapis-left-sidebar-chromium-darwin.png",
        "/visual-baselines/workspace/reference/lapis-right-sidebar-groups-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
    docs: {
      description: {
        story:
          "Source-backed left and right sidebar targets. The left capture records icon-only tab selection and the file panel; the right capture records collapsible group headers, group actions, dividers, body spacing, and the sidebar footer.",
      },
    },
  }}
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("img", { name: "Lapis left sidebar reference" }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("img", {
        name: "Lapis right sidebar groups reference",
      }),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <div
      data-ui-component="workspace-sidebar-story"
      data-ui-part="reference-grid"
    >
      <figure>
        <img
          src="/visual-baselines/workspace/reference/lapis-left-sidebar-chromium-darwin.png"
          alt="Lapis left sidebar reference"
          width="302"
          height="900"
        />
        <figcaption>Left sidebar</figcaption>
      </figure>
      <figure>
        <img
          src="/visual-baselines/workspace/reference/lapis-right-sidebar-groups-chromium-darwin.png"
          alt="Lapis right sidebar groups reference"
          width="253"
          height="900"
        />
        <figcaption>Right sidebar groups</figcaption>
      </figure>
    </div>
  {/snippet}
</Story>

<style>
  :global([data-ui-component="workspace-sidebar-story"][data-ui-part="host"]) {
    display: flex;
    height: 20rem;
    border: 1px solid var(--border);
  }

  :global([data-ui-component="workspace-sidebar-story"] main) {
    display: flex;
    gap: 0.75rem;
    padding: 1rem;
  }

  :global([data-ui-component="workspace-sidebar-story"] p) {
    margin: 0;
    padding: 0.75rem;
  }

  :global(
      [data-ui-component="workspace-sidebar-story"][data-ui-part="reference-grid"]
    ) {
    display: grid;
    width: max-content;
    grid-template-columns: 302px 253px;
    gap: 1rem;
  }

  :global(
      [data-ui-component="workspace-sidebar-story"][data-ui-part="reference-grid"]
        figure
    ) {
    margin: 0;
    overflow: hidden;
    border: 1px solid var(--border);
    background: var(--background);
  }

  :global(
      [data-ui-component="workspace-sidebar-story"][data-ui-part="reference-grid"]
        img
    ) {
    display: block;
    max-width: none;
    height: 900px;
  }

  :global(
      [data-ui-component="workspace-sidebar-story"][data-ui-part="reference-grid"]
        figcaption
    ) {
    border-top: 1px solid var(--border);
    padding: 0.5rem;
    color: var(--muted-foreground);
    font-size: 0.75rem;
    font-weight: 600;
    text-align: center;
  }
</style>
